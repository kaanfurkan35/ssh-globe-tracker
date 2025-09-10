# SSH Globe Tracker 🌍

A modern, real-time SSH connection monitoring and visualization dashboard with interactive world map.

## ✨ Features

### 📊 **Historical Analysis**
- **Upload SSH logs** via file or manual input
- **Load from server** - automatically reads `/var/log/ssh_reports/ssh_summary_last14d.md`
- **Generate reports** - runs `report_maker.py` to create fresh 14-day reports
- **Geolocation mapping** - shows SSH connections on interactive world map
- **Authentication analysis** - color-coded markers for password vs key-based auth

### 🔴 **Real-Time Monitoring**
- **Live SSH monitoring** - shows active connections as pulsing green dots
- **WebSocket updates** - real-time notifications of new connections
- **System integration** - monitors actual SSH connections using system commands
- **Automatic geolocation** - live connections get geolocated in real-time

### 🎨 **Modern UI**
- **Glass morphism header** with backdrop blur effects
- **Responsive design** - works on desktop, tablet, and mobile
- **Dark cyber theme** - security-focused color scheme
- **Interactive statistics** - hover effects and animations
- **Professional layout** - optimized for security operations centers

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+ with required packages
- SSH log files in `/var/log/ssh_reports/`

### Installation & Setup

1. **Install dependencies:**
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server && npm install && cd ..
```

2. **Start the application:**
```bash
./start.sh
```

This will start:
- 🔧 **Backend API** on `http://localhost:3001`
- 🎨 **Frontend** on `http://localhost:8080`  
- 🔌 **WebSocket** on `ws://localhost:3002`

## 🛠️ Manual Setup

### Start Backend Only
```bash
cd server
npm start
```

### Start Frontend Only
```bash
npm run dev
```

## 📁 Project Structure

```
ssh-globe-tracker/
├── src/                    # Frontend React app
│   ├── components/         # UI components
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── server/                # Backend API
│   ├── server.js          # Express + WebSocket server
│   └── package.json       # Backend dependencies
├── py_script/             # Python scripts
│   └── report_maker.py    # SSH log processor
└── start.sh              # Startup script
```

## 🔧 API Endpoints

### REST API (Port 3001)
- `GET /api/ssh-summary` - Load SSH summary from server file
- `POST /api/generate-report` - Generate new 14-day report
- `GET /api/live-connections` - Get current active SSH connections
- `GET /api/health` - Server health check

### WebSocket (Port 3002)
- Real-time SSH connection notifications
- Live connection events
- Connection status updates

## 📊 Features Overview

### **Auto-Load & Refresh System**
- **Startup auto-load**: Automatically loads server data when app starts
- **Hourly auto-refresh**: Updates data from server every hour
- **Manual refresh button**: Immediate refresh on demand
- **Visual indicators**: Shows last refresh timestamp
- **Report generation date**: Displays when the server report was generated

### **Load from Server Button**
- Reads `/var/log/ssh_reports/ssh_summary_last14d.md`
- Automatically processes and displays data
- Shows file modification time and report generation date
- **⚠️ Important**: Server file contains only **last 14 days** of SSH activity
- **📅 Update schedule**: File updated daily at **00:10** 
- **🕐 Current day limitation**: Today's SSH connections may not appear until tomorrow's update

### **Refresh Button**
- Forces immediate reload from server file
- Useful for getting latest available data
- Shows spinning animation during refresh
- Updates timestamp when complete

### **Generate Report Button**
- Executes `py_script/report_maker.py`
- Processes last 14 days of SSH logs
- Generates fresh markdown report
- Automatically loads new data

### **Live Monitor Toggle**
- Monitors active SSH connections using `ss` command
- Shows real-time connection notifications
- Displays green pulsing dots on map
- WebSocket-powered real-time updates

### **Map Features**
- **Blue dots**: Secure connections (public key only)
- **Yellow dots**: Mixed authentication methods
- **Red dots**: Password-only authentication (higher risk)
- **Green dots**: Live/active connections (pulsing animation)
- **Size scaling**: Larger dots = more connection activity
- **Interactive tooltips**: Click for detailed information

## 🔒 Security Notes

- Backend requires read access to `/var/log/ssh_reports/`
- Live monitoring uses system commands (`ss`, `tail`)
- WebSocket connections are local-only by default
- No authentication implemented (add as needed for production)

## 🐛 Troubleshooting

### "No SSH summary file found"
- Ensure `/var/log/ssh_reports/ssh_summary_last14d.md` exists
- Run `python py_script/report_maker.py /var/log/ssh_reports/*.csv` manually
- Check file permissions

### "Failed to connect to SSH monitor server"
- Verify backend is running on port 3001
- Check for port conflicts
- Ensure server dependencies are installed

### "Live monitoring not working"
- Requires root/sudo access for SSH log monitoring
- Check `/var/log/auth.log` or `/var/log/secure` permissions
- Verify SSH service is running and logging

## 🎯 Development

### Build for Production
```bash
npm run build
```

### Lint Code
```bash
npm run lint
```

### Technology Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + WebSockets
- **Mapping**: Leaflet.js with OpenStreetMap
- **Geolocation**: ipinfo.io API
- **UI Components**: shadcn/ui + Radix UI

## 📈 Future Enhancements

- [ ] Authentication & user management
- [ ] Historical trend analysis
- [ ] Alert system for suspicious activity
- [ ] Export reports to PDF/CSV
- [ ] Custom geolocation providers
- [ ] Mobile app version
- [ ] Integration with SIEM systems

---

**Built for cybersecurity professionals who need real-time SSH monitoring with beautiful, actionable visualizations.** 🛡️
