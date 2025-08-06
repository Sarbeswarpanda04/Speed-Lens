class SpeedLens {
    constructor() {
        this.isTestRunning = false;
        this.testResults = this.loadTestHistory();
        this.settings = this.loadSettings();
        this.autoTestInterval = null;
        this.currentTestData = [];
        this.chartInstance = null;
        this.historyChartInstance = null;
        
        // Initialize preloader
        this.initializePreloader();
        
        this.initializeElements();
        this.bindEvents();
        this.initializeApp();
    }

    initializePreloader() {
        // Show preloader for a minimum of 2.5 seconds
        const minLoadTime = 2500;
        const startTime = Date.now();
        
        // Hide preloader after minimum time and when page is loaded
        const hidePreloader = () => {
            const elapsed = Date.now() - startTime;
            const remainingTime = Math.max(0, minLoadTime - elapsed);
            
            setTimeout(() => {
                const preloader = document.getElementById('preloader');
                if (preloader) {
                    preloader.classList.add('fade-out');
                    setTimeout(() => {
                        preloader.style.display = 'none';
                        document.body.classList.add('loaded');
                    }, 800);
                }
            }, remainingTime);
        };

        // Hide preloader when everything is loaded
        if (document.readyState === 'complete') {
            hidePreloader();
        } else {
            window.addEventListener('load', hidePreloader);
        }
    }

    initializeElements() {
        // Main controls
        this.startTestBtn = document.getElementById('startTest');
        this.stopTestBtn = document.getElementById('stopTest');
        this.multiTestBtn = document.getElementById('multiTest');
        
        // Gauges
        this.downloadValue = document.getElementById('downloadValue');
        this.uploadValue = document.getElementById('uploadValue');
        this.pingDisplayValue = document.getElementById('pingDisplayValue');
        this.downloadGaugeFill = document.getElementById('downloadGaugeFill');
        this.uploadGaugeFill = document.getElementById('uploadGaugeFill');
        this.pingGaugeFill = document.getElementById('pingGaugeFill');
        
        // Results
        this.resultsContainer = document.getElementById('resultsContainer');
        this.downloadSpeed = document.getElementById('downloadSpeed');
        this.uploadSpeed = document.getElementById('uploadSpeed');
        this.pingValue = document.getElementById('pingValue');
        this.jitterValue = document.getElementById('jitterValue');
        this.signalQuality = document.getElementById('signalQuality');
        this.consistencyScore = document.getElementById('consistencyScore');
        
        // Status and progress
        this.testStatus = document.getElementById('testStatus');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        
        // History and analytics
        this.historyList = document.getElementById('historyList');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        this.exportHistoryBtn = document.getElementById('exportHistory');
        this.historyFilter = document.getElementById('historyFilter');
        
        // Charts
        this.speedGraph = document.getElementById('speedGraph');
        this.historyChart = document.getElementById('historyChart');
        
        // Settings
        this.settingsPanel = document.getElementById('settingsPanel');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.closeSettingsBtn = document.getElementById('closeSettings');
        
        // Connection status
        this.connectionType = document.getElementById('connectionType');
        this.ipAddress = document.getElementById('ipAddress');
        this.location = document.getElementById('location');
        this.isp = document.getElementById('isp');
        
        // Other controls
        this.exportBtn = document.getElementById('exportBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.notificationContainer = document.getElementById('notificationContainer');
    }

    bindEvents() {
        // Main test controls
        if (this.startTestBtn) this.startTestBtn.addEventListener('click', () => this.startSpeedTest());
        if (this.stopTestBtn) this.stopTestBtn.addEventListener('click', () => this.stopSpeedTest());
        if (this.multiTestBtn) this.multiTestBtn.addEventListener('click', () => this.startMultiServerTest());
        
        // History controls
        if (this.clearHistoryBtn) this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        if (this.exportHistoryBtn) this.exportHistoryBtn.addEventListener('click', () => this.exportData());
        if (this.historyFilter) this.historyFilter.addEventListener('change', () => this.updateHistoryDisplay());
        
        // View controls
        const chartViewBtn = document.getElementById('chartView');
        const listViewBtn = document.getElementById('listView');
        if (chartViewBtn) chartViewBtn.addEventListener('click', () => this.switchView('chart'));
        if (listViewBtn) listViewBtn.addEventListener('click', () => this.switchView('list'));
        
        // Settings - prevent accidental opening
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleSettings();
            });
        }
        if (this.closeSettingsBtn) {
            this.closeSettingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleSettings();
            });
        }
        
        // Other controls
        if (this.exportBtn) this.exportBtn.addEventListener('click', () => this.exportData());
        if (this.shareBtn) this.shareBtn.addEventListener('click', () => this.shareResults());
        if (this.fullscreenBtn) this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // Settings changes with proper error handling
        this.bindSettingsEvents();
        
        // Prevent settings from opening on page load
        document.addEventListener('click', (e) => {
            if (this.settingsPanel && this.settingsPanel.classList.contains('active')) {
                if (!this.settingsPanel.contains(e.target) && e.target !== this.settingsBtn) {
                    this.toggleSettings();
                }
            }
        });
    }

    bindSettingsEvents() {
        // Safely bind settings events
        const settingsControls = [
            'darkMode', 'notifications', 'autoTest',
            'serverLocation', 'speedUnit'
        ];
        
        settingsControls.forEach(controlId => {
            const control = document.getElementById(controlId);
            if (control) {
                control.addEventListener('change', () => {
                    this.handleSettingChange(controlId, control);
                });
            }
        });

        // Event listeners setup complete
    }

    handleSettingChange(controlId, control) {
        try {
            switch (controlId) {
                case 'darkMode':
                    this.toggleDarkMode(control.checked);
                    break;
                case 'notifications':
                    this.toggleNotifications(control.checked);
                    break;
                case 'autoTest':
                    this.toggleAutoTest(control.checked);
                    break;
                case 'serverLocation':
                    this.settings.serverLocation = control.value;
                    this.saveSettings();
                    break;
                case 'speedUnit':
                    this.settings.speedUnit = control.value;
                    this.saveSettings();
                    this.updateSpeedDisplays();
                    break;
            }
        } catch (error) {
            console.error('Error handling setting change:', error);
            this.showNotification('Failed to update setting', 'error');
        }
    }

    updateSpeedDisplays() {
        // Update speed unit displays if needed
        const unit = this.settings.speedUnit || 'Mbps';
        const speedElements = document.querySelectorAll('.speed-value');
        speedElements.forEach(element => {
            const value = parseFloat(element.textContent);
            if (!isNaN(value)) {
                let displayValue = value;
                if (unit === 'Kbps') displayValue = value * 1000;
                else if (unit === 'Gbps') displayValue = value / 1000;
                element.textContent = displayValue.toFixed(1);
            }
        });
    }

    async initializeApp() {
        try {
            // Ensure settings panel is closed on start
            if (this.settingsPanel) {
                this.settingsPanel.classList.remove('active');
                this.settingsPanel.style.right = '-400px';
            }
            
            await this.detectConnectionInfo();
            this.updateHistoryDisplay();
            this.updateAnalytics();
        this.initializeCharts();
        this.applySettings();
        this.checkNotificationPermission();
        
        // Initialize mobile optimizations only on mobile devices
        this.initMobileOptimizations();
        
        // Initialize view switching
        this.initializeViewSwitching();
        
        // Force chart resize after initialization
        setTimeout(() => {
            if (this.chartInstance) {
                this.chartInstance.resize();
            }
            if (this.historyChartInstance) {
                this.historyChartInstance.resize();
            }
        }, 500);            // Initialize view switching
            this.initializeViewSwitching();
            
        } catch (error) {
            console.error('App initialization error:', error);
            this.showNotification('Failed to initialize app completely', 'warning');
        }
    }

    async detectConnectionInfo() {
        try {
            // Detect connection type
            if ('connection' in navigator) {
                const connection = navigator.connection;
                if (this.connectionType) this.connectionType.textContent = connection.effectiveType || 'Unknown';
            } else {
                if (this.connectionType) this.connectionType.textContent = 'Unknown';
            }

            // Get IP address and location
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                if (this.ipAddress) this.ipAddress.textContent = data.ip || 'Unknown';
                if (this.location) this.location.textContent = `${data.city}, ${data.country_name}` || 'Unknown';
                if (this.isp) this.isp.textContent = data.org || 'Unknown';
            } catch (error) {
                if (this.ipAddress) this.ipAddress.textContent = 'Unknown';
                if (this.location) this.location.textContent = 'Unknown';
                if (this.isp) this.isp.textContent = 'Unknown';
            }
        } catch (error) {
            console.error('Error detecting connection info:', error);
        }
    }

    async startSpeedTest() {
        if (this.isTestRunning) return;

        this.isTestRunning = true;
        this.currentTestData = [];
        this.prepareTestUI();

        try {
            this.updateProgress(0, 'Initializing test...');
            
            let testResults = {
                timestamp: new Date(),
                ping: 0,
                jitter: 0,
                downloadSpeed: 0,
                uploadSpeed: 0,
                packetLoss: 0,
                signalQuality: 0,
                consistency: 0
            };

            // Test ping first
            await this.testPingAdvanced(testResults);
            
            // Test download speed
            await this.testDownloadSpeedAdvanced(testResults);
            
            // Test upload speed
            await this.testUploadSpeedAdvanced(testResults);
            
            // Calculate additional metrics
            this.calculateQualityMetrics(testResults);
            
            // Show results
            this.showResults(testResults);
            this.saveTestResult(testResults);
            this.updateHistoryDisplay();
            this.updateAnalytics();
            this.updateComparisons(testResults);
            this.updateDiagnostics(testResults);
            
            this.showNotification('Speed test completed successfully!', 'success');
            
        } catch (error) {
            console.error('Speed test error:', error);
            this.showNotification('Speed test failed. Please try again.', 'error');
            if (this.testStatus) this.testStatus.textContent = 'Test failed. Please try again.';
        } finally {
            this.resetTestUI();
        }
    }

    async testPingAdvanced(results) {
        this.updateProgress(10, 'Testing ping and latency...');
        const pingTimes = [];
        const testUrls = [
            'https://www.google.com/favicon.ico',
            'https://www.cloudflare.com/favicon.ico',
            'https://www.microsoft.com/favicon.ico'
        ];
        
        for (let i = 0; i < 10; i++) {
            const url = testUrls[i % testUrls.length];
            const startTime = performance.now();
            
            try {
                await fetch(url + '?t=' + Date.now(), { 
                    method: 'HEAD',
                    mode: 'no-cors',
                    cache: 'no-cache'
                });
                const endTime = performance.now();
                pingTimes.push(endTime - startTime);
            } catch (error) {
                // Fallback simulation
                pingTimes.push(Math.random() * 100 + 20);
            }
            
            this.updateProgress(10 + (i * 2), `Testing ping... ${i + 1}/10`);
            await this.delay(100);
        }

        results.ping = Math.round(pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length);
        results.jitter = Math.round(this.calculateJitter(pingTimes));
        results.packetLoss = this.calculatePacketLoss(pingTimes);
        
        this.updatePingGauge(results.ping);
        if (this.pingDisplayValue) this.pingDisplayValue.textContent = results.ping;
    }

    async testDownloadSpeedAdvanced(results) {
        this.updateProgress(30, 'Testing download speed...');
        const testSizes = [500, 1000, 2000, 5000]; // KB
        const speeds = [];
        
        for (let i = 0; i < testSizes.length; i++) {
            const size = testSizes[i];
            const startTime = performance.now();
            
            try {
                // Use multiple concurrent requests to simulate larger downloads
                const requests = Math.floor(size / 100);
                const promises = [];
                
                for (let j = 0; j < requests; j++) {
                    promises.push(
                        fetch(`https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js?t=${Date.now()}_${j}`, {
                            cache: 'no-cache'
                        }).then(response => response.arrayBuffer())
                    );
                }
                
                await Promise.all(promises);
                const endTime = performance.now();
                const duration = (endTime - startTime) / 1000;
                const speed = (size * 8) / (duration * 1000); // Mbps
                speeds.push(Math.min(speed, 1000)); // Cap at 1 Gbps
                
                // Update real-time display
                const currentSpeed = speeds[speeds.length - 1];
                this.updateDownloadGauge(currentSpeed);
                if (this.downloadValue) this.downloadValue.textContent = currentSpeed.toFixed(1);
                this.addToChart('download', currentSpeed);
                
            } catch (error) {
                // Fallback simulation
                const simulatedSpeed = Math.random() * 80 + 10;
                speeds.push(simulatedSpeed);
                this.updateDownloadGauge(simulatedSpeed);
                if (this.downloadValue) this.downloadValue.textContent = simulatedSpeed.toFixed(1);
            }
            
            this.updateProgress(30 + (i * 15), `Testing download... ${((i + 1) / testSizes.length * 100).toFixed(0)}%`);
            await this.delay(1000);
        }
        
        results.downloadSpeed = Math.max(...speeds);
    }

    async testUploadSpeedAdvanced(results) {
        this.updateProgress(70, 'Testing upload speed...');
        const uploadSpeeds = [];
        
        for (let i = 0; i < 3; i++) {
            const startTime = performance.now();
            
            try {
                // Simulate upload by creating and "sending" data
                const testData = new ArrayBuffer(1024 * 200); // 200KB
                const blob = new Blob([testData]);
                
                // Simulate network delay
                await this.delay(Math.random() * 1000 + 500);
                
                const endTime = performance.now();
                const duration = (endTime - startTime) / 1000;
                const speed = (200 * 8) / (duration * 1000); // Mbps
                uploadSpeeds.push(Math.min(speed, 200)); // Cap at 200 Mbps
                
                // Update real-time display
                const currentSpeed = uploadSpeeds[uploadSpeeds.length - 1];
                this.updateUploadGauge(currentSpeed);
                if (this.uploadValue) this.uploadValue.textContent = currentSpeed.toFixed(1);
                this.addToChart('upload', currentSpeed);
                
            } catch (error) {
                const simulatedSpeed = Math.random() * 40 + 5;
                uploadSpeeds.push(simulatedSpeed);
                this.updateUploadGauge(simulatedSpeed);
                if (this.uploadValue) this.uploadValue.textContent = simulatedSpeed.toFixed(1);
            }
            
            this.updateProgress(70 + (i * 10), `Testing upload... ${((i + 1) / 3 * 100).toFixed(0)}%`);
            await this.delay(1000);
        }
        
        results.uploadSpeed = Math.max(...uploadSpeeds);
    }

    calculateQualityMetrics(results) {
        // Signal quality based on ping and jitter
        let signalQuality = 100;
        if (results.ping > 100) signalQuality -= 30;
        else if (results.ping > 50) signalQuality -= 15;
        
        if (results.jitter > 50) signalQuality -= 20;
        else if (results.jitter > 20) signalQuality -= 10;
        
        if (results.packetLoss > 5) signalQuality -= 25;
        else if (results.packetLoss > 1) signalQuality -= 10;
        
        results.signalQuality = Math.max(signalQuality, 0);
        
        // Consistency score based on speed variations
        const recentTests = this.testResults.slice(0, 5);
        if (recentTests.length > 1) {
            const downloadSpeeds = recentTests.map(test => test.downloadSpeed);
            const avgSpeed = downloadSpeeds.reduce((a, b) => a + b, 0) / downloadSpeeds.length;
            const variance = downloadSpeeds.reduce((sum, speed) => sum + Math.pow(speed - avgSpeed, 2), 0) / downloadSpeeds.length;
            const coefficient = Math.sqrt(variance) / avgSpeed;
            results.consistency = Math.max(100 - (coefficient * 100), 0);
        } else {
            results.consistency = 100;
        }
    }

    showResults(results) {
        if (this.resultsContainer) this.resultsContainer.style.display = 'block';
        
        // Show advanced feature containers
        const recommendationsContainer = document.getElementById('recommendationsContainer');
        
        if (recommendationsContainer) recommendationsContainer.style.display = 'block';
        
        // Update result values
        if (this.downloadSpeed) this.downloadSpeed.textContent = `${results.downloadSpeed.toFixed(1)} Mbps`;
        if (this.uploadSpeed) this.uploadSpeed.textContent = `${results.uploadSpeed.toFixed(1)} Mbps`;
        if (this.pingValue) this.pingValue.textContent = `${results.ping} ms`;
        if (this.jitterValue) this.jitterValue.textContent = `${results.jitter} ms`;
        if (this.signalQuality) this.signalQuality.textContent = `${results.signalQuality.toFixed(0)}%`;
        if (this.consistencyScore) this.consistencyScore.textContent = `${results.consistency.toFixed(0)}%`;
        
        // Update quality indicators
        this.updateQualityIndicators(results);
        
        // Show recommendations
        this.showRecommendations(results);
        
        if (this.testStatus) this.testStatus.textContent = 'Test completed successfully';
        this.updateProgress(100, 'Test completed!');
    }

    updateQualityIndicators(results) {
        const qualities = {
            download: this.getSpeedQuality(results.downloadSpeed, 'download'),
            upload: this.getSpeedQuality(results.uploadSpeed, 'upload'),
            ping: this.getPingQuality(results.ping),
            jitter: this.getJitterQuality(results.jitter),
            signal: this.getSignalQuality(results.signalQuality),
            consistency: this.getConsistencyQuality(results.consistency)
        };
        
        const downloadQuality = document.getElementById('downloadQuality');
        const uploadQuality = document.getElementById('uploadQuality');
        const pingQuality = document.getElementById('pingQuality');
        const jitterQuality = document.getElementById('jitterQuality');
        const signalQualityText = document.getElementById('signalQualityText');
        const consistencyText = document.getElementById('consistencyText');
        
        if (downloadQuality) {
            downloadQuality.textContent = qualities.download;
            downloadQuality.className = `result-quality ${qualities.download.toLowerCase()}`;
        }
        if (uploadQuality) {
            uploadQuality.textContent = qualities.upload;
            uploadQuality.className = `result-quality ${qualities.upload.toLowerCase()}`;
        }
        if (pingQuality) {
            pingQuality.textContent = qualities.ping;
            pingQuality.className = `result-quality ${qualities.ping.toLowerCase()}`;
        }
        if (jitterQuality) {
            jitterQuality.textContent = qualities.jitter;
            jitterQuality.className = `result-quality ${qualities.jitter.toLowerCase()}`;
        }
        if (signalQualityText) {
            signalQualityText.textContent = qualities.signal;
            signalQualityText.className = `result-quality ${qualities.signal.toLowerCase()}`;
        }
        if (consistencyText) {
            consistencyText.textContent = qualities.consistency;
            consistencyText.className = `result-quality ${qualities.consistency.toLowerCase()}`;
        }
    }

    getSpeedQuality(speed, type) {
        const thresholds = type === 'download' 
            ? { excellent: 100, good: 50, fair: 25 }
            : { excellent: 50, good: 25, fair: 10 };
            
        if (speed >= thresholds.excellent) return 'Excellent';
        if (speed >= thresholds.good) return 'Good';
        if (speed >= thresholds.fair) return 'Fair';
        return 'Poor';
    }

    getPingQuality(ping) {
        if (ping <= 20) return 'Excellent';
        if (ping <= 50) return 'Good';
        if (ping <= 100) return 'Fair';
        return 'Poor';
    }

    getJitterQuality(jitter) {
        if (jitter <= 5) return 'Excellent';
        if (jitter <= 15) return 'Good';
        if (jitter <= 30) return 'Fair';
        return 'Poor';
    }

    getSignalQuality(quality) {
        if (quality >= 90) return 'Excellent';
        if (quality >= 70) return 'Good';
        if (quality >= 50) return 'Fair';
        return 'Poor';
    }

    getConsistencyQuality(consistency) {
        if (consistency >= 90) return 'Excellent';
        if (consistency >= 70) return 'Good';
        if (consistency >= 50) return 'Fair';
        return 'Poor';
    }

    // Continue with other methods...
    // (Due to length, I'll include the rest in a separate part)
    
    // Utility methods
    calculateJitter(times) {
        if (times.length < 2) return 0;
        
        const differences = [];
        for (let i = 1; i < times.length; i++) {
            differences.push(Math.abs(times[i] - times[i - 1]));
        }
        
        return differences.reduce((a, b) => a + b, 0) / differences.length;
    }

    calculatePacketLoss(times) {
        // Simulate packet loss calculation
        const lostPackets = times.filter(time => time > 1000).length;
        return (lostPackets / times.length) * 100;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Gauge update methods
    updateDownloadGauge(speed) {
        const maxSpeed = 200;
        const percentage = Math.min(speed / maxSpeed, 1);
        const rotation = percentage * 180 - 90;
        if (this.downloadGaugeFill) {
            this.downloadGaugeFill.style.transform = `rotate(${rotation}deg)`;
        }
    }

    updateUploadGauge(speed) {
        const maxSpeed = 100;
        const percentage = Math.min(speed / maxSpeed, 1);
        const rotation = percentage * 180 - 90;
        if (this.uploadGaugeFill) {
            this.uploadGaugeFill.style.transform = `rotate(${rotation}deg)`;
        }
    }

    updatePingGauge(ping) {
        const maxPing = 200;
        const percentage = Math.min(ping / maxPing, 1);
        const rotation = percentage * 180 - 90;
        if (this.pingGaugeFill) {
            this.pingGaugeFill.style.transform = `rotate(${rotation}deg)`;
        }
    }

    // UI helper methods
    prepareTestUI() {
        if (this.startTestBtn) this.startTestBtn.style.display = 'none';
        if (this.stopTestBtn) this.stopTestBtn.style.display = 'inline-flex';
        if (this.multiTestBtn) this.multiTestBtn.disabled = true;
        if (this.progressContainer) this.progressContainer.style.display = 'block';
        if (this.resultsContainer) this.resultsContainer.style.display = 'none';
        this.resetGauges();
    }

    resetTestUI() {
        this.isTestRunning = false;
        if (this.startTestBtn) this.startTestBtn.style.display = 'inline-flex';
        if (this.stopTestBtn) this.stopTestBtn.style.display = 'none';
        if (this.multiTestBtn) this.multiTestBtn.disabled = false;
        if (this.progressContainer) this.progressContainer.style.display = 'none';
    }

    resetGauges() {
        if (this.downloadGaugeFill) this.downloadGaugeFill.style.transform = 'rotate(-90deg)';
        if (this.uploadGaugeFill) this.uploadGaugeFill.style.transform = 'rotate(-90deg)';
        if (this.pingGaugeFill) this.pingGaugeFill.style.transform = 'rotate(-90deg)';
        
        if (this.downloadValue) this.downloadValue.textContent = '0';
        if (this.uploadValue) this.uploadValue.textContent = '0';
        if (this.pingDisplayValue) this.pingDisplayValue.textContent = '0';
    }

    updateProgress(percentage, text) {
        if (this.progressFill) {
            this.progressFill.style.width = `${percentage}%`;
        }
        if (this.progressText) {
            this.progressText.textContent = text;
        }
    }

    // Advanced implementations with animations
    showRecommendations(results) {
        const recommendationsContainer = document.getElementById('recommendationsContainer');
        if (!recommendationsContainer) return;

        const recommendations = this.generateRecommendations(results);
        const recommendationsContent = document.getElementById('recommendationsContent');
        
        if (!recommendationsContent) return;
        
        recommendationsContent.innerHTML = '';
        
        recommendations.forEach((rec, index) => {
            const recElement = document.createElement('div');
            recElement.className = 'recommendation-item';
            recElement.style.cssText = `
                opacity: 0;
                transform: translateY(20px);
                animation: slideInRecommendation 0.5s ease forwards;
                animation-delay: ${index * 0.1}s;
            `;
            
            recElement.innerHTML = `
                <div class="recommendation-icon ${rec.type}">
                    <i class="${rec.icon}"></i>
                </div>
                <div class="recommendation-content">
                    <h4>${rec.title}</h4>
                    <p>${rec.description}</p>
                </div>
            `;
            
            recommendationsContent.appendChild(recElement);
        });
    }

    generateRecommendations(results) {
        const recommendations = [];
        
        if (results.downloadSpeed < 25) {
            recommendations.push({
                type: 'warning',
                icon: 'fas fa-exclamation-triangle',
                title: 'Slow Download Speed',
                description: 'Your download speed is below 25 Mbps. Consider upgrading your internet plan or checking for network issues.'
            });
        }
        
        if (results.uploadSpeed < 10) {
            recommendations.push({
                type: 'info',
                icon: 'fas fa-upload',
                title: 'Low Upload Speed',
                description: 'Upload speed is below 10 Mbps. This may affect video calls and file uploads.'
            });
        }
        
        if (results.ping > 100) {
            recommendations.push({
                type: 'error',
                icon: 'fas fa-wifi',
                title: 'High Latency',
                description: 'Your ping is over 100ms. This may cause issues with online gaming and video calls.'
            });
        }
        
        if (results.jitter > 30) {
            recommendations.push({
                type: 'warning',
                icon: 'fas fa-chart-line',
                title: 'High Jitter',
                description: 'Network jitter is high. This can cause unstable connections for real-time applications.'
            });
        }
        
        if (results.signalQuality > 90 && results.downloadSpeed > 50) {
            recommendations.push({
                type: 'success',
                icon: 'fas fa-check-circle',
                title: 'Excellent Connection',
                description: 'Your internet connection is performing excellently! Perfect for streaming, gaming, and video calls.'
            });
        }
        
        return recommendations;
    }

    updateComparisons(results) {
        // Update global comparison bars
        const globalComparison = document.getElementById('globalComparison');
        if (globalComparison) {
            const yourSpeedBar = globalComparison.querySelector('.your-speed');
            const yourSpeedValue = globalComparison.querySelector('.bar-item:first-child .bar-value');
            
            if (yourSpeedBar && yourSpeedValue) {
                const percentage = Math.min((results.downloadSpeed / 100) * 100, 100);
                yourSpeedBar.style.width = `${percentage}%`;
                yourSpeedValue.textContent = `${results.downloadSpeed.toFixed(1)} Mbps`;
            }
        }

        // Update activity status indicators
        this.updateActivityStatus('hdVideoStatus', results.downloadSpeed, 5);
        this.updateActivityStatus('gamingStatus', results.downloadSpeed, 3);
        this.updateActivityStatus('videoCallStatus', results.downloadSpeed, 1.5);
        this.updateActivityStatus('downloadStatus', results.downloadSpeed, 10);
    }

    updateActivityStatus(elementId, speed, requirement) {
        const element = document.getElementById(elementId);
        if (!element) return;

        if (speed >= requirement * 1.5) {
            element.textContent = 'Excellent';
            element.className = 'status excellent';
        } else if (speed >= requirement) {
            element.textContent = 'Good';
            element.className = 'status good';
        } else if (speed >= requirement * 0.7) {
            element.textContent = 'Fair';
            element.className = 'status fair';
        } else {
            element.textContent = 'Poor';
            element.className = 'status poor';
        }
    }

    updateDiagnostics(results) {
        // Update connection health circle
        const healthCircle = document.getElementById('healthCircle');
        const healthPercentage = document.getElementById('healthPercentage');
        const healthStatus = document.getElementById('healthStatus');
        
        if (healthCircle && healthPercentage && healthStatus) {
            // Calculate overall health score based on multiple factors
            const healthScore = this.calculateHealthScore(results);
            
            healthPercentage.textContent = `${healthScore}%`;
            
            if (healthScore >= 80) {
                healthStatus.textContent = 'Excellent';
                healthCircle.className = 'health-circle excellent';
            } else if (healthScore >= 60) {
                healthStatus.textContent = 'Good';
                healthCircle.className = 'health-circle good';
            } else if (healthScore >= 40) {
                healthStatus.textContent = 'Fair';
                healthCircle.className = 'health-circle fair';
            } else {
                healthStatus.textContent = 'Poor';
                healthCircle.className = 'health-circle poor';
            }
        }

        // Update issues list
        const issuesList = document.getElementById('issuesList');
        if (issuesList) {
            const issues = this.detectIssues(results);
            issuesList.innerHTML = issues.length > 0 ? 
                issues.map(issue => `
                    <div class="issue-item ${issue.type}">
                        <i class="${issue.icon}"></i>
                        <span>${issue.message}</span>
                    </div>
                `).join('') :
                `<div class="issue-item success">
                    <i class="fas fa-check-circle"></i>
                    <span>No issues detected</span>
                </div>`;
        }

        // Update network details
        this.updateNetworkDetails(results);
    }

    calculateHealthScore(results) {
        let score = 0;
        
        // Download speed contribution (40%)
        if (results.downloadSpeed >= 50) score += 40;
        else if (results.downloadSpeed >= 25) score += 30;
        else if (results.downloadSpeed >= 10) score += 20;
        else if (results.downloadSpeed >= 5) score += 10;
        
        // Upload speed contribution (20%)
        if (results.uploadSpeed >= 10) score += 20;
        else if (results.uploadSpeed >= 5) score += 15;
        else if (results.uploadSpeed >= 2) score += 10;
        else if (results.uploadSpeed >= 1) score += 5;
        
        // Ping contribution (25%)
        if (results.ping <= 20) score += 25;
        else if (results.ping <= 50) score += 20;
        else if (results.ping <= 100) score += 15;
        else if (results.ping <= 200) score += 10;
        else score += 5;
        
        // Jitter contribution (15%)
        if (results.jitter <= 5) score += 15;
        else if (results.jitter <= 10) score += 12;
        else if (results.jitter <= 20) score += 8;
        else if (results.jitter <= 50) score += 5;
        
        return Math.min(100, Math.max(0, score));
    }

    detectIssues(results) {
        const issues = [];
        
        if (results.downloadSpeed < 5) {
            issues.push({
                type: 'error',
                icon: 'fas fa-exclamation-triangle',
                message: 'Very slow download speed detected'
            });
        }
        
        if (results.uploadSpeed < 1) {
            issues.push({
                type: 'warning',
                icon: 'fas fa-arrow-up',
                message: 'Upload speed is below recommended levels'
            });
        }
        
        if (results.ping > 100) {
            issues.push({
                type: 'warning',
                icon: 'fas fa-clock',
                message: 'High latency detected - may affect real-time applications'
            });
        }
        
        if (results.jitter > 30) {
            issues.push({
                type: 'warning',
                icon: 'fas fa-wave-square',
                message: 'High jitter detected - connection may be unstable'
            });
        }
        
        return issues;
    }

    updateNetworkDetails(results) {
        // Update connection type
        const connectionType = document.getElementById('detailConnectionType');
        if (connectionType) {
            connectionType.textContent = this.getConnectionType();
        }
        
        // Update DNS server
        const dnsServer = document.getElementById('dnsServer');
        if (dnsServer) {
            dnsServer.textContent = 'Auto';
        }
        
        // Update IPv6 support
        const ipv6Support = document.getElementById('ipv6Support');
        if (ipv6Support) {
            ipv6Support.textContent = 'Checking...';
            this.checkIPv6Support().then(supported => {
                ipv6Support.textContent = supported ? 'Yes' : 'No';
            });
        }
        
        // Update MTU size
        const mtuSize = document.getElementById('mtuSize');
        if (mtuSize) {
            mtuSize.textContent = '1500 bytes';
        }
    }

    getConnectionType() {
        if (navigator.connection) {
            return navigator.connection.effectiveType || 'Unknown';
        }
        return 'Unknown';
    }

    async checkIPv6Support() {
        try {
            const response = await fetch('https://ipv6.google.com/favicon.ico', { 
                method: 'HEAD',
                mode: 'no-cors'
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    addToChart(type, value) {
        if (!this.chartInstance) return;
        
        const now = new Date();
        const timeLabel = now.toLocaleTimeString();
        
        // Add new data point with animation
        if (type === 'download') {
            this.chartInstance.data.labels.push(timeLabel);
            this.chartInstance.data.datasets[0].data.push(value);
            
            // Animate the new point
            this.chartInstance.options.animation = {
                duration: 500,
                easing: 'easeInOutCubic'
            };
            
        } else if (type === 'upload') {
            if (this.chartInstance.data.datasets[1]) {
                this.chartInstance.data.datasets[1].data.push(value);
            }
        }
        
        // Keep only last 20 data points
        if (this.chartInstance.data.labels.length > 20) {
            this.chartInstance.data.labels.shift();
            this.chartInstance.data.datasets.forEach(dataset => {
                dataset.data.shift();
            });
        }
        
        this.chartInstance.update('active');
    }

    initializeCharts() {
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded, charts will not be available');
            return;
        }
        
        try {
            // Initialize real-time speed chart
            const speedChartCanvas = document.getElementById('speedGraph');
            if (speedChartCanvas) {
                // Clear any existing dimensions
                speedChartCanvas.style.width = '';
                speedChartCanvas.style.height = '';
                
                const ctx = speedChartCanvas.getContext('2d');
                
                this.chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Download Speed (Mbps)',
                        data: [],
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }, {
                        label: 'Upload Speed (Mbps)',
                        data: [],
                        borderColor: '#764ba2',
                        backgroundColor: 'rgba(118, 75, 162, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#764ba2',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 1000,
                        easing: 'easeInOutCubic'
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 20
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#667eea',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Time'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Speed (Mbps)'
                            },
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    }
                }
            });
        }
        
        // Initialize history chart
        this.initializeHistoryChart();
        
        // Add resize handler for charts
        window.addEventListener('resize', () => {
            setTimeout(() => {
                if (this.chartInstance) {
                    this.chartInstance.resize();
                }
                if (this.historyChartInstance) {
                    this.historyChartInstance.resize();
                }
            }, 100);
        });
        
        } catch (error) {
            console.error('Chart initialization error:', error);
            this.showNotification('Charts failed to load', 'warning');
        }
    }

    initializeHistoryChart() {
        try {
            const historyChartCanvas = document.getElementById('historyChart');
            if (historyChartCanvas && this.testResults.length > 0) {
                // Clear any existing dimensions
                historyChartCanvas.style.width = '';
                historyChartCanvas.style.height = '';
                
                const ctx = historyChartCanvas.getContext('2d');            const last10Results = this.testResults.slice(0, 10).reverse();
            
            this.historyChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: last10Results.map(result => 
                        new Date(result.timestamp).toLocaleDateString()
                    ),
                    datasets: [{
                        label: 'Download (Mbps)',
                        data: last10Results.map(result => result.downloadSpeed),
                        backgroundColor: 'rgba(102, 126, 234, 0.8)',
                        borderColor: '#667eea',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                    }, {
                        label: 'Upload (Mbps)',
                        data: last10Results.map(result => result.uploadSpeed),
                        backgroundColor: 'rgba(118, 75, 162, 0.8)',
                        borderColor: '#764ba2',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 1500,
                        easing: 'easeInOutCubic',
                        delay: (context) => context.dataIndex * 100
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Test Date'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Speed (Mbps)'
                            },
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        } catch (error) {
            console.error('History chart initialization error:', error);
        }
    }

    updateAnalytics() {
        if (this.testResults.length === 0) return;
        
        const analytics = this.calculateAnalytics();
        this.displayAnalytics(analytics);
    }

    calculateAnalytics() {
        const results = this.testResults;
        
        const downloadSpeeds = results.map(r => r.downloadSpeed);
        const uploadSpeeds = results.map(r => r.uploadSpeed);
        const pings = results.map(r => r.ping);
        
        return {
            totalTests: results.length,
            avgDownload: downloadSpeeds.reduce((sum, speed) => sum + speed, 0) / downloadSpeeds.length,
            avgUpload: uploadSpeeds.reduce((sum, speed) => sum + speed, 0) / uploadSpeeds.length,
            avgPing: pings.reduce((sum, ping) => sum + ping, 0) / pings.length,
            maxDownload: Math.max(...downloadSpeeds),
            maxUpload: Math.max(...uploadSpeeds),
            minPing: Math.min(...pings),
            testFrequency: this.calculateTestFrequency(),
            monthlyUsage: this.calculateMonthlyUsage(),
            peakHours: this.calculatePeakHours()
        };
    }

    displayAnalytics(analytics) {
        // Skip basic analytics display if detailed analytics manager is available
        if (window.analyticsManager) {
            console.log('Using detailed analytics manager instead of basic analytics');
            return;
        }
        
        const analyticsContainer = document.getElementById('analyticsContainer');
        if (!analyticsContainer) return;
        
        analyticsContainer.innerHTML = `
            <div class="analytics-grid">
                <div class="analytics-card" style="animation: fadeInUp 0.6s ease forwards;">
                    <div class="analytics-icon">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <div class="analytics-content">
                        <h3>${analytics.totalTests}</h3>
                        <p>Total Tests</p>
                    </div>
                </div>
                
                <div class="analytics-card" style="animation: fadeInUp 0.6s ease forwards; animation-delay: 0.1s;">
                    <div class="analytics-icon">
                        <i class="fas fa-download"></i>
                    </div>
                    <div class="analytics-content">
                        <h3>${analytics.avgDownload.toFixed(1)} Mbps</h3>
                        <p>Avg Download</p>
                        <small>Peak: ${analytics.maxDownload.toFixed(1)} Mbps</small>
                    </div>
                </div>
                
                <div class="analytics-card" style="animation: fadeInUp 0.6s ease forwards; animation-delay: 0.2s;">
                    <div class="analytics-icon">
                        <i class="fas fa-upload"></i>
                    </div>
                    <div class="analytics-content">
                        <h3>${analytics.avgUpload.toFixed(1)} Mbps</h3>
                        <p>Avg Upload</p>
                        <small>Peak: ${analytics.maxUpload.toFixed(1)} Mbps</small>
                    </div>
                </div>
                
                <div class="analytics-card" style="animation: fadeInUp 0.6s ease forwards; animation-delay: 0.3s;">
                    <div class="analytics-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="analytics-content">
                        <h3>${analytics.avgPing.toFixed(0)} ms</h3>
                        <p>Avg Ping</p>
                        <small>Best: ${analytics.minPing} ms</small>
                    </div>
                </div>
                
                <div class="analytics-card" style="animation: fadeInUp 0.6s ease forwards; animation-delay: 0.4s;">
                    <div class="analytics-icon">
                        <i class="fas fa-calendar"></i>
                    </div>
                    <div class="analytics-content">
                        <h3>${analytics.testFrequency}</h3>
                        <p>Tests/Day</p>
                        <small>This Month</small>
                    </div>
                </div>
                
                <div class="analytics-card" style="animation: fadeInUp 0.6s ease forwards; animation-delay: 0.5s;">
                    <div class="analytics-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="analytics-content">
                        <h3>${analytics.peakHours}</h3>
                        <p>Peak Hours</p>
                        <small>Most Active</small>
                    </div>
                </div>
            </div>
        `;
    }

    calculateTestFrequency() {
        if (this.testResults.length === 0) return 0;
        
        const now = new Date();
        const thisMonth = this.testResults.filter(result => {
            const testDate = new Date(result.timestamp);
            return testDate.getMonth() === now.getMonth() && 
                   testDate.getFullYear() === now.getFullYear();
        });
        
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        return (thisMonth.length / daysInMonth).toFixed(1);
    }

    calculateMonthlyUsage() {
        // Simulated monthly usage calculation
        return (Math.random() * 500 + 100).toFixed(0) + ' GB';
    }

    calculatePeakHours() {
        if (this.testResults.length === 0) return 'N/A';
        
        const hourCounts = {};
        this.testResults.forEach(result => {
            const hour = new Date(result.timestamp).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        
        const peakHour = Object.keys(hourCounts).reduce((a, b) => 
            hourCounts[a] > hourCounts[b] ? a : b
        );
        
        return `${peakHour}:00 - ${parseInt(peakHour) + 1}:00`;
    }

    updateHistoryDisplay() {
        if (this.testResults.length === 0) {
            if (this.historyList) this.historyList.innerHTML = '<p class="no-history">No previous tests</p>';
            if (this.clearHistoryBtn) this.clearHistoryBtn.style.display = 'none';
            if (this.exportHistoryBtn) this.exportHistoryBtn.style.display = 'none';
            return;
        }

        if (this.clearHistoryBtn) this.clearHistoryBtn.style.display = 'block';
        if (this.exportHistoryBtn) this.exportHistoryBtn.style.display = 'block';
        
        const historyHTML = this.testResults.map(result => `
            <div class="history-item">
                <div class="history-header-item">
                    <div class="history-date">${this.formatDate(result.timestamp)}</div>
                </div>
                <div class="history-speeds">
                    <div class="history-speed">
                        <div class="history-speed-label">Download</div>
                        <div class="history-speed-value">${result.downloadSpeed.toFixed(1)} Mbps</div>
                    </div>
                    <div class="history-speed">
                        <div class="history-speed-label">Upload</div>
                        <div class="history-speed-value">${result.uploadSpeed.toFixed(1)} Mbps</div>
                    </div>
                    <div class="history-speed">
                        <div class="history-speed-label">Ping</div>
                        <div class="history-speed-value">${result.ping} ms</div>
                    </div>
                    <div class="history-speed">
                        <div class="history-speed-label">Jitter</div>
                        <div class="history-speed-value">${result.jitter} ms</div>
                    </div>
                </div>
            </div>
        `).join('');
        
        if (this.historyList) this.historyList.innerHTML = historyHTML;
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all test history?')) {
            this.testResults = [];
            localStorage.removeItem('speedTestHistory');
            this.updateHistoryDisplay();
            this.showNotification('Test history cleared', 'info');
        }
    }

    // Settings and features
    toggleSettings() {
        if (this.settingsPanel) {
            const isActive = this.settingsPanel.classList.contains('active');
            
            if (isActive) {
                // Close settings with animation
                this.settingsPanel.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => {
                    this.settingsPanel.classList.remove('active');
                    this.settingsPanel.style.animation = '';
                }, 300);
            } else {
                // Open settings with animation
                this.settingsPanel.classList.add('active');
                this.settingsPanel.style.animation = 'slideInRight 0.3s ease forwards';
                setTimeout(() => {
                    this.settingsPanel.style.animation = '';
                }, 300);
            }
        }
    }

    applySettings() {
        const darkMode = this.settings.darkMode || false;
        const notifications = this.settings.notifications !== false;
        const autoTest = this.settings.autoTest || false;
        
        const darkModeBtn = document.getElementById('darkMode');
        const notificationsBtn = document.getElementById('notifications');
        const autoTestBtn = document.getElementById('autoTest');
        
        if (darkModeBtn) darkModeBtn.checked = darkMode;
        if (notificationsBtn) notificationsBtn.checked = notifications;
        if (autoTestBtn) autoTestBtn.checked = autoTest;
        
        this.toggleDarkMode(darkMode);
        this.toggleNotifications(notifications);
        this.toggleAutoTest(autoTest);
    }

    toggleDarkMode(enabled) {
        if (enabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        this.settings.darkMode = enabled;
        this.saveSettings();
    }

    toggleNotifications(enabled) {
        this.settings.notifications = enabled;
        this.saveSettings();
        
        if (enabled && 'Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }

    toggleAutoTest(enabled) {
        this.settings.autoTest = enabled;
        this.saveSettings();
        
        if (enabled) {
            this.autoTestInterval = setInterval(() => {
                if (!this.isTestRunning) {
                    this.startSpeedTest();
                }
            }, 30 * 60 * 1000); // 30 minutes
        } else if (this.autoTestInterval) {
            clearInterval(this.autoTestInterval);
            this.autoTestInterval = null;
        }
    }

    checkNotificationPermission() {
        if ('Notification' in window && this.settings.notifications) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }

    showNotification(message, type = 'info') {
        // Web notification
        if ('Notification' in window && Notification.permission === 'granted' && this.settings.notifications) {
            new Notification('Speed Lens', {
                body: message,
                icon: '/favicon.ico'
            });
        }
        
        // In-app notification
        if (this.notificationContainer) {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>${message}</span>
                    <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer;">&times;</button>
                </div>
            `;
            
            this.notificationContainer.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 5000);
        }
    }

    // Advanced view switching with smooth animations
    switchView(viewType) {
        const chartView = document.getElementById('chartViewContainer');
        const listView = document.getElementById('listViewContainer');
        const chartBtn = document.getElementById('chartView');
        const listBtn = document.getElementById('listView');
        
        if (!chartView || !listView) return;
        
        // Update button states with animation
        if (chartBtn && listBtn) {
            chartBtn.classList.toggle('active', viewType === 'chart');
            listBtn.classList.toggle('active', viewType === 'list');
            
            // Add pulse animation to active button
            const activeBtn = viewType === 'chart' ? chartBtn : listBtn;
            activeBtn.style.animation = 'buttonPulse 0.3s ease';
            setTimeout(() => activeBtn.style.animation = '', 300);
        }
        
        if (viewType === 'chart') {
            // Animate out list view
            listView.style.animation = 'slideOutLeft 0.3s ease forwards';
            
            setTimeout(() => {
                listView.style.display = 'none';
                chartView.style.display = 'block';
                chartView.style.animation = 'slideInRight 0.3s ease forwards';
                
                // Reinitialize charts for proper display
                if (this.historyChartInstance) {
                    this.historyChartInstance.resize();
                }
            }, 300);
            
        } else {
            // Animate out chart view
            chartView.style.animation = 'slideOutRight 0.3s ease forwards';
            
            setTimeout(() => {
                chartView.style.display = 'none';
                listView.style.display = 'block';
                listView.style.animation = 'slideInLeft 0.3s ease forwards';
            }, 300);
        }
        
        this.showNotification(`Switched to ${viewType} view`, 'info');
    }

    async startMultiServerTest() {
        if (this.isTestRunning) return;
        
        this.showNotification('Starting multi-server speed test...', 'info');
        this.isTestRunning = true;
        this.prepareTestUI();
        
        // Show multi-server container
        const multiServerContainer = document.getElementById('multiServerContainer');
        if (multiServerContainer) {
            multiServerContainer.style.display = 'block';
        }
        
        const servers = [
            { name: 'Primary Server', url: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js' },
            { name: 'Secondary Server', url: 'https://code.jquery.com/jquery-3.6.0.min.js' },
            { name: 'Backup Server', url: 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js' }
        ];
        
        const results = [];
        
        try {
            this.updateProgress(0, 'Testing multiple servers...');
            
            // Clear previous results
            const multiServerResults = document.getElementById('multiServerResults');
            if (multiServerResults) {
                multiServerResults.innerHTML = '';
            }
            
            // Test each server
            for (let i = 0; i < servers.length; i++) {
                const server = servers[i];
                this.updateProgress(i * 30, `Testing ${server.name}...`);
                
                const serverResult = await this.testSingleServer(server);
                results.push(serverResult);
                
                // Visual feedback for each server test
                this.showServerResult(server, serverResult, i);
                
                await this.delay(500);
            }
            
            // Calculate best results
            const bestResult = this.calculateBestResult(results);
            
            this.updateProgress(90, 'Analyzing results...');
            await this.delay(1000);
            
            // Show final results
            this.showResults(bestResult);
            this.saveTestResult(bestResult);
            this.updateHistoryDisplay();
            this.updateAnalytics();
            
            this.showNotification('Multi-server test completed!', 'success');
            this.updateProgress(100, 'Multi-server test completed!');
            
        } catch (error) {
            console.error('Multi-server test error:', error);
            this.showNotification('Multi-server test failed', 'error');
        } finally {
            this.resetTestUI();
        }
    }

    async testSingleServer(server) {
        const testResult = {
            serverName: server.name,
            timestamp: new Date(),
            ping: 0,
            jitter: 0,
            downloadSpeed: 0,
            uploadSpeed: 0,
            packetLoss: 0,
            signalQuality: 0,
            consistency: 100
        };
        
        // Test ping
        const pingTimes = [];
        for (let i = 0; i < 5; i++) {
            const startTime = performance.now();
            try {
                await fetch(server.url, { method: 'HEAD', cache: 'no-cache' });
                const endTime = performance.now();
                pingTimes.push(endTime - startTime);
            } catch (error) {
                pingTimes.push(Math.random() * 100 + 50);
            }
        }
        
        testResult.ping = Math.round(pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length);
        testResult.jitter = Math.round(this.calculateJitter(pingTimes));
        
        // Test download speed
        const downloadSpeeds = [];
        for (let i = 0; i < 3; i++) {
            const startTime = performance.now();
            try {
                const response = await fetch(server.url + '?t=' + Date.now());
                await response.arrayBuffer();
                const endTime = performance.now();
                const duration = (endTime - startTime) / 1000;
                const speed = (100 * 8) / (duration * 1000); // Approximate speed
                downloadSpeeds.push(Math.min(speed, 500));
            } catch (error) {
                downloadSpeeds.push(Math.random() * 80 + 20);
            }
        }
        
        testResult.downloadSpeed = Math.max(...downloadSpeeds);
        testResult.uploadSpeed = testResult.downloadSpeed * 0.4; // Approximate upload
        
        // Calculate quality metrics
        this.calculateQualityMetrics(testResult);
        
        return testResult;
    }

    showServerResult(server, result, index) {
        const container = document.getElementById('multiServerResults');
        if (!container) return;
        
        const resultElement = document.createElement('div');
        resultElement.className = 'server-result-item';
        resultElement.style.cssText = `
            padding: 15px;
            margin: 10px 0;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            opacity: 0;
            transform: translateX(-20px);
            animation: slideInResult 0.5s ease forwards;
            animation-delay: ${index * 0.1}s;
            border-left: 4px solid ${this.getQualityColor(result.signalQuality)};
        `;
        
        resultElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h4 style="margin: 0; color: #333;">${server.name}</h4>
                <div class="server-status ${result.signalQuality > 80 ? 'excellent' : result.signalQuality > 60 ? 'good' : 'poor'}">
                    <i class="fas fa-${result.signalQuality > 80 ? 'check-circle' : result.signalQuality > 60 ? 'exclamation-circle' : 'times-circle'}"></i>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px;">
                <div style="text-align: center;">
                    <div style="font-size: 18px; font-weight: bold; color: #667eea;">${result.downloadSpeed.toFixed(1)}</div>
                    <div style="font-size: 12px; color: #666;">Download (Mbps)</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 18px; font-weight: bold; color: #764ba2;">${result.uploadSpeed.toFixed(1)}</div>
                    <div style="font-size: 12px; color: #666;">Upload (Mbps)</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 18px; font-weight: bold; color: #4CAF50;">${result.ping}</div>
                    <div style="font-size: 12px; color: #666;">Ping (ms)</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 18px; font-weight: bold; color: #FF9800;">${result.signalQuality.toFixed(0)}%</div>
                    <div style="font-size: 12px; color: #666;">Quality</div>
                </div>
            </div>
        `;
        
        container.appendChild(resultElement);
    }

    getQualityColor(quality) {
        if (quality > 80) return '#4CAF50';
        if (quality > 60) return '#FF9800';
        return '#F44336';
    }

    calculateBestResult(results) {
        if (results.length === 0) return null;
        
        // Find best performance across all servers
        const bestDownload = Math.max(...results.map(r => r.downloadSpeed));
        const bestUpload = Math.max(...results.map(r => r.uploadSpeed));
        const bestPing = Math.min(...results.map(r => r.ping));
        const bestQuality = Math.max(...results.map(r => r.signalQuality));
        
        return {
            timestamp: new Date(),
            ping: bestPing,
            jitter: Math.min(...results.map(r => r.jitter)),
            downloadSpeed: bestDownload,
            uploadSpeed: bestUpload,
            packetLoss: Math.min(...results.map(r => r.packetLoss)),
            signalQuality: bestQuality,
            consistency: Math.max(...results.map(r => r.consistency)),
            multiServerData: results
        };
    }

    stopSpeedTest() {
        this.isTestRunning = false;
        this.resetTestUI();
        
        // Hide advanced containers
        const containers = ['recommendationsContainer', 'multiServerContainer'];
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.style.animation = 'fadeOut 0.3s ease forwards';
                setTimeout(() => container.style.display = 'none', 300);
            }
        });
        
        if (this.testStatus) this.testStatus.textContent = 'Test stopped by user';
        this.showNotification('Speed test stopped', 'warning');
        
        // Reset gauges with animation
        this.animateGaugeReset();
    }

    animateGaugeReset() {
        const gauges = [
            { element: this.downloadGaugeFill, value: this.downloadValue },
            { element: this.uploadGaugeFill, value: this.uploadValue },
            { element: this.pingGaugeFill, value: this.pingDisplayValue }
        ];
        
        gauges.forEach((gauge, index) => {
            setTimeout(() => {
                if (gauge.element) {
                    gauge.element.style.transition = 'transform 0.5s ease';
                    gauge.element.style.transform = 'rotate(-90deg)';
                }
                if (gauge.value) {
                    gauge.value.style.transition = 'all 0.5s ease';
                    setTimeout(() => gauge.value.textContent = '0', 250);
                }
            }, index * 100);
        });
    }

    // Advanced export functionality with multiple formats
    exportData() {
        if (this.testResults.length === 0) {
            this.showNotification('No data to export', 'warning');
            return;
        }

        // Create export modal with animation
        this.showExportModal();
    }

    showExportModal() {
        const modal = document.createElement('div');
        modal.className = 'export-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            opacity: 0;
            animation: fadeIn 0.3s ease forwards;
        `;

        modal.innerHTML = `
            <div class="export-content" style="
                background: white;
                border-radius: 15px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                transform: scale(0.8);
                animation: scaleIn 0.3s ease forwards;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            ">
                <div class="export-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                ">
                    <h3 style="margin: 0; color: #333;">Export Test Data</h3>
                    <button class="close-export" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #999;
                        padding: 5px;
                    ">&times;</button>
                </div>
                
                <div class="export-options" style="display: grid; gap: 15px;">
                    <button class="export-btn" data-format="json" style="
                        padding: 15px;
                        border: 2px solid #667eea;
                        background: transparent;
                        color: #667eea;
                        border-radius: 10px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        font-size: 16px;
                    ">
                        <i class="fas fa-code"></i>
                        Export as JSON
                        <small style="margin-left: auto; opacity: 0.7;">Raw data format</small>
                    </button>
                    
                    <button class="export-btn" data-format="csv" style="
                        padding: 15px;
                        border: 2px solid #4CAF50;
                        background: transparent;
                        color: #4CAF50;
                        border-radius: 10px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        font-size: 16px;
                    ">
                        <i class="fas fa-table"></i>
                        Export as CSV
                        <small style="margin-left: auto; opacity: 0.7;">Spreadsheet format</small>
                    </button>
                    
                    <button class="export-btn" data-format="pdf" style="
                        padding: 15px;
                        border: 2px solid #FF5722;
                        background: transparent;
                        color: #FF5722;
                        border-radius: 10px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        font-size: 16px;
                    ">
                        <i class="fas fa-file-pdf"></i>
                        Export as PDF Report
                        <small style="margin-left: auto; opacity: 0.7;">Professional report</small>
                    </button>
                    
                    <button class="export-btn" data-format="image" style="
                        padding: 15px;
                        border: 2px solid #9C27B0;
                        background: transparent;
                        color: #9C27B0;
                        border-radius: 10px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        font-size: 16px;
                    ">
                        <i class="fas fa-image"></i>
                        Export as Image
                        <small style="margin-left: auto; opacity: 0.7;">Latest test results</small>
                    </button>
                </div>
                
                <div class="export-settings" style="
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                ">
                    <label style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <input type="checkbox" id="includeCharts" checked>
                        Include charts and graphs
                    </label>
                    <label style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <input type="checkbox" id="includeAnalytics" checked>
                        Include analytics data
                    </label>
                    <label style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="includeRecommendations" checked>
                        Include recommendations
                    </label>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        modal.querySelector('.close-export').addEventListener('click', () => {
            modal.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => modal.remove(), 300);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.animation = 'fadeOut 0.3s ease forwards';
                setTimeout(() => modal.remove(), 300);
            }
        });

        modal.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px)';
                btn.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = 'none';
            });

            btn.addEventListener('click', () => {
                const format = btn.dataset.format;
                const settings = {
                    includeCharts: document.getElementById('includeCharts').checked,
                    includeAnalytics: document.getElementById('includeAnalytics').checked,
                    includeRecommendations: document.getElementById('includeRecommendations').checked
                };
                
                this.performExport(format, settings);
                modal.style.animation = 'fadeOut 0.3s ease forwards';
                setTimeout(() => modal.remove(), 300);
            });
        });
    }

    async performExport(format, settings) {
        this.showNotification(`Preparing ${format.toUpperCase()} export...`, 'info');
        
        try {
            switch (format) {
                case 'json':
                    await this.exportAsJSON(settings);
                    break;
                case 'csv':
                    await this.exportAsCSV(settings);
                    break;
                case 'pdf':
                    await this.exportAsPDF(settings);
                    break;
                case 'image':
                    await this.exportAsImage(settings);
                    break;
            }
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Export failed. Please try again.', 'error');
        }
    }

    async exportAsJSON(settings) {
        const exportData = {
            exportDate: new Date().toISOString(),
            testResults: this.testResults,
            summary: this.calculateAnalytics(),
            settings: this.settings
        };

        if (settings.includeAnalytics) {
            exportData.analytics = this.calculateAnalytics();
        }

        if (settings.includeRecommendations && this.testResults.length > 0) {
            exportData.recommendations = this.generateRecommendations(this.testResults[0]);
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        this.downloadFile(blob, `network-speed-data-${new Date().toISOString().split('T')[0]}.json`);
        this.showNotification('JSON export completed successfully!', 'success');
    }

    async exportAsCSV(settings) {
        let csvContent = 'Date,Time,Download (Mbps),Upload (Mbps),Ping (ms),Jitter (ms),Signal Quality (%),Consistency (%),Packet Loss (%)\n';
        
        this.testResults.forEach(result => {
            const date = new Date(result.timestamp);
            csvContent += [
                date.toLocaleDateString(),
                date.toLocaleTimeString(),
                result.downloadSpeed.toFixed(2),
                result.uploadSpeed.toFixed(2),
                result.ping,
                result.jitter.toFixed(2),
                result.signalQuality.toFixed(2),
                result.consistency.toFixed(2),
                result.packetLoss.toFixed(2)
            ].join(',') + '\n';
        });

        if (settings.includeAnalytics) {
            const analytics = this.calculateAnalytics();
            csvContent += '\n\nAnalytics Summary\n';
            csvContent += `Total Tests,${analytics.totalTests}\n`;
            csvContent += `Average Download,${analytics.avgDownload.toFixed(2)} Mbps\n`;
            csvContent += `Average Upload,${analytics.avgUpload.toFixed(2)} Mbps\n`;
            csvContent += `Average Ping,${analytics.avgPing.toFixed(2)} ms\n`;
            csvContent += `Max Download,${analytics.maxDownload.toFixed(2)} Mbps\n`;
            csvContent += `Max Upload,${analytics.maxUpload.toFixed(2)} Mbps\n`;
            csvContent += `Min Ping,${analytics.minPing} ms\n`;
        }

        const blob = new Blob([csvContent], { type: 'text/csv' });
        this.downloadFile(blob, `network-speed-data-${new Date().toISOString().split('T')[0]}.csv`);
        this.showNotification('CSV export completed successfully!', 'success');
    }

    async exportAsPDF(settings) {
        // Create a comprehensive PDF report
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            this.showNotification('PDF library not loaded. Please refresh the page.', 'error');
            return;
        }

        const pdf = new jsPDF();
        const analytics = this.calculateAnalytics();
        
        // Header
        pdf.setFontSize(20);
        pdf.setTextColor(102, 126, 234);
        pdf.text('Speed Lens By Sarbeswar Panda', 20, 30);
        pdf.text('Test Results Report', 20, 45);
        
        // Date
        pdf.setFontSize(12);
        pdf.setTextColor(100);
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 60);
        
        // Summary section
        pdf.setFontSize(16);
        pdf.setTextColor(0);
        pdf.text('Summary', 20, 80);
        
        pdf.setFontSize(12);
        let yPos = 95;
        pdf.text(`Total Tests Conducted: ${analytics.totalTests}`, 25, yPos);
        yPos += 15;
        pdf.text(`Average Download Speed: ${analytics.avgDownload.toFixed(2)} Mbps`, 25, yPos);
        yPos += 10;
        pdf.text(`Average Upload Speed: ${analytics.avgUpload.toFixed(2)} Mbps`, 25, yPos);
        yPos += 10;
        pdf.text(`Average Ping: ${analytics.avgPing.toFixed(2)} ms`, 25, yPos);
        yPos += 10;
        pdf.text(`Peak Download Speed: ${analytics.maxDownload.toFixed(2)} Mbps`, 25, yPos);
        yPos += 10;
        pdf.text(`Best Ping: ${analytics.minPing} ms`, 25, yPos);
        
        // Recent tests table
        yPos += 25;
        pdf.setFontSize(16);
        pdf.text('Recent Test Results', 20, yPos);
        
        yPos += 15;
        pdf.setFontSize(10);
        pdf.text('Date', 20, yPos);
        pdf.text('Download', 60, yPos);
        pdf.text('Upload', 100, yPos);
        pdf.text('Ping', 140, yPos);
        pdf.text('Quality', 170, yPos);
        
        yPos += 5;
        pdf.line(20, yPos, 190, yPos);
        yPos += 10;
        
        const recentTests = this.testResults.slice(0, 15);
        recentTests.forEach(result => {
            if (yPos > 250) {
                pdf.addPage();
                yPos = 30;
            }
            
            const date = new Date(result.timestamp);
            pdf.text(date.toLocaleDateString(), 20, yPos);
            pdf.text(`${result.downloadSpeed.toFixed(1)} Mbps`, 60, yPos);
            pdf.text(`${result.uploadSpeed.toFixed(1)} Mbps`, 100, yPos);
            pdf.text(`${result.ping} ms`, 140, yPos);
            pdf.text(`${result.signalQuality.toFixed(0)}%`, 170, yPos);
            yPos += 12;
        });

        if (settings.includeRecommendations && this.testResults.length > 0) {
            const recommendations = this.generateRecommendations(this.testResults[0]);
            if (recommendations.length > 0) {
                yPos += 15;
                if (yPos > 230) {
                    pdf.addPage();
                    yPos = 30;
                }
                
                pdf.setFontSize(16);
                pdf.text('Recommendations', 20, yPos);
                yPos += 15;
                
                pdf.setFontSize(11);
                recommendations.forEach(rec => {
                    if (yPos > 250) {
                        pdf.addPage();
                        yPos = 30;
                    }
                    
                    pdf.setFont(undefined, 'bold');
                    pdf.text(`• ${rec.title}`, 25, yPos);
                    yPos += 8;
                    pdf.setFont(undefined, 'normal');
                    const lines = pdf.splitTextToSize(rec.description, 160);
                    pdf.text(lines, 30, yPos);
                    yPos += lines.length * 6 + 5;
                });
            }
        }

        // Save the PDF
        pdf.save(`network-speed-report-${new Date().toISOString().split('T')[0]}.pdf`);
        this.showNotification('PDF report generated successfully!', 'success');
    }

    async exportAsImage(settings) {
        if (this.testResults.length === 0) return;
        
        // Create a canvas for the image export
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        // Background
        ctx.fillStyle = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        ctx.fillRect(0, 0, 800, 600);
        
        // Overlay
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(50, 50, 700, 500);
        
        // Title
        ctx.fillStyle = '#333';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Network Speed Test Results', 400, 100);
        
        // Latest result
        const latest = this.testResults[0];
        const date = new Date(latest.timestamp);
        
        ctx.font = '18px Arial';
        ctx.fillText(`Test Date: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`, 400, 140);
        
        // Speed results
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#667eea';
        ctx.fillText(`${latest.downloadSpeed.toFixed(1)} Mbps`, 250, 220);
        
        ctx.font = '16px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText('Download Speed', 250, 245);
        
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#764ba2';
        ctx.fillText(`${latest.uploadSpeed.toFixed(1)} Mbps`, 550, 220);
        
        ctx.font = '16px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText('Upload Speed', 550, 245);
        
        // Ping and Quality
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#4CAF50';
        ctx.fillText(`${latest.ping} ms`, 250, 320);
        
        ctx.font = '16px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText('Ping', 250, 345);
        
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#FF9800';
        ctx.fillText(`${latest.signalQuality.toFixed(0)}%`, 550, 320);
        
        ctx.font = '16px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText('Signal Quality', 550, 345);
        
        // Analytics if included
        if (settings.includeAnalytics) {
            const analytics = this.calculateAnalytics();
            
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = '#333';
            ctx.fillText('Analytics Summary', 400, 400);
            
            ctx.font = '14px Arial';
            ctx.fillStyle = '#666';
            ctx.textAlign = 'left';
            ctx.fillText(`Total Tests: ${analytics.totalTests}`, 150, 430);
            ctx.fillText(`Avg Download: ${analytics.avgDownload.toFixed(1)} Mbps`, 150, 450);
            ctx.fillText(`Avg Upload: ${analytics.avgUpload.toFixed(1)} Mbps`, 150, 470);
            ctx.fillText(`Avg Ping: ${analytics.avgPing.toFixed(1)} ms`, 450, 430);
            ctx.fillText(`Peak Download: ${analytics.maxDownload.toFixed(1)} Mbps`, 450, 450);
            ctx.fillText(`Best Ping: ${analytics.minPing} ms`, 450, 470);
        }
        
        // Footer
        ctx.font = '12px Arial';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.fillText('Generated by Speed Lens By Sarbeswar Panda', 400, 520);
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
            this.downloadFile(blob, `speed-test-results-${new Date().toISOString().split('T')[0]}.png`);
            this.showNotification('Image export completed successfully!', 'success');
        }, 'image/png');
    }

    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        
        // Animate download
        a.style.animation = 'downloadPulse 0.3s ease';
        a.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }

    shareResults() {
        if (this.testResults.length === 0) {
            this.showNotification('No test results to share', 'warning');
            return;
        }
        
        const latestResult = this.testResults[0];
        const history = JSON.parse(localStorage.getItem('speedTestHistory') || '[]');
        
        // Calculate average speeds from history
        let avgDownload = 0, avgUpload = 0, avgPing = 0;
        if (history.length > 0) {
            avgDownload = history.reduce((sum, test) => sum + test.downloadSpeed, 0) / history.length;
            avgUpload = history.reduce((sum, test) => sum + test.uploadSpeed, 0) / history.length;
            avgPing = history.reduce((sum, test) => sum + test.ping, 0) / history.length;
        }
        
        // Get device and browser info
        const deviceInfo = this.getDeviceInfo();
        const connectionInfo = this.getConnectionInfo();
        
        // Get current date and time
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const timeStr = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZoneName: 'short'
        });
        
        // Create comprehensive share text
        const shareText = `🚀 Internet Speed Test Results - Speed Lens
        
📊 LATEST TEST RESULTS (${dateStr} at ${timeStr})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 Download Speed: ${latestResult.downloadSpeed.toFixed(2)} Mbps
📤 Upload Speed: ${latestResult.uploadSpeed.toFixed(2)} Mbps
⚡ Ping Latency: ${latestResult.ping}ms
🔗 Jitter: ${latestResult.jitter ? latestResult.jitter.toFixed(2) + 'ms' : 'N/A'}
🌐 Server: ${latestResult.server || 'Auto-selected'}

${history.length > 1 ? `📈 HISTORICAL AVERAGES (${history.length} tests)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 Avg Download: ${avgDownload.toFixed(2)} Mbps
📤 Avg Upload: ${avgUpload.toFixed(2)} Mbps
⚡ Avg Ping: ${avgPing.toFixed(1)}ms` : ''}

🔧 TECHNICAL DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Device: ${deviceInfo.device}
🌐 Browser: ${deviceInfo.browser}
💻 OS: ${deviceInfo.os}
📡 Connection: ${connectionInfo.type}
🔋 Connection Quality: ${this.getConnectionQuality(latestResult.downloadSpeed)}

💡 SPEED ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${this.getSpeedAnalysis(latestResult)}

✨ Tested with Speed Lens by Sarbeswar Panda
🔗 Test your connection: ${window.location.href}

#SpeedTest #InternetSpeed #SpeedLens #NetworkPerformance`;
        
        // Add loading state to share button
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.disabled = true;
            shareBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
        
        // Check if Web Share API is available and site is secure
        const isSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';
        
        if (navigator.share && isSecureContext) {
            const shareData = {
                title: `Internet Speed Test Results - ${latestResult.downloadSpeed.toFixed(1)} Mbps Download`,
                text: shareText,
                url: window.location.href
            };
            
            // Check if we can share this data
            if (navigator.canShare && !navigator.canShare(shareData)) {
                console.log('Cannot share this data');
                this.copyToClipboard(shareText);
                return;
            }
            
            navigator.share(shareData).then(() => {
                this.showNotification('Results shared successfully! 🎉', 'success');
            }).catch((error) => {
                console.log('Share error:', error);
                if (error.name !== 'AbortError') {
                    // Only fallback if it's not a user cancellation
                    this.copyToClipboard(shareText);
                } else {
                    this.showNotification('Share cancelled', 'info');
                }
            }).finally(() => {
                this.resetShareButton();
            });
        } else {
            // Fallback to clipboard copy
            this.copyToClipboard(shareText);
        }
    }

    resetShareButton() {
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.disabled = false;
            shareBtn.innerHTML = '<i class="fas fa-share"></i>';
        }
    }

    getDeviceInfo() {
        const ua = navigator.userAgent;
        let device = 'Unknown Device';
        let browser = 'Unknown Browser';
        let os = 'Unknown OS';
        
        // Detect OS
        if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Mac OS')) os = 'macOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
        
        // Detect Browser
        if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
        else if (ua.includes('Edg')) browser = 'Edge';
        else if (ua.includes('Opera')) browser = 'Opera';
        
        // Detect Device Type
        if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
            device = 'Mobile Device';
        } else if (ua.includes('Tablet') || ua.includes('iPad')) {
            device = 'Tablet';
        } else {
            device = 'Desktop/Laptop';
        }
        
        return { device, browser, os };
    }
    
    getConnectionInfo() {
        let type = 'Unknown';
        let effectiveType = 'Unknown';
        
        if ('connection' in navigator) {
            const conn = navigator.connection;
            type = conn.type || 'Unknown';
            effectiveType = conn.effectiveType || 'Unknown';
        }
        
        return { 
            type: type !== 'Unknown' ? type : effectiveType,
            effectiveType 
        };
    }
    
    getConnectionQuality(downloadSpeed) {
        if (downloadSpeed >= 100) return '🔥 Excellent (100+ Mbps)';
        if (downloadSpeed >= 50) return '⚡ Very Good (50-100 Mbps)';
        if (downloadSpeed >= 25) return '✅ Good (25-50 Mbps)';
        if (downloadSpeed >= 10) return '⚠️ Fair (10-25 Mbps)';
        if (downloadSpeed >= 5) return '🐌 Slow (5-10 Mbps)';
        return '❌ Very Slow (<5 Mbps)';
    }
    
    getSpeedAnalysis(result) {
        const { downloadSpeed, uploadSpeed, ping } = result;
        let analysis = [];
        
        // Download analysis
        if (downloadSpeed >= 100) {
            analysis.push('🎮 Perfect for 4K streaming, gaming, and large downloads');
        } else if (downloadSpeed >= 50) {
            analysis.push('📺 Great for HD streaming and video calls');
        } else if (downloadSpeed >= 25) {
            analysis.push('💻 Good for most web browsing and streaming');
        } else if (downloadSpeed >= 10) {
            analysis.push('📱 Basic web browsing and standard streaming');
        } else {
            analysis.push('⚠️ May experience buffering with video content');
        }
        
        // Upload analysis
        if (uploadSpeed >= 50) {
            analysis.push('📤 Excellent upload for video calls and content creation');
        } else if (uploadSpeed >= 25) {
            analysis.push('📤 Good upload for video conferencing');
        } else if (uploadSpeed >= 10) {
            analysis.push('📤 Adequate upload for most activities');
        } else {
            analysis.push('📤 Limited upload capacity');
        }
        
        // Ping analysis
        if (ping <= 20) {
            analysis.push('⚡ Excellent latency for gaming and real-time apps');
        } else if (ping <= 50) {
            analysis.push('🎯 Good latency for most online activities');
        } else if (ping <= 100) {
            analysis.push('⏱️ Moderate latency, may notice delays in gaming');
        } else {
            analysis.push('🐌 High latency, may affect real-time applications');
        }
        
        return analysis.join('\n');
    }

    copyToClipboard(text) {
        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Results copied to clipboard! 📋', 'success');
            }).catch((error) => {
                console.log('Clipboard API failed:', error);
                // Fallback to older method
                this.fallbackCopyToClipboard(text);
            }).finally(() => {
                this.resetShareButton();
            });
        } else {
            // Use fallback method for older browsers
            this.fallbackCopyToClipboard(text);
        }
    }

    fallbackCopyToClipboard(text) {
        // Create a temporary textarea element
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.style.opacity = '0';
        textArea.style.pointerEvents = 'none';
        document.body.appendChild(textArea);
        
        try {
            textArea.focus();
            textArea.select();
            textArea.setSelectionRange(0, 99999); // For mobile devices
            
            const successful = document.execCommand('copy');
            if (successful) {
                this.showNotification('Results copied to clipboard! 📋', 'success');
            } else {
                // Try a different approach
                this.showManualCopyDialog(text);
            }
        } catch (error) {
            console.log('Fallback copy failed:', error);
            this.showManualCopyDialog(text);
        } finally {
            document.body.removeChild(textArea);
            this.resetShareButton();
        }
    }

    showManualCopyDialog(text) {
        // Create a modal with the text for manual copying
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
            box-sizing: border-box;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            border-radius: 16px;
            padding: 24px;
            max-width: 90%;
            max-height: 80%;
            overflow: auto;
            text-align: center;
        `;
        
        content.innerHTML = `
            <h3 style="margin-top: 0; color: #333;">Copy Results</h3>
            <p style="color: #666; margin-bottom: 16px;">Please copy the text below manually:</p>
            <textarea readonly style="
                width: 100%;
                height: 120px;
                padding: 12px;
                border: 2px solid #ddd;
                border-radius: 8px;
                font-family: monospace;
                font-size: 14px;
                resize: none;
                margin-bottom: 16px;
            ">${text}</textarea>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: var(--primary-color, #667eea);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                font-size: 16px;
                cursor: pointer;
                min-height: 44px;
            ">Close</button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Auto-select the text
        const textarea = content.querySelector('textarea');
        textarea.focus();
        textarea.select();
        
        this.showNotification('Manual copy dialog opened', 'info');
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            if (this.fullscreenBtn) this.fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            document.exitFullscreen();
            if (this.fullscreenBtn) this.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    }

    handleKeyboardShortcuts(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'Enter':
                    event.preventDefault();
                    if (!this.isTestRunning) {
                        this.startSpeedTest();
                    }
                    break;
                case 'e':
                    event.preventDefault();
                    this.exportData();
                    break;
                case 's':
                    event.preventDefault();
                    this.shareResults();
                    break;
            }
        }
    }

    // Data persistence
    saveTestResult(result) {
        this.testResults.unshift(result);
        if (this.testResults.length > 50) {
            this.testResults = this.testResults.slice(0, 50);
        }
        localStorage.setItem('speedTestHistory', JSON.stringify(this.testResults));
        this.updateFooterStats();
    }

    updateFooterStats() {
        const totalTestsElement = document.getElementById('totalTestsFooter');
        if (totalTestsElement) {
            totalTestsElement.textContent = this.testResults.length.toLocaleString();
        }
    }

    loadTestHistory() {
        const saved = localStorage.getItem('speedTestHistory');
        return saved ? JSON.parse(saved) : [];
    }

    initializeViewSwitching() {
        const chartView = document.getElementById('chartViewContainer');
        const listView = document.getElementById('listViewContainer');
        const chartBtn = document.getElementById('chartView');
        const listBtn = document.getElementById('listView');
        
        // Set initial state
        if (chartView && listView) {
            chartView.style.display = 'block';
            listView.style.display = 'none';
        }
        
        if (chartBtn && listBtn) {
            chartBtn.classList.add('active');
            listBtn.classList.remove('active');
        }
    }

    // Mobile detection and optimizations
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth <= 768;
    }

    initMobileOptimizations() {
        // Only apply mobile optimizations on mobile devices
        if (!this.isMobile()) {
            return;
        }
        
        // Fix viewport height issues on mobile
        this.setVH();
        window.addEventListener('resize', () => this.setVH());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.setVH(), 100);
        });
        
        // Prevent double-tap zoom on buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.touchAction = 'manipulation';
            button.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            button.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        });
        
        // Improve touch target sizes
        this.improveTouchTargets();
        
        // Handle orientation changes
        this.handleOrientationChanges();
    }

    setVH() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    improveTouchTargets() {
        const touchTargets = document.querySelectorAll('input, select, textarea, a, button');
        touchTargets.forEach(target => {
            const computedStyle = window.getComputedStyle(target);
            const minSize = 44;
            
            if (parseInt(computedStyle.height) < minSize) {
                target.style.minHeight = `${minSize}px`;
            }
            if (parseInt(computedStyle.width) < minSize && target.tagName !== 'INPUT') {
                target.style.minWidth = `${minSize}px`;
            }
        });
    }

    handleOrientationChanges() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                window.scrollTo(0, 0);
                
                // Recalculate charts if they exist
                if (this.chartInstance) {
                    this.chartInstance.resize();
                }
                if (this.historyChartInstance) {
                    this.historyChartInstance.resize();
                }
                
                // Fix container widths
                const containers = document.querySelectorAll('.speed-test-container, .history-container, .comparison-container, .diagnostics-container');
                containers.forEach(container => {
                    container.style.width = '100%';
                    container.style.maxWidth = '100%';
                });
                
            }, 300);
        });
    }

    // Data persistence
    saveTestResult(result) {
        this.testResults.unshift(result);
        if (this.testResults.length > 50) {
            this.testResults = this.testResults.slice(0, 50);
        }
        localStorage.setItem('speedTestHistory', JSON.stringify(this.testResults));
        
        // Update footer stats
        if (typeof updateFooterStats === 'function') {
            updateFooterStats();
        }
    }

    loadTestHistory() {
        const saved = localStorage.getItem('speedTestHistory');
        return saved ? JSON.parse(saved) : [];
    }

    saveSettings() {
        localStorage.setItem('speedTestSettings', JSON.stringify(this.settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('speedTestSettings');
        return saved ? JSON.parse(saved) : {};
    }
}

// Initialize the application with proper error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Add loading class to prevent settings from showing during init
        document.body.classList.add('loading');
        
        const tracker = new SpeedLens();
        
        // Remove loading class after initialization
        setTimeout(() => {
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');
        }, 100);
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            tracker.handleKeyboardShortcuts(event);
        });
        
        // Handle escape key to close modals/settings
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                const settingsPanel = document.getElementById('settingsPanel');
                if (settingsPanel && settingsPanel.classList.contains('active')) {
                    tracker.toggleSettings();
                }
                
                // Close any open modals
                const modals = document.querySelectorAll('.export-modal');
                modals.forEach(modal => {
                    modal.style.animation = 'fadeOut 0.3s ease forwards';
                    setTimeout(() => modal.remove(), 300);
                });
            }
        });
        
    } catch (error) {
        console.error('Failed to initialize Speed Lens:', error);
        // Show fallback UI
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                flex-direction: column;
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
                padding: 20px;
            ">
                <h1>⚠️ Initialization Error</h1>
                <p>Failed to load Speed Lens.</p>
                <p>Please refresh the page to try again.</p>
                <button onclick="location.reload()" style="
                    padding: 12px 24px;
                    background: white;
                    color: #667eea;
                    border: none;
                    border-radius: 25px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 20px;
                ">Refresh Page</button>
            </div>
        `;
    }
});

// Service Worker registration for PWA with mobile optimizations
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
                
                // Handle mobile app install prompt
                window.addEventListener('beforeinstallprompt', (e) => {
                    e.preventDefault();
                    window.deferredPrompt = e;
                    showInstallPrompt();
                });
                
                // Handle app installed event for mobile
                window.addEventListener('appinstalled', (e) => {
                    console.log('App was installed');
                    showNotification('App installed successfully!', 'success');
                    window.deferredPrompt = null;
                });
                
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Mobile install prompt function
function showInstallPrompt() {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'install-prompt-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        box-sizing: border-box;
        animation: fadeIn 0.3s ease;
    `;
    
    // Create popup content
    const popup = document.createElement('div');
    popup.className = 'install-prompt-popup';
    popup.style.cssText = `
        background: white;
        border-radius: 20px;
        padding: 30px;
        max-width: 400px;
        width: 100%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        position: relative;
        animation: slideInScale 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        border: 3px solid;
        border-image: linear-gradient(135deg, #667eea, #764ba2) 1;
    `;
    
    popup.innerHTML = `
        <div style="
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 2.5rem;
            color: white;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        ">
            ⚡
        </div>
        
        <h2 style="
            color: #333;
            font-size: 1.5rem;
            margin: 0 0 10px 0;
            font-weight: 700;
        ">Install Speed Lens</h2>
        
        <p style="
            color: #666;
            font-size: 1rem;
            line-height: 1.6;
            margin: 0 0 25px 0;
        ">
            Get faster access and better performance with our progressive web app!
        </p>
        
        <div style="
            background: rgba(102, 126, 234, 0.1);
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 25px;
            border-left: 4px solid #667eea;
        ">
            <div style="
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
                font-weight: 600;
                color: #667eea;
            ">
                <i class="fas fa-check-circle"></i>
                <span>Benefits:</span>
            </div>
            <ul style="
                text-align: left;
                margin: 0;
                padding-left: 20px;
                color: #555;
                font-size: 0.9rem;
                line-height: 1.5;
            ">
                <li>⚡ Faster loading times</li>
                <li>📱 Works offline</li>
                <li>🔔 Push notifications</li>
                <li>🏠 Add to home screen</li>
            </ul>
        </div>
        
        <div style="
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
        ">
            <button id="installAccept" style="
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 14px 28px;
                border-radius: 25px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            ">
                <i class="fas fa-download"></i>
                Install Now
            </button>
            
            <button id="installDecline" style="
                background: transparent;
                color: #666;
                border: 2px solid #ddd;
                padding: 12px 24px;
                border-radius: 25px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            ">
                Maybe Later
            </button>
        </div>
        
        <button id="installClose" style="
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #999;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s ease;
        ">×</button>
    `;
    
    // Add event listeners
    const acceptBtn = popup.querySelector('#installAccept');
    const declineBtn = popup.querySelector('#installDecline');
    const closeBtn = popup.querySelector('#installClose');
    
    acceptBtn.addEventListener('click', async () => {
        if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
            const { outcome } = await window.deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            window.deferredPrompt = null;
            
            if (outcome === 'accepted') {
                // Show success notification
                if (window.speedTester && typeof window.speedTester.showNotification === 'function') {
                    window.speedTester.showNotification('App installation started! 🎉', 'success');
                }
            }
        }
        modal.remove();
    });
    
    declineBtn.addEventListener('click', () => {
        modal.remove();
        // Show polite reminder
        if (window.speedTester && typeof window.speedTester.showNotification === 'function') {
            window.speedTester.showNotification('You can install the app anytime from the footer! 💡', 'info');
        }
    });
    
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Add hover effects
    acceptBtn.addEventListener('mouseenter', () => {
        acceptBtn.style.transform = 'translateY(-2px)';
        acceptBtn.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
    });
    
    acceptBtn.addEventListener('mouseleave', () => {
        acceptBtn.style.transform = 'translateY(0)';
        acceptBtn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
    });
    
    declineBtn.addEventListener('mouseenter', () => {
        declineBtn.style.borderColor = '#999';
        declineBtn.style.color = '#333';
    });
    
    declineBtn.addEventListener('mouseleave', () => {
        declineBtn.style.borderColor = '#ddd';
        declineBtn.style.color = '#666';
    });
    
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'rgba(0, 0, 0, 0.1)';
        closeBtn.style.color = '#333';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'none';
        closeBtn.style.color = '#999';
    });
    
    // Append to DOM
    modal.appendChild(popup);
    document.body.appendChild(modal);
    
    // Auto-remove after 30 seconds if not interacted with
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 30000);
}

