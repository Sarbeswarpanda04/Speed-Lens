# Speed Lens - Installation Guide

## 🚀 Installation Options

Speed Lens can be used in multiple ways, from simple browser usage to full PWA installation. Choose the method that best fits your needs.

## 📱 Progressive Web App (PWA) Installation

### Desktop Installation

#### Chrome, Edge, Opera
1. **Open Speed Lens** in your browser
2. **Look for Install Icon** in the address bar (⬇️ or ➕)
3. **Click Install** and confirm
4. **Launch** from desktop shortcut or Start menu

#### Firefox
1. **Add to Bookmarks** for easy access
2. **Pin Tab** for persistent access
3. **Create Desktop Shortcut** manually

#### Safari (macOS)
1. **File Menu** → "Add to Dock"
2. **Share Button** → "Add to Dock"
3. **Bookmarks** → "Add to Favorites"

### Mobile Installation

#### iOS (Safari)
1. **Open** Speed Lens in Safari
2. **Tap Share Button** (📤)
3. **Select "Add to Home Screen"**
4. **Confirm** installation
5. **Launch** from home screen

#### Android (Chrome)
1. **Open** Speed Lens in Chrome
2. **Tap Menu** (⋮)
3. **Select "Add to Home screen"**
4. **Confirm** installation
5. **Find** app in app drawer

## 💻 Local Server Installation

### Requirements
- **Web Server** (Apache, Nginx, Python, Node.js, or any HTTP server)
- **Modern Browser** (Chrome 70+, Firefox 65+, Safari 12+, Edge 79+)
- **Internet Connection** (for speed testing)

### Option 1: Python Server

#### Python 3.x
```bash
# Navigate to project directory
cd /path/to/network-speed-tracker

# Start server
python -m http.server 8000

# Access at http://localhost:8000
```

#### Python 2.x
```bash
# Navigate to project directory
cd /path/to/network-speed-tracker

# Start server
python -m SimpleHTTPServer 8000

# Access at http://localhost:8000
```

### Option 2: Node.js Server

#### Using http-server
```bash
# Install http-server globally
npm install -g http-server

# Navigate to project directory
cd /path/to/network-speed-tracker

# Start server
http-server -p 8000

# Access at http://localhost:8000
```

#### Using live-server (with auto-reload)
```bash
# Install live-server globally
npm install -g live-server

# Navigate to project directory
cd /path/to/network-speed-tracker

# Start server with auto-reload
live-server --port=8000

# Access at http://localhost:8000
```

### Option 3: PHP Server

```bash
# Navigate to project directory
cd /path/to/network-speed-tracker

# Start PHP built-in server
php -S localhost:8000

# Access at http://localhost:8000
```

### Option 4: Using Apache/Nginx

#### Apache Configuration
```apache
<VirtualHost *:80>
    ServerName speedlens.local
    DocumentRoot /path/to/network-speed-tracker
    DirectoryIndex index.html
    
    <Directory /path/to/network-speed-tracker>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name speedlens.local;
    root /path/to/network-speed-tracker;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(css|js|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🐳 Docker Installation

### Dockerfile
```dockerfile
FROM nginx:alpine

# Copy application files
COPY . /usr/share/nginx/html

# Copy custom nginx configuration (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Commands
```bash
# Build the image
docker build -t speed-lens .

# Run the container
docker run -d -p 8080:80 --name speed-lens-app speed-lens

# Access at http://localhost:8080
```

### Docker Compose
```yaml
version: '3.8'

services:
  speed-lens:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
    volumes:
      - ./data:/data  # For persistent storage if needed
```

```bash
# Start with docker-compose
docker-compose up -d
```

## ☁️ Cloud Deployment

### GitHub Pages

1. **Fork Repository** or upload files to GitHub
2. **Go to Repository Settings**
3. **Navigate to Pages Section**
4. **Select Source Branch** (main/master)
5. **Access** at `https://yourusername.github.io/repository-name`

