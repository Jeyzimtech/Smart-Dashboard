# 🌌 Smart Data Center Monitor (React Edition)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide_Icons-FF69B4?style=for-the-badge&logo=lucide&logoColor=white)

A professional-grade, real-time **React** Single Page Application (SPA) designed for thermal monitoring in mission-critical data center environments.

## 🚀 Key Features

*   **⚛️ Fully Built with React**: Modern functional components and hooks (`useState`, `useEffect`, `useRef`).
*   **📊 Live Telemetry Stream**: Simulates 10-second polling intervals with realistic thermal oscillation.
*   **🚨 Critical Alert System**: Automatic threshold monitoring with deep-red UI transitions and pulsing error states.
*   **📱 Universal Responsiveness**: Fluid layouts for Mobile, Tablet, and Desktop (optimized with Tailwind CSS).
*   **🔔 Interactive Notifications**: Dynamic dropdown incident logs with real-time event tracking.
*   **🎨 Premium Vanguard Aesthetic**: Industrial dark theme featuring glassmorphism and modern typography.

## 🛠️ Technology Stack

- **Framework**: [React.js](https://react.dev/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Fonts**: Space Grotesk & Inter (via Google Fonts)

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jeyzimtech/Smart-Dashboard.git
   cd Smart-Dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

## 📈 Monitoring Logic

The system utilizes a sinusoidal oscillation algorithm to simulate realistic server rack temperature shifts:
- **Nominal Baseline**: 27.5°C
- **Critical Threshold**: 30.0°C
- **Update Frequency**: 10.0 seconds

---
Developed by **Jefter** - Technical System Operator