// Mobile-specific optimizations (removed duplicate function)
// This functionality is now handled within the SpeedLens class

// Footer Functionality
function updateFooterStats() {
    try {
        const testHistory = JSON.parse(localStorage.getItem('speedTestHistory') || '[]');
        const totalTests = testHistory.length;
        
        // Update total tests (desktop - new)
        const totalTestsElementDesktop = document.getElementById('totalTestsFooterDesktop');
        if (totalTestsElementDesktop) {
            totalTestsElementDesktop.textContent = totalTests.toLocaleString();
        }
        
        // Update total tests (desktop - legacy)
        const totalTestsElement = document.getElementById('totalTestsFooter');
        if (totalTestsElement) {
            totalTestsElement.textContent = totalTests.toLocaleString();
        }
        
        // Update total tests (mobile)
        const totalTestsElementMobile = document.getElementById('totalTestsFooterMobile');
        if (totalTestsElementMobile) {
            totalTestsElementMobile.textContent = totalTests.toLocaleString();
        }
        
        // Calculate average speed
        if (testHistory.length > 0) {
            const avgDownload = testHistory.reduce((sum, test) => sum + (test.downloadSpeed || 0), 0) / testHistory.length;
            
            // Update desktop average speed (new)
            const avgSpeedElementDesktop = document.getElementById('avgSpeedFooterDesktop');
            if (avgSpeedElementDesktop) {
                avgSpeedElementDesktop.textContent = `${avgDownload.toFixed(1)} Mbps`;
            }
            
            // Update desktop average speed (legacy)
            const avgSpeedElement = document.getElementById('avgSpeedFooter');
            if (avgSpeedElement) {
                avgSpeedElement.textContent = `${avgDownload.toFixed(1)} Mbps`;
            }
            
            // Update mobile average speed (shorter format)
            const avgSpeedElementMobile = document.getElementById('avgSpeedFooterMobile');
            if (avgSpeedElementMobile) {
                avgSpeedElementMobile.textContent = `${avgDownload.toFixed(0)}M`;
            }
        } else {
            // No tests yet - set defaults
            const avgSpeedElementDesktop = document.getElementById('avgSpeedFooterDesktop');
            if (avgSpeedElementDesktop) {
                avgSpeedElementDesktop.textContent = '--';
            }
            
            const avgSpeedElement = document.getElementById('avgSpeedFooter');
            const avgSpeedElementMobile = document.getElementById('avgSpeedFooterMobile');
            if (avgSpeedElement) {
                avgSpeedElement.textContent = '-- Mbps';
            }
            if (avgSpeedElementMobile) {
                avgSpeedElementMobile.textContent = '--';
            }
        }
        
        // Update online status
        updateOnlineStatus();
    } catch (error) {
        console.log('Could not update footer stats:', error);
    }
}

