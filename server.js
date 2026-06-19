const express = require('express');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Store authentication token globally (set after auth)
let authToken = null;
let depotsData = [];
let vehiclesData = [];
let notificationsData = [];

// Logging Middleware
const Log = async (stack, level, packageName, message) => {
  try {
    if (!authToken) {
      console.warn('Remote log skipped: auth token not available yet');
      return;
    }

    const logPayload = {
      stack,
      level,
      package: packageName,
      message
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    };

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

// ===== TASK 2: FETCH PROTECTED APIs =====

// Authenticate with test server
const authenticateWithServer = async () => {
  try {
    await Log("backend", "info", "auth", "Authenticating with test server");
    
    const authPayload = {
      email: process.env.EMAIL,
      name: "Sanjana S Katti",
      rollNo: process.env.ROLL_NO,
      accessCode: process.env.ACCESS_CODE,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET
    };

    const response = await fetch(`${process.env.TEST_SERVER}/evaluation-service/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authPayload)
    });

    const data = await response.json();
    authToken = data.access_token;
    await Log("backend", "info", "auth", "Authentication successful");
    console.log("✅ Authenticated with test server");
    return true;
  } catch (error) {
    await Log("backend", "error", "auth", `Authentication failed: ${error.message}`);
    console.error("❌ Authentication failed:", error.message);
    return false;
  }
};

// Fetch depots from test server
const fetchDepots = async () => {
  try {
    if (!authToken) {
      await Log("backend", "warn", "depot-fetch", "No auth token available");
      return false;
    }

    await Log("backend", "info", "depot-fetch", "Fetching depots from test server");
    
    const response = await fetch(`${process.env.TEST_SERVER}/evaluation-service/depots`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const data = await response.json();
    depotsData = data.depots || [];
    await Log("backend", "info", "depot-fetch", `Fetched ${depotsData.length} depots`);
    console.log(`✅ Fetched ${depotsData.length} depots`);
    return true;
  } catch (error) {
    await Log("backend", "error", "depot-fetch", `Failed to fetch depots: ${error.message}`);
    console.error("❌ Depot fetch failed:", error.message);
    return false;
  }
};

// Fetch vehicles from test server
const fetchVehicles = async () => {
  try {
    if (!authToken) {
      await Log("backend", "warn", "vehicle-fetch", "No auth token available");
      return false;
    }

    await Log("backend", "info", "vehicle-fetch", "Fetching vehicles from test server");
    
    const response = await fetch(`${process.env.TEST_SERVER}/evaluation-service/vehicles`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const data = await response.json();
    vehiclesData = data.vehicles || [];
    await Log("backend", "info", "vehicle-fetch", `Fetched ${vehiclesData.length} vehicles`);
    console.log(`✅ Fetched ${vehiclesData.length} vehicles`);
    return true;
  } catch (error) {
    await Log("backend", "error", "vehicle-fetch", `Failed to fetch vehicles: ${error.message}`);
    console.error("❌ Vehicle fetch failed:", error.message);
    return false;
  }
};

const fetchNotifications = async () => {
  try {
    if (!authToken) {
      await Log("backend", "warn", "notification-fetch", "No auth token available");
      return false;
    }

    await Log("backend", "info", "notification-fetch", "Fetching notifications from test server");
    
    const response = await fetch(`${process.env.TEST_SERVER}/evaluation-service/notifications`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const data = await response.json();
    notificationsData = data.notifications || [];
    await Log("backend", "info", "notification-fetch", `Fetched ${notificationsData.length} notifications`);
    console.log(`✅ Fetched ${notificationsData.length} notifications`);
    return true;
  } catch (error) {
    await Log("backend", "error", "notification-fetch", `Failed to fetch notifications: ${error.message}`);
    console.error("❌ Notification fetch failed:", error.message);
    return false;
  }
};

// Initialize server data on startup
const initializeServer = async () => {
  console.log("🚀 Initializing server...");
  await authenticateWithServer();
  await fetchDepots();
  await fetchVehicles();
  await fetchNotifications();
  console.log("✅ Server initialization complete");
};

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
    await Log("backend", "info", "depot-api", "Serving depot data");
    res.status(200).json({ depots: depotsData });
  } catch (error) {
    await Log("backend", "error", "depot-api", error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vehicles API (GET)
app.get('/evaluation-service/vehicles', authenticateToken, async (req, res) => {
  try {
    await Log("backend", "info", "vehicle-api", "Serving vehicle data");
    res.status(200).json({ vehicles: vehiclesData });
  } catch (error) {
    await Log("backend", "error", "vehicle-api", error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Campus Notifications API (GET)
app.get('/evaluation-service/notifications', authenticateToken, async (req, res) => {
  try {
    await Log("backend", "info", "notification-api", "Serving notifications data");
    res.status(200).json({ notifications: notificationsData });
  } catch (error) {
    await Log("backend", "error", "notification-api", error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Scheduling helpers
const selectVehicles = (maxHours, vehicles) => {
  const n = vehicles.length;
  const W = Math.max(0, Math.floor(maxHours));
  const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));

  for (let i = 1; i <= n; i += 1) {
    const { Duration, Impact } = vehicles[i - 1];
    for (let w = 0; w <= W; w += 1) {
      const without = dp[i - 1][w];
      if (Duration <= w) {
        const withItem = dp[i - 1][w - Duration] + Impact;
        if (withItem > without) {
          dp[i][w] = withItem;
        } else {
          dp[i][w] = without;
        }
      } else {
        dp[i][w] = without;
      }
    }
  }

  let remaining = W;
  const selected = [];
  for (let i = n; i > 0; i -= 1) {
    const { Duration, TaskID, Impact } = vehicles[i - 1];
    if (remaining >= Duration && dp[i][remaining] === dp[i - 1][remaining - Duration] + Impact) {
      selected.push(vehicles[i - 1]);
      remaining -= Duration;
    }
  }

  const result = selected.reverse();
  const totalDuration = result.reduce((sum, item) => sum + item.Duration, 0);
  const totalImpact = result.reduce((sum, item) => sum + item.Impact, 0);
  return { selectedVehicles: result, totalDuration, totalImpact };
};

// Schedule endpoint
app.post('/schedule', async (req, res) => {
  try {
    const { depotId, availableMechanicHours } = req.body;
    let hours = availableMechanicHours;

    if (depotId != null && (hours == null || hours === 0)) {
      const depot = depotsData.find((item) => item.ID === depotId);
      if (!depot) {
        return res.status(404).json({ error: 'Depot not found' });
      }
      hours = depot.MechanicHours;
    }

    if (hours == null) {
      return res.status(400).json({ error: 'depotId or availableMechanicHours is required' });
    }

    const { selectedVehicles, totalDuration, totalImpact } = selectVehicles(hours, vehiclesData);
    await Log("backend", "info", "scheduler", `Generated schedule for ${hours} hours`);

    res.json({
      depotId: depotId || null,
      availableMechanicHours: hours,
      selectedVehicles,
      totalDuration,
      totalImpact
    });
  } catch (error) {
    await Log("backend", "error", "scheduler", error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await Log("backend", "info", "server", `Server started on port ${PORT}`);
  
  // Initialize server with real data
  await initializeServer();
});
