// Enhanced Analytics Demo Implementation
class AnalyticsManager {
    constructor() {
        this.testHistory = this.generateDemoData();
        this.chart = null;
        this.currentFilter = 'all';
        this.currentTimeRange = '7days';
        this.initializeAnalytics();
    }

    generateDemoData() {
        const data = [];
        const now = new Date();
        
        // Generate 30 days of demo data
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            // Generate realistic speed variations
            const baseDownload = 50 + Math.random() * 100;
            const baseUpload = 20 + Math.random() * 30;
            const basePing = 10 + Math.random() * 40;
            
            // Add some patterns (slower on weekends, peak hours)
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const hour = date.getHours();
            const isPeakHour = hour >= 19 && hour <= 23;
            
            let downloadMultiplier = 1;
            let uploadMultiplier = 1;
            let pingMultiplier = 1;
            
            if (isWeekend) {
                downloadMultiplier *= 0.8;
                uploadMultiplier *= 0.9;
                pingMultiplier *= 1.2;
            }
            
            if (isPeakHour) {
                downloadMultiplier *= 0.7;
                uploadMultiplier *= 0.8;
                pingMultiplier *= 1.5;
            }
            
            data.push({
                date: date.toISOString(),
                download: Math.round(baseDownload * downloadMultiplier * 100) / 100,
                upload: Math.round(baseUpload * uploadMultiplier * 100) / 100,
                ping: Math.round(basePing * pingMultiplier * 100) / 100,
                jitter: Math.round((2 + Math.random() * 8) * 100) / 100,
                timestamp: date.getTime()
            });
        }
        