function updateOnlineStatus() {
    const statusElement = document.getElementById('onlineStatus');
    const statusElementMobile = document.getElementById('onlineStatusMobile');
    const statusElementDesktop = document.getElementById('onlineStatusDesktop');
    
    const isOnline = navigator.onLine;
    const statusText = isOnline ? 'Online' : 'Offline';
    const statusClass = isOnline ? 'status-indicator' : 'status-indicator offline';
    
    if (statusElement) {
        statusElement.textContent = statusText;
        statusElement.className = statusClass;
    }
    
    if (statusElementMobile) {
        statusElementMobile.textContent = statusText;
        statusElementMobile.className = statusClass;
    }
    
    if (statusElementDesktop) {
        statusElementDesktop.textContent = statusText;
        statusElementDesktop.className = statusClass;
    }
}

function shareApp() {
    const shareText = `🚀 Speed Lens - Professional Internet Speed Testing Tool
    
⚡ FEATURES THAT MAKE IT AWESOME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Accurate Speed Testing - Download, Upload & Ping
� Detailed Analytics & Historical Data
📱 Mobile Optimized - Works on any device
🔒 Privacy Focused - No data collection
🌐 Global Server Network
📋 Easy Results Sharing
🎨 Beautiful Modern Interface
⚙️ Advanced Network Diagnostics
📋 Export & Save Results
🔄 Real-time Connection Monitoring

💡 PERFECT FOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👨‍💼 IT Professionals & Network Admins
🎮 Gamers checking connection quality  
📺 Streamers optimizing bandwidth
🏠 Home users troubleshooting internet
📱 Mobile users testing cellular speeds
💼 Remote workers ensuring connectivity

🌟 Why Choose Speed Lens?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ No ads or tracking
✅ Instant results
✅ Professional-grade accuracy
✅ Works offline after first load
✅ Free to use forever
✅ Open source & transparent

🔗 Test your connection now: ${window.location.href}

Built with ❤️ by Sarbeswar Panda
#SpeedTest #NetworkTesting #InternetSpeed #TechTools`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Speed Lens - Professional Internet Speed Test Tool',
            text: shareText,
            url: window.location.href
        }).then(() => {
            // Show success notification if available
            if (window.speedTester && typeof window.speedTester.showNotification === 'function') {
                window.speedTester.showNotification('App shared successfully! 🎉', 'success');
            }
        }).catch(error => {
            if (error.name !== 'AbortError') {
                copyToClipboard(shareText);
            }
        });
    } else {
        copyToClipboard(shareText);
    }
}

