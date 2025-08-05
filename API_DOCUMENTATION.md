# Speed Lens - API Documentation

## 📡 JavaScript API Reference

Speed Lens provides a comprehensive JavaScript API for programmatic access to all speed testing functionality. This documentation covers all available methods, events, and configuration options.

## 🚀 Core API

### SpeedTester Class

The main class that handles all speed testing functionality.

```javascript
// Initialize speed tester
const speedTester = new SpeedTester(config);
```

#### Constructor Options

```javascript
const config = {
    testDuration: 20000,        // Test duration in milliseconds
    serverLocation: 'auto',     // Server selection: 'auto', 'us', 'eu', 'asia'
    units: 'mbps',             // Speed units: 'mbps', 'kbps', 'gbps'
    theme: 'auto',             // Theme: 'light', 'dark', 'auto'
    notifications: true,        // Enable notifications
    autoTest: false,           // Enable automatic testing
    autoTestInterval: 1800000, // Auto-test interval (30 minutes)
    debugMode: false          // Enable debug logging
};
```

### Core Methods

#### Testing Methods

```javascript
// Start a speed test
speedTester.startTest()
    .then(results => {
        console.log('Test completed:', results);
    })
    .catch(error => {
        console.error('Test failed:', error);
    });

// Stop current test
speedTester.stopTest();

// Start multi-server test
speedTester.startMultiServerTest()
    .then(results => {
        console.log('Multi-server results:', results);
    });

// Check if test is running
const isRunning = speedTester.isTestRunning();
```

#### Results Methods

```javascript
// Get latest test results
const results = speedTester.getResults();

// Get test history
const history = speedTester.getHistory();

// Get filtered history
const filteredHistory = speedTester.getHistory({
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    minDownload: 50,
    maxPing: 100
});

// Clear test history
speedTester.clearHistory();
```

#### Configuration Methods

```javascript
// Update configuration
speedTester.updateConfig({
    testDuration: 30000,
    units: 'gbps'
});

// Get current configuration
const config = speedTester.getConfig();

// Reset to defaults
speedTester.resetConfig();
```

### Data Export Methods

```javascript
// Export as CSV
const csvData = speedTester.exportCSV();

// Export as JSON
const jsonData = speedTester.exportJSON();

// Export specific data
const exportData = speedTester.export({
    format: 'csv',          // 'csv', 'json', 'pdf'
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    fields: ['download', 'upload', 'ping']
});

// Download export file
speedTester.downloadExport('csv', 'speed-test-results.csv');
```

## 📊 Data Structures

### Test Result Object

```javascript
const testResult = {
    id: 'test_1640995200000',
    timestamp: '2024-01-01T12:00:00.000Z',
    duration: 20000,
    server: {
        location: 'New York, US',
        host: 'speedtest.example.com',
        distance: 45.2
    },
    metrics: {
        download: {
            speed: 150.45,      // Mbps
            bytes: 47640000,    // Total bytes
            quality: 'excellent' // Quality rating
        },
        upload: {
            speed: 45.20,
            bytes: 14130000,
            quality: 'good'
        },
        ping: {
            latency: 12.5,      // Milliseconds
            jitter: 2.1,        // Milliseconds
            quality: 'excellent'
        }
    },
    network: {
        type: 'wifi',
        ip: '192.168.1.100',
        isp: 'Example ISP',
        location: 'New York, NY'
    },
    device: {
        userAgent: 'Mozilla/5.0...',
        screen: '1920x1080',
        connection: '4g'
    }
};
```

### Configuration Object

```javascript
const configuration = {
    test: {
        duration: 20000,
        server: 'auto',
        multiServer: false,
        retries: 3
    },
    ui: {
        theme: 'auto',
        units: 'mbps',
        notifications: true,
        sounds: false
    },
    data: {
        retention: 30,          // Days to keep data
        autoExport: false,
        exportFormat: 'json'
    },
    network: {
        timeout: 30000,
        userAgent: 'custom-agent'
    }
};
```

### History Filter Object