        return data;
    }

    initializeAnalytics() {
        // Force detailed analytics to take priority
        this.setupDetailedView();
        this.updateStatistics();
        this.createChart();
        this.generateInsights();
        this.setupEventListeners();
        this.animateStatCards();
    }

    setupDetailedView() {
        // Ensure the detailed analytics view is always shown
        const container = document.getElementById('analyticsContainer');
        if (container) {
            container.setAttribute('data-view', 'detailed');
            container.classList.add('detailed-analytics');
        }
    }

    setupEventListeners() {
        // Chart toggle controls
        document.querySelectorAll('.chart-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-toggle').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTimeRange = e.target.dataset.range;
                this.updateChart();
            });
        });

        // Export buttons
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.target.dataset.format || e.target.closest('.export-btn').dataset.format;
                this.exportData(format);
            });
        });

        // Filter controls
        const filterSelect = document.querySelector('.filter-select');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.updateAnalytics();
            });
        }

        // Date range picker
        const dateInputs = document.querySelectorAll('.date-input');
        dateInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateAnalytics();
            });
        });
    }

    updateStatistics() {
        const stats = this.calculateStatistics();
        
        // Update stat cards with animation
        Object.keys(stats).forEach((key, index) => {
            const card = document.querySelector(`.stat-card:nth-child(${index + 1})`);
            if (card) {
                const valueElement = card.querySelector('.stat-value');
                const trendElement = card.querySelector('.stat-trend');
                
                if (valueElement) {
                    this.animateValue(valueElement, stats[key].value, stats[key].unit);
                }
                
                if (trendElement && stats[key].trend) {
                    trendElement.innerHTML = `
                        <span class="trend-icon">${stats[key].trend > 0 ? '↗' : stats[key].trend < 0 ? '↘' : '→'}</span>
                        ${Math.abs(stats[key].trend)}% vs last period
                    `;
                    trendElement.className = `stat-trend ${stats[key].trend > 0 ? 'positive' : stats[key].trend < 0 ? 'negative' : 'neutral'}`;
                }
            }
        });
    }

    calculateStatistics() {
        const filteredData = this.getFilteredData();
        
        if (filteredData.length === 0) {
            return {};
        }

        const downloads = filteredData.map(d => d.download);
        const uploads = filteredData.map(d => d.upload);
        const pings = filteredData.map(d => d.ping);
        const jitters = filteredData.map(d => d.jitter);

        return {
            avgDownload: {
                value: this.average(downloads),
                unit: 'Mbps',
                trend: this.calculateTrend(downloads)
            },
            avgUpload: {
                value: this.average(uploads),
                unit: 'Mbps',
                trend: this.calculateTrend(uploads)
            },
            avgPing: {
                value: this.average(pings),
                unit: 'ms',
                trend: this.calculateTrend(pings) * -1 // Lower ping is better
            },
            maxDownload: {
                value: Math.max(...downloads),
                unit: 'Mbps',
                trend: 0
            },
            minPing: {
                value: Math.min(...pings),
                unit: 'ms',
                trend: 0
            },
            totalTests: {
                value: filteredData.length,
                unit: 'tests',
                trend: 0
            }
        };
    }

    average(arr) {
        return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100;
    }

    calculateTrend(data) {
        if (data.length < 2) return 0;
        
        const midPoint = Math.floor(data.length / 2);
        const firstHalf = data.slice(0, midPoint);
        const secondHalf = data.slice(midPoint);
        
        const firstAvg = this.average(firstHalf);
        const secondAvg = this.average(secondHalf);
        
        return Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
    }

    getFilteredData() {
        let filtered = [...this.testHistory];
        
        // Apply time range filter
        const now = new Date();
        let startDate = new Date(now);
        
        switch (this.currentTimeRange) {
            case '24h':
                startDate.setHours(startDate.getHours() - 24);
                break;
            case '7days':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30days':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case 'all':
            default:
                startDate = new Date(0);
                break;
        }
        
        filtered = filtered.filter(d => new Date(d.date) >= startDate);
        
        // Apply custom date range if set
        const startDateInput = document.querySelector('.date-input[type="date"]:first-of-type');
        const endDateInput = document.querySelector('.date-input[type="date"]:last-of-type');
        
        if (startDateInput && startDateInput.value) {
            const customStart = new Date(startDateInput.value);
            filtered = filtered.filter(d => new Date(d.date) >= customStart);
        }
        
        if (endDateInput && endDateInput.value) {
            const customEnd = new Date(endDateInput.value);
            customEnd.setHours(23, 59, 59);
            filtered = filtered.filter(d => new Date(d.date) <= customEnd);
        }
        
        return filtered;
    }

    createChart() {
        const ctx = document.getElementById('historyChart');
        if (!ctx) return;

        const data = this.getFilteredData();
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => new Date(d.date).toLocaleDateString()),
                datasets: [
                    {
                        label: 'Download Speed (Mbps)',
                        data: data.map(d => d.download),
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4
                    },
                    {
                        label: 'Upload Speed (Mbps)',
                        data: data.map(d => d.upload),
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#4CAF50',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4
                    },
                    {
                        label: 'Ping (ms)',
                        data: data.map(d => d.ping),
                        borderColor: '#FF9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#FF9800',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#333',
                        bodyColor: '#666',
                        borderColor: '#ddd',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        titleFont: {
                            size: 14,
                            weight: '600'
                        },
                        bodyFont: {
                            size: 13
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxTicksLimit: 10,
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Speed (Mbps)',
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Ping (ms)',
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    updateChart() {
        if (!this.chart) return;
        
        const data = this.getFilteredData();
        
        this.chart.data.labels = data.map(d => new Date(d.date).toLocaleDateString());
        this.chart.data.datasets[0].data = data.map(d => d.download);
        this.chart.data.datasets[1].data = data.map(d => d.upload);
        this.chart.data.datasets[2].data = data.map(d => d.ping);
        
        this.chart.update('active');
    }

    generateInsights() {
        const data = this.getFilteredData();
        const insights = this.analyzePerformance(data);
        
        const insightsContainer = document.querySelector('.insights-grid');
        if (!insightsContainer) return;
        
        insightsContainer.innerHTML = insights.map(insight => `
            <div class="insight-card">
                <span class="insight-type ${insight.type}">${insight.type}</span>
                <div class="insight-message">${insight.message}</div>
                <div class="insight-details">${insight.details}</div>
            </div>
        `).join('');
    }

    analyzePerformance(data) {
        if (data.length === 0) return [];
        
        const insights = [];
        const downloads = data.map(d => d.download);
        const uploads = data.map(d => d.upload);
        const pings = data.map(d => d.ping);
        
        const avgDownload = this.average(downloads);
        const avgUpload = this.average(uploads);
        const avgPing = this.average(pings);
        
        // Download speed analysis
        if (avgDownload > 100) {
            insights.push({
                type: 'improvement',
                message: 'Excellent Download Performance',
                details: `Your average download speed of ${avgDownload} Mbps is excellent for most activities including 4K streaming and large file downloads.`
            });
        } else if (avgDownload > 50) {
            insights.push({
                type: 'info',
                message: 'Good Download Performance',
                details: `Your average download speed of ${avgDownload} Mbps is suitable for HD streaming and moderate file downloads.`
            });
        } else if (avgDownload > 25) {
            insights.push({
                type: 'warning',
                message: 'Moderate Download Performance',
                details: `Your average download speed of ${avgDownload} Mbps may limit some activities. Consider upgrading for better performance.`
            });
        } else {
            insights.push({
                type: 'critical',
                message: 'Slow Download Performance',
                details: `Your average download speed of ${avgDownload} Mbps is below recommended levels. Contact your ISP or consider upgrading your plan.`
            });
        }
        
        // Upload speed analysis
        if (avgUpload > 20) {
            insights.push({
                type: 'improvement',
                message: 'Great Upload Performance',
                details: `Upload speed of ${avgUpload} Mbps is excellent for video calls, file sharing, and content creation.`
            });
        } else if (avgUpload > 10) {
            insights.push({
                type: 'info',
                message: 'Adequate Upload Performance',
                details: `Upload speed of ${avgUpload} Mbps is sufficient for most activities but may be limiting for heavy file uploads.`
            });
        } else {
            insights.push({
                type: 'warning',
                message: 'Limited Upload Performance',
                details: `Upload speed of ${avgUpload} Mbps may affect video calls and file sharing. Consider upgrading for better performance.`
            });
        }
        
        // Ping analysis
        if (avgPing < 20) {
            insights.push({
                type: 'improvement',
                message: 'Excellent Latency',
                details: `Average ping of ${avgPing}ms is excellent for gaming and real-time applications.`
            });
        } else if (avgPing < 50) {
            insights.push({
                type: 'info',
                message: 'Good Latency',
                details: `Average ping of ${avgPing}ms is good for most online activities.`
            });
        } else if (avgPing < 100) {
            insights.push({
                type: 'warning',
                message: 'High Latency Detected',
                details: `Average ping of ${avgPing}ms may affect gaming and real-time applications.`
            });
        } else {
            insights.push({
                type: 'critical',
                message: 'Very High Latency',
                details: `Average ping of ${avgPing}ms indicates potential network issues. Contact your ISP for assistance.`
            });
        }
        
        // Consistency analysis
        const downloadVariance = this.calculateVariance(downloads);
        if (downloadVariance > 1000) {
            insights.push({
                type: 'warning',
                message: 'Inconsistent Performance',
                details: 'Your connection speed varies significantly. This may indicate network congestion or equipment issues.'
            });
        }
        
        return insights;
    }

    calculateVariance(arr) {
        const mean = this.average(arr);
        const variance = arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / arr.length;
        return variance;
    }

    animateValue(element, value, unit) {
        const start = 0;
        const end = value;
        const duration = 1000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            const currentValue = start + (end - start) * easeProgress;
            element.textContent = `${Math.round(currentValue * 100) / 100}${unit}`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    animateStatCards() {
        const cards = document.querySelectorAll('.stat-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('animate-in');
        });
    }

    exportData(format) {
        const data = this.getFilteredData();
        const filename = `network-speed-data-${new Date().toISOString().split('T')[0]}`;
        
        switch (format) {
            case 'csv':
                this.exportCSV(data, filename);
                break;
            case 'json':
                this.exportJSON(data, filename);
                break;
            case 'pdf':
                this.exportPDF(data, filename);
                break;
        }
        
        // Show success notification
        this.showNotification(`Data exported as ${format.toUpperCase()}`, 'success');
    }

    exportCSV(data, filename) {
        const headers = ['Date', 'Download (Mbps)', 'Upload (Mbps)', 'Ping (ms)', 'Jitter (ms)'];
        const csvContent = [
            headers.join(','),
            ...data.map(row => [
                new Date(row.date).toLocaleString(),
                row.download,
                row.upload,
                row.ping,
                row.jitter
            ].join(','))
        ].join('\n');
        
        this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
    }

    exportJSON(data, filename) {
        const jsonContent = JSON.stringify(data, null, 2);
        this.downloadFile(jsonContent, `${filename}.json`, 'application/json');
    }

    exportPDF(data, filename) {
        // This would typically use a library like jsPDF
        // For demo purposes, we'll create a simple text-based PDF alternative
        const stats = this.calculateStatistics();
        const content = `
Network Speed Test Report
Generated: ${new Date().toLocaleString()}

Statistics:
- Average Download: ${stats.avgDownload?.value || 'N/A'} Mbps
- Average Upload: ${stats.avgUpload?.value || 'N/A'} Mbps
- Average Ping: ${stats.avgPing?.value || 'N/A'} ms
- Total Tests: ${stats.totalTests?.value || 'N/A'}

Test History:
${data.map(d => `${new Date(d.date).toLocaleString()}: Down=${d.download} Up=${d.upload} Ping=${d.ping}`).join('\n')}
        `;
        
        this.downloadFile(content, `${filename}.txt`, 'text/plain');
        this.showNotification('PDF export feature coming soon! Text report downloaded instead.', 'info');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    updateAnalytics() {
        this.updateStatistics();
        this.updateChart();
        this.generateInsights();
    }
}

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Chart !== 'undefined') {
        window.analyticsManager = new AnalyticsManager();
    } else {
        console.warn('Chart.js not loaded. Analytics features may not work properly.');
    }
});

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification button {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification button:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(notificationStyles);