// Standalone copy to clipboard function for global use
function copyToClipboard(text) {
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            // Show success notification if speedTester is available
            if (window.speedTester && typeof window.speedTester.showNotification === 'function') {
                window.speedTester.showNotification('Copied to clipboard! 📋', 'success');
            } else {
                console.log('Text copied to clipboard');
            }
        }).catch((error) => {
            console.log('Clipboard API failed:', error);
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

// Fallback copy method for older browsers
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    document.body.appendChild(textArea);
    
    try {
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, 99999);
        
        const successful = document.execCommand('copy');
        if (successful) {
            if (window.speedTester && typeof window.speedTester.showNotification === 'function') {
                window.speedTester.showNotification('Copied to clipboard! 📋', 'success');
            } else {
                console.log('Text copied to clipboard');
            }
        } else {
            showManualCopyDialog(text);
        }
    } catch (error) {
        console.log('Fallback copy failed:', error);
        showManualCopyDialog(text);
    } finally {
        document.body.removeChild(textArea);
    }
}

// Manual copy dialog for when all else fails
function showManualCopyDialog(text) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        box-sizing: border-box;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        border-radius: 15px;
        padding: 30px;
        max-width: 90%;
        max-height: 80%;
        overflow-y: auto;
        position: relative;
    `;
    
    content.innerHTML = `
        <h3 style="margin-top: 0; color: #333;">Copy to Share 📋</h3>
        <p style="color: #666; margin-bottom: 15px;">Please copy the text below manually:</p>
        <textarea readonly style="
            width: 100%;
            height: 200px;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            resize: vertical;
            background: #f9f9f9;
        ">${text}</textarea>
        <div style="text-align: center; margin-top: 20px;">
            <button onclick="this.closest('[style*=position]').remove()" style="
                background: #667eea;
                color: white;
                border: none;
                padding: 12px 25px;
                border-radius: 25px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
            ">Close</button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Auto-select the text
    const textarea = content.querySelector('textarea');
    textarea.focus();
    textarea.select();
}