```javascript
const historyFilter = {
    startDate: '2024-01-01',    // ISO date string
    endDate: '2024-12-31',      // ISO date string
    minDownload: 50,            // Minimum download speed
    maxDownload: 1000,          // Maximum download speed
    minUpload: 10,              // Minimum upload speed
    maxUpload: 500,             // Maximum upload speed
    minPing: 0,                 // Minimum ping
    maxPing: 100,               // Maximum ping
    server: 'us',               // Server location
    quality: 'good',            // Minimum quality rating
    limit: 100,                 // Maximum results
    offset: 0                   // Results offset
};
```

## 🔔 Event System

### Event Listeners

```javascript
// Test started
speedTester.on('testStart', (data) => {
    console.log('Test started:', data);
});

// Test progress update
speedTester.on('testProgress', (progress) => {
    console.log('Progress:', progress.percentage + '%');
    console.log('Current speed:', progress.currentSpeed);
    console.log('Stage:', progress.stage); // 'download', 'upload', 'ping'
});

// Test completed
speedTester.on('testComplete', (results) => {
    console.log('Test completed:', results);
});

// Test error
speedTester.on('testError', (error) => {
    console.error('Test error:', error);
});

// Configuration changed
speedTester.on('configChange', (newConfig) => {
    console.log('Config updated:', newConfig);
});

// History updated
speedTester.on('historyUpdate', (history) => {
    console.log('History updated:', history.length + ' tests');
});
```

### Custom Events

```javascript
// Emit custom event
speedTester.emit('customEvent', eventData);

// Listen for custom events
speedTester.on('customEvent', (data) => {
    console.log('Custom event:', data);
});

// Remove event listener
speedTester.off('testComplete', handlerFunction);

// Remove all listeners for event
speedTester.removeAllListeners('testProgress');
```

## 🔧 Advanced Features

### Network Diagnostics API

```javascript
// Run network diagnostics
speedTester.runDiagnostics()
    .then(diagnostics => {
        console.log('Network health:', diagnostics.health);
        console.log('Issues found:', diagnostics.issues);
        console.log('Recommendations:', diagnostics.recommendations);
    });

// Get network information
const networkInfo = speedTester.getNetworkInfo();
console.log('Connection type:', networkInfo.type);
console.log('ISP:', networkInfo.isp);
console.log('Location:', networkInfo.location);
```

### Analytics API

```javascript
// Get analytics summary
const analytics = speedTester.getAnalytics();
console.log('Average download:', analytics.averageDownload);
console.log('Peak performance:', analytics.peakPerformance);
console.log('Consistency score:', analytics.consistencyScore);

// Get performance trends
const trends = speedTester.getTrends('7days');
console.log('Download trend:', trends.download);
console.log('Upload trend:', trends.upload);
console.log('Ping trend:', trends.ping);

// Get usage statistics
const stats = speedTester.getUsageStats();
console.log('Total tests:', stats.totalTests);
console.log('Test frequency:', stats.frequency);
console.log('Active days:', stats.activeDays);
```

### Comparison API

```javascript
// Compare with global averages
const comparison = speedTester.compareGlobal();
console.log('Download vs global:', comparison.download);
console.log('Upload vs global:', comparison.upload);
console.log('Ping vs global:', comparison.ping);

// Check activity requirements
const activities = speedTester.checkActivities();
console.log('HD Streaming:', activities.hdStreaming); // true/false
console.log('Gaming:', activities.gaming);
console.log('Video Calls:', activities.videoCalls);
```

## 🎨 UI Integration API

### Theme Management

```javascript
// Set theme
speedTester.setTheme('dark');

// Get current theme
const currentTheme = speedTester.getTheme();

// Toggle theme
speedTester.toggleTheme();

// Listen for theme changes
speedTester.on('themeChange', (theme) => {
    console.log('Theme changed to:', theme);
});
```

### Notification API

```javascript
// Show notification
speedTester.showNotification('Test completed!', {
    type: 'success',        // 'info', 'success', 'warning', 'error'
    duration: 5000,         // Auto-dismiss time
    actions: [              // Action buttons
        {
            text: 'View Results',
            action: () => showResults()
        }
    ]
});

// Request notification permissions
speedTester.requestNotificationPermission()
    .then(granted => {
        console.log('Notifications:', granted ? 'enabled' : 'denied');
    });
```

