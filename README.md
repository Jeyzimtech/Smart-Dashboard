# IoT Temperature Ops Center (Smart Dashboard)

This is an advanced IoT Ops Center built with React and Vite for industrial thermal telemetry.

## Developer
**Jefter Tokomere**

## Live Demo

🚀 **[View the Live IoT Ops Center (Deployed on Vercel)](https://smart-dashboard-smoky.vercel.app/)**

## How to Install and Run Locally

To get this project running on your computer, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/Jeyzimtech/Smart-Dashboard.git
   ```
2. Open your terminal in the `Smart-Dashboard` folder.
3. Install the required packages by running:
   ```bash
   npm install
   ```
4. Start the local development server by running:
   ```bash
   npm run dev
   ```
5. Open your browser and go to `http://localhost:5173`.

## Alert System Logic

The IoT Ops Center features a robust, real-time alerting system designed for industrial monitoring. The core logic is structured as follows:

- **Threshold Monitoring**: The system maintains a strict `TEMP_THRESHOLD` of **30.0°C**. Telemetry is polled every **10 seconds** (`POLLING_INTERVAL`).
- **Thermal Simulation**: To provide a realistic environment for demonstration:
  - Data oscillates using a sine-wave function: `Math.sin((2 * Math.PI * timeSec) / 40) * 8.5`.
  - Random "noise" is added to simulate sensor jitter.
  - A base temperature of **27.5°C** is used, ensuring frequent threshold crossings for testing.
- **Critical State Triggers**:
  - **Visual Alert**: When the threshold is exceeded, the Global State `isCritical` becomes true, triggering a theme shift to a deep red (`#2a0b0b`) and activating an emergency pulse overlay.
  - **Audio Synthesis**: The system uses the **Web Audio API** to generate a synthetic siren. A sawtooth oscillator cycles between 440Hz and 880Hz to create a high-visibility acoustic warning.
  - **Event Logging**: Every state change (Nominal → Critical or vice versa) is timestamped and recorded using a custom `addLog` helper, ensuring a permanent record for audit trails.
- **Manual Overrides**:
  - **Cooling Boost**: Users can manually activate cooling, which applies a `-10.0°C` offset to the telemetry to simulate system mitigation.
  - **Surge Simulation**: A manual override allows operators to simulate an immediate thermal surge to **35.2°C** for emergency response training.

## Technologies Used

- React.js
- Tailwind CSS
- Lucide React Icons
- Vite