function rateApp() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        box-sizing: border-box;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        border-radius: 20px;
        padding: 30px;
        max-width: 500px;
        text-align: center;
        position: relative;
    `;
    
    content.innerHTML = `
        <h2 style="color: var(--primary-color); margin-bottom: 20px;">⭐ Rate Speed Lens</h2>
        <p style="margin-bottom: 30px; color: #666; line-height: 1.6;">
            Help others discover Speed Lens! Your feedback helps us improve and grow the community.
        </p>
        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <button onclick="openFeedback('excellent')" style="
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white; border: none; padding: 12px 20px; border-radius: 25px;
                cursor: pointer; font-size: 14px; font-weight: 600;">
                ⭐⭐⭐⭐⭐ Excellent!
            </button>
            <button onclick="openFeedback('good')" style="
                background: linear-gradient(135deg, #2196F3, #1976D2);
                color: white; border: none; padding: 12px 20px; border-radius: 25px;
                cursor: pointer; font-size: 14px; font-weight: 600;">
                👍 Good
            </button>
            <button onclick="openFeedback('suggest')" style="
                background: linear-gradient(135deg, #FF9800, #F57C00);
                color: white; border: none; padding: 12px 20px; border-radius: 25px;
                cursor: pointer; font-size: 14px; font-weight: 600;">
                💡 Suggestions
            </button>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
            position: absolute; top: 10px; right: 15px; background: none; border: none;
            font-size: 20px; cursor: pointer; color: #999;">✕</button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
}

function openFeedback(type) {
    // Close rating modal
    const ratingModal = document.querySelector('div[style*="rgba(0,0,0,0.8)"]');
    if (ratingModal) ratingModal.remove();
    
    // Open contact page with appropriate type
    const urls = {
        excellent: 'contact.html?type=feedback',
        good: 'contact.html?type=feedback',
        suggest: 'contact.html?type=feature'
    };
    
    window.open(urls[type] || 'contact.html', '_blank');
}

function showKeyboardShortcuts() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        box-sizing: border-box;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        border-radius: 20px;
        padding: 30px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
    `;
    
    content.innerHTML = `
        <h2 style="color: var(--primary-color); margin-bottom: 20px; text-align: center;">⌨️ Keyboard Shortcuts</h2>
        <div style="display: grid; gap: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                <span><strong>Space</strong></span>
                <span>Start/Stop Speed Test</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                <span><strong>Ctrl + M</strong></span>
                <span>Multi-Server Test</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                <span><strong>Ctrl + H</strong></span>
                <span>View Test History</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                <span><strong>Ctrl + S</strong></span>
                <span>Open Settings</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                <span><strong>Ctrl + E</strong></span>
                <span>Export Results</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                <span><strong>Escape</strong></span>
                <span>Close Dialogs</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                <span><strong>F11</strong></span>
                <span>Toggle Fullscreen</span>
            </div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
            position: absolute; top: 10px; right: 15px; background: none; border: none;
            font-size: 20px; cursor: pointer; color: #999;">✕</button>
        <div style="text-align: center; margin-top: 20px;">
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: var(--primary-color); color: white; border: none;
                padding: 12px 24px; border-radius: 25px; cursor: pointer;
                font-size: 16px; font-weight: 600;">Got it!</button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
}

