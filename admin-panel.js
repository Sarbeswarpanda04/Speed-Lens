// ========== SPEED LENS ADMIN PANEL JAVASCRIPT ==========
// Advanced admin functionality with modern ES6+ features

class AdminPanel {
    constructor() {
        this.currentPage = 'dashboard';
        this.users = [];
        this.tests = [];
        this.notifications = [];
        this.charts = {};
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.generateDemoData();
        await this.loadPage('dashboard');
        this.initializeCharts();
        this.startRealTimeUpdates();
        this.setupWebSocketConnection();
    }

    // ========== EVENT LISTENERS ==========
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                this.navigateToPage(page);
            });
        });

        // User menu dropdown
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');
        
        userMenuBtn?.addEventListener('click', () => {
            userDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userMenuBtn?.contains(e.target)) {
                userDropdown?.classList.remove('show');
            }
        });

        // Notifications panel
        const notificationsBtn = document.getElementById('notificationsBtn');
        const notificationPanel = document.getElementById('notificationPanel');
        
        notificationsBtn?.addEventListener('click', () => {
            notificationPanel.classList.toggle('show');
        });

        // Global search
        const globalSearch = document.getElementById('globalSearch');
        globalSearch?.addEventListener('input', (e) => {
            this.handleGlobalSearch(e.target.value);
        });

        // Modal controls
        this.setupModalListeners();
        
        // Page-specific listeners
        this.setupDashboardListeners();
        this.setupUserManagementListeners();
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    setupModalListeners() {
        const modalOverlay = document.getElementById('modalOverlay');
        const closeButtons = document.querySelectorAll('.modal-close, [id$="Cancel"]');
        
        modalOverlay?.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.closeAllModals();
            }
        });

        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // User modal specific
        const addUserBtn = document.getElementById('addUser');
        const saveUserBtn = document.getElementById('saveUser');
        
        addUserBtn?.addEventListener('click', () => {
            this.openUserModal();
        });
        
        saveUserBtn?.addEventListener('click', () => {
            this.saveUser();
        });
    }

    setupDashboardListeners() {
        const refreshBtn = document.getElementById('refreshDashboard');
        const exportBtn = document.getElementById('exportDashboard');
        const usageTimeframe = document.getElementById('usageTimeframe');
        
        refreshBtn?.addEventListener('click', () => {
            this.refreshDashboard();
        });
        
        exportBtn?.addEventListener('click', () => {
            this.exportDashboardReport();
        });
        
        usageTimeframe?.addEventListener('change', (e) => {
            this.updateUsageChart(e.target.value);
        });
    }

    setupUserManagementListeners() {
        const userSearch = document.getElementById('userSearch');
        const userStatusFilter = document.getElementById('userStatusFilter');
        const userRoleFilter = document.getElementById('userRoleFilter');
        const selectAllUsers = document.getElementById('selectAllUsers');
        const exportUsers = document.getElementById('exportUsers');
        
        userSearch?.addEventListener('input', (e) => {
            this.filterUsers();
        });
        
        userStatusFilter?.addEventListener('change', () => {
            this.filterUsers();
        });
        
        userRoleFilter?.addEventListener('change', () => {
            this.filterUsers();
        });
        
        selectAllUsers?.addEventListener('change', (e) => {
            this.toggleAllUsers(e.target.checked);
        });
        
        exportUsers?.addEventListener('click', () => {
            this.exportUsers();
        });
    }

    // ========== NAVIGATION ==========
    async navigateToPage(page) {
        if (this.currentPage === page) return;
        
        this.showLoading();
        
        // Update active nav item
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
        
        // Hide current page
        document.querySelectorAll('.admin-page').forEach(pageEl => {
            pageEl.classList.remove('active');
        });
        
        // Load and show new page
        await this.loadPage(page);
        
        this.currentPage = page;
        this.hideLoading();
        
        // Update URL without page reload
        history.pushState({ page }, '', `#${page}`);
    }

    async loadPage(page) {
        const pageElement = document.getElementById(`${page}-page`);
        
        if (!pageElement) {
            await this.createPage(page);
        }
        
        // Show page
        const targetPage = document.getElementById(`${page}-page`);
        targetPage?.classList.add('active');
        
        // Load page-specific data
        await this.loadPageData(page);
    }

    async createPage(page) {
        const main = document.getElementById('adminMain');
        let pageHTML = '';
        
        switch (page) {
            case 'tests':
                pageHTML = this.generateTestsPageHTML();
                break;
            case 'analytics':
                pageHTML = this.generateAnalyticsPageHTML();
                break;
            case 'servers':
                pageHTML = this.generateServersPageHTML();
                break;
            case 'monitoring':
                pageHTML = this.generateMonitoringPageHTML();
                break;
            case 'logs':
                pageHTML = this.generateLogsPageHTML();
                break;
            case 'backup':
                pageHTML = this.generateBackupPageHTML();
                break;
            case 'settings':
                pageHTML = this.generateSettingsPageHTML();
                break;
            case 'api':
                pageHTML = this.generateApiPageHTML();
                break;
            case 'maintenance':
                pageHTML = this.generateMaintenancePageHTML();
                break;
            default:
                pageHTML = '<div class="admin-page"><h1>Page Not Found</h1></div>';
        }
        
        main.insertAdjacentHTML('beforeend', pageHTML);
    }

    async loadPageData(page) {
        switch (page) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'users':
                await this.loadUsersData();
                break;
            case 'tests':
                await this.loadTestsData();
                break;
            case 'analytics':
                await this.loadAnalyticsData();
                break;
            case 'servers':
                await this.loadServersData();
                break;
            case 'monitoring':
                await this.loadMonitoringData();
                break;
            case 'logs':
                await this.loadLogsData();
                break;
            case 'backup':
                await this.loadBackupData();
                break;
            case 'settings':
                await this.loadSettingsData();
                break;
            case 'api':
                await this.loadApiData();
                break;
            case 'maintenance':
                await this.loadMaintenanceData();
                break;
        }
    }

    // ========== DATA GENERATION ==========
    generateDemoData() {
        this.generateDemoUsers();
        this.generateDemoTests();
        this.generateDemoNotifications();
        this.generateDemoMetrics();
    }

    generateDemoUsers() {
        const names = [
            'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson',
            'David Brown', 'Emily Davis', 'Chris Miller', 'Amanda Garcia',
            'James Rodriguez', 'Lisa Anderson', 'Robert Taylor', 'Michelle White'
        ];
        
        const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'company.com'];
        const roles = ['user', 'premium', 'admin'];
        const statuses = ['active', 'inactive', 'suspended'];
        
        this.users = [];
        
        for (let i = 0; i < 156; i++) {
            const name = names[Math.floor(Math.random() * names.length)];
            const email = `${name.toLowerCase().replace(' ', '.')}${i}@${domains[Math.floor(Math.random() * domains.length)]}`;
            
            this.users.push({
                id: i + 1,
                name: name,
                email: email,
                role: roles[Math.floor(Math.random() * roles.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                tests: Math.floor(Math.random() * 50) + 1,
                lastActive: this.generateRandomDate(30),
                avatar: this.generateAvatar(name),
                joinDate: this.generateRandomDate(365),
                notes: ''
            });
        }
    }

    generateDemoTests() {
        this.tests = [];
        
        for (let i = 0; i < 2400; i++) {
            this.tests.push({
                id: i + 1,
                userId: Math.floor(Math.random() * 156) + 1,
                timestamp: this.generateRandomDate(90),
                downloadSpeed: (Math.random() * 200 + 10).toFixed(2),
                uploadSpeed: (Math.random() * 50 + 5).toFixed(2),
                ping: (Math.random() * 80 + 10).toFixed(1),
                jitter: (Math.random() * 10 + 1).toFixed(1),
                location: this.generateRandomLocation(),
                server: this.generateRandomServer(),
                userAgent: this.generateRandomUserAgent(),
                ip: this.generateRandomIP()
            });
        }
    }

    generateDemoNotifications() {
        this.notifications = [
            {
                id: 1,
                type: 'warning',
                title: 'High Memory Usage Alert',
                message: 'Server memory usage has exceeded 85% threshold',
                timestamp: new Date(Date.now() - 5 * 60 * 1000),
                read: false
            },
            {
                id: 2,
                type: 'success',
                title: 'Backup Completed',
                message: 'Daily database backup completed successfully',
                timestamp: new Date(Date.now() - 60 * 60 * 1000),
                read: false
            },
            {
                id: 3,
                type: 'info',
                title: 'System Update Available',
                message: 'A new version of Speed Lens is available for update',
                timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
                read: true
            }
        ];
    }

    generateDemoMetrics() {
        this.metrics = {
            totalUsers: 1247,
            totalTests: 24891,
            avgSpeed: 87.3,
            serverUptime: 99.8,
            avgPing: 23.7,
            activeRegions: 127
        };
    }

    // ========== DASHBOARD FUNCTIONS ==========
    async loadDashboardData() {
        this.updateMetricCards();
        this.updateGeographicData();
        this.updateActivityTimeline();
        this.updateSystemAlerts();
        this.updatePerformanceMetrics();
        this.updateActiveUsersMetrics();
        this.updateRecentTestUsers();
    // ========== ENHANCED DASHBOARD METRICS ==========
    updateActiveUsersMetrics() {
        // Calculate active users today
        const today = new Date();
        const usersToday = this.users.filter(u => {
            const lastActive = new Date(u.lastActive);
            return lastActive.toDateString() === today.toDateString();
        });
        const testUsers = this.users.filter(u => u.tests > 0);
        const newUsersWeek = this.users.filter(u => {
            const joinDate = new Date(u.joinDate);
            const daysAgo = (today - joinDate) / (1000 * 60 * 60 * 24);
            return daysAgo <= 7;
        });

        this.animateValue(document.getElementById('activeUsersToday'), usersToday.length);
        this.animateValue(document.getElementById('testUsersCount'), testUsers.length);
        this.animateValue(document.getElementById('newUsersThisWeek'), newUsersWeek.length);
    };

    updateRecentTestUsers() {
        // Get last 8 users who performed a test
        const recentTests = this.tests
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 8);
        const recentUserIds = [...new Set(recentTests.map(t => t.userId))];
        const recentUsers = recentUserIds.map(id => this.users.find(u => u.id === id)).filter(Boolean);

        const container = document.getElementById('recentTestUsersList');
        if (!container) return;
        container.innerHTML = recentUsers.map(user => `
            <div class="recent-user-card">
                <img src="${user.avatar}" alt="${user.name}" class="recent-user-avatar">
                <div class="recent-user-info">
                    <div class="recent-user-name">${user.name}</div>
                    <div class="recent-user-email">${user.email}</div>
                    <div class="recent-user-lasttest">Last Test: ${this.formatTimeAgo(user.lastActive)}</div>
                </div>
            </div>
        `).join('');
    };
    }

    updateMetricCards() {
        const metrics = [
            { id: 'totalUsers', value: this.metrics.totalUsers, format: 'number' },
            { id: 'totalTests', value: this.metrics.totalTests, format: 'number' },
            { id: 'avgSpeed', value: this.metrics.avgSpeed, format: 'decimal', unit: ' Mbps' },
            { id: 'serverUptime', value: this.metrics.serverUptime, format: 'decimal', unit: '%' },
            { id: 'avgPing', value: this.metrics.avgPing, format: 'decimal', unit: ' ms' },
            { id: 'activeRegions', value: this.metrics.activeRegions, format: 'number' }
        ];
        
        metrics.forEach(metric => {
            const element = document.getElementById(metric.id);
            if (element) {
                let formattedValue = metric.value;
                
                if (metric.format === 'number') {
                    formattedValue = this.formatNumber(metric.value);
                } else if (metric.format === 'decimal') {
                    formattedValue = metric.value.toFixed(1);
                }
                
                this.animateValue(element, formattedValue + (metric.unit || ''));
            }
        });
    }

    updateGeographicData() {
        // Geographic data is already in HTML, but we could update it dynamically here
        const geoItems = document.querySelectorAll('.geo-item .bar-fill');
        geoItems.forEach((bar, index) => {
            const width = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = width;
            }, index * 100);
        });
    }

    updateActivityTimeline() {
        // Activity timeline data would be updated here
        // This is placeholder for real-time activity updates
    }

    updateSystemAlerts() {
        const alertList = document.querySelector('.alert-list');
        if (!alertList) return;
        
        // Update alert counts and add new alerts dynamically
        const alertCount = document.querySelector('.alert-count');
        if (alertCount) {
            alertCount.textContent = `${this.notifications.filter(n => !n.read).length} active`;
        }
    }

    updatePerformanceMetrics() {
        const perfGauges = document.querySelectorAll('.perf-gauge');
        perfGauges.forEach(gauge => {
            const value = parseInt(gauge.dataset.value);
            const circle = gauge.querySelector('circle:last-child');
            const valueEl = gauge.querySelector('.perf-value');
            
            if (circle && valueEl) {
                const circumference = 2 * Math.PI * 50; // radius = 50
                const offset = circumference - (value / 100) * circumference;
                
                circle.style.strokeDasharray = circumference;
                circle.style.strokeDashoffset = circumference;
                
                setTimeout(() => {
                    circle.style.strokeDashoffset = offset;
                }, 500);
            }
        });
    }

    refreshDashboard() {
        this.showLoading();
        
        // Simulate API call
        setTimeout(() => {
            this.loadDashboardData();
            this.hideLoading();
            this.showNotification('Dashboard refreshed successfully', 'success');
        }, 1000);
    }

    // ========== USER MANAGEMENT ==========
    async loadUsersData() {
        this.renderUsersTable();
    }

    renderUsersTable() {
        const tbody = document.querySelector('#usersTable tbody');
        if (!tbody) return;
        
        const filteredUsers = this.getFilteredUsers();
        
        tbody.innerHTML = filteredUsers.slice(0, 20).map(user => `
            <tr>
                <td>
                    <input type="checkbox" class="user-checkbox" data-user-id="${user.id}">
                </td>
                <td>
                    <div class="d-flex align-center gap-md">
                        <img src="${user.avatar}" alt="${user.name}" width="32" height="32" style="border-radius: 50%;">
                        <div>
                            <div style="font-weight: 600;">${user.name}</div>
                            <div class="text-muted" style="font-size: 0.85rem;">ID: ${user.id}</div>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="badge ${this.getRoleBadgeClass(user.role)}">${user.role}</span>
                </td>
                <td>
                    <span class="badge ${this.getStatusBadgeClass(user.status)}">${user.status}</span>
                </td>
                <td>${user.tests}</td>
                <td>${this.formatTimeAgo(user.lastActive)}</td>
                <td>
                    <div class="d-flex gap-sm">
                        <button class="btn-icon" onclick="adminPanel.editUser(${user.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="adminPanel.viewUser(${user.id})" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="adminPanel.deleteUser(${user.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getFilteredUsers() {
        let filtered = [...this.users];
        
        const searchTerm = document.getElementById('userSearch')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('userStatusFilter')?.value || '';
        const roleFilter = document.getElementById('userRoleFilter')?.value || '';
        
        if (searchTerm) {
            filtered = filtered.filter(user => 
                user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                user.id.toString().includes(searchTerm)
            );
        }
        
        if (statusFilter) {
            filtered = filtered.filter(user => user.status === statusFilter);
        }
        
        if (roleFilter) {
            filtered = filtered.filter(user => user.role === roleFilter);
        }
        
        return filtered;
    }

    filterUsers() {
        this.renderUsersTable();
    }

    openUserModal(userId = null) {
        const modal = document.getElementById('userModal');
        const overlay = document.getElementById('modalOverlay');
        const title = document.getElementById('userModalTitle');
        
        if (userId) {
            const user = this.users.find(u => u.id === userId);
            if (user) {
                title.textContent = 'Edit User';
                this.populateUserForm(user);
            }
        } else {
            title.textContent = 'Add New User';
            this.clearUserForm();
        }
        
        overlay.classList.add('show');
        modal.style.display = 'block';
    }

    populateUserForm(user) {
        document.getElementById('userName').value = user.name;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userRole').value = user.role;
        document.getElementById('userStatus').value = user.status;
        document.getElementById('userNotes').value = user.notes || '';
    }

    clearUserForm() {
        document.getElementById('userName').value = '';
        document.getElementById('userEmail').value = '';
        document.getElementById('userRole').value = 'user';
        document.getElementById('userStatus').value = 'active';
        document.getElementById('userNotes').value = '';
    }

    saveUser() {
        const formData = {
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            role: document.getElementById('userRole').value,
            status: document.getElementById('userStatus').value,
            notes: document.getElementById('userNotes').value
        };
        
        // Validate form
        if (!formData.name || !formData.email) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Add or update user
        const existingUserIndex = this.users.findIndex(u => u.email === formData.email);
        
        if (existingUserIndex >= 0) {
            // Update existing user
            this.users[existingUserIndex] = { ...this.users[existingUserIndex], ...formData };
            this.showNotification('User updated successfully', 'success');
        } else {
            // Add new user
            const newUser = {
                ...formData,
                id: this.users.length + 1,
                tests: 0,
                lastActive: new Date(),
                avatar: this.generateAvatar(formData.name),
                joinDate: new Date()
            };
            
            this.users.push(newUser);
            this.showNotification('User added successfully', 'success');
        }
        
        this.closeAllModals();
        this.renderUsersTable();
    }

    editUser(userId) {
        this.openUserModal(userId);
    }

    viewUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            // Open user details modal or navigate to user detail page
            this.showNotification(`Viewing user: ${user.name}`, 'info');
        }
    }

    deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            this.users = this.users.filter(u => u.id !== userId);
            this.renderUsersTable();
            this.showNotification('User deleted successfully', 'success');
        }
    }

    toggleAllUsers(checked) {
        document.querySelectorAll('.user-checkbox').forEach(checkbox => {
            checkbox.checked = checked;
        });
    }

    exportUsers() {
        const selectedUsers = this.getSelectedUsers();
        const dataToExport = selectedUsers.length > 0 ? selectedUsers : this.getFilteredUsers();
        
        const csv = this.convertToCSV(dataToExport, ['id', 'name', 'email', 'role', 'status', 'tests', 'lastActive']);
        this.downloadFile(csv, 'users-export.csv', 'text/csv');
        
        this.showNotification(`Exported ${dataToExport.length} users`, 'success');
    }

    getSelectedUsers() {
        const selectedIds = Array.from(document.querySelectorAll('.user-checkbox:checked'))
            .map(cb => parseInt(cb.dataset.userId));
        
        return this.users.filter(u => selectedIds.includes(u.id));
    }

    // ========== CHARTS ==========
    initializeCharts() {
        this.initUsageChart();
    }

    initUsageChart() {
        const ctx = document.getElementById('usageChart');
        if (!ctx) return;
        
        const data = this.generateUsageChartData('30d');
        
        this.charts.usage = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Speed Tests',
                        data: data.tests,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'New Users',
                        data: data.users,
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    generateUsageChartData(timeframe) {
        const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
        const labels = [];
        const tests = [];
        const users = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            tests.push(Math.floor(Math.random() * 100) + 50);
            users.push(Math.floor(Math.random() * 20) + 5);
        }
        
        return { labels, tests, users };
    }

    updateUsageChart(timeframe) {
        if (!this.charts.usage) return;
        
        const data = this.generateUsageChartData(timeframe);
        
        this.charts.usage.data.labels = data.labels;
        this.charts.usage.data.datasets[0].data = data.tests;
        this.charts.usage.data.datasets[1].data = data.users;
        this.charts.usage.update();
    }

    // ========== UTILITY FUNCTIONS ==========
    showLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay?.classList.add('show');
        this.isLoading = true;
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay?.classList.remove('show');
        this.isLoading = false;
    }

    closeAllModals() {
        const modalOverlay = document.getElementById('modalOverlay');
        const modals = document.querySelectorAll('.modal');
        
        modalOverlay?.classList.remove('show');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add styles for notifications
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 20px',
            borderRadius: '8px',
            background: type === 'success' ? '#4CAF50' : 
                       type === 'error' ? '#f44336' : 
                       type === 'warning' ? '#FF9800' : '#2196F3',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '400px',
            animation: 'slideInRight 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    }

    formatTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return new Date(date).toLocaleDateString();
    }

    animateValue(element, targetValue) {
        const duration = 1000;
        const startTime = performance.now();
        const startValue = 0;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            if (typeof targetValue === 'string' && targetValue.includes('.')) {
                const numericPart = parseFloat(targetValue);
                const suffix = targetValue.replace(numericPart.toString(), '');
                const currentValue = (startValue + (numericPart - startValue) * progress).toFixed(1);
                element.textContent = currentValue + suffix;
            } else if (typeof targetValue === 'string') {
                const numericPart = parseInt(targetValue.replace(/[^0-9]/g, ''));
                const suffix = targetValue.replace(numericPart.toString(), '');
                const currentValue = Math.floor(startValue + (numericPart - startValue) * progress);
                element.textContent = this.formatNumber(currentValue) + suffix;
            } else {
                const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
                element.textContent = this.formatNumber(currentValue);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    generateRandomDate(daysBack) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
        return date;
    }

    generateAvatar(name) {
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        const colors = ['#667eea', '#764ba2', '#4CAF50', '#FF9800', '#2196F3', '#9C27B0'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        return `data:image/svg+xml;base64,${btoa(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" fill="${color}" rx="20"/>
                <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" 
                      fill="white" font-family="Arial" font-size="16" font-weight="600">
                    ${initials}
                </text>
            </svg>
        `)}`;
    }

    generateRandomLocation() {
        const locations = [
            'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
            'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA',
            'Dallas, TX', 'San Jose, CA', 'Austin, TX', 'Jacksonville, FL'
        ];
        return locations[Math.floor(Math.random() * locations.length)];
    }

    generateRandomServer() {
        const servers = [
            'Server East-1', 'Server West-1', 'Server Central-1', 'Server EU-1',
            'Server Asia-1', 'Server South-1'
        ];
        return servers[Math.floor(Math.random() * servers.length)];
    }

    generateRandomUserAgent() {
        const agents = [
            'Chrome/91.0.4472.124', 'Firefox/89.0', 'Safari/14.1.1',
            'Edge/91.0.864.59', 'Opera/77.0.4054.172'
        ];
        return agents[Math.floor(Math.random() * agents.length)];
    }

    generateRandomIP() {
        return Array.from({length: 4}, () => Math.floor(Math.random() * 256)).join('.');
    }

    getRoleBadgeClass(role) {
        const classes = {
            admin: 'badge-danger',
            premium: 'badge-warning',
            user: 'badge-info'
        };
        return classes[role] || 'badge-secondary';
    }

    getStatusBadgeClass(status) {
        const classes = {
            active: 'badge-success',
            inactive: 'badge-secondary',
            suspended: 'badge-danger'
        };
        return classes[status] || 'badge-secondary';
    }

    convertToCSV(data, fields) {
        const header = fields.join(',');
        const rows = data.map(item => 
            fields.map(field => {
                let value = item[field];
                if (value instanceof Date) {
                    value = value.toISOString();
                }
                return `"${value || ''}"`;
            }).join(',')
        );
        
        return [header, ...rows].join('\n');
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

    handleGlobalSearch(query) {
        if (query.length < 2) return;
        
        // Implement global search logic
        console.log('Searching for:', query);
    }

    handleKeyboardShortcuts(e) {
        // Ctrl+K for search
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            document.getElementById('globalSearch')?.focus();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            this.closeAllModals();
        }
    }

    handleResize() {
        // Handle responsive behavior
        if (this.charts.usage) {
            this.charts.usage.resize();
        }
    }

    startRealTimeUpdates() {
        // Start periodic updates every 30 seconds
        setInterval(() => {
            if (this.currentPage === 'dashboard') {
                this.updateMetricCards();
            }
        }, 30000);
    }

    setupWebSocketConnection() {
        // Placeholder for WebSocket connection
        // In a real application, this would connect to a WebSocket server
        // for real-time updates
        console.log('WebSocket connection would be established here');
    }

    exportDashboardReport() {
        const reportData = {
            generatedAt: new Date().toISOString(),
            metrics: this.metrics,
            users: this.users.length,
            tests: this.tests.length,
            notifications: this.notifications.length
        };
        
        const json = JSON.stringify(reportData, null, 2);
        this.downloadFile(json, `dashboard-report-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
        this.showNotification('Dashboard report exported successfully', 'success');
    }

    // ========== PAGE GENERATORS ==========
    generateTestsPageHTML() {
        return `
            <div class="admin-page" id="tests-page">
                <div class="page-header">
                    <div class="page-title">
                        <h1><i class="fas fa-flask"></i> Speed Tests Management</h1>
                        <p>Monitor and analyze all speed tests performed on the platform</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-secondary" onclick="adminPanel.exportTests()">
                            <i class="fas fa-file-export"></i> Export Tests
                        </button>
                        <button class="btn btn-primary" onclick="adminPanel.generateTestReport()">
                            <i class="fas fa-chart-line"></i> Generate Report
                        </button>
                        <button class="btn btn-danger" onclick="adminPanel.clearOldTests()">
                            <i class="fas fa-trash-alt"></i> Clear Old Tests
                        </button>
                    </div>
                </div>
                
                <div class="filters-bar">
                    <div class="filter-group">
                        <label>Search Tests:</label>
                        <div class="search-input">
                            <i class="fas fa-search"></i>
                            <input type="text" id="testSearch" placeholder="Search by user, location, or ID..." oninput="adminPanel.filterTests()">
                        </div>
                    </div>
                    
                    <div class="filter-group">
                        <label>Date Range:</label>
                        <select id="testDateFilter" onchange="adminPanel.filterTests()">
                            <option value="">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="3months">Last 3 Months</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>Speed Range:</label>
                        <select id="testSpeedFilter" onchange="adminPanel.filterTests()">
                            <option value="">All Speeds</option>
                            <option value="slow">0-25 Mbps</option>
                            <option value="medium">25-100 Mbps</option>
                            <option value="fast">100+ Mbps</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>Results per page:</label>
                        <select id="testsPerPage" onchange="adminPanel.changeTestsPerPage()">
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                </div>
                
                <div class="stats-bar">
                    <div class="stat-item">
                        <span class="stat-label">Total Tests:</span>
                        <span class="stat-value" id="totalTestsCount">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Avg Download:</span>
                        <span class="stat-value" id="avgDownloadSpeed">0 Mbps</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Avg Upload:</span>
                        <span class="stat-value" id="avgUploadSpeed">0 Mbps</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Avg Ping:</span>
                        <span class="stat-value" id="avgPingTime">0 ms</span>
                    </div>
                </div>
                
                <div class="data-table-container">
                    <table class="data-table" id="testsTable">
                        <thead>
                            <tr>
                                <th><input type="checkbox" id="selectAllTests" onchange="adminPanel.toggleAllTests(this.checked)"></th>
                                <th>Test ID <i class="fas fa-sort" onclick="adminPanel.sortTests('id')"></i></th>
                                <th>User <i class="fas fa-sort" onclick="adminPanel.sortTests('user')"></i></th>
                                <th>Download <i class="fas fa-sort" onclick="adminPanel.sortTests('download')"></i></th>
                                <th>Upload <i class="fas fa-sort" onclick="adminPanel.sortTests('upload')"></i></th>
                                <th>Ping <i class="fas fa-sort" onclick="adminPanel.sortTests('ping')"></i></th>
                                <th>Location <i class="fas fa-sort" onclick="adminPanel.sortTests('location')"></i></th>
                                <th>Date <i class="fas fa-sort" onclick="adminPanel.sortTests('date')"></i></th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="9" style="text-align: center; padding: 40px;">
                                    <i class="fas fa-spinner fa-spin"></i> Loading test data...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="pagination" id="testsPagination">
                    <div class="pagination-info">
                        <span id="testsPageInfo">Showing 0-0 of 0 tests</span>
                        <button class="btn btn-sm btn-secondary" onclick="adminPanel.bulkDeleteTests()">
                            <i class="fas fa-trash"></i> Delete Selected
                        </button>
                    </div>
                    <div class="pagination-controls" id="testsPageControls">
                        <!-- Pagination will be generated dynamically -->
                    </div>
                </div>
            </div>
        `;
    }

    generateAnalyticsPageHTML() {
        return `
            <div class="admin-page" id="analytics-page">
                <div class="page-header">
                    <div class="page-title">
                        <h1><i class="fas fa-chart-line"></i> Advanced Analytics</h1>
                        <p>Deep insights into platform usage and performance metrics</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-secondary" onclick="adminPanel.configureAnalytics()">
                            <i class="fas fa-cog"></i> Configure
                        </button>
                        <button class="btn btn-primary" onclick="adminPanel.exportAnalyticsReport()">
                            <i class="fas fa-download"></i> Export Report
                        </button>
                        <button class="btn btn-info" onclick="adminPanel.scheduleReport()">
                            <i class="fas fa-calendar"></i> Schedule Report
                        </button>
                    </div>
                </div>
                
                <div class="analytics-controls">
                    <div class="control-group">
                        <label>Time Period:</label>
                        <select id="analyticsTimePeriod" onchange="adminPanel.updateAnalytics()">
                            <option value="7d">Last 7 Days</option>
                            <option value="30d" selected>Last 30 Days</option>
                            <option value="90d">Last 90 Days</option>
                            <option value="1y">Last Year</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Region Filter:</label>
                        <select id="analyticsRegion" onchange="adminPanel.updateAnalytics()">
                            <option value="">All Regions</option>
                            <option value="north-america">North America</option>
                            <option value="europe">Europe</option>
                            <option value="asia">Asia</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>User Type:</label>
                        <select id="analyticsUserType" onchange="adminPanel.updateAnalytics()">
                            <option value="">All Users</option>
                            <option value="free">Free Users</option>
                            <option value="premium">Premium Users</option>
                            <option value="admin">Admin Users</option>
                        </select>
                    </div>
                </div>
                
                <div class="analytics-summary">
                    <div class="summary-card">
                        <div class="summary-icon">
                            <i class="fas fa-chart-bar"></i>
                        </div>
                        <div class="summary-content">
                            <div class="summary-value" id="totalAnalyticsTests">0</div>
                            <div class="summary-label">Total Tests</div>
                            <div class="summary-change positive" id="testsChange">+0%</div>
                        </div>
                    </div>
                    
                    <div class="summary-card">
                        <div class="summary-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="summary-content">
                            <div class="summary-value" id="activeUsers">0</div>
                            <div class="summary-label">Active Users</div>
                            <div class="summary-change positive" id="usersChange">+0%</div>
                        </div>
                    </div>
                    
                    <div class="summary-card">
                        <div class="summary-icon">
                            <i class="fas fa-tachometer-alt"></i>
                        </div>
                        <div class="summary-content">
                            <div class="summary-value" id="avgSpeedAnalytics">0</div>
                            <div class="summary-label">Avg Speed (Mbps)</div>
                            <div class="summary-change positive" id="speedChange">+0%</div>
                        </div>
                    </div>
                    
                    <div class="summary-card">
                        <div class="summary-icon">
                            <i class="fas fa-globe"></i>
                        </div>
                        <div class="summary-content">
                            <div class="summary-value" id="regionsCount">0</div>
                            <div class="summary-label">Active Regions</div>
                            <div class="summary-change positive" id="regionsChange">+0</div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-grid">
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3><i class="fas fa-chart-area"></i> Speed Trends Over Time</h3>
                            <div class="card-actions">
                                <button class="btn-icon" onclick="adminPanel.fullscreenChart('speedTrendsChart')" title="Fullscreen">
                                    <i class="fas fa-expand"></i>
                                </button>
                            </div>
                        </div>
                        <div class="card-content">
                            <canvas id="speedTrendsChart" height="300"></canvas>
                        </div>
                    </div>
                    
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3><i class="fas fa-users"></i> User Growth & Retention</h3>
                            <div class="card-actions">
                                <button class="btn-icon" onclick="adminPanel.fullscreenChart('userGrowthChart')" title="Fullscreen">
                                    <i class="fas fa-expand"></i>
                                </button>
                            </div>
                        </div>
                        <div class="card-content">
                            <canvas id="userGrowthChart" height="300"></canvas>
                        </div>
                    </div>
                    
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3><i class="fas fa-clock"></i> Peak Usage Hours</h3>
                        </div>
                        <div class="card-content">
                            <canvas id="peakUsageChart" height="300"></canvas>
                        </div>
                    </div>
                    
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3><i class="fas fa-pie-chart"></i> Connection Types</h3>
                        </div>
                        <div class="card-content">
                            <canvas id="connectionTypesChart" height="300"></canvas>
                        </div>
                    </div>
                    
                    <div class="dashboard-card full-width">
                        <div class="card-header">
                            <h3><i class="fas fa-globe"></i> Global Performance Map</h3>
                            <div class="card-actions">
                                <button class="btn btn-sm btn-secondary" onclick="adminPanel.exportMapData()">
                                    <i class="fas fa-download"></i> Export Data
                                </button>
                            </div>
                        </div>
                        <div class="card-content">
                            <div class="world-map-container">
                                <div class="world-map-placeholder">
                                    <div class="map-regions">
                                        <div class="region-item">
                                            <div class="region-name">North America</div>
                                            <div class="region-stats">
                                                <span class="region-speed">Avg: 89.3 Mbps</span>
                                                <span class="region-tests">2,847 tests</span>
                                            </div>
                                            <div class="region-bar">
                                                <div class="region-fill" style="width: 85%;"></div>
                                            </div>
                                        </div>
                                        
                                        <div class="region-item">
                                            <div class="region-name">Europe</div>
                                            <div class="region-stats">
                                                <span class="region-speed">Avg: 76.8 Mbps</span>
                                                <span class="region-tests">1,923 tests</span>
                                            </div>
                                            <div class="region-bar">
                                                <div class="region-fill" style="width: 73%;"></div>
                                            </div>
                                        </div>
                                        
                                        <div class="region-item">
                                            <div class="region-name">Asia Pacific</div>
                                            <div class="region-stats">
                                                <span class="region-speed">Avg: 94.2 Mbps</span>
                                                <span class="region-tests">3,156 tests</span>
                                            </div>
                                            <div class="region-bar">
                                                <div class="region-fill" style="width: 90%;"></div>
                                            </div>
                                        </div>
                                        
                                        <div class="region-item">
                                            <div class="region-name">South America</div>
                                            <div class="region-stats">
                                                <span class="region-speed">Avg: 45.7 Mbps</span>
                                                <span class="region-tests">892 tests</span>
                                            </div>
                                            <div class="region-bar">
                                                <div class="region-fill" style="width: 44%;"></div>
                                            </div>
                                        </div>
                                        
                                        <div class="region-item">
                                            <div class="region-name">Africa</div>
                                            <div class="region-stats">
                                                <span class="region-speed">Avg: 32.1 Mbps</span>
                                                <span class="region-tests">423 tests</span>
                                            </div>
                                            <div class="region-bar">
                                                <div class="region-fill" style="width: 31%;"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3><i class="fas fa-mobile-alt"></i> Device Analytics</h3>
                        </div>
                        <div class="card-content">
                            <div class="device-stats">
                                <div class="device-item">
                                    <div class="device-icon">
                                        <i class="fas fa-desktop"></i>
                                    </div>
                                    <div class="device-info">
                                        <div class="device-name">Desktop</div>
                                        <div class="device-percentage">52.3%</div>
                                        <div class="device-count">5,234 tests</div>
                                    </div>
                                </div>
                                
                                <div class="device-item">
                                    <div class="device-icon">
                                        <i class="fas fa-mobile-alt"></i>
                                    </div>
                                    <div class="device-info">
                                        <div class="device-name">Mobile</div>
                                        <div class="device-percentage">34.7%</div>
                                        <div class="device-count">3,468 tests</div>
                                    </div>
                                </div>
                                
                                <div class="device-item">
                                    <div class="device-icon">
                                        <i class="fas fa-tablet-alt"></i>
                                    </div>
                                    <div class="device-info">
                                        <div class="device-name">Tablet</div>
                                        <div class="device-percentage">13.0%</div>
                                        <div class="device-count">1,298 tests</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3><i class="fas fa-exclamation-triangle"></i> Performance Issues</h3>
                        </div>
                        <div class="card-content">
                            <div class="issues-list">
                                <div class="issue-item high">
                                    <div class="issue-severity">HIGH</div>
                                    <div class="issue-description">
                                        <div class="issue-title">Slow Upload Speeds</div>
                                        <div class="issue-details">Detected in 23% of tests in EU region</div>
                                    </div>
                                    <div class="issue-count">1,847</div>
                                </div>
                                
                                <div class="issue-item medium">
                                    <div class="issue-severity">MEDIUM</div>
                                    <div class="issue-description">
                                        <div class="issue-title">High Latency</div>
                                        <div class="issue-details">Average ping >100ms in 15% of tests</div>
                                    </div>
                                    <div class="issue-count">892</div>
                                </div>
                                
                                <div class="issue-item low">
                                    <div class="issue-severity">LOW</div>
                                    <div class="issue-description">
                                        <div class="issue-title">Jitter Spikes</div>
                                        <div class="issue-details">Occasional network instability</div>
                                    </div>
                                    <div class="issue-count">234</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateServersPageHTML() {
        return `
            <div class="admin-page" id="servers-page">
                <div class="page-header">
                    <div class="page-title">
                        <h1><i class="fas fa-server"></i> Server Management</h1>
                        <p>Monitor and manage speed test servers worldwide</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-secondary" onclick="adminPanel.addNewServer()">
                            <i class="fas fa-plus"></i> Add Server
                        </button>
                        <button class="btn btn-info" onclick="adminPanel.serverMaintenance()">
                            <i class="fas fa-tools"></i> Maintenance Mode
                        </button>
                        <button class="btn btn-primary" onclick="adminPanel.refreshAllServers()">
                            <i class="fas fa-sync-alt"></i> Refresh All
                        </button>
                    </div>
                </div>
                
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-icon">
                            <i class="fas fa-server"></i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value" id="totalServers">24</div>
                            <div class="metric-label">Total Servers</div>
                            <div class="metric-trend positive">
                                <i class="fas fa-arrow-up"></i> 2 new this month
                            </div>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value" id="onlineServers">23</div>
                            <div class="metric-label">Online Servers</div>
                            <div class="metric-trend positive">
                                <i class="fas fa-check"></i> <span id="serverUptime">95.8%</span> uptime
                            </div>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon">
                            <i class="fas fa-tachometer-alt"></i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value" id="avgResponseTime">2.3s</div>
                            <div class="metric-label">Avg Response Time</div>
                            <div class="metric-trend positive">
                                <i class="fas fa-arrow-down"></i> 12% faster
                            </div>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value" id="serverAlerts">1</div>
                            <div class="metric-label">Active Alerts</div>
                            <div class="metric-trend negative">
                                <i class="fas fa-exclamation"></i> Needs attention
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="server-filters">
                    <div class="filter-group">
                        <label>Region:</label>
                        <select id="serverRegionFilter" onchange="adminPanel.filterServers()">
                            <option value="">All Regions</option>
                            <option value="us">United States</option>
                            <option value="eu">Europe</option>
                            <option value="asia">Asia</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Status:</label>
                        <select id="serverStatusFilter" onchange="adminPanel.filterServers()">
                            <option value="">All Status</option>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="warning">Warning</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Performance:</label>
                        <select id="serverPerformanceFilter" onchange="adminPanel.filterServers()">
                            <option value="">All Performance</option>
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                        </select>
                    </div>
                </div>
                
                <div class="data-table-container">
                    <table class="data-table" id="serversTable">
                        <thead>
                            <tr>
                                <th>Server</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Response Time</th>
                                <th>Load</th>
                                <th>Capacity</th>
                                <th>Last Check</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div class="d-flex align-center gap-md">
                                        <div class="status-indicator online"></div>
                                        <div>
                                            <div style="font-weight: 600;">Server-US-East-1</div>
                                            <div class="text-muted" style="font-size: 0.85rem;">Primary</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <div>New York, USA</div>
                                        <div class="text-muted" style="font-size: 0.85rem;">40.7128° N, 74.0060° W</div>
                                    </div>
                                </td>
                                <td><span class="badge badge-success">Online</span></td>
                                <td>
                                    <div>
                                        <div style="font-weight: 600;">23ms</div>
                                        <div class="performance-bar excellent">
                                            <div class="performance-fill" style="width: 95%;"></div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <div style="font-weight: 600;">67%</div>
                                        <div class="load-bar">
                                            <div class="load-fill" style="width: 67%; background: #4CAF50;"></div>
                                        </div>
                                    </div>
                                </td>
                                <td>1000 concurrent</td>
                                <td>2 min ago</td>
                                <td>
                                    <div class="d-flex gap-sm">
                                        <button class="btn-icon" title="Monitor" onclick="adminPanel.monitorServer('us-east-1')">
                                            <i class="fas fa-chart-line"></i>
                                        </button>
                                        <button class="btn-icon" title="Configure" onclick="adminPanel.configureServer('us-east-1')">
                                            <i class="fas fa-cog"></i>
                                        </button>
                                        <button class="btn-icon" title="Restart" onclick="adminPanel.restartServer('us-east-1')">
                                            <i class="fas fa-redo"></i>
                                        </button>
                                        <button class="btn-icon" title="Logs" onclick="adminPanel.viewServerLogs('us-east-1')">
                                            <i class="fas fa-file-alt"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div class="d-flex align-center gap-md">
                                        <div class="status-indicator online"></div>
                                        <div>
                                            <div style="font-weight: 600;">Server-EU-West-1</div>
                                            <div class="text-muted" style="font-size: 0.85rem;">Secondary</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <div>London, UK</div>
                                        <div class="text-muted" style="font-size: 0.85rem;">51.5074° N, 0.1278° W</div>
                                    </div>
                                </td>
                                <td><span class="badge badge-success">Online</span></td>
                                <td>
                                    <div>
                                        <div style="font-weight: 600;">31ms</div>
                                        <div class="performance-bar good">
                                            <div class="performance-fill" style="width: 87%;"></div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <div style="font-weight: 600;">84%</div>
                                        <div class="load-bar">
                                            <div class="load-fill" style="width: 84%; background: #FF9800;"></div>
                                        </div>
                                    </div>
                                </td>
                                <td>800 concurrent</td>
                                <td>1 min ago</td>
                                <td>
                                    <div class="d-flex gap-sm">
                                        <button class="btn-icon" title="Monitor" onclick="adminPanel.monitorServer('eu-west-1')">
                                            <i class="fas fa-chart-line"></i>
                                        </button>
                                        <button class="btn-icon" title="Configure" onclick="adminPanel.configureServer('eu-west-1')">
                                            <i class="fas fa-cog"></i>
                                        </button>
                                        <button class="btn-icon" title="Restart" onclick="adminPanel.restartServer('eu-west-1')">
                                            <i class="fas fa-redo"></i>
                                        </button>
                                        <button class="btn-icon" title="Logs" onclick="adminPanel.viewServerLogs('eu-west-1')">
                                            <i class="fas fa-file-alt"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div class="d-flex align-center gap-md">
                                        <div class="status-indicator warning"></div>
                                        <div>
                                            <div style="font-weight: 600;">Server-Asia-1</div>
                                            <div class="text-muted" style="font-size: 0.85rem;">Primary</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <div>Tokyo, Japan</div>
                                        <div class="text-muted" style="font-size: 0.85rem;">35.6762° N, 139.6503° E</div>
                                    </div>
                                </td>
                                <td><span class="badge badge-warning">Warning</span></td>
                                <td>
                                    <div>
                                        <div style="font-weight: 600;">156ms</div>
                                        <div class="performance-bar poor">
                                            <div class="performance-fill" style="width: 45%;"></div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <div style="font-weight: 600;">92%</div>
                                        <div class="load-bar">
                                            <div class="load-fill" style="width: 92%; background: #f44336;"></div>
                                        </div>
                                    </div>
                                </td>
                                <td>600 concurrent</td>
                                <td>5 min ago</td>
                                <td>
                                    <div class="d-flex gap-sm">
                                        <button class="btn-icon warning" title="Monitor" onclick="adminPanel.monitorServer('asia-1')">
                                            <i class="fas fa-chart-line"></i>
                                        </button>
                                        <button class="btn-icon" title="Configure" onclick="adminPanel.configureServer('asia-1')">
                                            <i class="fas fa-cog"></i>
                                        </button>
                                        <button class="btn-icon" title="Restart" onclick="adminPanel.restartServer('asia-1')">
                                            <i class="fas fa-redo"></i>
                                        </button>
                                        <button class="btn-icon" title="Logs" onclick="adminPanel.viewServerLogs('asia-1')">
                                            <i class="fas fa-file-alt"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="server-actions-bar">
                    <button class="btn btn-secondary" onclick="adminPanel.bulkServerAction('restart')">
                        <i class="fas fa-redo"></i> Restart Selected
                    </button>
                    <button class="btn btn-warning" onclick="adminPanel.bulkServerAction('maintenance')">
                        <i class="fas fa-tools"></i> Maintenance Mode
                    </button>
                    <button class="btn btn-info" onclick="adminPanel.exportServerReport()">
                        <i class="fas fa-download"></i> Export Report
                    </button>
                </div>
            </div>
        `;
    }

    generateMonitoringPageHTML() {
        return `
            <div class="admin-page" id="monitoring-page">
                <div class="page-header">
                    <div class="page-title">
                        <h1><i class="fas fa-desktop"></i> System Monitoring</h1>
                        <p>Real-time system performance and health monitoring</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-secondary" onclick="adminPanel.configureAlerts()">
                            <i class="fas fa-bell"></i> Configure Alerts
                        </button>
                        <button class="btn btn-info" onclick="adminPanel.viewSystemLogs()">
                            <i class="fas fa-file-alt"></i> System Logs
                        </button>
                        <button class="btn btn-primary" onclick="adminPanel.refreshMonitoring()">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                </div>
                
                <div class="monitoring-controls">
                    <div class="control-group">
                        <label>Refresh Interval:</label>
                        <select id="monitoringInterval" onchange="adminPanel.updateMonitoringInterval()">
                            <option value="5">5 seconds</option>
                            <option value="10" selected>10 seconds</option>
                            <option value="30">30 seconds</option>
                            <option value="60">1 minute</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Time Range:</label>
                        <select id="monitoringTimeRange" onchange="adminPanel.updateMonitoringRange()">
                            <option value="1h">Last Hour</option>
                            <option value="6h" selected>Last 6 Hours</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Auto Refresh:</label>
                        <label class="toggle-switch">
                            <input type="checkbox" id="autoRefresh" checked onchange="adminPanel.toggleAutoRefresh()">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="system-status-overview">
                    <div class="status-card healthy">
                        <div class="status-header">
                            <h3>System Health</h3>
                            <div class="status-indicator healthy"></div>
                        </div>
                        <div class="status-content">
                            <div class="status-metric">
                                <span class="metric-label">Overall Status:</span>
                                <span class="metric-value healthy">Healthy</span>
                            </div>
                            <div class="status-metric">
                                <span class="metric-label">Uptime:</span>
                                <span class="metric-value">15d 7h 23m</span>
                            </div>
                            <div class="status-metric">
                                <span class="metric-label">Last Restart:</span>
                                <span class="metric-value">15 days ago</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="status-card warning">
                        <div class="status-header">
                            <h3>Active Alerts</h3>
                            <div class="status-indicator warning"></div>
                        </div>
                        <div class="status-content">
                            <div class="alert-item">
                                <div class="alert-type warning">WARN</div>
                                <div class="alert-message">High memory usage detected</div>
                                <div class="alert-time">2 min ago</div>
                            </div>
                            <div class="alert-item">
                                <div class="alert-type info">INFO</div>
                                <div class="alert-message">Database backup completed</div>
                                <div class="alert-time">1 hour ago</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="status-card info">
                        <div class="status-header">
                            <h3>Performance Summary</h3>
                            <div class="status-indicator info"></div>
                        </div>
                        <div class="status-content">
                            <div class="status-metric">
                                <span class="metric-label">Avg Response Time:</span>
                                <span class="metric-value">234ms</span>
                            </div>
                            <div class="status-metric">
                                <span class="metric-label">Request Rate:</span>
                                <span class="metric-value">1,247/min</span>
                            </div>
                            <div class="status-metric">
                                <span class="metric-label">Error Rate:</span>
                                <span class="metric-value">0.02%</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-grid">
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3><i class="fas fa-microchip"></i> CPU Usage</h3>
                            <div class="metric-current">
                                <span class="current-value" id="currentCpu">67.3%</span>
                            </div>
                        </div>
                        <div class="card-content">
                            <canvas id="cpuChart" height="200"></canvas>
                            <div class="chart-legend">
                                <div class="legend-item">
                                    <div class="legend-color" style="background: #667eea;"></div>
                                    <span>CPU Core 1</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color" style="background: #4CAF50;"></div>
                                    <span>CPU Core 2</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color" style="background: #FF9800;"></div>
                                    <span>CPU Core 3</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color" style="background: #f44336;"></div>
                                    <span>CPU Core 4</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3><i class="fas fa-memory"></i> Memory Usage</h3>
                            <div class="metric-current">
                                <span class="current-value" id="currentMemory">8.2 GB</span>
                                <span class="current-total">/ 16 GB</span>
                            </div>
                        </div>
                        <div class="card-content">
                            <canvas id="memoryChart" height="200"></canvas>
                            <div class="memory-breakdown">
                                <div class="memory-item">
                                    <span class="memory-label">Application:</span>
                                    <span class="memory-value">4.8 GB</span>
                                    <div class="memory-bar">
                                        <div class="memory-fill" style="width: 30%; background: #667eea;"></div>
                                    </div>
                                </div>
                                <div class="memory-item">
                                    <span class="memory-label">Database:</span>
                                    <span class="memory-value">2.1 GB</span>
                                    <div class="memory-bar">
                                        <div class="memory-fill" style="width: 13%; background: #4CAF50;"></div>
                                    </div>
                                </div>
                                <div class="memory-item">
                                    <span class="memory-label">Cache:</span>
                                    <span class="memory-value">1.3 GB</span>
                                    <div class="memory-bar">
                                        <div class="memory-fill" style="width: 8%; background: #FF9800;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3><i class="fas fa-hdd"></i> Disk Usage</h3>
                            <div class="metric-current">
                                <span class="current-value" id="currentDisk">342 GB</span>
                                <span class="current-total">/ 500 GB</span>
                            </div>
                        </div>
                        <div class="card-content">
                            <div class="disk-usage-chart">
                                <div class="disk-circle">
                                    <svg viewBox="0 0 120 120">
                                        <circle cx="60" cy="60" r="50" fill="none" stroke="#f0f0f0" stroke-width="10"/>
                                        <circle cx="60" cy="60" r="50" fill="none" stroke="#667eea" stroke-width="10" 
                                                stroke-dasharray="314" stroke-dashoffset="94" 
                                                stroke-linecap="round" transform="rotate(-90 60 60)"/>
                                    </svg>
                                    <div class="disk-percentage">68%</div>
                                </div>
                            </div>
                            <div class="disk-breakdown">
                                <div class="disk-item">
                                    <div class="disk-type">System</div>
                                    <div class="disk-size">45 GB</div>
                                </div>
                                <div class="disk-item">
                                    <div class="disk-type">Database</div>
                                    <div class="disk-size">198 GB</div>
                                </div>
                                <div class="disk-item">
                                    <div class="disk-type">Logs</div>
                                    <div class="disk-size">23 GB</div>
                                </div>
                                <div class="disk-item">
                                    <div class="disk-type">Cache</div>
                                    <div class="disk-size">76 GB</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3><i class="fas fa-network-wired"></i> Network I/O</h3>
                            <div class="metric-current">
                                <span class="current-value" id="currentNetwork">1.2 MB/s</span>
                            </div>
                        </div>
                        <div class="card-content">
                            <canvas id="networkChart" height="200"></canvas>
                            <div class="network-stats">
                                <div class="network-stat">
                                    <div class="stat-icon">
                                        <i class="fas fa-arrow-down"></i>
                                    </div>
                                    <div class="stat-info">
                                        <div class="stat-label">Incoming</div>
                                        <div class="stat-value">847 KB/s</div>
                                    </div>
                                </div>
                                <div class="network-stat">
                                    <div class="stat-icon">
                                        <i class="fas fa-arrow-up"></i>
                                    </div>
                                    <div class="stat-info">
                                        <div class="stat-label">Outgoing</div>
                                        <div class="stat-value">423 KB/s</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card full-width">
                        <div class="card-header">
                            <h3><i class="fas fa-database"></i> Database Performance</h3>
                            <div class="card-actions">
                                <button class="btn btn-sm btn-secondary" onclick="adminPanel.optimizeDatabase()">
                                    <i class="fas fa-tools"></i> Optimize
                                </button>
                                <button class="btn btn-sm btn-info" onclick="adminPanel.viewDbStats()">
                                    <i class="fas fa-chart-bar"></i> Detailed Stats
                                </button>
                            </div>
                        </div>
                        <div class="card-content">
                            <div class="db-metrics-grid">
                                <div class="db-metric">
                                    <div class="db-metric-icon">
                                        <i class="fas fa-stopwatch"></i>
                                    </div>
                                    <div class="db-metric-content">
                                        <div class="db-metric-value">23ms</div>
                                        <div class="db-metric-label">Avg Query Time</div>
                                    </div>
                                </div>
                                
                                <div class="db-metric">
                                    <div class="db-metric-icon">
                                        <i class="fas fa-bolt"></i>
                                    </div>
                                    <div class="db-metric-content">
                                        <div class="db-metric-value">1,247</div>
                                        <div class="db-metric-label">Queries/min</div>
                                    </div>
                                </div>
                                
                                <div class="db-metric">
                                    <div class="db-metric-icon">
                                        <i class="fas fa-link"></i>
                                    </div>
                                    <div class="db-metric-content">
                                        <div class="db-metric-value">23/100</div>
                                        <div class="db-metric-label">Active Connections</div>
                                    </div>
                                </div>
                                
                                <div class="db-metric">
                                    <div class="db-metric-icon">
                                        <i class="fas fa-lock"></i>
                                    </div>
                                    <div class="db-metric-content">
                                        <div class="db-metric-value">0</div>
                                        <div class="db-metric-label">Deadlocks</div>
                                    </div>
                                </div>
                                
                                <div class="db-metric">
                                    <div class="db-metric-icon">
                                        <i class="fas fa-cache"></i>
                                    </div>
                                    <div class="db-metric-content">
                                        <div class="db-metric-value">94.7%</div>
                                        <div class="db-metric-label">Cache Hit Ratio</div>
                                    </div>
                                </div>
                                
                                <div class="db-metric">
                                    <div class="db-metric-icon">
                                        <i class="fas fa-database"></i>
                                    </div>
                                    <div class="db-metric-content">
                                        <div class="db-metric-value">198 GB</div>
                                        <div class="db-metric-label">Database Size</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3><i class="fas fa-exclamation-triangle"></i> System Alerts</h3>
                        </div>
                        <div class="card-content">
                            <div class="alerts-list">
                                <div class="alert-entry warning">
                                    <div class="alert-severity">WARNING</div>
                                    <div class="alert-content">
                                        <div class="alert-title">High Memory Usage</div>
                                        <div class="alert-description">Memory usage above 80% threshold</div>
                                        <div class="alert-timestamp">2 minutes ago</div>
                                    </div>
                                    <button class="alert-action" onclick="adminPanel.acknowledgeAlert('mem-001')">
                                        <i class="fas fa-check"></i>
                                    </button>
                                </div>
                                
                                <div class="alert-entry info">
                                    <div class="alert-severity">INFO</div>
                                    <div class="alert-content">
                                        <div class="alert-title">Backup Completed</div>
                                        <div class="alert-description">Daily database backup finished successfully</div>
                                        <div class="alert-timestamp">1 hour ago</div>
                                    </div>
                                    <button class="alert-action" onclick="adminPanel.acknowledgeAlert('backup-001')">
                                        <i class="fas fa-check"></i>
                                    </button>
                                </div>
                                
                                <div class="alert-entry success">
                                    <div class="alert-severity">SUCCESS</div>
                                    <div class="alert-content">
                                        <div class="alert-title">System Update</div>
                                        <div class="alert-description">Security patches applied successfully</div>
                                        <div class="alert-timestamp">3 hours ago</div>
                                    </div>
                                    <button class="alert-action" onclick="adminPanel.acknowledgeAlert('update-001')">
                                        <i class="fas fa-check"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3><i class="fas fa-clock"></i> System Processes</h3>
                        </div>
                        <div class="card-content">
                            <div class="processes-list">
                                <div class="process-item">
                                    <div class="process-info">
                                        <div class="process-name">Speed Lens API</div>
                                        <div class="process-id">PID: 1247</div>
                                    </div>
                                    <div class="process-stats">
                                        <div class="process-cpu">CPU: 12.3%</div>
                                        <div class="process-memory">RAM: 245 MB</div>
                                    </div>
                                    <div class="process-status running">Running</div>
                                </div>
                                
                                <div class="process-item">
                                    <div class="process-info">
                                        <div class="process-name">Database Server</div>
                                        <div class="process-id">PID: 891</div>
                                    </div>
                                    <div class="process-stats">
                                        <div class="process-cpu">CPU: 8.7%</div>
                                        <div class="process-memory">RAM: 1.2 GB</div>
                                    </div>
                                    <div class="process-status running">Running</div>
                                </div>
                                
                                <div class="process-item">
                                    <div class="process-info">
                                        <div class="process-name">Web Server</div>
                                        <div class="process-id">PID: 2156</div>
                                    </div>
                                    <div class="process-stats">
                                        <div class="process-cpu">CPU: 5.1%</div>
                                        <div class="process-memory">RAM: 89 MB</div>
                                    </div>
                                    <div class="process-status running">Running</div>
                                </div>
                                
                                <div class="process-item">
                                    <div class="process-info">
                                        <div class="process-name">Cache Service</div>
                                        <div class="process-id">PID: 3421</div>
                                    </div>
                                    <div class="process-stats">
                                        <div class="process-cpu">CPU: 2.8%</div>
                                        <div class="process-memory">RAM: 156 MB</div>
                                    </div>
                                    <div class="process-status running">Running</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Additional page generators would follow the same pattern...
    generateLogsPageHTML() {
        return `
            <div class="admin-page" id="logs-page">
                <div class="page-header">
                    <div class="page-title">
                        <h1><i class="fas fa-file-alt"></i> Logs & Reports</h1>
                        <p>System logs, error tracking, and comprehensive reporting</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-secondary" onclick="adminPanel.clearLogs()">
                            <i class="fas fa-trash-alt"></i> Clear Logs
                        </button>
                        <button class="btn btn-info" onclick="adminPanel.downloadLogs()">
                            <i class="fas fa-download"></i> Download Logs
                        </button>
                        <button class="btn btn-primary" onclick="adminPanel.refreshLogs()">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                </div>
                
                <div class="logs-controls">
                    <div class="control-group">
                        <label>Log Level:</label>
                        <select id="logLevel" onchange="adminPanel.filterLogs()">
                            <option value="">All Levels</option>
                            <option value="error">Error</option>
                            <option value="warning">Warning</option>
                            <option value="info">Info</option>
                            <option value="debug">Debug</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Time Range:</label>
                        <select id="logTimeRange" onchange="adminPanel.filterLogs()">
                            <option value="1h">Last Hour</option>
                            <option value="24h" selected>Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Search:</label>
                        <div class="search-input">
                            <i class="fas fa-search"></i>
                            <input type="text" id="logSearch" placeholder="Search logs..." oninput="adminPanel.filterLogs()">
                        </div>
                    </div>
                    <div class="control-group">
                        <label>Auto-scroll:</label>
                        <label class="toggle-switch">
                            <input type="checkbox" id="autoScroll" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="logs-stats">
                    <div class="stat-item error">
                        <div class="stat-icon"><i class="fas fa-times-circle"></i></div>
                        <div class="stat-content">
                            <div class="stat-value">12</div>
                            <div class="stat-label">Errors</div>
                        </div>
                    </div>
                    <div class="stat-item warning">
                        <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
                        <div class="stat-content">
                            <div class="stat-value">34</div>
                            <div class="stat-label">Warnings</div>
                        </div>
                    </div>
                    <div class="stat-item info">
                        <div class="stat-icon"><i class="fas fa-info-circle"></i></div>
                        <div class="stat-content">
                            <div class="stat-value">156</div>
                            <div class="stat-label">Info</div>
                        </div>
                    </div>
                    <div class="stat-item debug">
                        <div class="stat-icon"><i class="fas fa-bug"></i></div>
                        <div class="stat-content">
                            <div class="stat-value">892</div>
                            <div class="stat-label">Debug</div>
                        </div>
                    </div>
                </div>
                
                <div class="logs-container">
                    <div class="logs-viewer" id="logsViewer">
                        <div class="log-entry error">
                            <div class="log-timestamp">2025-08-05 14:23:45</div>
                            <div class="log-level error">ERROR</div>
                            <div class="log-source">API Server</div>
                            <div class="log-message">Database connection failed: Connection timeout after 30 seconds</div>
                            <div class="log-details">
                                <button class="btn-link" onclick="adminPanel.expandLogEntry(this)">
                                    <i class="fas fa-chevron-down"></i> Show Details
                                </button>
                                <div class="log-expanded" style="display: none;">
                                    Stack trace: DatabaseConnection.connect() at line 45<br>
                                    Connection string: postgresql://localhost:5432/speedlens<br>
                                    Error code: ETIMEDOUT
                                </div>
                            </div>
                        </div>
                        
                        <div class="log-entry warning">
                            <div class="log-timestamp">2025-08-05 14:22:12</div>
                            <div class="log-level warning">WARN</div>
                            <div class="log-source">Speed Test Engine</div>
                            <div class="log-message">High latency detected for server US-East-1: 156ms average over last 5 minutes</div>
                        </div>
                        
                        <div class="log-entry info">
                            <div class="log-timestamp">2025-08-05 14:20:30</div>
                            <div class="log-level info">INFO</div>
                            <div class="log-source">User Manager</div>
                            <div class="log-message">New user registration: john.doe@example.com (ID: 1248)</div>
                        </div>
                        
                        <div class="log-entry debug">
                            <div class="log-timestamp">2025-08-05 14:19:45</div>
                            <div class="log-level debug">DEBUG</div>
                            <div class="log-source">Cache Service</div>
                            <div class="log-message">Cache hit ratio: 94.7% (1,247 hits, 67 misses)</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateBackupPageHTML() {
        return `
            <div class="admin-page" id="backup-page">
                <div class="page-header">
                    <div class="page-title">
                        <h1><i class="fas fa-shield-alt"></i> Backup & Security</h1>
                        <p>Data backup, recovery, and security management</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-secondary" onclick="adminPanel.configureBackup()">
                            <i class="fas fa-cog"></i> Configure
                        </button>
                        <button class="btn btn-warning" onclick="adminPanel.runBackupNow()">
                            <i class="fas fa-save"></i> Backup Now
                        </button>
                        <button class="btn btn-danger" onclick="adminPanel.restoreFromBackup()">
                            <i class="fas fa-undo"></i> Restore
                        </button>
                    </div>
                </div>
                
                <div class="backup-overview">
                    <div class="backup-card">
                        <div class="backup-header">
                            <h3>Last Backup</h3>
                            <div class="backup-status success">
                                <i class="fas fa-check-circle"></i> Success
                            </div>
                        </div>
                        <div class="backup-content">
                            <div class="backup-detail">
                                <span class="detail-label">Date:</span>
                                <span class="detail-value">2025-08-05 02:30:00</span>
                            </div>
                            <div class="backup-detail">
                                <span class="detail-label">Size:</span>
                                <span class="detail-value">2.3 GB</span>
                            </div>
                            <div class="backup-detail">
                                <span class="detail-label">Duration:</span>
                                <span class="detail-value">4m 23s</span>
                            </div>
                            <div class="backup-detail">
                                <span class="detail-label">Type:</span>
                                <span class="detail-value">Full Backup</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="backup-card">
                        <div class="backup-header">
                            <h3>Next Scheduled</h3>
                            <div class="backup-status scheduled">
                                <i class="fas fa-clock"></i> Scheduled
                            </div>
                        </div>
                        <div class="backup-content">
                            <div class="backup-detail">
                                <span class="detail-label">Date:</span>
                                <span class="detail-value">2025-08-06 02:30:00</span>
                            </div>
                            <div class="backup-detail">
                                <span class="detail-label">Type:</span>
                                <span class="detail-value">Incremental</span>
                            </div>
                            <div class="backup-detail">
                                <span class="detail-label">Estimated Size:</span>
                                <span class="detail-value">~450 MB</span>
                            </div>
                            <div class="backup-detail">
                                <span class="detail-label">Retention:</span>
                                <span class="detail-value">30 days</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="backup-card">
                        <div class="backup-header">
                            <h3>Storage Usage</h3>
                            <div class="backup-status info">
                                <i class="fas fa-database"></i> 67% Used
                            </div>
                        </div>
                        <div class="backup-content">
                            <div class="storage-bar">
                                <div class="storage-fill" style="width: 67%;"></div>
                            </div>
                            <div class="backup-detail">
                                <span class="detail-label">Used:</span>
                                <span class="detail-value">33.5 GB</span>
                            </div>
                            <div class="backup-detail">
                                <span class="detail-label">Available:</span>
                                <span class="detail-value">16.5 GB</span>
                            </div>
                            <div class="backup-detail">
                                <span class="detail-label">Total:</span>
                                <span class="detail-value">50 GB</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="backup-history">
                    <div class="section-header">
                        <h3>Backup History</h3>
                        <div class="section-actions">
                            <button class="btn btn-sm btn-secondary" onclick="adminPanel.cleanupOldBackups()">
                                <i class="fas fa-broom"></i> Cleanup Old
                            </button>
                            <button class="btn btn-sm btn-info" onclick="adminPanel.exportBackupReport()">
                                <i class="fas fa-download"></i> Export Report
                            </button>
                        </div>
                    </div>
                    
                    <div class="data-table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Size</th>
                                    <th>Duration</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>2025-08-05 02:30:00</td>
                                    <td><span class="badge badge-info">Full</span></td>
                                    <td>2.3 GB</td>
                                    <td>4m 23s</td>
                                    <td><span class="badge badge-success">Success</span></td>
                                    <td>
                                        <div class="d-flex gap-sm">
                                            <button class="btn-icon" title="Download">
                                                <i class="fas fa-download"></i>
                                            </button>
                                            <button class="btn-icon" title="Restore">
                                                <i class="fas fa-undo"></i>
                                            </button>
                                            <button class="btn-icon" title="Verify">
                                                <i class="fas fa-check"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>2025-08-04 02:30:00</td>
                                    <td><span class="badge badge-warning">Incremental</span></td>
                                    <td>456 MB</td>
                                    <td>1m 12s</td>
                                    <td><span class="badge badge-success">Success</span></td>
                                    <td>
                                        <div class="d-flex gap-sm">
                                            <button class="btn-icon" title="Download">
                                                <i class="fas fa-download"></i>
                                            </button>
                                            <button class="btn-icon" title="Restore">
                                                <i class="fas fa-undo"></i>
                                            </button>
                                            <button class="btn-icon" title="Verify">
                                                <i class="fas fa-check"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>2025-08-03 02:30:00</td>
                                    <td><span class="badge badge-warning">Incremental</span></td>
                                    <td>523 MB</td>
                                    <td>1m 34s</td>
                                    <td><span class="badge badge-danger">Failed</span></td>
                                    <td>
                                        <div class="d-flex gap-sm">
                                            <button class="btn-icon" title="View Error">
                                                <i class="fas fa-exclamation-triangle"></i>
                                            </button>
                                            <button class="btn-icon" title="Retry">
                                                <i class="fas fa-redo"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="security-section">
                    <div class="section-header">
                        <h3>Security Settings</h3>
                    </div>
                    
                    <div class="security-grid">
                        <div class="security-card">
                            <div class="security-header">
                                <i class="fas fa-lock"></i>
                                <h4>Encryption</h4>
                            </div>
                            <div class="security-content">
                                <div class="security-setting">
                                    <span class="setting-label">Backup Encryption:</span>
                                    <span class="setting-status enabled">Enabled (AES-256)</span>
                                </div>
                                <div class="security-setting">
                                    <span class="setting-label">Transit Encryption:</span>
                                    <span class="setting-status enabled">Enabled (TLS 1.3)</span>
                                </div>
                                <div class="security-setting">
                                    <span class="setting-label">Key Rotation:</span>
                                    <span class="setting-status enabled">Every 90 days</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="security-card">
                            <div class="security-header">
                                <i class="fas fa-shield-alt"></i>
                                <h4>Access Control</h4>
                            </div>
                            <div class="security-content">
                                <div class="security-setting">
                                    <span class="setting-label">Two-Factor Auth:</span>
                                    <span class="setting-status enabled">Required</span>
                                </div>
                                <div class="security-setting">
                                    <span class="setting-label">API Key Rotation:</span>
                                    <span class="setting-status enabled">Monthly</span>
                                </div>
                                <div class="security-setting">
                                    <span class="setting-label">Session Timeout:</span>
                                    <span class="setting-status">30 minutes</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="security-card">
                            <div class="security-header">
                                <i class="fas fa-eye"></i>
                                <h4>Monitoring</h4>
                            </div>
                            <div class="security-content">
                                <div class="security-setting">
                                    <span class="setting-label">Audit Logging:</span>
                                    <span class="setting-status enabled">Enabled</span>
                                </div>
                                <div class="security-setting">
                                    <span class="setting-label">Intrusion Detection:</span>
                                    <span class="setting-status enabled">Active</span>
                                </div>
                                <div class="security-setting">
                                    <span class="setting-label">Threat Alerts:</span>
                                    <span class="setting-status enabled">Real-time</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateSettingsPageHTML() {
        return `
            <div class="admin-page" id="settings-page">
                <div class="page-header">
                    <div class="page-title">
                        <h1><i class="fas fa-cog"></i> Application Settings</h1>
                        <p>Configure system preferences, features, and global settings</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-secondary" onclick="adminPanel.resetToDefaults()">
                            <i class="fas fa-undo"></i> Reset to Defaults
                        </button>
                        <button class="btn btn-info" onclick="adminPanel.exportSettings()">
                            <i class="fas fa-download"></i> Export Config
                        </button>
                        <button class="btn btn-primary" onclick="adminPanel.saveSettings()">
                            <i class="fas fa-save"></i> Save Changes
                        </button>
                    </div>
                </div>
                
                <div class="settings-tabs">
                    <div class="tab-nav">
                        <button class="tab-btn active" onclick="adminPanel.switchSettingsTab('general', this)">
                            <i class="fas fa-cog"></i> General
                        </button>
                        <button class="tab-btn" onclick="adminPanel.switchSettingsTab('performance', this)">
                            <i class="fas fa-tachometer-alt"></i> Performance
                        </button>
                        <button class="tab-btn" onclick="adminPanel.switchSettingsTab('security', this)">
                            <i class="fas fa-shield-alt"></i> Security
                        </button>
                        <button class="tab-btn" onclick="adminPanel.switchSettingsTab('notifications', this)">
                            <i class="fas fa-bell"></i> Notifications
                        </button>
                        <button class="tab-btn" onclick="adminPanel.switchSettingsTab('integrations', this)">
                            <i class="fas fa-plug"></i> Integrations
                        </button>
                    </div>
                    
                    <div class="tab-content">
                        <div class="tab-pane active" id="general-settings">
                            <div class="settings-section">
                                <h3>Application Settings</h3>
                                <div class="settings-grid">
                                    <div class="setting-item">
                                        <label class="setting-label">Application Name</label>
                                        <input type="text" class="setting-input" value="Speed Lens" id="appName">
                                        <small class="setting-description">The name displayed throughout the application</small>
                                    </div>
                                    
                                    <div class="setting-item">
                                        <label class="setting-label">Default Language</label>
                                        <select class="setting-select" id="defaultLanguage">
                                            <option value="en" selected>English</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                            <option value="de">German</option>
                                        </select>
                                        <small class="setting-description">Default language for new users</small>
                                    </div>
                                    
                                    <div class="setting-item">
                                        <label class="setting-label">Timezone</label>
                                        <select class="setting-select" id="timezone">
                                            <option value="UTC" selected>UTC</option>
                                            <option value="America/New_York">Eastern Time</option>
                                            <option value="America/Los_Angeles">Pacific Time</option>
                                            <option value="Europe/London">London</option>
                                        </select>
                                        <small class="setting-description">Default timezone for the application</small>
                                    </div>
                                    
                                    <div class="setting-item">
                                        <label class="setting-label">Theme</label>
                                        <select class="setting-select" id="theme">
                                            <option value="light">Light</option>
                                            <option value="dark" selected>Dark</option>
                                            <option value="auto">Auto</option>
                                        </select>
                                        <small class="setting-description">Default theme for the admin panel</small>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="settings-section">
                                <h3>Speed Test Configuration</h3>
                                <div class="settings-grid">
                                    <div class="setting-item">
                                        <label class="setting-label">Test Duration (seconds)</label>
                                        <input type="number" class="setting-input" value="30" min="10" max="120" id="testDuration">
                                        <small class="setting-description">Default duration for speed tests</small>
                                    </div>
                                    
                                    <div class="setting-item">
                                        <label class="setting-label">Max Concurrent Tests</label>
                                        <input type="number" class="setting-input" value="100" min="10" max="1000" id="maxConcurrentTests">
                                        <small class="setting-description">Maximum number of simultaneous speed tests</small>
                                    </div>
                                    
                                    <div class="setting-item">
                                        <label class="setting-label">Auto-select Server</label>
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="autoSelectServer" checked>
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <small class="setting-description">Automatically select the best server for users</small>
                                    </div>
                                    
                                    <div class="setting-item">
                                        <label class="setting-label">Store Test History</label>
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="storeTestHistory" checked>
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <small class="setting-description">Keep historical test data for analytics</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-pane" id="performance-settings">
                            <div class="settings-section">
                                <h3>Cache Settings</h3>
                                <div class="settings-grid">
                                    <div class="setting-item">
                                        <label class="setting-label">Enable Caching</label>
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="enableCaching" checked>
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <small class="setting-description">Enable application-wide caching</small>
                                    </div>
                                    
                                    <div class="setting-item">
                                        <label class="setting-label">Cache TTL (minutes)</label>
                                        <input type="number" class="setting-input" value="15" min="1" max="1440" id="cacheTTL">
                                        <small class="setting-description">Time-to-live for cached data</small>
                                    </div>
                                    
                                    <div class="setting-item">
                                        <label class="setting-label">Max Cache Size (MB)</label>
                                        <input type="number" class="setting-input" value="512" min="64" max="4096" id="maxCacheSize">
                                        <small class="setting-description">Maximum cache size in megabytes</small>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="settings-section">
                                <h3>Database Settings</h3>
                                <div class="settings-grid">
                                    <div class="setting-item">
                                        <label class="setting-label">Connection Pool Size</label>
                                        <input type="number" class="setting-input" value="20" min="5" max="100" id="connectionPoolSize">
                                        <small class="setting-description">Number of database connections in pool</small>
                                    </div>
                                    
                                    <div class="setting-item">
                                        <label class="setting-label">Query Timeout (seconds)</label>
                                        <input type="number" class="setting-input" value="30" min="5" max="300" id="queryTimeout">
                                        <small class="setting-description">Maximum time for database queries</small>
                                    </div>
                                    
                                    <div class="setting-item">
                                        <label class="setting-label">Enable Query Logging</label>
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="enableQueryLogging">
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <small class="setting-description">Log all database queries (for debugging)</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-pane" id="security-settings">
                            <div class="settings-section">
                                <h3>Authentication Settings</h3>
                                <div class="settings-grid">
                                    <div class="setting-item">
                                        <label class="setting-label">Require 2FA for Admins</label>
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="require2FA" checked>
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <small class="setting-description">Require two-factor authentication for admin accounts</small>
                                    </div>
                                    
                                    <div class="setting-item">
                                        <label class="setting-label">Session Timeout (minutes)</label>
                                        <input type="number" class="setting-input" value="30" min="5" max="480" id="sessionTimeout">
                                        <small class="setting-description">Automatic logout after inactivity</small>
                                    </div>
                                    
                                    <div class="setting-item">
                                        <label class="setting-label">Max Login Attempts</label>
                                        <input type="number" class="setting-input" value="5" min="3" max="20" id="maxLoginAttempts">
                                        <small class="setting-description">Account lockout after failed attempts</small>
                                    </div>
                                    
                                    <div class="setting-item">
                                        <label class="setting-label">Password Minimum Length</label>
                                        <input type="number" class="setting-input" value="8" min="6" max="32" id="passwordMinLength">
                                        <small class="setting-description">Minimum required password length</small>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="settings-section">
                                <h3>Data Protection</h3>
                                <div class="settings-grid">
                                    <div class="setting-item">
                                        <label class="setting-label">Enable Data Encryption</label>
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="enableEncryption" checked>
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <small class="setting-description">Encrypt sensitive data at rest</small>
                                    </div>
                                    
                                    <div class="setting-item">
                                        <label class="setting-label">Data Retention (days)</label>
                                        <input type="number" class="setting-input" value="365" min="30" max="2555" id="dataRetention">
                                        <small class="setting-description">How long to keep user data</small>
                                    </div>
                                    
                                    <div class="setting-item">
                                        <label class="setting-label">Enable Audit Logging</label>
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="enableAuditLogging" checked>
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <small class="setting-description">Log all admin actions for security</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-pane" id="notifications-settings">
                            <div class="settings-section">
                                <h3>Email Notifications</h3>
                                <div class="settings-grid">
                                    <div class="setting-item">
                                        <label class="setting-label">SMTP Server</label>
                                        <input type="text" class="setting-input" value="smtp.gmail.com" id="smtpServer">
                                        <small class="setting-description">SMTP server for sending emails</small>
                                    </div>
                                    
                                    <div class="setting-item">
                                        <label class="setting-label">SMTP Port</label>
                                        <input type="number" class="setting-input" value="587" min="25" max="65535" id="smtpPort">
                                        <small class="setting-description">SMTP port number</small>
                                    </div>
                                    
                                    <div class="setting-item">
                                        <label class="setting-label">From Email</label>
                                        <input type="email" class="setting-input" value="noreply@speedlens.com" id="fromEmail">
                                        <small class="setting-description">Default sender email address</small>
                                    </div>
                                    
                                    <div class="setting-item">
                                        <label class="setting-label">Enable SSL</label>
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="enableSSL" checked>
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <small class="setting-description">Use SSL/TLS for email</small>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="settings-section">
                                <h3>Alert Settings</h3>
                                <div class="settings-grid">
                                    <div class="setting-item">
                                        <label class="setting-label">System Alert Threshold</label>
                                        <select class="setting-select" id="alertThreshold">
                                            <option value="low">Low</option>
                                            <option value="medium" selected>Medium</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical Only</option>
                                        </select>
                                        <small class="setting-description">Minimum alert level to trigger notifications</small>
                                    </div>
                                    
                                    <div class="setting-item">
                                        <label class="setting-label">Alert Email Recipients</label>
                                        <textarea class="setting-textarea" id="alertEmails" rows="3">admin@speedlens.com
support@speedlens.com</textarea>
                                        <small class="setting-description">Email addresses to receive alerts (one per line)</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-pane" id="integrations-settings">
                            <div class="settings-section">
                                <h3>Third-Party Integrations</h3>
                                <div class="integrations-grid">
                                    <div class="integration-card">
                                        <div class="integration-header">
                                            <div class="integration-logo">
                                                <i class="fab fa-google"></i>
                                            </div>
                                            <div class="integration-info">
                                                <h4>Google Analytics</h4>
                                                <p>Track user behavior and performance</p>
                                            </div>
                                            <div class="integration-status">
                                                <label class="toggle-switch">
                                                    <input type="checkbox" id="googleAnalytics">
                                                    <span class="toggle-slider"></span>
                                                </label>
                                            </div>
                                        </div>
                                        <div class="integration-config">
                                            <input type="text" placeholder="Tracking ID (GA-XXXXXXXXX-X)" class="setting-input">
                                        </div>
                                    </div>
                                    
                                    <div class="integration-card">
                                        <div class="integration-header">
                                            <div class="integration-logo">
                                                <i class="fab fa-slack"></i>
                                            </div>
                                            <div class="integration-info">
                                                <h4>Slack</h4>
                                                <p>Send alerts and notifications to Slack</p>
                                            </div>
                                            <div class="integration-status">
                                                <label class="toggle-switch">
                                                    <input type="checkbox" id="slackIntegration" checked>
                                                    <span class="toggle-slider"></span>
                                                </label>
                                            </div>
                                        </div>
                                        <div class="integration-config">
                                            <input type="text" placeholder="Webhook URL" class="setting-input" value="https://hooks.slack.com/services/...">
                                        </div>
                                    </div>
                                    
                                    <div class="integration-card">
                                        <div class="integration-header">
                                            <div class="integration-logo">
                                                <i class="fab fa-github"></i>
                                            </div>
                                            <div class="integration-info">
                                                <h4>GitHub</h4>
                                                <p>Issue tracking and deployment hooks</p>
                                            </div>
                                            <div class="integration-status">
                                                <label class="toggle-switch">
                                                    <input type="checkbox" id="githubIntegration">
                                                    <span class="toggle-slider"></span>
                                                </label>
                                            </div>
                                        </div>
                                        <div class="integration-config">
                                            <input type="text" placeholder="Repository (owner/repo)" class="setting-input">
                                            <input type="password" placeholder="Access Token" class="setting-input">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateApiPageHTML() {
        return `
            <div class="admin-page" id="api-page">
                <div class="page-header">
                    <div class="page-title">
                        <h1><i class="fas fa-code"></i> API Management</h1>
                        <p>Manage API keys, endpoints, rate limits, and integrations</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-secondary" onclick="adminPanel.createApiKey()">
                            <i class="fas fa-key"></i> Create API Key
                        </button>
                        <button class="btn btn-info" onclick="adminPanel.viewApiDocs()">
                            <i class="fas fa-book"></i> API Documentation
                        </button>
                        <button class="btn btn-primary" onclick="adminPanel.refreshApiStats()">
                            <i class="fas fa-sync-alt"></i> Refresh Stats
                        </button>
                    </div>
                </div>
                
                <div class="api-overview">
                    <div class="api-metric-card">
                        <div class="metric-icon">
                            <i class="fas fa-code"></i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value">2,847</div>
                            <div class="metric-label">API Calls Today</div>
                            <div class="metric-trend positive">
                                <i class="fas fa-arrow-up"></i> +15.3%
                            </div>
                        </div>
                    </div>
                    
                    <div class="api-metric-card">
                        <div class="metric-icon">
                            <i class="fas fa-key"></i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value">12</div>
                            <div class="metric-label">Active API Keys</div>
                            <div class="metric-trend neutral">
                                <i class="fas fa-minus"></i> No change
                            </div>
                        </div>
                    </div>
                    
                    <div class="api-metric-card">
                        <div class="metric-icon">
                            <i class="fas fa-tachometer-alt"></i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value">234ms</div>
                            <div class="metric-label">Avg Response Time</div>
                            <div class="metric-trend positive">
                                <i class="fas fa-arrow-down"></i> -12ms
                            </div>
                        </div>
                    </div>
                    
                    <div class="api-metric-card">
                        <div class="metric-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value">0.02%</div>
                            <div class="metric-label">Error Rate</div>
                            <div class="metric-trend positive">
                                <i class="fas fa-arrow-down"></i> -0.01%
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="api-sections">
                    <div class="api-section">
                        <div class="section-header">
                            <h3>API Keys Management</h3>
                            <div class="section-actions">
                                <button class="btn btn-sm btn-secondary" onclick="adminPanel.revokeExpiredKeys()">
                                    <i class="fas fa-ban"></i> Revoke Expired
                                </button>
                                <button class="btn btn-sm btn-info" onclick="adminPanel.exportApiKeys()">
                                    <i class="fas fa-download"></i> Export
                                </button>
                            </div>
                        </div>
                        
                        <div class="data-table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>API Key</th>
                                        <th>Name</th>
                                        <th>Owner</th>
                                        <th>Permissions</th>
                                        <th>Usage</th>
                                        <th>Created</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <div class="api-key-display">
                                                <code>sl_key_1234****5678</code>
                                                <button class="btn-icon" onclick="adminPanel.copyApiKey('sl_key_12345678')" title="Copy">
                                                    <i class="fas fa-copy"></i>
                                                </button>
                                            </div>
                                        </td>
                                        <td>Production API</td>
                                        <td>admin@speedlens.com</td>
                                        <td>
                                            <div class="permission-tags">
                                                <span class="permission-tag read">Read</span>
                                                <span class="permission-tag write">Write</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="usage-info">
                                                <div class="usage-bar">
                                                    <div class="usage-fill" style="width: 67%;"></div>
                                                </div>
                                                <small>6,700 / 10,000</small>
                                            </div>
                                        </td>
                                        <td>2025-01-15</td>
                                        <td><span class="badge badge-success">Active</span></td>
                                        <td>
                                            <div class="d-flex gap-sm">
                                                <button class="btn-icon" onclick="adminPanel.editApiKey('key1')" title="Edit">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn-icon" onclick="adminPanel.regenerateApiKey('key1')" title="Regenerate">
                                                    <i class="fas fa-redo"></i>
                                                </button>
                                                <button class="btn-icon" onclick="adminPanel.revokeApiKey('key1')" title="Revoke">
                                                    <i class="fas fa-ban"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="api-key-display">
                                                <code>sl_key_9876****4321</code>
                                                <button class="btn-icon" onclick="adminPanel.copyApiKey('sl_key_98764321')" title="Copy">
                                                    <i class="fas fa-copy"></i>
                                                </button>
                                            </div>
                                        </td>
                                        <td>Mobile App</td>
                                        <td>mobile@speedlens.com</td>
                                        <td>
                                            <div class="permission-tags">
                                                <span class="permission-tag read">Read</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="usage-info">
                                                <div class="usage-bar">
                                                    <div class="usage-fill" style="width: 23%;"></div>
                                                </div>
                                                <small>1,150 / 5,000</small>
                                            </div>
                                        </td>
                                        <td>2025-02-20</td>
                                        <td><span class="badge badge-success">Active</span></td>
                                        <td>
                                            <div class="d-flex gap-sm">
                                                <button class="btn-icon" onclick="adminPanel.editApiKey('key2')" title="Edit">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn-icon" onclick="adminPanel.regenerateApiKey('key2')" title="Regenerate">
                                                    <i class="fas fa-redo"></i>
                                                </button>
                                                <button class="btn-icon" onclick="adminPanel.revokeApiKey('key2')" title="Revoke">
                                                    <i class="fas fa-ban"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="api-section">
                        <div class="section-header">
                            <h3>API Endpoints</h3>
                        </div>
                        
                        <div class="endpoints-grid">
                            <div class="endpoint-card">
                                <div class="endpoint-header">
                                    <span class="http-method get">GET</span>
                                    <span class="endpoint-path">/api/v1/tests</span>
                                    <span class="endpoint-status online">Online</span>
                                </div>
                                <div class="endpoint-description">
                                    Retrieve speed test results with optional filtering
                                </div>
                                <div class="endpoint-stats">
                                    <div class="stat">
                                        <span class="stat-label">Calls Today:</span>
                                        <span class="stat-value">1,234</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-label">Avg Response:</span>
                                        <span class="stat-value">45ms</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-label">Success Rate:</span>
                                        <span class="stat-value">99.8%</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="endpoint-card">
                                <div class="endpoint-header">
                                    <span class="http-method post">POST</span>
                                    <span class="endpoint-path">/api/v1/tests</span>
                                    <span class="endpoint-status online">Online</span>
                                </div>
                                <div class="endpoint-description">
                                    Submit new speed test results
                                </div>
                                <div class="endpoint-stats">
                                    <div class="stat">
                                        <span class="stat-label">Calls Today:</span>
                                        <span class="stat-value">892</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-label">Avg Response:</span>
                                        <span class="stat-value">123ms</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-label">Success Rate:</span>
                                        <span class="stat-value">99.5%</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="endpoint-card">
                                <div class="endpoint-header">
                                    <span class="http-method get">GET</span>
                                    <span class="endpoint-path">/api/v1/servers</span>
                                    <span class="endpoint-status online">Online</span>
                                </div>
                                <div class="endpoint-description">
                                    Get list of available test servers
                                </div>
                                <div class="endpoint-stats">
                                    <div class="stat">
                                        <span class="stat-label">Calls Today:</span>
                                        <span class="stat-value">567</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-label">Avg Response:</span>
                                        <span class="stat-value">23ms</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-label">Success Rate:</span>
                                        <span class="stat-value">100%</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="endpoint-card">
                                <div class="endpoint-header">
                                    <span class="http-method get">GET</span>
                                    <span class="endpoint-path">/api/v1/analytics</span>
                                    <span class="endpoint-status maintenance">Maintenance</span>
                                </div>
                                <div class="endpoint-description">
                                    Advanced analytics and reporting data
                                </div>
                                <div class="endpoint-stats">
                                    <div class="stat">
                                        <span class="stat-label">Calls Today:</span>
                                        <span class="stat-value">0</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-label">Avg Response:</span>
                                        <span class="stat-value">-</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-label">Success Rate:</span>
                                        <span class="stat-value">-</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="api-section">
                        <div class="section-header">
                            <h3>Rate Limits & Quotas</h3>
                        </div>
                        
                        <div class="rate-limits-grid">
                            <div class="rate-limit-card">
                                <h4>Free Tier</h4>
                                <div class="rate-limit-details">
                                    <div class="limit-item">
                                        <span class="limit-label">Requests per hour:</span>
                                        <span class="limit-value">1,000</span>
                                    </div>
                                    <div class="limit-item">
                                        <span class="limit-label">Requests per day:</span>
                                        <span class="limit-value">10,000</span>
                                    </div>
                                    <div class="limit-item">
                                        <span class="limit-label">Concurrent requests:</span>
                                        <span class="limit-value">10</span>
                                    </div>
                                </div>
                                <div class="rate-limit-usage">
                                    <div class="usage-bar">
                                        <div class="usage-fill" style="width: 34%;"></div>
                                    </div>
                                    <small>3,400 / 10,000 today</small>
                                </div>
                            </div>
                            
                            <div class="rate-limit-card">
                                <h4>Premium Tier</h4>
                                <div class="rate-limit-details">
                                    <div class="limit-item">
                                        <span class="limit-label">Requests per hour:</span>
                                        <span class="limit-value">10,000</span>
                                    </div>
                                    <div class="limit-item">
                                        <span class="limit-label">Requests per day:</span>
                                        <span class="limit-value">100,000</span>
                                    </div>
                                    <div class="limit-item">
                                        <span class="limit-label">Concurrent requests:</span>
                                        <span class="limit-value">100</span>
                                    </div>
                                </div>
                                <div class="rate-limit-usage">
                                    <div class="usage-bar">
                                        <div class="usage-fill" style="width: 12%;"></div>
                                    </div>
                                    <small>12,000 / 100,000 today</small>
                                </div>
                            </div>
                            
                            <div class="rate-limit-card">
                                <h4>Enterprise Tier</h4>
                                <div class="rate-limit-details">
                                    <div class="limit-item">
                                        <span class="limit-label">Requests per hour:</span>
                                        <span class="limit-value">Unlimited</span>
                                    </div>
                                    <div class="limit-item">
                                        <span class="limit-label">Requests per day:</span>
                                        <span class="limit-value">Unlimited</span>
                                    </div>
                                    <div class="limit-item">
                                        <span class="limit-label">Concurrent requests:</span>
                                        <span class="limit-value">1,000</span>
                                    </div>
                                </div>
                                <div class="rate-limit-usage">
                                    <div class="usage-bar">
                                        <div class="usage-fill" style="width: 5%;"></div>
                                    </div>
                                    <small>47 concurrent connections</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateMaintenancePageHTML() {
        return `
            <div class="admin-page" id="maintenance-page">
                <div class="page-header">
                    <div class="page-title">
                        <h1><i class="fas fa-tools"></i> System Maintenance</h1>
                        <p>Scheduled maintenance, updates, and system optimization</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-secondary" onclick="adminPanel.scheduleMaintenance()">
                            <i class="fas fa-calendar-plus"></i> Schedule Maintenance
                        </button>
                        <button class="btn btn-warning" onclick="adminPanel.enableMaintenanceMode()">
                            <i class="fas fa-exclamation-triangle"></i> Enable Maintenance Mode
                        </button>
                        <button class="btn btn-primary" onclick="adminPanel.runSystemCheck()">
                            <i class="fas fa-search"></i> Run System Check
                        </button>
                    </div>
                </div>
                
                <div class="maintenance-status">
                    <div class="status-card">
                        <div class="status-header">
                            <h3>Current Status</h3>
                            <div class="status-indicator online"></div>
                        </div>
                        <div class="status-content">
                            <div class="status-detail">
                                <span class="detail-label">System Status:</span>
                                <span class="detail-value online">Operational</span>
                            </div>
                            <div class="status-detail">
                                <span class="detail-label">Last Maintenance:</span>
                                <span class="detail-value">2025-08-01 02:00 UTC</span>
                            </div>
                            <div class="status-detail">
                                <span class="detail-label">Next Scheduled:</span>
                                <span class="detail-value">2025-08-15 02:00 UTC</span>
                            </div>
                            <div class="status-detail">
                                <span class="detail-label">Maintenance Window:</span>
                                <span class="detail-value">2-4 hours</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="maintenance-actions">
                        <div class="action-group">
                            <h4>Quick Actions</h4>
                            <button class="maintenance-btn" onclick="adminPanel.clearCaches()">
                                <i class="fas fa-broom"></i>
                                <span>Clear Caches</span>
                            </button>
                            <button class="maintenance-btn" onclick="adminPanel.restartServices()">
                                <i class="fas fa-redo"></i>
                                <span>Restart Services</span>
                            </button>
                            <button class="maintenance-btn" onclick="adminPanel.optimizeDatabase()">
                                <i class="fas fa-database"></i>
                                <span>Optimize Database</span>
                            </button>
                            <button class="maintenance-btn" onclick="adminPanel.updateSystem()">
                                <i class="fas fa-arrow-up"></i>
                                <span>System Update</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="maintenance-sections">
                    <div class="maintenance-section">
                        <div class="section-header">
                            <h3>Scheduled Maintenance</h3>
                            <button class="btn btn-sm btn-primary" onclick="adminPanel.addMaintenanceWindow()">
                                <i class="fas fa-plus"></i> Add Window
                            </button>
                        </div>
                        
                        <div class="maintenance-timeline">
                            <div class="timeline-item">
                                <div class="timeline-date">
                                    <div class="timeline-day">15</div>
                                    <div class="timeline-month">Aug</div>
                                </div>
                                <div class="timeline-content">
                                    <div class="timeline-title">Security Updates</div>
                                    <div class="timeline-description">
                                        Apply latest security patches and update SSL certificates
                                    </div>
                                    <div class="timeline-details">
                                        <span class="timeline-time">02:00 - 04:00 UTC</span>
                                        <span class="timeline-type">Scheduled</span>
                                    </div>
                                </div>
                                <div class="timeline-actions">
                                    <button class="btn-icon" onclick="adminPanel.editMaintenance('maint1')" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon" onclick="adminPanel.cancelMaintenance('maint1')" title="Cancel">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="timeline-item">
                                <div class="timeline-date">
                                    <div class="timeline-day">22</div>
                                    <div class="timeline-month">Aug</div>
                                </div>
                                <div class="timeline-content">
                                    <div class="timeline-title">Database Optimization</div>
                                    <div class="timeline-description">
                                        Full database optimization and index rebuilding
                                    </div>
                                    <div class="timeline-details">
                                        <span class="timeline-time">01:00 - 05:00 UTC</span>
                                        <span class="timeline-type">Scheduled</span>
                                    </div>
                                </div>
                                <div class="timeline-actions">
                                    <button class="btn-icon" onclick="adminPanel.editMaintenance('maint2')" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon" onclick="adminPanel.cancelMaintenance('maint2')" title="Cancel">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="timeline-item completed">
                                <div class="timeline-date">
                                    <div class="timeline-day">01</div>
                                    <div class="timeline-month">Aug</div>
                                </div>
                                <div class="timeline-content">
                                    <div class="timeline-title">Server Migration</div>
                                    <div class="timeline-description">
                                        Migrated database servers to new infrastructure
                                    </div>
                                    <div class="timeline-details">
                                        <span class="timeline-time">02:00 - 03:30 UTC</span>
                                        <span class="timeline-type">Completed</span>
                                    </div>
                                </div>
                                <div class="timeline-actions">
                                    <button class="btn-icon" onclick="adminPanel.viewMaintenanceReport('maint3')" title="View Report">
                                        <i class="fas fa-file-alt"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="maintenance-section">
                        <div class="section-header">
                            <h3>System Health Check</h3>
                            <button class="btn btn-sm btn-secondary" onclick="adminPanel.downloadHealthReport()">
                                <i class="fas fa-download"></i> Download Report
                            </button>
                        </div>
                        
                        <div class="health-checks">
                            <div class="health-check-item">
                                <div class="health-check-icon success">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <div class="health-check-content">
                                    <div class="health-check-title">Database Connectivity</div>
                                    <div class="health-check-description">All database connections are healthy</div>
                                    <div class="health-check-details">
                                        <span>Response Time: 23ms</span>
                                        <span>Last Checked: 2 minutes ago</span>
                                    </div>
                                </div>
                                <div class="health-check-status">
                                    <span class="status-badge success">Healthy</span>
                                </div>
                            </div>
                            
                            <div class="health-check-item">
                                <div class="health-check-icon success">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <div class="health-check-content">
                                    <div class="health-check-title">API Endpoints</div>
                                    <div class="health-check-description">All API endpoints responding normally</div>
                                    <div class="health-check-details">
                                        <span>Success Rate: 99.8%</span>
                                        <span>Last Checked: 1 minute ago</span>
                                    </div>
                                </div>
                                <div class="health-check-status">
                                    <span class="status-badge success">Healthy</span>
                                </div>
                            </div>
                            
                            <div class="health-check-item">
                                <div class="health-check-icon warning">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                                <div class="health-check-content">
                                    <div class="health-check-title">Memory Usage</div>
                                    <div class="health-check-description">Memory usage is above recommended threshold</div>
                                    <div class="health-check-details">
                                        <span>Current: 8.2GB / 10GB (82%)</span>
                                        <span>Last Checked: 30 seconds ago</span>
                                    </div>
                                </div>
                                <div class="health-check-status">
                                    <span class="status-badge warning">Warning</span>
                                </div>
                            </div>
                            
                            <div class="health-check-item">
                                <div class="health-check-icon success">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <div class="health-check-content">
                                    <div class="health-check-title">SSL Certificates</div>
                                    <div class="health-check-description">All SSL certificates are valid and up to date</div>
                                    <div class="health-check-details">
                                        <span>Expires: 45 days</span>
                                        <span>Last Checked: 1 hour ago</span>
                                    </div>
                                </div>
                                <div class="health-check-status">
                                    <span class="status-badge success">Healthy</span>
                                </div>
                            </div>
                            
                            <div class="health-check-item">
                                <div class="health-check-icon success">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <div class="health-check-content">
                                    <div class="health-check-title">Backup Systems</div>
                                    <div class="health-check-description">Backup systems are operational and up to date</div>
                                    <div class="health-check-details">
                                        <span>Last Backup: 6 hours ago</span>
                                        <span>Size: 2.3GB</span>
                                    </div>
                                </div>
                                <div class="health-check-status">
                                    <span class="status-badge success">Healthy</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="maintenance-section">
                        <div class="section-header">
                            <h3>System Updates</h3>
                        </div>
                        
                        <div class="updates-grid">
                            <div class="update-card available">
                                <div class="update-header">
                                    <h4>Security Update</h4>
                                    <span class="update-badge critical">Critical</span>
                                </div>
                                <div class="update-content">
                                    <div class="update-version">Version 2.4.1</div>
                                    <div class="update-description">
                                        Critical security patches for authentication system
                                    </div>
                                    <div class="update-details">
                                        <span>Size: 45MB</span>
                                        <span>Est. Downtime: 15 minutes</span>
                                    </div>
                                </div>
                                <div class="update-actions">
                                    <button class="btn btn-sm btn-warning" onclick="adminPanel.installUpdate('security-2.4.1')">
                                        <i class="fas fa-download"></i> Install Now
                                    </button>
                                    <button class="btn btn-sm btn-secondary" onclick="adminPanel.scheduleUpdate('security-2.4.1')">
                                        <i class="fas fa-calendar"></i> Schedule
                                    </button>
                                </div>
                            </div>
                            
                            <div class="update-card available">
                                <div class="update-header">
                                    <h4>Feature Update</h4>
                                    <span class="update-badge low">Low Priority</span>
                                </div>
                                <div class="update-content">
                                    <div class="update-version">Version 2.5.0</div>
                                    <div class="update-description">
                                        New analytics features and performance improvements
                                    </div>
                                    <div class="update-details">
                                        <span>Size: 120MB</span>
                                        <span>Est. Downtime: 30 minutes</span>
                                    </div>
                                </div>
                                <div class="update-actions">
                                    <button class="btn btn-sm btn-primary" onclick="adminPanel.installUpdate('feature-2.5.0')">
                                        <i class="fas fa-download"></i> Install
                                    </button>
                                    <button class="btn btn-sm btn-secondary" onclick="adminPanel.scheduleUpdate('feature-2.5.0')">
                                        <i class="fas fa-calendar"></i> Schedule
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Additional stub methods for page data loading
    async loadTestsData() {
        this.currentTestsPage = 1;
        this.testsPerPage = 20;
        this.updateTestsStats();
        this.renderTestsTable();
    }
    
    async loadAnalyticsData() {
        this.updateAnalyticsSummary();
        this.initAnalyticsCharts();
    }
    
    async loadServersData() {
        this.updateServerMetrics();
        // Server data is already rendered in HTML
    }
    
    async loadMonitoringData() {
        this.initMonitoringCharts();
        this.startRealTimeMonitoring();
    }
    
    async loadLogsData() {
        this.loadSystemLogs();
    }
    
    async loadBackupData() {
        this.loadBackupStatus();
    }
    
    async loadSettingsData() {
        this.loadAppSettings();
    }
    
    async loadApiData() {
        this.loadApiManagement();
    }
    
    async loadMaintenanceData() {
        this.loadMaintenanceStatus();
    }

    // ========== TESTS MANAGEMENT FUNCTIONS ==========
    filterTests() {
        this.renderTestsTable();
    }

    sortTests(column) {
        // Implement sorting logic
        this.currentTestsSort = { column, direction: this.currentTestsSort?.column === column && this.currentTestsSort?.direction === 'asc' ? 'desc' : 'asc' };
        this.renderTestsTable();
    }

    renderTestsTable() {
        const tbody = document.querySelector('#testsTable tbody');
        if (!tbody) return;

        const filteredTests = this.getFilteredTests();
        const startIndex = (this.currentTestsPage - 1) * this.testsPerPage;
        const endIndex = startIndex + this.testsPerPage;
        const pageTests = filteredTests.slice(startIndex, endIndex);

        tbody.innerHTML = pageTests.map(test => {
            const user = this.users.find(u => u.id === test.userId);
            return `
                <tr>
                    <td><input type="checkbox" class="test-checkbox" data-test-id="${test.id}"></td>
                    <td>#${test.id}</td>
                    <td>
                        <div>
                            <div style="font-weight: 600;">${user ? user.name : 'Unknown User'}</div>
                            <div class="text-muted" style="font-size: 0.85rem;">ID: ${test.userId}</div>
                        </div>
                    </td>
                    <td>
                        <div style="font-weight: 600; color: ${this.getSpeedColor(test.downloadSpeed)};">
                            ${test.downloadSpeed} Mbps
                        </div>
                    </td>
                    <td>
                        <div style="font-weight: 600; color: ${this.getSpeedColor(test.uploadSpeed)};">
                            ${test.uploadSpeed} Mbps
                        </div>
                    </td>
                    <td>
                        <div style="font-weight: 600; color: ${this.getPingColor(test.ping)};">
                            ${test.ping} ms
                        </div>
                    </td>
                    <td>${test.location}</td>
                    <td>${this.formatTimeAgo(test.timestamp)}</td>
                    <td>
                        <div class="d-flex gap-sm">
                            <button class="btn-icon" onclick="adminPanel.viewTestDetails(${test.id})" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon" onclick="adminPanel.exportTestData(${test.id})" title="Export">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="btn-icon" onclick="adminPanel.deleteTest(${test.id})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        this.updateTestsPagination(filteredTests.length);
    }

    getFilteredTests() {
        let filtered = [...this.tests];
        
        const searchTerm = document.getElementById('testSearch')?.value.toLowerCase() || '';
        const dateFilter = document.getElementById('testDateFilter')?.value || '';
        const speedFilter = document.getElementById('testSpeedFilter')?.value || '';
        
        if (searchTerm) {
            filtered = filtered.filter(test => 
                test.id.toString().includes(searchTerm) ||
                test.location.toLowerCase().includes(searchTerm) ||
                test.server.toLowerCase().includes(searchTerm)
            );
        }
        
        if (dateFilter) {
            const now = new Date();
            let cutoffDate = new Date();
            
            switch(dateFilter) {
                case 'today':
                    cutoffDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    cutoffDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    cutoffDate.setMonth(now.getMonth() - 1);
                    break;
                case '3months':
                    cutoffDate.setMonth(now.getMonth() - 3);
                    break;
            }
            
            filtered = filtered.filter(test => new Date(test.timestamp) >= cutoffDate);
        }
        
        if (speedFilter) {
            filtered = filtered.filter(test => {
                const speed = parseFloat(test.downloadSpeed);
                switch(speedFilter) {
                    case 'slow': return speed < 25;
                    case 'medium': return speed >= 25 && speed < 100;
                    case 'fast': return speed >= 100;
                    default: return true;
                }
            });
        }
        
        return filtered;
    }

    updateTestsStats() {
        const tests = this.getFilteredTests();
        
        document.getElementById('totalTestsCount').textContent = this.formatNumber(tests.length);
        
        const avgDownload = tests.reduce((sum, test) => sum + parseFloat(test.downloadSpeed), 0) / tests.length;
        document.getElementById('avgDownloadSpeed').textContent = `${avgDownload.toFixed(1)} Mbps`;
        
        const avgUpload = tests.reduce((sum, test) => sum + parseFloat(test.uploadSpeed), 0) / tests.length;
        document.getElementById('avgUploadSpeed').textContent = `${avgUpload.toFixed(1)} Mbps`;
        
        const avgPing = tests.reduce((sum, test) => sum + parseFloat(test.ping), 0) / tests.length;
        document.getElementById('avgPingTime').textContent = `${avgPing.toFixed(1)} ms`;
    }

    updateTestsPagination(totalTests) {
        const totalPages = Math.ceil(totalTests / this.testsPerPage);
        const pageInfo = document.getElementById('testsPageInfo');
        const pageControls = document.getElementById('testsPageControls');
        
        if (pageInfo) {
            const start = (this.currentTestsPage - 1) * this.testsPerPage + 1;
            const end = Math.min(this.currentTestsPage * this.testsPerPage, totalTests);
            pageInfo.textContent = `Showing ${start}-${end} of ${totalTests} tests`;
        }
        
        if (pageControls) {
            pageControls.innerHTML = this.generatePaginationControls(this.currentTestsPage, totalPages, 'Tests');
        }
    }

    generatePaginationControls(currentPage, totalPages, type) {
        let html = `
            <button class="btn-icon" ${currentPage === 1 ? 'disabled' : ''} onclick="adminPanel.changePage${type}(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
            <span class="page-numbers">
        `;
        
        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="adminPanel.changePage${type}(${i})">${i}</button>`;
        }
        
        html += `
            </span>
            <button class="btn-icon" ${currentPage === totalPages ? 'disabled' : ''} onclick="adminPanel.changePage${type}(${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        return html;
    }

    changePageTests(page) {
        this.currentTestsPage = page;
        this.renderTestsTable();
    }

    toggleAllTests(checked) {
        document.querySelectorAll('.test-checkbox').forEach(checkbox => {
            checkbox.checked = checked;
        });
    }

    exportTests() {
        const selectedTests = this.getSelectedTests();
        const dataToExport = selectedTests.length > 0 ? selectedTests : this.getFilteredTests();
        
        const csv = this.convertToCSV(dataToExport, ['id', 'userId', 'downloadSpeed', 'uploadSpeed', 'ping', 'jitter', 'location', 'timestamp']);
        this.downloadFile(csv, 'speed-tests-export.csv', 'text/csv');
        
        this.showNotification(`Exported ${dataToExport.length} tests`, 'success');
    }

    getSelectedTests() {
        const selectedIds = Array.from(document.querySelectorAll('.test-checkbox:checked'))
            .map(cb => parseInt(cb.dataset.testId));
        
        return this.tests.filter(t => selectedIds.includes(t.id));
    }

    bulkDeleteTests() {
        const selectedTests = this.getSelectedTests();
        if (selectedTests.length === 0) {
            this.showNotification('No tests selected', 'warning');
            return;
        }
        
        if (confirm(`Are you sure you want to delete ${selectedTests.length} tests?`)) {
            const selectedIds = selectedTests.map(t => t.id);
            this.tests = this.tests.filter(t => !selectedIds.includes(t.id));
            this.renderTestsTable();
            this.showNotification(`Deleted ${selectedTests.length} tests`, 'success');
        }
    }

    viewTestDetails(testId) {
        const test = this.tests.find(t => t.id === testId);
        if (test) {
            this.showNotification(`Viewing test details for test #${testId}`, 'info');
            // In a real app, this would open a detailed modal
        }
    }

    exportTestData(testId) {
        const test = this.tests.find(t => t.id === testId);
        if (test) {
            const json = JSON.stringify(test, null, 2);
            this.downloadFile(json, `test-${testId}-data.json`, 'application/json');
            this.showNotification(`Exported test #${testId} data`, 'success');
        }
    }

    deleteTest(testId) {
        if (confirm('Are you sure you want to delete this test?')) {
            this.tests = this.tests.filter(t => t.id !== testId);
            this.renderTestsTable();
            this.showNotification('Test deleted successfully', 'success');
        }
    }

    generateTestReport() {
        const tests = this.getFilteredTests();
        const report = {
            generatedAt: new Date().toISOString(),
            totalTests: tests.length,
            avgDownloadSpeed: tests.reduce((sum, test) => sum + parseFloat(test.downloadSpeed), 0) / tests.length,
            avgUploadSpeed: tests.reduce((sum, test) => sum + parseFloat(test.uploadSpeed), 0) / tests.length,
            avgPing: tests.reduce((sum, test) => sum + parseFloat(test.ping), 0) / tests.length,
            tests: tests
        };
        
        const json = JSON.stringify(report, null, 2);
        this.downloadFile(json, `speed-tests-report-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
        this.showNotification('Test report generated successfully', 'success');
    }

    clearOldTests() {
        if (confirm('Are you sure you want to clear tests older than 90 days?')) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 90);
            
            const initialCount = this.tests.length;
            this.tests = this.tests.filter(test => new Date(test.timestamp) >= cutoffDate);
            const deletedCount = initialCount - this.tests.length;
            
            this.renderTestsTable();
            this.showNotification(`Cleared ${deletedCount} old tests`, 'success');
        }
    }

    // ========== ANALYTICS FUNCTIONS ==========
    updateAnalyticsSummary() {
        const period = document.getElementById('analyticsTimePeriod')?.value || '30d';
        const filteredTests = this.getAnalyticsTests(period);
        
        document.getElementById('totalAnalyticsTests').textContent = this.formatNumber(filteredTests.length);
        document.getElementById('testsChange').textContent = '+12.5%';
        
        const activeUsers = new Set(filteredTests.map(t => t.userId)).size;
        document.getElementById('activeUsers').textContent = this.formatNumber(activeUsers);
        document.getElementById('usersChange').textContent = '+8.3%';
        
        const avgSpeed = filteredTests.reduce((sum, test) => sum + parseFloat(test.downloadSpeed), 0) / filteredTests.length;
        document.getElementById('avgSpeedAnalytics').textContent = avgSpeed.toFixed(1);
        document.getElementById('speedChange').textContent = '+5.7%';
        
        const regions = new Set(filteredTests.map(t => t.location.split(',')[1]?.trim() || 'Unknown')).size;
        document.getElementById('regionsCount').textContent = regions;
        document.getElementById('regionsChange').textContent = '+2';
    }

    getAnalyticsTests(period) {
        const now = new Date();
        const cutoffDate = new Date();
        
        switch(period) {
            case '7d':
                cutoffDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                cutoffDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                cutoffDate.setDate(now.getDate() - 90);
                break;
            case '1y':
                cutoffDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                return this.tests;
        }
        
        return this.tests.filter(test => new Date(test.timestamp) >= cutoffDate);
    }

    initAnalyticsCharts() {
        this.initSpeedTrendsChart();
        this.initUserGrowthChart();
        this.initPeakUsageChart();
        this.initConnectionTypesChart();
    }

    initSpeedTrendsChart() {
        const ctx = document.getElementById('speedTrendsChart');
        if (!ctx) return;
        
        const data = this.generateSpeedTrendsData();
        
        this.charts.speedTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Download Speed',
                        data: data.download,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Upload Speed',
                        data: data.upload,
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        title: {
                            display: true,
                            text: 'Speed (Mbps)'
                        }
                    }
                }
            }
        });
    }

    generateSpeedTrendsData() {
        const days = 30;
        const labels = [];
        const download = [];
        const upload = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            download.push(Math.floor(Math.random() * 50) + 50);
            upload.push(Math.floor(Math.random() * 20) + 20);
        }
        
        return { labels, download, upload };
    }

    // ========== SERVER MANAGEMENT FUNCTIONS ==========
    updateServerMetrics() {
        // Server metrics are already displayed in the HTML
        // In a real app, these would be updated from server data
    }

    filterServers() {
        // Implement server filtering
        this.showNotification('Server filtering applied', 'info');
    }

    addNewServer() {
        this.showNotification('Add new server dialog would open here', 'info');
    }

    serverMaintenance() {
        this.showNotification('Server maintenance mode activated', 'warning');
    }

    refreshAllServers() {
        this.showLoading();
        setTimeout(() => {
            this.hideLoading();
            this.showNotification('All servers refreshed successfully', 'success');
        }, 2000);
    }

    monitorServer(serverId) {
        this.showNotification(`Opening monitoring for server: ${serverId}`, 'info');
    }

    configureServer(serverId) {
        this.showNotification(`Opening configuration for server: ${serverId}`, 'info');
    }

    restartServer(serverId) {
        if (confirm(`Are you sure you want to restart server ${serverId}?`)) {
            this.showNotification(`Restarting server: ${serverId}`, 'warning');
        }
    }

    viewServerLogs(serverId) {
        this.showNotification(`Opening logs for server: ${serverId}`, 'info');
    }

    // ========== MONITORING FUNCTIONS ==========
    initMonitoringCharts() {
        this.initCpuChart();
        this.initMemoryChart();
        this.initNetworkChart();
    }

    initCpuChart() {
        const ctx = document.getElementById('cpuChart');
        if (!ctx) return;
        
        this.charts.cpu = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(60),
                datasets: [
                    {
                        label: 'CPU Core 1',
                        data: this.generateRandomData(60, 40, 80),
                        borderColor: '#667eea',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.4
                    },
                    {
                        label: 'CPU Core 2',
                        data: this.generateRandomData(60, 30, 70),
                        borderColor: '#4CAF50',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    startRealTimeMonitoring() {
        setInterval(() => {
            if (this.currentPage === 'monitoring') {
                this.updateMonitoringCharts();
            }
        }, 10000);
    }

    updateMonitoringCharts() {
        if (this.charts.cpu) {
            this.charts.cpu.data.datasets[0].data.shift();
            this.charts.cpu.data.datasets[0].data.push(Math.random() * 40 + 40);
            this.charts.cpu.update('none');
        }
    }

    generateTimeLabels(count) {
        const labels = [];
        const now = new Date();
        
        for (let i = count - 1; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 10 * 1000);
            labels.push(time.toLocaleTimeString());
        }
        
        return labels;
    }

    generateRandomData(count, min, max) {
        return Array.from({length: count}, () => Math.random() * (max - min) + min);
    }

    // ========== UTILITY FUNCTIONS ==========
    getSpeedColor(speed) {
        const speedNum = parseFloat(speed);
        if (speedNum >= 100) return '#4CAF50';
        if (speedNum >= 50) return '#FF9800';
        return '#f44336';
    }

    getPingColor(ping) {
        const pingNum = parseFloat(ping);
        if (pingNum <= 30) return '#4CAF50';
        if (pingNum <= 100) return '#FF9800';
        return '#f44336';
    }

    updateAnalytics() {
        this.updateAnalyticsSummary();
        this.initAnalyticsCharts();
    }

    configureAnalytics() {
        this.showNotification('Analytics configuration panel would open here', 'info');
    }

    exportAnalyticsReport() {
        const report = {
            generatedAt: new Date().toISOString(),
            period: document.getElementById('analyticsTimePeriod')?.value || '30d',
            summary: {
                totalTests: document.getElementById('totalAnalyticsTests')?.textContent,
                activeUsers: document.getElementById('activeUsers')?.textContent,
                avgSpeed: document.getElementById('avgSpeedAnalytics')?.textContent,
                regions: document.getElementById('regionsCount')?.textContent
            }
        };
        
        const json = JSON.stringify(report, null, 2);
        this.downloadFile(json, `analytics-report-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
        this.showNotification('Analytics report exported successfully', 'success');
    }

    scheduleReport() {
        this.showNotification('Report scheduling dialog would open here', 'info');
    }

    fullscreenChart(chartId) {
        this.showNotification(`Fullscreen view for ${chartId} would open here`, 'info');
    }

    exportMapData() {
        this.showNotification('Map data exported successfully', 'success');
    }

    // Additional monitoring functions
    configureAlerts() {
        this.showNotification('Alert configuration panel would open here', 'info');
    }

    viewSystemLogs() {
        this.showNotification('System logs viewer would open here', 'info');
    }

    refreshMonitoring() {
        this.showLoading();
        setTimeout(() => {
            this.hideLoading();
            this.showNotification('Monitoring data refreshed', 'success');
        }, 1000);
    }

    updateMonitoringInterval() {
        const interval = document.getElementById('monitoringInterval')?.value;
        this.showNotification(`Monitoring interval updated to ${interval} seconds`, 'success');
    }

    updateMonitoringRange() {
        const range = document.getElementById('monitoringTimeRange')?.value;
        this.showNotification(`Time range updated to ${range}`, 'success');
    }

    toggleAutoRefresh() {
        const enabled = document.getElementById('autoRefresh')?.checked;
        this.showNotification(`Auto refresh ${enabled ? 'enabled' : 'disabled'}`, 'info');
    }

    optimizeDatabase() {
        if (confirm('Are you sure you want to optimize the database? This may take several minutes.')) {
            this.showLoading();
            setTimeout(() => {
                this.hideLoading();
                this.showNotification('Database optimization completed', 'success');
            }, 3000);
        }
    }

    viewDbStats() {
        this.showNotification('Detailed database statistics would open here', 'info');
    }

    acknowledgeAlert(alertId) {
        this.showNotification(`Alert ${alertId} acknowledged`, 'success');
    }

    // ========== LOGS PAGE FUNCTIONS ==========
    loadSystemLogs() {
        // Logs are already rendered in HTML
        this.showNotification('System logs loaded', 'info');
    }

    filterLogs() {
        this.showNotification('Logs filtered based on current criteria', 'info');
    }

    clearLogs() {
        if (confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
            this.showNotification('Logs cleared successfully', 'success');
        }
    }

    downloadLogs() {
        this.showNotification('Downloading system logs...', 'info');
        // Simulate download
        setTimeout(() => {
            this.showNotification('Logs downloaded successfully', 'success');
        }, 2000);
    }

    refreshLogs() {
        this.showLoading();
        setTimeout(() => {
            this.hideLoading();
            this.showNotification('Logs refreshed', 'success');
        }, 1000);
    }

    expandLogEntry(button) {
        const expanded = button.parentNode.querySelector('.log-expanded');
        const icon = button.querySelector('i');
        
        if (expanded.style.display === 'none') {
            expanded.style.display = 'block';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            button.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Details';
        } else {
            expanded.style.display = 'none';
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
            button.innerHTML = '<i class="fas fa-chevron-down"></i> Show Details';
        }
    }

    // ========== BACKUP PAGE FUNCTIONS ==========
    loadBackupStatus() {
        // Backup status is already rendered in HTML
        this.showNotification('Backup status loaded', 'info');
    }

    configureBackup() {
        this.showNotification('Backup configuration panel would open here', 'info');
    }

    runBackupNow() {
        if (confirm('Are you sure you want to start a backup now? This may impact system performance.')) {
            this.showLoading();
            this.showNotification('Backup started...', 'info');
            
            setTimeout(() => {
                this.hideLoading();
                this.showNotification('Backup completed successfully', 'success');
            }, 5000);
        }
    }

    restoreFromBackup() {
        if (confirm('WARNING: Restoring from backup will overwrite current data. Are you sure?')) {
            this.showNotification('Restore from backup dialog would open here', 'warning');
        }
    }

    cleanupOldBackups() {
        if (confirm('Are you sure you want to cleanup old backups? This will free up storage space.')) {
            this.showLoading();
            setTimeout(() => {
                this.hideLoading();
                this.showNotification('Old backups cleaned up successfully', 'success');
            }, 3000);
        }
    }

    exportBackupReport() {
        const report = {
            generatedAt: new Date().toISOString(),
            lastBackup: '2025-08-05 02:30:00',
            backupSize: '2.3 GB',
            status: 'Success',
            nextScheduled: '2025-08-06 02:30:00'
        };
        
        const json = JSON.stringify(report, null, 2);
        this.downloadFile(json, `backup-report-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
        this.showNotification('Backup report exported successfully', 'success');
    }

    // ========== SETTINGS PAGE FUNCTIONS ==========
    loadAppSettings() {
        // Settings are already rendered in HTML
        this.showNotification('Application settings loaded', 'info');
    }

    switchSettingsTab(tabName, button) {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        
        // Add active class to selected tab
        button.classList.add('active');
        document.getElementById(`${tabName}-settings`).classList.add('active');
    }

    saveSettings() {
        this.showLoading();
        
        // Simulate saving settings
        setTimeout(() => {
            this.hideLoading();
            this.showNotification('Settings saved successfully', 'success');
        }, 2000);
    }

    resetToDefaults() {
        if (confirm('Are you sure you want to reset all settings to default values?')) {
            this.showLoading();
            setTimeout(() => {
                this.hideLoading();
                this.showNotification('Settings reset to defaults', 'success');
            }, 1500);
        }
    }

    exportSettings() {
        const settings = {
            general: {
                appName: document.getElementById('appName')?.value || 'Speed Lens',
                defaultLanguage: document.getElementById('defaultLanguage')?.value || 'en',
                timezone: document.getElementById('timezone')?.value || 'UTC',
                theme: document.getElementById('theme')?.value || 'dark'
            },
            speedTest: {
                testDuration: document.getElementById('testDuration')?.value || 30,
                maxConcurrentTests: document.getElementById('maxConcurrentTests')?.value || 100,
                autoSelectServer: document.getElementById('autoSelectServer')?.checked || true,
                storeTestHistory: document.getElementById('storeTestHistory')?.checked || true
            },
            exportedAt: new Date().toISOString()
        };
        
        const json = JSON.stringify(settings, null, 2);
        this.downloadFile(json, `speedlens-settings-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
        this.showNotification('Settings exported successfully', 'success');
    }

    // ========== API MANAGEMENT FUNCTIONS ==========
    loadApiManagement() {
        // API data is already rendered in HTML
        this.showNotification('API management data loaded', 'info');
    }

    createApiKey() {
        this.showNotification('Create API key dialog would open here', 'info');
    }

    viewApiDocs() {
        this.showNotification('Opening API documentation...', 'info');
        // In a real app, this would open the API docs
    }

    refreshApiStats() {
        this.showLoading();
        setTimeout(() => {
            this.hideLoading();
            this.showNotification('API statistics refreshed', 'success');
        }, 1000);
    }

    copyApiKey(key) {
        navigator.clipboard.writeText(key).then(() => {
            this.showNotification('API key copied to clipboard', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy API key', 'error');
        });
    }

    editApiKey(keyId) {
        this.showNotification(`Edit API key ${keyId} dialog would open here`, 'info');
    }

    regenerateApiKey(keyId) {
        if (confirm('Are you sure you want to regenerate this API key? The old key will be invalidated.')) {
            this.showNotification(`API key ${keyId} regenerated successfully`, 'success');
        }
    }

    revokeApiKey(keyId) {
        if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
            this.showNotification(`API key ${keyId} revoked successfully`, 'warning');
        }
    }

    revokeExpiredKeys() {
        if (confirm('Are you sure you want to revoke all expired API keys?')) {
            this.showNotification('Expired API keys revoked successfully', 'success');
        }
    }

    exportApiKeys() {
        const apiData = {
            exportedAt: new Date().toISOString(),
            totalKeys: 12,
            activeKeys: 11,
            totalRequests: 2847
        };
        
        const json = JSON.stringify(apiData, null, 2);
        this.downloadFile(json, `api-keys-report-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
        this.showNotification('API keys report exported', 'success');
    }

    // ========== MAINTENANCE PAGE FUNCTIONS ==========
    loadMaintenanceStatus() {
        // Maintenance data is already rendered in HTML
        this.showNotification('Maintenance status loaded', 'info');
    }

    scheduleMaintenance() {
        this.showNotification('Schedule maintenance dialog would open here', 'info');
    }

    enableMaintenanceMode() {
        if (confirm('Are you sure you want to enable maintenance mode? This will make the application unavailable to users.')) {
            this.showNotification('Maintenance mode enabled', 'warning');
        }
    }

    runSystemCheck() {
        this.showLoading();
        this.showNotification('Running comprehensive system check...', 'info');
        
        setTimeout(() => {
            this.hideLoading();
            this.showNotification('System check completed - all systems healthy', 'success');
        }, 4000);
    }

    clearCaches() {
        this.showLoading();
        setTimeout(() => {
            this.hideLoading();
            this.showNotification('All caches cleared successfully', 'success');
        }, 2000);
    }

    restartServices() {
        if (confirm('Are you sure you want to restart all services? This may cause temporary downtime.')) {
            this.showLoading();
            this.showNotification('Restarting services...', 'warning');
            
            setTimeout(() => {
                this.hideLoading();
                this.showNotification('All services restarted successfully', 'success');
            }, 10000);
        }
    }

    updateSystem() {
        if (confirm('Are you sure you want to update the system? This may require downtime.')) {
            this.showLoading();
            this.showNotification('System update started...', 'info');
            
            setTimeout(() => {
                this.hideLoading();
                this.showNotification('System updated successfully', 'success');
            }, 15000);
        }
    }

    addMaintenanceWindow() {
        this.showNotification('Add maintenance window dialog would open here', 'info');
    }

    editMaintenance(maintId) {
        this.showNotification(`Edit maintenance ${maintId} dialog would open here`, 'info');
    }

    cancelMaintenance(maintId) {
        if (confirm('Are you sure you want to cancel this scheduled maintenance?')) {
            this.showNotification(`Maintenance ${maintId} cancelled`, 'warning');
        }
    }

    viewMaintenanceReport(maintId) {
        this.showNotification(`Viewing maintenance report for ${maintId}`, 'info');
    }

    downloadHealthReport() {
        const healthReport = {
            generatedAt: new Date().toISOString(),
            overallStatus: 'Healthy',
            checks: {
                database: { status: 'Healthy', responseTime: '23ms' },
                apiEndpoints: { status: 'Healthy', successRate: '99.8%' },
                memoryUsage: { status: 'Warning', usage: '82%' },
                sslCertificates: { status: 'Healthy', expires: '45 days' },
                backupSystems: { status: 'Healthy', lastBackup: '6 hours ago' }
            }
        };
        
        const json = JSON.stringify(healthReport, null, 2);
        this.downloadFile(json, `health-report-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
        this.showNotification('Health report downloaded', 'success');
    }

    installUpdate(updateId) {
        if (confirm(`Are you sure you want to install ${updateId}? This may require system downtime.`)) {
            this.showLoading();
            this.showNotification(`Installing ${updateId}...`, 'info');
            
            setTimeout(() => {
                this.hideLoading();
                this.showNotification(`${updateId} installed successfully`, 'success');
            }, 8000);
        }
    }

    scheduleUpdate(updateId) {
        this.showNotification(`Schedule ${updateId} installation dialog would open here`, 'info');
    }

    // ========== ADDITIONAL CHART INITIALIZATIONS ==========
    initPeakUsageChart() {
        const ctx = document.getElementById('peakUsageChart');
        if (!ctx) return;
        
        const data = this.generatePeakUsageData();
        
        this.charts.peakUsage = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Tests per Hour',
                    data: data.values,
                    backgroundColor: 'rgba(102, 126, 234, 0.6)',
                    borderColor: '#667eea',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Hour of Day'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Tests'
                        }
                    }
                }
            }
        });
    }

    initConnectionTypesChart() {
        const ctx = document.getElementById('connectionTypesChart');
        if (!ctx) return;
        
        this.charts.connectionTypes = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Fiber', 'Cable', 'DSL', 'Mobile', 'Satellite', 'Other'],
                datasets: [{
                    data: [45, 25, 15, 10, 3, 2],
                    backgroundColor: [
                        '#667eea',
                        '#4CAF50',
                        '#FF9800',
                        '#2196F3',
                        '#9C27B0',
                        '#f44336'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    generatePeakUsageData() {
        const labels = [];
        const values = [];
        
        for (let i = 0; i < 24; i++) {
            labels.push(`${i}:00`);
            // Simulate peak hours (higher usage during business hours)
            if (i >= 9 && i <= 17) {
                values.push(Math.floor(Math.random() * 200) + 300);
            } else if (i >= 19 && i <= 22) {
                values.push(Math.floor(Math.random() * 150) + 200);
            } else {
                values.push(Math.floor(Math.random() * 100) + 50);
            }
        }
        
        return { labels, values };
    }

    initUserGrowthChart() {
        const ctx = document.getElementById('userGrowthChart');
        if (!ctx) return;
        
        const data = this.generateUserGrowthData();
        
        this.charts.userGrowth = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'New Users',
                        data: data.newUsers,
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Total Users',
                        data: data.totalUsers,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });
    }

    generateUserGrowthData() {
        const days = 30;
        const labels = [];
        const newUsers = [];
        const totalUsers = [];
        let runningTotal = 1000;
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            const dailyNew = Math.floor(Math.random() * 30) + 10;
            newUsers.push(dailyNew);
            runningTotal += dailyNew;
            totalUsers.push(runningTotal);
        }
        
        return { labels, newUsers, totalUsers };
    }

    initMemoryChart() {
        const ctx = document.getElementById('memoryChart');
        if (!ctx) return;
        
        this.charts.memory = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(60),
                datasets: [{
                    label: 'Memory Usage',
                    data: this.generateRandomData(60, 60, 85),
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    initNetworkChart() {
        const ctx = document.getElementById('networkChart');
        if (!ctx) return;
        
        this.charts.network = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(60),
                datasets: [
                    {
                        label: 'Incoming',
                        data: this.generateRandomData(60, 500, 1500),
                        borderColor: '#667eea',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.4
                    },
                    {
                        label: 'Outgoing',
                        data: this.generateRandomData(60, 200, 800),
                        borderColor: '#FF9800',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + ' KB/s';
                            }
                        }
                    }
                }
            }
        });
    }
}

// Add badge styles dynamically
const badgeStyles = document.createElement('style');
badgeStyles.textContent = `
    .badge {
        display: inline-block;
        padding: 4px 8px;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: 12px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }
    
    .badge-success {
        background: rgba(76, 175, 80, 0.1);
        color: #2E7D32;
        border: 1px solid rgba(76, 175, 80, 0.3);
    }
    
    .badge-danger {
        background: rgba(244, 67, 54, 0.1);
        color: #C62828;
        border: 1px solid rgba(244, 67, 54, 0.3);
    }
    
    .badge-warning {
        background: rgba(255, 193, 7, 0.1);
        color: #F57C00;
        border: 1px solid rgba(255, 193, 7, 0.3);
    }
    
    .badge-info {
        background: rgba(33, 150, 243, 0.1);
        color: #1565C0;
        border: 1px solid rgba(33, 150, 243, 0.3);
    }
    
    .badge-secondary {
        background: rgba(108, 117, 125, 0.1);
        color: #495057;
        border: 1px solid rgba(108, 117, 125, 0.3);
    }
    
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
`;
document.head.appendChild(badgeStyles);

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});

// Handle browser back/forward navigation
window.addEventListener('popstate', (e) => {
    const page = e.state?.page || 'dashboard';
    window.adminPanel?.navigateToPage(page);
});
