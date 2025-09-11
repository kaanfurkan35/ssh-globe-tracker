# SSH Globe Tracker - Deployment Guide

## 📋 Prerequisites

### System Requirements
- Ubuntu/Debian Linux (tested on Ubuntu 20.04+)
- Node.js 18+ (will be installed automatically)
- Python 3.8+ (usually pre-installed)
- Root/sudo access
- Internet connection for initial setup

### Required Ports
- **3001**: Backend API and Web Interface
- **SSH access** to the target machine for deployment

---

## 🎯 Method 1: Automated Installation (Recommended)

### Option A: Using the Debian Package
```bash
# 1. Copy the .deb package to target machine
scp ssh-globe-tracker_1.0.0_all.deb user@target-machine:~/

# 2. Install on target machine
ssh user@target-machine
sudo dpkg -i ssh-globe-tracker_1.0.0_all.deb
sudo apt-get install -f  # Fix any dependency issues

# 3. Start the service
ssh-globe-tracker start
```

### Option B: Using the Setup Script
```bash
# 1. Copy project to target machine
scp -r /path/to/ssh-globe-tracker user@target-machine:~/

# 2. Run setup on target machine
ssh user@target-machine
cd ssh-globe-tracker
chmod +x setup-ubuntu.sh
sudo ./setup-ubuntu.sh

# 3. Start the application
ssh-globe-tracker start
```

---

## 🔧 Method 2: Manual Installation

### Step 1: Copy Project Files
```bash
# From your current machine
scp -r /home/kaltinok/ssh-globe-tracker user@target-machine:~/
```

### Step 2: Install Dependencies on Target Machine
```bash
ssh user@target-machine
cd ssh-globe-tracker

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python and pip
sudo apt-get update
sudo apt-get install -y python3 python3-pip

# Install Python dependencies
pip3 install requests python-geoip2-database

# Install project dependencies
cd server
npm install
cd ..
npm install
```

### Step 3: Create Required Directories
```bash
# Create log directory
sudo mkdir -p /var/log/ssh_reports
sudo chown $USER:$USER /var/log/ssh_reports

# Create application directory (optional, for system-wide installation)
sudo mkdir -p /opt/ssh-globe-tracker
sudo cp -r . /opt/ssh-globe-tracker/
sudo chown -R $USER:$USER /opt/ssh-globe-tracker
```

### Step 4: Setup Service (Optional)
```bash
# Copy service files
sudo cp debian/ssh-globe-tracker.service /etc/systemd/system/
sudo cp debian/ssh-globe-tracker.sh /usr/bin/ssh-globe-tracker
sudo chmod +x /usr/bin/ssh-globe-tracker

# Update service file with correct user
sudo sed -i "s/User=kaltinok/User=$USER/g" /etc/systemd/system/ssh-globe-tracker.service

# Reload systemd
sudo systemctl daemon-reload
sudo systemctl enable ssh-globe-tracker
```

---

## 🚀 Method 3: Development Mode (Quick Start)

For quick testing or development:

```bash
# 1. Copy project
scp -r ssh-globe-tracker user@target-machine:~/

# 2. On target machine
ssh user@target-machine
cd ssh-globe-tracker

# 3. Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install dependencies
cd server && npm install && cd ..
npm install

# 5. Start in development mode
chmod +x start.sh
./start.sh
```

---

## 🌐 Method 4: Docker Deployment (Advanced)

Create a Docker setup for containerized deployment:

```bash
# Create Dockerfile (you can add this to your project)
cat > Dockerfile << 'EOF'
FROM node:20-slim

# Install Python and system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip3 install requests python-geoip2-database

# Create app directory
WORKDIR /app

# Copy package files
COPY server/package*.json ./server/
COPY package*.json ./

# Install Node.js dependencies
RUN cd server && npm install
RUN npm install

# Copy application code
COPY . .

# Create log directory
RUN mkdir -p /var/log/ssh_reports

# Expose port
EXPOSE 3001

# Start command
CMD ["node", "server/server.js"]
EOF

# Build and run
docker build -t ssh-globe-tracker .
docker run -d -p 3001:3001 -v /var/log:/var/log ssh-globe-tracker
```

---

## 🔐 Security Considerations

### Firewall Setup
```bash
# Allow SSH Globe Tracker port
sudo ufw allow 3001/tcp
sudo ufw reload
```

### SSH Log Access
The application needs to read SSH logs. Ensure the user has proper permissions:
```bash
# Add user to adm group (for log access)
sudo usermod -a -G adm $USER

# Or create a specific setup for log access
sudo chmod 644 /var/log/auth.log
```

---

## 📊 Post-Installation Verification

### Test the Installation
```bash
# Check if service is running
sudo systemctl status ssh-globe-tracker

# Test API endpoint
curl http://localhost:3001/api/health

# Check logs
tail -f /var/log/ssh_reports/ssh_summary_last14d.md
```

### Access the Web Interface
- Open browser to: `http://target-machine-ip:3001`
- Or use SSH tunnel: `ssh -L 3001:localhost:3001 user@target-machine`

---

## 🔧 Troubleshooting

### Common Issues
1. **Permission Denied for /var/log/auth.log**
   ```bash
   sudo usermod -a -G adm $USER
   # Log out and back in
   ```

2. **Port 3001 Already in Use**
   ```bash
   sudo lsof -ti:3001 | xargs sudo kill -9
   ```

3. **Node.js Not Found**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Python Dependencies Missing**
   ```bash
   pip3 install requests python-geoip2-database
   ```

---

## 📝 Configuration Files to Update

Before deployment, you might want to update:

1. **Server Configuration** (`server/server.js`):
   - Change default paths if needed
   - Update CORS settings for remote access

2. **Service Configuration** (`debian/ssh-globe-tracker.service`):
   - Update username
   - Adjust memory/CPU limits

3. **Startup Script** (`debian/ssh-globe-tracker.sh`):
   - Update paths
   - Modify default browser behavior

---

## 🎉 Quick Deployment Commands

For the fastest deployment on a new Ubuntu machine:

```bash
# On target machine (one-liner)
curl -fsSL https://github.com/kaanfurkan35/ssh-globe-tracker/raw/develop/setup-ubuntu.sh | sudo bash

# Or if you have the files locally
scp ssh-globe-tracker_1.0.0_all.deb user@target:~/ && \
ssh user@target 'sudo dpkg -i ssh-globe-tracker_1.0.0_all.deb && sudo apt-get install -f && ssh-globe-tracker start'
```
