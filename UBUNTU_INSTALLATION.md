# SSH Globe Tracker - Ubuntu Application Installation Guide

This guide shows you how to install and run SSH Globe Tracker as a proper Ubuntu application.

## 🎯 **Installation Options**

### Option 1: Quick System Installation (Recommended)
```bash
# Install directly to system with systemd service
./ubuntu-package.sh install

# Start the application
ssh-globe-tracker start

# Or find "SSH Globe Tracker" in your applications menu
```

### Option 2: Debian Package (.deb)
```bash
# Build .deb package
./ubuntu-package.sh deb

# Install the package
sudo dpkg -i ../ssh-globe-tracker_1.0.0_all.deb

# Fix dependencies if needed
sudo apt install -f

# Launch from applications menu or command line
ssh-globe-tracker start
```

### Option 3: Snap Package
```bash
# Install snapcraft
sudo apt install snapcraft

# Build snap package
./ubuntu-package.sh snap

# Install the snap
sudo snap install --dangerous ssh-globe-tracker_1.0.0_amd64.snap

# Run the application
ssh-globe-tracker
```

### Option 4: Portable AppImage
```bash
# Build AppImage (portable, no installation needed)
./ubuntu-package.sh appimage

# Make executable and run
chmod +x SSH_Globe_Tracker-x86_64.AppImage
./SSH_Globe_Tracker-x86_64.AppImage
```

## 🚀 **Quick Start**

### Prerequisites
```bash
# Install required dependencies
sudo apt update
sudo apt install nodejs npm python3 python3-pip curl

# Verify installations
node --version    # Should be >= 18
npm --version
python3 --version
```

### Build and Install
```bash
# Clone and enter directory
git clone https://github.com/kaanfurkan35/ssh-globe-tracker.git
cd ssh-globe-tracker

# Quick install to system
./ubuntu-package.sh install

# Start the application
ssh-globe-tracker start
```

## 📱 **Using the Application**

### Command Line Interface
```bash
# Start the application
ssh-globe-tracker start

# Stop the application
ssh-globe-tracker stop

# Restart the application
ssh-globe-tracker restart

# Check status
ssh-globe-tracker status

# View logs
ssh-globe-tracker logs
```

### Desktop Application
- Find "SSH Globe Tracker" in your applications menu
- Category: Network → Security
- Or search for "SSH" in the activities overview

### Web Interface
- Automatically opens at: http://localhost:8080
- Backend API runs on: http://localhost:3001
- WebSocket for live data: ws://localhost:3002

## 🔧 **Configuration**

### Log Files Location
- Application logs: `/var/log/ssh_reports/`
- SSH summary file: `/var/log/ssh_reports/ssh_summary_last14d.md`

### Service Management
```bash
# Enable auto-start on boot
sudo systemctl enable ssh-globe-tracker

# Disable auto-start
sudo systemctl disable ssh-globe-tracker

# View service status
sudo systemctl status ssh-globe-tracker

# View service logs
sudo journalctl -u ssh-globe-tracker -f
```

### Permissions
The application needs access to:
- Network interfaces (for monitoring SSH connections)
- SSH log files (typically in `/var/log/`)
- System information (for connection analysis)

## 🛠 **Development Mode**

For development, you can still use the original method:
```bash
# Development mode with hot reload
./start.sh
```

## 📦 **Package Information**

### Debian Package Details
- **Package name**: ssh-globe-tracker
- **Version**: 1.0.0
- **Architecture**: all
- **Category**: Network/Security
- **Dependencies**: nodejs, python3, python3-pandas, python3-numpy

### File Locations (System Installation)
- **Application**: `/opt/ssh-globe-tracker/`
- **Executable**: `/usr/local/bin/ssh-globe-tracker`
- **Desktop file**: `/usr/share/applications/ssh-globe-tracker.desktop`
- **Service file**: `/etc/systemd/system/ssh-globe-tracker.service`

## 🔍 **Troubleshooting**

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :3001
   sudo lsof -i :8080
   ```

2. **Permission denied for log files**
   ```bash
   sudo chown -R www-data:www-data /var/log/ssh_reports/
   ```

3. **Service won't start**
   ```bash
   sudo journalctl -u ssh-globe-tracker -n 50
   ```

4. **Dependencies missing**
   ```bash
   sudo apt install nodejs npm python3 python3-pip
   ```

### Uninstallation

#### System Installation
```bash
# Stop and disable service
sudo systemctl stop ssh-globe-tracker
sudo systemctl disable ssh-globe-tracker

# Remove files
sudo rm -rf /opt/ssh-globe-tracker/
sudo rm /usr/local/bin/ssh-globe-tracker
sudo rm /etc/systemd/system/ssh-globe-tracker.service
sudo rm /usr/share/applications/ssh-globe-tracker.desktop

# Reload systemd
sudo systemctl daemon-reload
sudo update-desktop-database
```

#### Debian Package
```bash
sudo apt remove ssh-globe-tracker
```

#### Snap Package
```bash
sudo snap remove ssh-globe-tracker
```

## 🎯 **Features**

When installed as Ubuntu application, you get:

- ✅ **Desktop Integration**: Launch from applications menu
- ✅ **System Service**: Automatic startup and management
- ✅ **Command Line Tools**: Easy control via terminal
- ✅ **Proper Packaging**: Standard Ubuntu package formats
- ✅ **Security**: Runs with appropriate permissions
- ✅ **Logging**: Integrated with systemd journal
- ✅ **Auto-start**: Optional boot-time activation

## 📞 **Support**

For issues or questions:
- Check logs: `ssh-globe-tracker logs`
- GitHub Issues: [Repository Issues](https://github.com/kaanfurkan35/ssh-globe-tracker/issues)
- Documentation: See README_FEATURES.md for detailed features