### Chart Integration

```javascript
// Get chart data
const chartData = speedTester.getChartData('7days');

// Create performance chart
const chart = speedTester.createChart('performanceChart', {
    type: 'line',
    timeRange: '30days',
    metrics: ['download', 'upload', 'ping']
});

// Update existing chart
speedTester.updateChart(chart, newData);
```

## 🔍 Error Handling

### Error Types

```javascript
// Network errors
try {
    await speedTester.startTest();
} catch (error) {
    switch (error.type) {
        case 'NETWORK_ERROR':
            console.log('Network connection failed');
            break;
        case 'TIMEOUT_ERROR':
            console.log('Test timed out');
            break;
        case 'SERVER_ERROR':
            console.log('Server unavailable');
            break;
        case 'PERMISSION_ERROR':
            console.log('Permission denied');
            break;
        default:
            console.log('Unknown error:', error.message);
    }
}
```

### Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `NET_001` | No internet connection | Check network |
| `NET_002` | DNS resolution failed | Check DNS settings |
| `NET_003` | Server unreachable | Try different server |
| `TEST_001` | Test already running | Stop current test first |
| `TEST_002` | Invalid test configuration | Check config parameters |
| `DATA_001` | Storage quota exceeded | Clear old data |
| `PERM_001` | Notification permission denied | Enable in browser settings |

## 🔐 Security & Privacy

### Data Privacy

```javascript
// Check data collection status
const privacyStatus = speedTester.getPrivacyStatus();
console.log('Data collection:', privacyStatus.dataCollection); // false

// Get stored data summary
const dataInfo = speedTester.getDataInfo();
console.log('Local storage used:', dataInfo.storageUsed);
console.log('Test count:', dataInfo.testCount);

// Clear all local data
speedTester.clearAllData();
```

### Security Features

```javascript
// Generate anonymous session ID
const sessionId = speedTester.generateSessionId();

// Get data hash for integrity verification
const dataHash = speedTester.getDataHash();

// Validate data integrity
const isValid = speedTester.validateDataIntegrity();
```

## 🛠️ Utility Functions

### Helper Methods

```javascript
// Format speed values
const formatted = speedTester.formatSpeed(150.456, 'mbps');
console.log(formatted); // "150.46 Mbps"

// Calculate quality rating
const quality = speedTester.calculateQuality('download', 150);
console.log(quality); // "excellent"

// Convert units
const converted = speedTester.convertUnits(150, 'mbps', 'gbps');
console.log(converted); // 0.15

// Format time duration
const duration = speedTester.formatDuration(20000);
console.log(duration); // "20s"
```

### Validation Methods

```javascript
// Validate configuration
const isValidConfig = speedTester.validateConfig(config);

// Validate test results
const isValidResult = speedTester.validateResult(testResult);

// Check browser compatibility
const isCompatible = speedTester.checkCompatibility();
```

## 📱 Mobile API Extensions

### Device Information

```javascript
// Get device capabilities
const device = speedTester.getDeviceInfo();
console.log('Device type:', device.type); // 'mobile', 'tablet', 'desktop'
console.log('Connection type:', device.connection); // '4g', 'wifi', 'ethernet'
console.log('Screen size:', device.screen);

// Check mobile-specific features
const mobileFeatures = speedTester.getMobileFeatures();
console.log('Touch support:', mobileFeatures.touch);
console.log('Orientation support:', mobileFeatures.orientation);
```

### PWA Integration

```javascript
// Check PWA status
const pwaStatus = speedTester.getPWAStatus();
console.log('Is PWA:', pwaStatus.isPWA);
console.log('Is installed:', pwaStatus.isInstalled);

// Trigger PWA install prompt
speedTester.showInstallPrompt();

// Listen for PWA events
speedTester.on('pwaInstall', () => {
    console.log('PWA installed');
});
```

---

**For more examples and advanced usage, check the source code and additional documentation files.**
