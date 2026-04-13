# Smart Dashboard - Data Center Monitoring

This is a simple dashboard built with React and Vite for monitoring thermal data in a data center.

## How to Install and Run Locally

To get this project running on your computer, follow these steps:

1. Clone the repository to your local machine.
2. Open your terminal in the project folder.
3. Run `npm install` to download all the necessary packages.
4. Run `npm run dev` to start the local development server.
5. Open your browser and go to `http://localhost:5173`.

## Alert System Logic

The system is designed to monitor a 30.0°C threshold. Here is how it works:

1. **Threshold**: If the temperature goes above 30.0°C, the system triggers a CRITICAL state.
2. **Visuals**: The background color changes to red and a warning label appears.
3. **Sound**: A synthetic siren sound plays using the Web Audio API to alert the user.
4. **Logs**: Every time the threshold is crossed, a message is added to the System Notifications list with a timestamp.
5. **Recovery**: If the temperature goes back below 30.0°C, the system logs a recovery message and returns to the normal blue theme.

The data is simulated using a sine-wave oscillation to make sure it hits the threshold every few seconds for testing purposes.

## Technologies Used

- React.js
- Tailwind CSS
- Lucide React Icons
- Vite
