# Vehicle Maintenance Scheduler Backend

A Node.js + Express backend for the Vehicle Maintenance Scheduler exam task.

This project implements:
- protected API access with test-server authentication
- logging middleware for backend operations
- fetching depots, vehicles, and notifications from the evaluation server
- a `/schedule` endpoint that schedules vehicles by available mechanic hours
- startup initialization with data fetch and auth token handling

## Files
- `server.js` - main Express application with authentication, logging, fetch, and scheduling logic
- `package.json` - project metadata and scripts
- `assets/` - contains exam screenshot evidence showing `npm start` and `/schedule` results
- `.env` - local environment variables (ignored by Git)

## Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/sanjanakati/ENG23CS0175.git
   cd "Online exam"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` with the required values:
   ```env
   PORT=3000
   EMAIL=your-email@example.com
   ROLL_NO=your-roll-number
   ACCESS_CODE=your-access-code
   CLIENT_ID=your-client-id
   CLIENT_SECRET=your-client-secret
   TEST_SERVER=http://4.224.186.213
   ```

## Run
```bash
npm start
```

The server starts on `http://localhost:3000`.

## API Endpoints

- `GET /api/health`
  - Returns server health
- `GET /evaluation-service/depots`
  - Protected route, returns depot data
- `GET /evaluation-service/vehicles`
  - Protected route, returns vehicle data
- `GET /evaluation-service/notifications`
  - Protected route, returns notifications data
- `GET /evaluation-service/notifications/priority`
  - Protected route, returns top 10 priority notifications by weight and recency
- `POST /schedule`
  - Calculates the best vehicle schedule using available mechanic hours

### Example `/schedule` request
```json
{
  "depotId": 1,
  "availableMechanicHours": 120
}
```

### Example response
```json
{
  "depotId": 1,
  "availableMechanicHours": 60,
  "selectedVehicles": [ ... ],
  "totalDuration": 60,
  "totalImpact": 132
}
```

## Screenshot Evidence
The `assets` folder includes screenshot files showing the running server and scheduler output.

- `assets/Screenshot 2026-06-19 123825.png`
- `assets/Screenshot 2026-06-19 123846.png`
- `assets/Screenshot 2026-06-19 123859.png`

### Embedded Screenshots
![Screenshot 1](assets/Screenshot%202026-06-19%20123825.png)
![Screenshot 2](assets/Screenshot%202026-06-19%20123846.png)
![Screenshot 3](assets/Screenshot%202026-06-19%20123859.png)

## Notes
- `.env` is intentionally excluded from Git to keep sensitive values private.
- The backend is ready for submission with code pushed to GitHub.
- Repo URL: `https://github.com/sanjanakati/ENG23CS0175.git`