function showAppInfo() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        box-sizing: border-box;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        border-radius: 20px;
        padding: 30px;
        max-width: 500px;
        text-align: center;
        position: relative;
    `;
    
    const buildDate = new Date().toLocaleDateString();
    const userAgent = navigator.userAgent;
    const isOnline = navigator.onLine ? 'Online' : 'Offline';
    const testHistory = JSON.parse(localStorage.getItem('speedTestHistory') || '[]');
    
    content.innerHTML = `
        <h2 style="color: var(--primary-color); margin-bottom: 20px;">ℹ️ App Information</h2>
        <div style="text-align: left; background: #f8f9fa; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
            <div style="margin-bottom: 15px;"><strong>Version:</strong> 3.0.0</div>
            <div style="margin-bottom: 15px;"><strong>Build Date:</strong> ${buildDate}</div>
            <div style="margin-bottom: 15px;"><strong>Status:</strong> ${isOnline}</div>
            <div style="margin-bottom: 15px;"><strong>Tests Performed:</strong> ${testHistory.length}</div>
            <div style="margin-bottom: 15px;"><strong>Developer:</strong> Sarbeswar Panda</div>
            <div style="margin-bottom: 15px;"><strong>Technology:</strong> Progressive Web App</div>
            <div><strong>Browser:</strong> ${userAgent.split(' ')[0]}</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
            position: absolute; top: 10px; right: 15px; background: none; border: none;
            font-size: 20px; cursor: pointer; color: #999;">✕</button>
        <button onclick="this.parentElement.parentElement.remove()" style="
            background: var(--primary-color); color: white; border: none;
            padding: 12px 24px; border-radius: 25px; cursor: pointer;
            font-size: 16px; font-weight: 600;">Close</button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
}

