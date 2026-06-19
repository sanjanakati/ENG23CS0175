const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Store authentication token globally (set after auth)
let authToken = null;

// Logging Middleware
const Log = async (stack, level, packageName, message) => {
  try {
    const logPayload = {
      stack,
      level,
      package: packageName,
      message,
      timestamp: new Date().toISOString()
    };

    const headers = { 'Content-Type': 'application/json' };
    
    // Add auth token if available
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Call the test server log API
    const response = await fetch('http://4.224.186.213/evaluation-service/logs', {
      method: 'POST',
      headers,
      body: JSON.stringify(logPayload)
    });

    if (!response.ok) {
      console.warn(`Log failed: ${response.status}`);
    }
  } catch (error) {
    console.error('Logging error:', error.message);
  }
};

// Usage examples:
// Log("backend", "error", "handler", "received string, expected bool")
// Log("backend", "fatal", "db", "Critical database connection failure.")
// Log("backend", "info", "auth", "User authenticated successfully")

// Mock Authentication Middleware (for protected routes)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    Log("backend", "warn", "auth", "Access token required but not provided");
    return res.status(401).json({ error: 'Access token required' });
  }
  
  // For now, accept any token. In production, verify with JWT
  next();
};

// Mock Data
const depots = [
  { "ID": 1, "MechanicHours": 60 },
  { "ID": 2, "MechanicHours": 135 },
  { "ID": 3, "MechanicHours": 188 },
  { "ID": 4, "MechanicHours": 97 },
  { "ID": 5, "MechanicHours": 164 }
];

const vehicles = [
  { "TaskID": "264e638f-1c7a-4d67-9f9c-53f3d1766d37", "Duration": 1, "Impact": 5 },
  { "TaskID": "73ce9dca-1536-4a7a-9f1e-c67083afad61", "Duration": 6, "Impact": 2 },
  { "TaskID": "4b6e22ee-b4ed-45ad-a6af-5294b0d69f37", "Duration": 1, "Impact": 3 }
];

const notifications = [
  { "ID": "d1460954-8d86-4a34-9e69-390da1457cbc", "Type": "Result", "Message": "mid-sem", "Timestamp": "2026-04-22 17:51:38" },
  { "ID": "b2892187-e65a-407c-93ad-1242d40dad0b", "Type": "Placement", "Message": "CSR Corporation Hiring", "Timestamp": "2026-04-22 17:51:18" },
  { "ID": "81549dda-8ad3-4d77-9554-f524f558e90d", "Type": "Event", "Message": "farewell", "Timestamp": "2026-04-22 17:51:00" }
];

// Set authentication token endpoint (for initialization)
app.post('/set-token', (req, res) => {
  authToken = req.body.token;
  res.json({ message: 'Token set successfully' });
});

// Health Check Route
app.get('/api/health', async (req, res) => {
  await Log("backend", "info", "health-check", "Health check called");
  res.status(200).json({ status: 'Server is running' });
});

// Protected Routes

// Depot API (GET)
app.get('/evaluation-service/depots', authenticateToken, async (req, res) => {
  try {
    await Log("backend", "info", "depot-api", "Fetching depots data");
    res.status(200).json({ depots });
  } catch (error) {
    await Log("backend", "error", "depot-api", error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vehicles API (GET)
app.get('/evaluation-service/vehicles', authenticateToken, async (req, res) => {
  try {
    await Log("backend", "info", "vehicle-api", "Fetching vehicles data");
    res.status(200).json({ vehicles });
  } catch (error) {
    await Log("backend", "error", "vehicle-api", error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Campus Notifications API (GET)
app.get('/evaluation-service/notifications', authenticateToken, async (req, res) => {
  try {
    await Log("backend", "info", "notification-api", "Fetching notifications data");
    res.status(200).json({ notifications });
  } catch (error) {
    await Log("backend", "error", "notification-api", error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await Log("backend", "info", "server", `Server started on port ${PORT}`);
});
