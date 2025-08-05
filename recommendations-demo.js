// Enhanced Smart Recommendations Demo
// This demonstrates the improved recommendations functionality

function createEnhancedRecommendation(type, priority, title, description, actions = []) {
    return `
        <div class="recommendation-item ${type}" data-priority="${priority}">
            <div class="recommendation-icon ${type}">
                <i class="fas ${getIconForType(type)}"></i>
            </div>
            <div class="recommendation-content">
                <h4>${title}</h4>
                <p>${description}</p>
                ${actions.length > 0 ? `
                    <div class="recommendation-actions">
                        ${actions.map(action => `
                            <button class="recommendation-btn ${action.type}" onclick="${action.onclick}">
                                <i class="fas ${action.icon}"></i>
                                ${action.text}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="priority-badge ${priority}">${priority.toUpperCase()}</div>
        </div>
    `;
}

function getIconForType(type) {
    const icons = {
        'urgent': 'fa-exclamation-triangle',
        'warning': 'fa-exclamation-circle',
        'error': 'fa-times-circle',
        'success': 'fa-check-circle',
        'info': 'fa-info-circle'
    };
    return icons[type] || 'fa-lightbulb';
}

// Sample recommendations data
const sampleRecommendations = [
    {
        type: 'urgent',
        priority: 'high',
        title: 'Low Upload Speed Detected',
        description: 'Your upload speed is below 10 Mbps. This may affect video calls and file uploads.',
        actions: [
            { type: 'primary', text: 'Run Diagnostic', icon: 'fa-stethoscope', onclick: 'runDiagnostic()' },
            { type: 'secondary', text: 'Learn More', icon: 'fa-info', onclick: 'showUploadInfo()' }
        ]
    },
    {
        type: 'warning',
        priority: 'medium',
        title: 'High Latency',
        description: 'Your ping is over 100ms. This may cause issues with online gaming and video calls.',
        actions: [
            { type: 'primary', text: 'Optimize Connection', icon: 'fa-tools', onclick: 'optimizeConnection()' }
        ]
    },
    {
        type: 'info',
        priority: 'low',
        title: 'Network Jitter Detected',
        description: 'Network jitter is high. This can cause unstable connections for real-time applications.',
        actions: [
            { type: 'secondary', text: 'View Details', icon: 'fa-chart-line', onclick: 'showJitterDetails()' }
        ]
    },
    {
        type: 'success',
        priority: 'low',
        title: 'Excellent Connection Quality',
        description: 'Your connection is performing well for all online activities.',
        actions: []
    }
];

// Function to render enhanced recommendations
function renderEnhancedRecommendations(container, recommendations) {
    const recommendationsHTML = recommendations.map(rec => 
        createEnhancedRecommendation(rec.type, rec.priority, rec.title, rec.description, rec.actions)
    ).join('');
    
    container.innerHTML = `
        <div class="recommendation-list">
            ${recommendationsHTML}
        </div>
    `;
    
    // Trigger animations
    setTimeout(() => {
        container.classList.add('show');
    }, 100);
}

// Usage example:
// const container = document.getElementById('recommendationsContent');
// renderEnhancedRecommendations(container, sampleRecommendations);

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createEnhancedRecommendation,
        renderEnhancedRecommendations,
        sampleRecommendations
    };
}