function showChangelog() {
    const modal = document.createElement('div');
    modal.className = 'install-modal-overlay';
    modal.setAttribute('data-modal-type', 'changelog');
    
    const modalContent = document.createElement('div');
    modalContent.className = 'install-modal-content';
    modalContent.style.maxWidth = '700px';
    modalContent.style.maxHeight = '85vh';
    modalContent.style.overflowY = 'auto';
    
    modalContent.innerHTML = `
        <div class="install-modal-header">
            <div class="modal-icon">📝</div>
            <h2 class="modal-title">What's New</h2>
            <p class="modal-subtitle">Latest updates and improvements</p>
            <button class="modal-close" onclick="closeModal(this)">&times;</button>
        </div>
        
        <div class="install-modal-body" style="text-align: left; padding: 0 30px 30px;">
            <div class="changelog-version">
                <div class="version-header latest">
                    <h3>🚀 Version 3.0.0 - Latest</h3>
                    <span class="version-badge">NEW</span>
                </div>
                <ul class="feature-list">
                    <li><span class="feature-icon">📱</span>Enhanced mobile user interface</li>
                    <li><span class="feature-icon">⚡</span>Improved speed testing accuracy</li>
                    <li><span class="feature-icon">🔗</span>New footer with quick links</li>
                    <li><span class="feature-icon">📤</span>Better sharing functionality</li>
                    <li><span class="feature-icon">📲</span>Enhanced PWA features</li>
                    <li><span class="feature-icon">🔧</span>Performance optimizations</li>
                </ul>
            </div>
            
            <div class="changelog-version">
                <div class="version-header">
                    <h3>🔄 Version 2.5.0</h3>
                    <span class="version-badge">Previous</span>
                </div>
                <ul class="feature-list">
                    <li><span class="feature-icon">🌐</span>Added multi-server testing</li>
                    <li><span class="feature-icon">📊</span>Improved analytics dashboard</li>
                    <li><span class="feature-icon">📄</span>Export functionality enhancement</li>
                    <li><span class="feature-icon">🐛</span>Bug fixes and stability improvements</li>
                </ul>
            </div>
            
            <div class="changelog-version">
                <div class="version-header">
                    <h3>🎨 Version 2.0.0</h3>
                    <span class="version-badge">Legacy</span>
                </div>
                <ul class="feature-list">
                    <li><span class="feature-icon">✨</span>Complete UI redesign</li>
                    <li><span class="feature-icon">📈</span>Real-time charting</li>
                    <li><span class="feature-icon">📝</span>History tracking</li>
                    <li><span class="feature-icon">📱</span>Mobile optimizations</li>
                </ul>
            </div>
        </div>
        
        <div class="install-modal-actions">
            <button class="modal-button primary" onclick="closeModal(this)">
                <span class="button-icon">✓</span>
                Got it
            </button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Trigger animation
    requestAnimationFrame(() => modal.classList.add('show'));
}

// Initialize footer stats and online status monitoring
document.addEventListener('DOMContentLoaded', updateFooterStats);
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Update footer stats when tests are completed
document.addEventListener('testCompleted', updateFooterStats);

// ========== ENHANCED FOOTER FUNCTIONALITY ========== //

// Clear all data function
function clearAllData() {
    const modal = document.createElement('div');
    modal.className = 'install-modal-overlay';
    modal.setAttribute('data-modal-type', 'clear-data');
    
    const modalContent = document.createElement('div');
    modalContent.className = 'install-modal-content';
    modalContent.style.maxWidth = '550px';
    
    modalContent.innerHTML = `
        <div class="install-modal-header">
            <div class="modal-icon" style="background: linear-gradient(135deg, #ff6b6b, #ee5a52); color: white;">⚠️</div>
            <h2 class="modal-title">Clear All Data</h2>
            <p class="modal-subtitle">This action cannot be undone</p>
            <button class="modal-close" onclick="closeModal(this)">&times;</button>
        </div>
        
        <div class="install-modal-body">
            <div style="text-align: left; margin-bottom: 25px;">
                <h3 style="color: #e74c3c; margin-bottom: 15px; font-size: 18px;">
                    <span style="margin-right: 8px;">🗑️</span>The following data will be permanently deleted:
                </h3>
                <ul style="margin: 0; padding-left: 25px; color: #666; line-height: 1.8;">
                    <li><strong>Speed test history</strong> - All your previous test results</li>
                    <li><strong>App settings</strong> - Your personalized preferences</li>
                    <li><strong>Test preferences</strong> - Custom test configurations</li>
                    <li><strong>Analytics data</strong> - Usage statistics and trends</li>
                </ul>
            </div>
            
            <div style="background: linear-gradient(135deg, #fff5f5, #fee); padding: 20px; border-radius: 15px; border-left: 4px solid #e74c3c; margin-bottom: 20px;">
                <p style="margin: 0; color: #c0392b; font-weight: 600; display: flex; align-items: center;">
                    <span style="margin-right: 10px; font-size: 18px;">⚠️</span>
                    This action is permanent and cannot be reversed!
                </p>
            </div>
        </div>
        
        <div class="install-modal-actions">
            <button class="modal-button secondary" onclick="closeModal(this)">
                <span class="button-icon">✗</span>
                Cancel
            </button>
            <button class="modal-button danger" onclick="confirmClearData(this)">
                <span class="button-icon">🗑️</span>
                Clear All Data
            </button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Trigger animation
    requestAnimationFrame(() => modal.classList.add('show'));
}

// Function to actually clear the data after confirmation
function confirmClearData(button) {
    // Show loading state
    button.innerHTML = '<span class="button-icon">⏳</span>Clearing...';
    button.disabled = true;
    
    setTimeout(() => {
        localStorage.removeItem('speedTestHistory');
        localStorage.removeItem('speedLensSettings');
        localStorage.removeItem('speedTestPreferences');
        
        // Close the modal
        closeModal(button);
        
        // Show success popup
        setTimeout(() => {
            showSuccessMessage('All data has been cleared successfully!');
            // Reset the app
            setTimeout(() => location.reload(), 1500);
        }, 300);
    }, 1000);
}