### Netlify

#### Method 1: Drag & Drop
1. **Zip Project Folder**
2. **Visit** [netlify.com](https://netlify.com)
3. **Drag & Drop** zip file
4. **Get** auto-generated URL

#### Method 2: Git Integration
1. **Connect GitHub Repository**
2. **Configure Build Settings** (usually not needed)
3. **Deploy Automatically** on commits

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project directory
cd /path/to/network-speed-tracker

# Deploy
vercel

# Follow prompts for configuration
```

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init hosting

# Deploy
firebase deploy
```

## 🔧 Configuration

### Environment Setup

#### Basic Configuration
No special configuration required for basic usage. Simply serve the files over HTTP/HTTPS.

#### HTTPS Configuration (Recommended)
For full PWA functionality and some advanced features, HTTPS is recommended:

```bash
# Using mkcert for local HTTPS
# Install mkcert
brew install mkcert  # macOS
# or
choco install mkcert  # Windows

# Create local certificate
mkcert localhost 127.0.0.1

# Use with your server
```

### Custom Configuration

#### Modify Default Settings
Edit `script.js` to change default configuration:

```javascript
// Default configuration options
const defaultConfig = {
    testDuration: 20000,        // 20 seconds
    serverLocation: 'auto',     // Auto-select server
    units: 'mbps',             // Speed units
    theme: 'auto',             // Theme preference
    notifications: true,        // Enable notifications
    autoTest: false,           // Auto-testing disabled
    autoTestInterval: 1800000  // 30 minutes
};
```

#### Custom Styling
Modify CSS variables in `styles.css`:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --background-color: #f8fafc;
    --text-color: #2d3748;
    --border-radius: 12px;
    --box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
```

## 🛠️ Troubleshooting Installation

### Common Issues

#### PWA Not Installing
- **Check HTTPS**: PWA requires secure connection
- **Verify Manifest**: Ensure manifest.json is accessible
- **Browser Support**: Check PWA compatibility
- **Clear Cache**: Remove old cached versions

#### Local Server Issues
- **Port Conflicts**: Try different port numbers
- **File Permissions**: Ensure files are readable
- **CORS Issues**: Use proper HTTP server
- **Cache Problems**: Clear browser cache

#### Performance Issues
- **Large Files**: Optimize images and assets
- **Slow Network**: Check internet connection
- **Browser Extensions**: Disable interfering extensions
- **Memory Usage**: Close unnecessary tabs/apps

### Debug Mode

Enable debug mode by adding `?debug=true` to URL:
```
http://localhost:8000?debug=true
```

This enables:
- Console logging
- Performance metrics
- Error details
- Debug information

## 📋 System Requirements

### Minimum Requirements
- **Browser**: Chrome 60+, Firefox 55+, Safari 11+, Edge 76+
- **RAM**: 1GB available memory
- **Storage**: 50MB free space (for PWA installation)
- **Network**: Active internet connection

### Recommended Requirements
- **Browser**: Latest version of supported browsers
- **RAM**: 2GB+ available memory
- **Storage**: 100MB+ free space
- **Network**: Broadband connection for accurate testing

### Optimal Performance
- **Browser**: Chrome/Edge latest with hardware acceleration
- **RAM**: 4GB+ system memory
- **Storage**: SSD with 500MB+ free space
- **Network**: Stable broadband or fiber connection

## 🔄 Updates

### Automatic Updates (PWA)
- **Browser-based**: Automatic updates when online
- **Manual Refresh**: Pull-to-refresh on mobile
- **Cache Clearing**: Clear data if issues occur

### Manual Updates
1. **Download** latest version
2. **Replace** old files
3. **Clear Cache** in browser
4. **Restart** application

### Version Checking
Check current version in:
- About section in app
- Browser console
- Service worker registration

---

**Need help with installation?** Contact the developer or create an issue on GitHub for assistance.
