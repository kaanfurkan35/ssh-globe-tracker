#!/bin/bash

# SSH Globe Tracker - Ubuntu Application Builder and Installer
# This script helps you package and install SSH Globe Tracker as a proper Ubuntu application

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_NAME="ssh-globe-tracker"
VERSION="1.0.0"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_dependencies() {
    print_status "Checking dependencies..."
    
    local missing_deps=()
    
    # Check for required tools
    command -v node >/dev/null 2>&1 || missing_deps+=("nodejs")
    command -v npm >/dev/null 2>&1 || missing_deps+=("npm")
    command -v python3 >/dev/null 2>&1 || missing_deps+=("python3")
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Install them with: sudo apt update && sudo apt install ${missing_deps[*]}"
        exit 1
    fi
    
    print_success "All dependencies found"
}

build_application() {
    print_status "Building SSH Globe Tracker application..."
    
    # Build frontend
    print_status "Building frontend..."
    npm install
    npm run build
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd server
    npm install --production
    cd ..
    
    print_success "Application built successfully"
}

build_snap() {
    print_status "Building Snap package..."
    
    if ! command -v snapcraft >/dev/null 2>&1; then
        print_error "snapcraft not found. Install with: sudo apt install snapcraft"
        exit 1
    fi
    
    # Make scripts executable
    chmod +x snap/local/*.sh
    
    # Build the snap
    snapcraft
    
    print_success "Snap package built successfully"
    print_status "Install with: sudo snap install --dangerous ${APP_NAME}_${VERSION}_amd64.snap"
}

build_deb() {
    print_status "Building Debian package..."
    
    if ! command -v dpkg-buildpackage >/dev/null 2>&1; then
        print_error "dpkg-buildpackage not found. Install with: sudo apt install build-essential devscripts"
        exit 1
    fi
    
    # Make scripts executable
    chmod +x debian/ssh-globe-tracker.sh
    chmod +x debian/rules
    
    # Build the package
    dpkg-buildpackage -us -uc -b
    
    print_success "Debian package built successfully"
    print_status "Install with: sudo dpkg -i ../${APP_NAME}_${VERSION}_all.deb"
}

install_systemd_service() {
    print_status "Installing systemd service..."
    
    # Create application directory
    sudo mkdir -p /opt/ssh-globe-tracker/{backend,frontend,scripts}
    
    # Copy files
    sudo cp -r dist/* /opt/ssh-globe-tracker/frontend/ 2>/dev/null || true
    sudo cp -r server/* /opt/ssh-globe-tracker/backend/
    sudo cp -r py_script/* /opt/ssh-globe-tracker/scripts/
    
    # Install systemd service
    sudo cp debian/ssh-globe-tracker.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable ssh-globe-tracker
    
    # Install launcher script
    sudo cp debian/ssh-globe-tracker.sh /usr/local/bin/ssh-globe-tracker
    sudo chmod +x /usr/local/bin/ssh-globe-tracker
    
    # Install desktop file
    sudo cp debian/ssh-globe-tracker.desktop /usr/share/applications/
    sudo update-desktop-database
    
    print_success "System installation completed"
    print_status "Start with: ssh-globe-tracker start"
    print_status "Or find 'SSH Globe Tracker' in your applications menu"
}

create_appimage() {
    print_status "Creating AppImage..."
    
    if ! command -v linuxdeploy >/dev/null 2>&1; then
        print_warning "linuxdeploy not found. Download from: https://github.com/linuxdeploy/linuxdeploy/releases"
        print_status "Skipping AppImage creation"
        return
    fi
    
    # Create AppDir structure
    mkdir -p AppDir/usr/{bin,share/{applications,pixmaps}}
    mkdir -p AppDir/opt/ssh-globe-tracker/{backend,frontend,scripts}
    
    # Copy application files
    cp -r dist/* AppDir/opt/ssh-globe-tracker/frontend/ 2>/dev/null || true
    cp -r server/* AppDir/opt/ssh-globe-tracker/backend/
    cp -r py_script/* AppDir/opt/ssh-globe-tracker/scripts/
    
    # Copy launcher
    cp debian/ssh-globe-tracker.sh AppDir/usr/bin/ssh-globe-tracker
    chmod +x AppDir/usr/bin/ssh-globe-tracker
    
    # Copy desktop file
    cp debian/ssh-globe-tracker.desktop AppDir/usr/share/applications/
    
    # Create AppImage
    linuxdeploy --appdir AppDir --output appimage
    
    print_success "AppImage created successfully"
}

show_usage() {
    echo "SSH Globe Tracker - Ubuntu Application Builder"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  snap              Build Snap package"
    echo "  deb               Build Debian package"
    echo "  appimage          Create AppImage (portable)"
    echo "  install           Install directly to system (systemd service)"
    echo "  build             Build application only"
    echo "  all               Build all package types"
    echo "  clean             Clean build artifacts"
    echo "  help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deb            # Build .deb package for Ubuntu"
    echo "  $0 snap           # Build snap package"
    echo "  $0 install        # Install directly to system"
    echo "  $0 all            # Build all package types"
}

clean_build() {
    print_status "Cleaning build artifacts..."
    
    rm -rf dist/
    rm -rf node_modules/
    rm -rf server/node_modules/
    rm -rf AppDir/
    rm -f *.snap
    rm -f ../*.deb
    rm -f *.AppImage
    
    print_success "Clean completed"
}

main() {
    cd "$SCRIPT_DIR"
    
    case "${1:-help}" in
        "check")
            check_dependencies
            ;;
        "build")
            check_dependencies
            build_application
            ;;
        "snap")
            check_dependencies
            build_application
            build_snap
            ;;
        "deb")
            check_dependencies
            build_application
            build_deb
            ;;
        "appimage")
            check_dependencies
            build_application
            create_appimage
            ;;
        "install")
            check_dependencies
            build_application
            install_systemd_service
            ;;
        "all")
            check_dependencies
            build_application
            build_deb
            build_snap
            create_appimage
            ;;
        "clean")
            clean_build
            ;;
        "help"|*)
            show_usage
            ;;
    esac
}

# Check if script is being run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
