# SSH Globe Tracker - Quick Reference 🚀

**One-page quick reference for SSH Globe Tracker commands and usage**

---

## ⚡ **Quick Start**

```bash
# Install
git clone https://github.com/kaanfurkan35/ssh-globe-tracker.git
cd ssh-globe-tracker && ./setup-ubuntu.sh

# Start
ssh-globe-tracker start

# Access
http://localhost:3001
```

---

## 🔧 **Essential Commands**

### **Service Management**
```bash
ssh-globe-tracker start     # Start service
ssh-globe-tracker stop      # Stop service
ssh-globe-tracker status    # Check status
ssh-globe-tracker logs      # View logs
ssh-globe-tracker restart   # Restart service
```

### **Development**
```bash
./start.sh                  # Development mode
./start-simple.sh           # Simple start (no sudo)
./check-status.sh           # Full status check
```

### **Deployment**
```bash
./deploy.sh user@server     # Deploy remotely
./ubuntu-package.sh install # Install locally
./uninstall.sh              # Remove completely
```

---

## 🌐 **Access Points**

| Service | URL | Purpose |
|---------|-----|---------|
| **Web UI** | http://localhost:3001 | Main interface |
| **API** | http://localhost:3001/api | REST API |
| **Health** | http://localhost:3001/api/health | Health check |
| **WebSocket** | ws://localhost:3001 | Real-time updates |

---

## 📊 **Key Features**

### **🗺️ Interactive Map**
- Global SSH connection visualization
- Real-time updates with green dots
- Click countries for statistics
- Zoom and rotate globe

### **📋 Dashboard**
- Live connection feed
- Geographic statistics  
- Authentication analysis
- Security alerts

### **📈 Analytics**
- Connection trends
- User activity patterns
- Failed attempt tracking
- Report generation

---

## 🛠️ **System Integration**

### **Service Management**
```bash
# Systemd
sudo systemctl start ssh-globe-tracker
sudo systemctl enable ssh-globe-tracker

# Manual
./start-simple.sh
ps aux | grep "node server.js"
```

### **Logs & Monitoring**
```bash
# View logs
tail -f /tmp/ssh-globe-tracker.log
sudo journalctl -u ssh-globe-tracker -f

# Check SSH logs
tail -f /var/log/auth.log

# Reports
ls /var/log/ssh_reports/
```

---

## 🔍 **Troubleshooting**

### **Common Issues**
```bash
# Service won't start
sudo systemctl status ssh-globe-tracker
sudo lsof -i :3001

# Permission errors
sudo usermod -a -G adm $USER
ls -la /var/log/auth.log

# API not responding
curl http://localhost:3001/api/health
ps aux | grep node
```

### **Debug Mode**
```bash
# Debug startup
NODE_ENV=development node server/server.js

# Verbose logging
DEBUG=* npm start
```

---

## 📦 **Installation Methods**

| Method | Command | Use Case |
|--------|---------|----------|
| **Interactive** | `./setup-ubuntu.sh` | First-time users |
| **System** | `./ubuntu-package.sh install` | Production |
| **Package** | `./ubuntu-package.sh deb` | Distribution |
| **Development** | `./start.sh` | Development |
| **Remote** | `./deploy.sh user@server` | Remote deploy |

---

## 🔐 **Security**

### **File Permissions**
```bash
# Required access
/var/log/auth.log          # SSH logs (read)
/var/log/ssh_reports/      # Reports (write)

# User groups
sudo usermod -a -G adm $USER
```

### **Network Security**
```bash
# Local only (default)
localhost:3001

# Remote access (SSH tunnel)
ssh -L 3001:localhost:3001 user@server

# Firewall
sudo ufw allow 3001/tcp
```

---

## 📱 **API Quick Reference**

### **REST Endpoints**
```bash
GET /api/health              # Service health
GET /api/ssh-data            # All SSH data
GET /api/recent-connections  # Recent connections
GET /api/summary             # Statistics summary
```

### **WebSocket Events**
```javascript
// Connect
const ws = new WebSocket('ws://localhost:3001');

// Events
ssh-connection      // New SSH connection
connection-summary  // Updated statistics
error              // Error notifications
```

---

## 🚨 **Emergency Commands**

```bash
# Stop everything
sudo pkill -f "node server.js"
sudo systemctl stop ssh-globe-tracker

# Reset service
ssh-globe-tracker stop
./uninstall.sh
./setup-ubuntu.sh

# Check what's running
sudo lsof -i :3001
ps aux | grep ssh-globe-tracker
```

---

## 📞 **Support**

- **Documentation:** [README.md](README.md) | [USAGE.md](USAGE.md)
- **Issues:** [GitHub Issues](https://github.com/kaanfurkan35/ssh-globe-tracker/issues)
- **Repository:** https://github.com/kaanfurkan35/ssh-globe-tracker

---

**Print this page for offline reference!** 📄