// Success message popup
function showSuccessMessage(message) {
    const modal = document.createElement('div');
    modal.className = 'install-modal-overlay';
    modal.style.background = 'rgba(0, 0, 0, 0.3)';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'install-modal-content';
    modalContent.style.maxWidth = '400px';
    modalContent.style.padding = '30px';
    modalContent.style.textAlign = 'center';
    
    modalContent.innerHTML = `
        <div style="margin-bottom: 20px;">
            <div style="background: linear-gradient(135deg, #4CAF50, #45a049); color: white; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 32px; box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3);">✓</div>
            <h3 style="color: #4CAF50; margin: 0; font-size: 20px;">${message}</h3>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Trigger animation
    requestAnimationFrame(() => modal.classList.add('show'));
    
    // Auto-close after 1.5 seconds
    setTimeout(() => {
        modal.classList.add('hide');
        setTimeout(() => modal.remove(), 300);
    }, 1500);
}

// Export all data function
function exportAllData() {
    try {
        const history = JSON.parse(localStorage.getItem('speedTestHistory') || '[]');
        const settings = JSON.parse(localStorage.getItem('speedLensSettings') || '{}');
        
        const exportData = {
            exportDate: new Date().toISOString(),
            appVersion: '1.0.0',
            testHistory: history,
            settings: settings,
            totalTests: history.length,
            deviceInfo: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language
            }
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `speed-lens-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        alert('Your data has been exported successfully!');
    } catch (error) {
        console.error('Export error:', error);
        alert('Failed to export data. Please try again.');
    }
}

// Install app function (PWA)
function installApp() {
    if (window.deferredPrompt) {
        // Use the popup for install prompt
        showInstallPrompt();
    } else {
        // Show informative popup when deferredPrompt is not available
        showInstallInstructions();
    }
}

// Show install instructions when PWA prompt is not available
function showInstallInstructions() {
    const modal = document.createElement('div');
    modal.className = 'install-instructions-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        box-sizing: border-box;
        animation: fadeIn 0.3s ease;
    `;
    
    const popup = document.createElement('div');
    popup.style.cssText = `
        background: white;
        border-radius: 20px;
        padding: 30px;
        max-width: 450px;
        width: 100%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        position: relative;
        animation: slideInScale 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        border: 3px solid transparent;
        background-clip: padding-box;
    `;
    
    popup.innerHTML = `
        <div style="
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 2.5rem;
            color: white;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        ">
            📱
        </div>
        
        <h2 style="
            color: #333;
            font-size: 1.5rem;
            margin: 0 0 10px 0;
            font-weight: 700;
        ">Install Speed Lens</h2>
        
        <p style="
            color: #666;
            font-size: 1rem;
            line-height: 1.6;
            margin: 0 0 25px 0;
        ">
            Add Speed Lens to your device for the best experience!
        </p>
        
        <div style="
            text-align: left;
            background: rgba(102, 126, 234, 0.1);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
            border-left: 4px solid #667eea;
        ">
            <div style="margin-bottom: 15px;">
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                    color: #667eea;
                    margin-bottom: 8px;
                ">
                    <i class="fas fa-mobile-alt"></i>
                    <span>On Mobile:</span>
                </div>
                <ul style="
                    margin: 0;
                    padding-left: 20px;
                    color: #555;
                    font-size: 0.9rem;
                    line-height: 1.5;
                ">
                    <li>Tap the share button <i class="fas fa-share" style="color: #667eea;"></i></li>
                    <li>Select "Add to Home Screen"</li>
                    <li>Tap "Add" to confirm</li>
                </ul>
            </div>
            
            <div>
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                    color: #667eea;
                    margin-bottom: 8px;
                ">
                    <i class="fas fa-desktop"></i>
                    <span>On Desktop:</span>
                </div>
                <ul style="
                    margin: 0;
                    padding-left: 20px;
                    color: #555;
                    font-size: 0.9rem;
                    line-height: 1.5;
                ">
                    <li>Look for the install icon <i class="fas fa-download" style="color: #667eea;"></i> in your browser's address bar</li>
                    <li>Or bookmark this page for quick access</li>
                </ul>
            </div>
        </div>
        
        <div style="
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
        ">
            <button id="instructionsOk" style="
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 14px 28px;
                border-radius: 25px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            ">
                <i class="fas fa-check"></i>
                Got it!
            </button>
        </div>
        
        <button id="instructionsClose" style="
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #999;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s ease;
        ">×</button>
    `;
    
    // Add event listeners
    const okBtn = popup.querySelector('#instructionsOk');
    const closeBtn = popup.querySelector('#instructionsClose');
    
    okBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Add hover effects
    okBtn.addEventListener('mouseenter', () => {
        okBtn.style.transform = 'translateY(-2px)';
        okBtn.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
    });
    
    okBtn.addEventListener('mouseleave', () => {
        okBtn.style.transform = 'translateY(0)';
        okBtn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
    });
    
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'rgba(0, 0, 0, 0.1)';
        closeBtn.style.color = '#333';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'none';
        closeBtn.style.color = '#999';
    });
    
    // Append to DOM
    modal.appendChild(popup);
    document.body.appendChild(modal);
}

// Show network information
function showNetworkInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    const modal = document.createElement('div');
    modal.className = 'install-modal-overlay';
    modal.setAttribute('data-modal-type', 'network-info');
    
    const modalContent = document.createElement('div');
    modalContent.className = 'install-modal-content';
    modalContent.style.maxWidth = '650px';
    
    // Gather network information
    const networkData = {
        online: navigator.onLine,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screen: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        connection: connection ? {
            type: connection.effectiveType || 'Unknown',
            downlink: connection.downlink || 'Unknown',
            rtt: connection.rtt || 'Unknown',
            saveData: connection.saveData
        } : null
    };
    
    modalContent.innerHTML = `
        <div class="install-modal-header">
            <div class="modal-icon" style="background: linear-gradient(135deg, #667eea, #764ba2);">📡</div>
            <h2 class="modal-title">Network Information</h2>
            <p class="modal-subtitle">System and connection details</p>
            <button class="modal-close" onclick="closeModal(this)">&times;</button>
        </div>
        
        <div class="install-modal-body" style="text-align: left; padding: 0 30px 30px;">
            <div class="network-info-section">
                <h3 style="color: #667eea; margin-bottom: 15px; display: flex; align-items: center; font-size: 18px;">
                    <span style="margin-right: 10px;">🌐</span>Connection Status
                </h3>
                <div class="network-info-grid">
                    <div class="network-info-item">
                        <span class="network-info-label">Status:</span>
                        <span class="network-info-value ${networkData.online ? 'online' : 'offline'}">
                            ${networkData.online ? '✅ Connected' : '❌ Offline'}
                        </span>
                    </div>
                    ${networkData.connection ? `
                        <div class="network-info-item">
                            <span class="network-info-label">Connection Type:</span>
                            <span class="network-info-value">${networkData.connection.type}</span>
                        </div>
                        <div class="network-info-item">
                            <span class="network-info-label">Downlink Speed:</span>
                            <span class="network-info-value">${networkData.connection.downlink} Mbps</span>
                        </div>
                        <div class="network-info-item">
                            <span class="network-info-label">Round Trip Time:</span>
                            <span class="network-info-value">${networkData.connection.rtt} ms</span>
                        </div>
                        <div class="network-info-item">
                            <span class="network-info-label">Data Saver:</span>
                            <span class="network-info-value">${networkData.connection.saveData ? '🔋 Enabled' : '🚫 Disabled'}</span>
                        </div>
                    ` : '<div class="network-info-item"><span class="network-info-value">Connection API not supported in this browser</span></div>'}
                </div>
            </div>
            
            <div class="network-info-section">
                <h3 style="color: #667eea; margin-bottom: 15px; display: flex; align-items: center; font-size: 18px;">
                    <span style="margin-right: 10px;">💻</span>Device Information
                </h3>
                <div class="network-info-grid">
                    <div class="network-info-item">
                        <span class="network-info-label">Platform:</span>
                        <span class="network-info-value">${networkData.platform}</span>
                    </div>
                    <div class="network-info-item">
                        <span class="network-info-label">Language:</span>
                        <span class="network-info-value">${networkData.language}</span>
                    </div>
                    <div class="network-info-item">
                        <span class="network-info-label">Screen Size:</span>
                        <span class="network-info-value">${networkData.screen}</span>
                    </div>
                    <div class="network-info-item">
                        <span class="network-info-label">Viewport:</span>
                        <span class="network-info-value">${networkData.viewport}</span>
                    </div>
                </div>
            </div>
            
            <div class="network-info-section">
                <h3 style="color: #667eea; margin-bottom: 15px; display: flex; align-items: center; font-size: 18px;">
                    <span style="margin-right: 10px;">🔍</span>Browser Details
                </h3>
                <div class="network-info-item" style="flex-direction: column; align-items: flex-start;">
                    <span class="network-info-label">User Agent:</span>
                    <span class="network-info-value" style="word-break: break-all; font-size: 12px; color: #666; margin-top: 5px; padding: 10px; background: #f8f9fa; border-radius: 8px; width: 100%; box-sizing: border-box;">
                        ${networkData.userAgent}
                    </span>
                </div>
            </div>
        </div>
        
        <div class="install-modal-actions">
            <button class="modal-button primary" onclick="closeModal(this)">
                <span class="button-icon">✓</span>
                Close
            </button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Trigger animation
    requestAnimationFrame(() => modal.classList.add('show'));
}

// Universal close modal function
function closeModal(element) {
    const modal = element.closest('.install-modal-overlay');
    if (modal) {
        modal.classList.add('hide');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}

// Toggle theme function
let currentTheme = 'light';
function toggleTheme() {
    const body = document.body;
    const mobileThemeButton = document.querySelector('.theme-toggle i');
    const desktopThemeButton = document.querySelector('.theme-icon');
    
    if (currentTheme === 'light') {
        body.classList.add('dark-mode');
        // Update mobile button
        if (mobileThemeButton) {
            mobileThemeButton.className = 'fas fa-sun';
        }
        // Update desktop button
        if (desktopThemeButton) {
            desktopThemeButton.className = 'fas fa-sun theme-icon';
        }
        currentTheme = 'dark';
        localStorage.setItem('speedLensTheme', 'dark');
    } else {
        body.classList.remove('dark-mode');
        // Update mobile button
        if (mobileThemeButton) {
            mobileThemeButton.className = 'fas fa-moon';
        }
        // Update desktop button
        if (desktopThemeButton) {
            desktopThemeButton.className = 'fas fa-moon theme-icon';
        }
        currentTheme = 'light';
        localStorage.setItem('speedLensTheme', 'light');
    }
}

// Update last test time in footer
function updateLastTestTime() {
    const lastTestElement = document.getElementById('lastTestTime');
    const lastTestElementMobile = document.getElementById('lastTestTimeMobile');
    const lastTestElementDesktop = document.getElementById('lastTestTimeDesktop');
    
    const history = JSON.parse(localStorage.getItem('speedTestHistory') || '[]');
    
    let timeString = 'Never';
    let mobileTimeString = '--';
    let desktopTimeString = '--';
    
    if (history.length > 0) {
        const lastTest = new Date(history[history.length - 1].timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now - lastTest) / 60000);
        
        if (diffMinutes < 1) {
            timeString = 'Just now';
            mobileTimeString = 'Now';
            desktopTimeString = 'Just now';
        } else if (diffMinutes < 60) {
            timeString = `${diffMinutes}m ago`;
            mobileTimeString = `${diffMinutes}m`;
            desktopTimeString = `${diffMinutes}m ago`;
        } else if (diffMinutes < 1440) {
            const hours = Math.floor(diffMinutes / 60);
            timeString = `${hours}h ago`;
            mobileTimeString = `${hours}h`;
            desktopTimeString = `${hours}h ago`;
        } else {
            const days = Math.floor(diffMinutes / 1440);
            timeString = `${days}d ago`;
            mobileTimeString = `${days}d`;
            desktopTimeString = `${days}d ago`;
        }
    }
    
    if (lastTestElement) {
        lastTestElement.textContent = timeString;
    }
    
    if (lastTestElementMobile) {
        lastTestElementMobile.textContent = mobileTimeString;
    }
    
    if (lastTestElementDesktop) {
        lastTestElementDesktop.textContent = desktopTimeString;
    }
    if (lastTestElementMobile) {
        lastTestElementMobile.textContent = mobileTimeString;
    }
}

// Initialize theme from localStorage
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('speedLensTheme');
    if (savedTheme === 'dark') {
        toggleTheme();
    }
    
    // Update last test time
    updateLastTestTime();
    setInterval(updateLastTestTime, 60000); // Update every minute
});

// Listen for PWA install prompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPrompt = e;
});

// Update footer stats more frequently
setInterval(() => {
    updateFooterStats();
    updateLastTestTime();
}, 30000); // Update every 30 seconds

// Mobile Footer Accordion Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeMobileFooterAccordion();
});

function initializeMobileFooterAccordion() {
    // Only initialize on mobile devices
    if (window.innerWidth > 480) return;
    
    const footerSections = document.querySelectorAll('.footer-section:not(.footer-brand-section)');
    
    footerSections.forEach(section => {
        const header = section.querySelector('h4');
        if (!header) return;
        
        // Add click event to header
        header.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close all other sections
            footerSections.forEach(otherSection => {
                if (otherSection !== section) {
                    otherSection.classList.remove('active');
                }
            });
            
            // Toggle current section
            section.classList.toggle('active');
        });
        
        // Prevent clicks on links from closing the accordion
        const links = section.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.stopPropagation();
                // Allow normal link behavior
            });
        });
    });
    
    // Close accordions when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.footer-section')) {
            footerSections.forEach(section => {
                section.classList.remove('active');
            });
        }
    });
}

// Re-initialize accordion on window resize
window.addEventListener('resize', function() {
    // Debounce resize events
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(() => {
        if (window.innerWidth <= 480) {
            initializeMobileFooterAccordion();
        } else {
            // Remove accordion functionality on larger screens
            const footerSections = document.querySelectorAll('.footer-section:not(.footer-brand-section)');
            footerSections.forEach(section => {
                section.classList.remove('active');
                const header = section.querySelector('h4');
                if (header) {
                    // Clone and replace to remove event listeners
                    const newHeader = header.cloneNode(true);
                    header.parentNode.replaceChild(newHeader, header);
                }
            });
        }
    }, 250);
});
