#!/bin/bash

# SSH Globe Tracker - Ubuntu Application Setup
# Quick setup script for different installation methods

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║             SSH Globe Tracker - Ubuntu Application          ║"
echo "║              Choose Your Installation Method                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${GREEN}Available Installation Options:${NC}"
echo ""
echo -e "${YELLOW}1. Quick System Install${NC} (Recommended for daily use)"
echo "   • Installs as systemd service"
echo "   • Adds to applications menu"
echo "   • Command: ./ubuntu-package.sh install"
echo ""
echo -e "${YELLOW}2. Debian Package (.deb)${NC} (Standard Ubuntu way)"
echo "   • Creates proper .deb package"
echo "   • Installable via dpkg/apt"
echo "   • Command: ./ubuntu-package.sh deb"
echo ""
echo -e "${YELLOW}3. Snap Package${NC} (Modern, sandboxed)"
echo "   • Snap store compatible"
echo "   • Automatic updates"
echo "   • Command: ./ubuntu-package.sh snap"
echo ""
echo -e "${YELLOW}4. AppImage${NC} (Portable, no install needed)"
echo "   • Single executable file"
echo "   • Run anywhere"
echo "   • Command: ./ubuntu-package.sh appimage"
echo ""
echo -e "${YELLOW}5. Development Mode${NC} (For developers)"
echo "   • Hot reload during development"
echo "   • Command: ./start.sh"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo -e "${GREEN}Installing SSH Globe Tracker to system...${NC}"
        ./ubuntu-package.sh install
        echo ""
        echo -e "${GREEN}✅ Installation complete!${NC}"
        echo "Start with: ssh-globe-tracker start"
        echo "Or find 'SSH Globe Tracker' in your applications menu"
        ;;
    2)
        echo -e "${GREEN}Building Debian package...${NC}"
        ./ubuntu-package.sh deb
        echo ""
        echo -e "${GREEN}✅ Package built!${NC}"
        echo "Install with: sudo dpkg -i ../ssh-globe-tracker_1.0.0_all.deb"
        ;;
    3)
        echo -e "${GREEN}Building Snap package...${NC}"
        if ! command -v snapcraft >/dev/null 2>&1; then
            echo -e "${RED}Snapcraft not installed. Installing...${NC}"
            sudo apt update && sudo apt install snapcraft
        fi
        ./ubuntu-package.sh snap
        echo ""
        echo -e "${GREEN}✅ Snap built!${NC}"
        echo "Install with: sudo snap install --dangerous ssh-globe-tracker_1.0.0_amd64.snap"
        ;;
    4)
        echo -e "${GREEN}Creating AppImage...${NC}"
        ./ubuntu-package.sh appimage
        echo ""
        echo -e "${GREEN}✅ AppImage created!${NC}"
        echo "Run with: ./SSH_Globe_Tracker-x86_64.AppImage"
        ;;
    5)
        echo -e "${GREEN}Starting development mode...${NC}"
        if [ ! -f "./start.sh" ]; then
            echo -e "${RED}start.sh not found. Make sure you're in the correct directory.${NC}"
            exit 1
        fi
        ./start.sh
        ;;
    *)
        echo -e "${RED}Invalid choice. Please run the script again and choose 1-5.${NC}"
        exit 1
        ;;
esac
