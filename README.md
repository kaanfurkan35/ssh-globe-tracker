# SSH Globe Tracker 🌍🔒

**Real-time SSH security monitoring with interactive global visualization, comprehensive analytics, and live connection tracking.**

![SSH Globe Tracker](public/ssh-globe-tracker-og.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Ubuntu](https://img.shields.io/badge/Ubuntu-20.04+-orange.svg)](https://ubuntu.com/)

---

## 📖 **Table of Contents**

- [🎯 Quick Start](#-quick-start)
- [📋 Features](#-features)
- [🛠️ Installation Methods](#️-installation-methods)
- [🚀 Usage Guide](#-usage-guide)
- [🌐 Deployment](#-deployment)
- [🔧 Management Commands](#-management-commands)
- [📊 API Reference](#-api-reference)
- [🔒 Security](#-security)
- [🐛 Troubleshooting](#-troubleshooting)

---

## 🎯 **Quick Start**

### **For Ubuntu Users (Recommended)**

```bash
# 1. Clone the repository
git clone https://github.com/kaanfurkan35/ssh-globe-tracker.git
cd ssh-globe-tracker

# 2. Run interactive setup
./setup-ubuntu.sh

# 3. Start the application
ssh-globe-tracker start

# 4. Open your browser
# Web interface: http://localhost:3001
```

### **Quick Commands**

```bash
ssh-globe-tracker start     # Start the service
ssh-globe-tracker stop      # Stop the service
ssh-globe-tracker status    # Check status
ssh-globe-tracker logs      # View logs
```

---

## 📋 **Features**

### **🗺️ Real-time Monitoring**
- **Interactive Global Map** - Visualize SSH connections worldwide with 3D globe
- **Live Connection Tracking** - See SSH attempts as they happen
- **Geographic Analysis** - IP-based location mapping with country statistics
- **Connection Timeline** - Historical view of SSH activity

### **🛡️ Security Analytics**
- **Risk Assessment** - Identify suspicious connection patterns
- **Authentication Analysis** - Track password vs key-based logins
- **Failed Attempt Detection** - Monitor brute force attacks
- **User Activity Tracking** - Per-user connection statistics

### **📊 Reporting & Analytics**
- **Automated Reports** - Generate detailed SSH summaries
- **Real-time Dashboard** - Live metrics and statistics
- **Data Export** - Export connection data in various formats
- **Historical Analysis** - Trend analysis over time

### **🔧 System Integration**
- **Native Ubuntu App** - Desktop integration with system tray
- **Systemd Service** - Proper Linux service management
- **WebSocket API** - Real-time data streaming
- **REST API** - Programmatic access to data

---

## 🛠️ **Installation Methods**

### **Method 1: Interactive Setup (Recommended)**
```bash
./setup-ubuntu.sh
```
**Features:**
- Guided installation process
- Automatic dependency installation
- Service configuration
- Desktop integration

### **Method 2: System Installation**
```bash
./ubuntu-package.sh install
```
**Features:**
- Direct system installation
- Creates systemd service
- Adds application menu entry
- Sets up command-line tools

### **Method 3: Debian Package**
```bash
./ubuntu-package.sh deb
sudo dpkg -i ssh-globe-tracker_1.0.0_all.deb
```
**Features:**
- Standard Ubuntu package
- Proper dependency management
- Easy distribution
- Clean uninstallation

### **Method 4: Development Mode**
```bash
./start.sh
```
**Features:**
- Hot reload for development
- Separate frontend/backend processes
- Development tools enabled
- Source code modification support

### **Method 5: Remote Deployment**
```bash
./deploy.sh user@target-machine
```
**Features:**
- Automated remote installation
- SSH-based deployment
- Multiple fallback methods
- Status verification

---

## 🚀 **Usage Guide**

### **Starting the Application**

#### **System Service (Recommended)**
```bash
# Start via command
ssh-globe-tracker start

# Or via systemd
sudo systemctl start ssh-globe-tracker

# Check status
ssh-globe-tracker status
```

#### **Manual Startup**
```bash
# Simple startup (no sudo required)
./start-simple.sh

# Development mode
./start.sh

# Check if running
./check-status.sh
```

### **Accessing the Interface**

#### **Local Access**
- **Web Interface:** http://localhost:3001
- **API Endpoint:** http://localhost:3001/api
- **Health Check:** http://localhost:3001/api/health

#### **Remote Access**
```bash
# SSH Tunnel (Recommended)
ssh -L 3001:localhost:3001 user@server

# Then access: http://localhost:3001

# Direct Access (if firewall allows)
http://server-ip:3001
```

### **Core Features Usage**

#### **🗺️ Interactive Map**
- **View Global Connections:** Click on country markers
- **Connection Details:** Hover over connection points
- **Time Range Selection:** Use date picker for historical data
- **Live Mode:** Toggle real-time updates

#### **📊 Dashboard Analytics**
- **Connection Statistics:** View daily/weekly/monthly trends
- **Geographic Distribution:** Top countries and regions
- **Authentication Methods:** Key vs password login analysis
- **Risk Assessment:** Failed attempts and suspicious activity

#### **📋 Report Generation**
```bash
# Generate fresh report
ssh-globe-tracker generate-report

# Load server data
ssh-globe-tracker load-data

# View logs
ssh-globe-tracker logs
```

#### **� Live Monitoring**
- **Real-time Updates:** Green dots show new connections
- **WebSocket Connection:** Automatic reconnection on failure
- **Connection Status:** Monitor connected clients
- **Alert System:** Visual/audio notifications for events

### **Data Sources**

#### **SSH Log Files**
- **Primary:** `/var/log/auth.log`
- **Archive:** `/var/log/auth.log.1`, etc.
- **Custom Logs:** Configurable via settings

#### **Generated Reports**
- **Location:** `/var/log/ssh_reports/`
- **Format:** Markdown with timestamps
- **Content:** Connection summaries, geographic data, statistics

---

## 🌐 **Deployment**

### **Single Machine Deployment**
```bash
# Local installation
./setup-ubuntu.sh

# Start service
ssh-globe-tracker start
```

### **Remote Machine Deployment**
```bash
# Deploy to remote server
./deploy.sh user@192.168.1.100

# Deploy to multiple servers
for server in server1 server2 server3; do
    ./deploy.sh user@$server
done
```

### **Production Deployment**
```bash
# Build package for distribution
./ubuntu-package.sh deb

# Deploy package
scp ssh-globe-tracker_1.0.0_all.deb user@server:~/
ssh user@server 'sudo dpkg -i ssh-globe-tracker_1.0.0_all.deb'
```

### **Docker Deployment**
```bash
# Build Docker image
docker build -t ssh-globe-tracker .

# Run container
docker run -d \
  -p 3001:3001 \
  -v /var/log:/var/log:ro \
  ssh-globe-tracker
```

---

## 🔧 **Management Commands**

### **Service Management**
```bash
# System service
ssh-globe-tracker start     # Start application
ssh-globe-tracker stop      # Stop application  
ssh-globe-tracker restart   # Restart application
ssh-globe-tracker status    # Show service status
ssh-globe-tracker logs      # View service logs

# Systemd commands
sudo systemctl start ssh-globe-tracker
sudo systemctl stop ssh-globe-tracker
sudo systemctl enable ssh-globe-tracker    # Auto-start on boot
sudo systemctl disable ssh-globe-tracker   # Disable auto-start
```

### **Development Commands**
```bash
# Development mode
./start.sh                  # Start with hot reload
./check-status.sh          # Check application status
./start-simple.sh          # Simple startup (no sudo)

# Monitoring
tail -f /tmp/ssh-globe-tracker.log           # View logs
ps aux | grep "node server.js"              # Check processes
curl http://localhost:3001/api/health       # Health check
```

### **Maintenance Commands**
```bash
# Report generation
python3 py_script/report_maker.py          # Generate new report

# Log management
sudo logrotate /etc/logrotate.d/ssh-globe-tracker

# Cleanup
./uninstall.sh                             # Complete removal
sudo apt-get purge ssh-globe-tracker       # Remove package
```

### **Troubleshooting Commands**
```bash
# Check dependencies
node --version              # Check Node.js
python3 --version          # Check Python
curl --version             # Check curl

# Check permissions
ls -la /var/log/auth.log                   # Check log access
groups $USER                               # Check user groups
sudo journalctl -u ssh-globe-tracker -f   # View systemd logs

# Network troubleshooting
sudo lsof -i :3001                        # Check port usage
sudo netstat -tulpn | grep 3001           # Check network connections
```

---
./ubuntu-package.sh install
ssh-globe-tracker start
```

### For Developers

There are several ways of editing your application.

**Use Lovable**


## 📊 **API Reference**

### **REST API Endpoints**

#### **Health Check**
```bash
GET /api/health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-09-11T08:55:10.203Z",
  "connectedClients": 2
}
```

#### **SSH Data**
```bash
GET /api/ssh-data           # Get all SSH connection data
GET /api/recent-connections # Get recent connections
GET /api/summary           # Get connection summary
```

#### **Real-time Updates**
```bash
WebSocket: ws://localhost:3001
```
**Events:**
- `ssh-connection`: New SSH connection detected
- `connection-summary`: Updated connection statistics
- `error`: Error notifications

### **Configuration API**
```bash
GET /api/config            # Get current configuration
POST /api/config           # Update configuration
POST /api/generate-report  # Trigger report generation
```

---

## 🔒 **Security**

### **File Permissions**
- **SSH Logs:** Read access to `/var/log/auth.log`
- **User Groups:** Application runs with `adm` group membership
- **Service User:** Configurable (default: `www-data`)

### **Network Security**
- **Local Binding:** Service binds to `localhost:3001` by default
- **CORS Policy:** Configurable cross-origin settings
- **API Authentication:** Optional API key authentication

### **Data Privacy**
- **Local Processing:** All data processed locally
- **No External Calls:** No data sent to external services
- **Log Retention:** Configurable log retention policies

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Service Won't Start**
```bash
# Check systemd service
sudo systemctl status ssh-globe-tracker

# Check logs
sudo journalctl -u ssh-globe-tracker -f

# Check port availability
sudo lsof -i :3001
```

#### **Permission Denied Errors**
```bash
# Add user to adm group
sudo usermod -a -G adm $USER

# Check log file permissions
ls -la /var/log/auth.log

# Restart session for group changes
```

#### **API Not Responding**
```bash
# Check if service is running
ps aux | grep "node server.js"

# Test API directly
curl http://localhost:3001/api/health

# Check firewall
sudo ufw status
```

#### **No SSH Data Showing**
```bash
# Check if SSH service is active
sudo systemctl status ssh

# Verify log file exists and has content
tail -f /var/log/auth.log

# Check report generation
python3 py_script/report_maker.py
```

### **Advanced Troubleshooting**

#### **Debug Mode**
```bash
# Start in debug mode
NODE_ENV=development node server/server.js

# Enable verbose logging
DEBUG=ssh-globe-tracker:* npm start
```

#### **Manual Report Generation**
```bash
# Generate report manually
cd py_script
python3 report_maker.py

# Check report output
cat /var/log/ssh_reports/ssh_summary_last14d.md
```

#### **Performance Issues**
```bash
# Check system resources
top -p $(pgrep -f "node server.js")

# Monitor memory usage
sudo journalctl -u ssh-globe-tracker --since "1 hour ago"

# Check disk space
df -h /var/log
```

---

## 🤝 **Contributing**

### **Development Setup**
```bash
# Clone repository
git clone https://github.com/kaanfurkan35/ssh-globe-tracker.git
cd ssh-globe-tracker

# Install dependencies
npm install
cd server && npm install && cd ..

# Start development mode
./start.sh
```

### **Project Structure**
```
ssh-globe-tracker/
├── src/                    # React frontend source
├── server/                 # Node.js backend
├── public/                 # Static assets
├── py_script/             # Python utilities
├── debian/                # Debian packaging
├── snap/                  # Snap packaging
├── *.sh                   # Management scripts
└── docs/                  # Documentation
```

### **Development Commands**
```bash
npm run dev                # Start frontend dev server
npm run build             # Build production frontend
npm test                  # Run tests
npm run lint              # Run linting
```

### **Script Development**
```bash
# Test scripts
./start.sh                 # Development mode
./check-status.sh          # Status monitoring
./deploy.sh user@test      # Test deployment

# Packaging
./ubuntu-package.sh build  # Build packages
./ubuntu-package.sh test   # Test installation
```

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **React Globe:** For the interactive 3D globe component
- **Node.js Community:** For excellent backend frameworks
- **Ubuntu/Debian:** For robust packaging systems
- **Open Source Community:** For inspiration and tools

---

## 📞 **Contact**

- **Author:** [kaanfurkan35](https://github.com/kaanfurkan35)
- **Project:** [SSH Globe Tracker](https://github.com/kaanfurkan35/ssh-globe-tracker)
- **Issues:** [Report Issues](https://github.com/kaanfurkan35/ssh-globe-tracker/issues)

---

**Made with ❤️ for SSH security monitoring**
