// Responsive enhancements and performance optimizations
(function() {
    'use strict';
    
    // Responsive breakpoint management
    const breakpoints = {
        mobile: 768,
        tablet: 1024,
        desktop: 1440
    };
    
    let currentBreakpoint = '';
    
    function getCurrentBreakpoint() {
        const width = window.innerWidth;
        if (width < breakpoints.mobile) return 'mobile';
        if (width < breakpoints.tablet) return 'tablet';
        if (width < breakpoints.desktop) return 'desktop';
        return 'wide';
    }
    
    function updateBreakpoint() {
        const newBreakpoint = getCurrentBreakpoint();
        if (newBreakpoint !== currentBreakpoint) {
            document.documentElement.setAttribute('data-breakpoint', newBreakpoint);
            currentBreakpoint = newBreakpoint;
            
            // Trigger custom event for other scripts
            window.dispatchEvent(new CustomEvent('breakpointChange', {
                detail: { breakpoint: newBreakpoint }
            }));
        }
    }
    
    // Enhanced viewport height fix for mobile
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    // Performance-optimized resize handler
    let resizeTimer;
    function handleResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateBreakpoint();
            setViewportHeight();
        }, 150);
    }
    
    // Touch gesture enhancements
    function enhanceTouchInteractions() {
        const resultItems = document.querySelectorAll('.result-item');
        
        resultItems.forEach(item => {
            let touchStartY = 0;
            let touchStartTime = 0;
            
            item.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
                touchStartTime = Date.now();
                item.classList.add('touching');
            }, { passive: true });
            
            item.addEventListener('touchend', (e) => {
                const touchEndY = e.changedTouches[0].clientY;
                const touchDuration = Date.now() - touchStartTime;
                const touchDistance = Math.abs(touchEndY - touchStartY);
                
                item.classList.remove('touching');
                
                // If it's a tap (short duration, minimal movement)
                if (touchDuration < 200 && touchDistance < 10) {
                    item.classList.add('tapped');
                    setTimeout(() => item.classList.remove('tapped'), 200);
                }
            }, { passive: true });
            
            item.addEventListener('touchcancel', () => {
                item.classList.remove('touching');
            }, { passive: true });
        });
    }
    
    // Intersection Observer for performance
    function setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });
            
            document.querySelectorAll('.result-item').forEach(item => {
                observer.observe(item);
            });
        }
    }
    
    // Enhanced scroll performance
    function optimizeScrolling() {
        let ticking = false;
        
        function updateScrollState() {
            const scrollTop = window.pageYOffset;
            document.documentElement.style.setProperty('--scroll-y', `${scrollTop}px`);
            ticking = false;
        }
        
        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(updateScrollState);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', onScroll, { passive: true });
    }
    
    // Container query polyfill for older browsers
    function containerQueryPolyfill() {
        if (!window.CSS || !window.CSS.supports || !window.CSS.supports('container-type: inline-size')) {
            const resultsContainer = document.querySelector('.results-container');
            if (resultsContainer) {
                function updateContainerClass() {
                    const width = resultsContainer.offsetWidth;
                    resultsContainer.className = resultsContainer.className.replace(/container-\w+/g, '');
                    
                    if (width < 768) {
                        resultsContainer.classList.add('container-small');
                    } else if (width < 1024) {
                        resultsContainer.classList.add('container-medium');
                    } else {
                        resultsContainer.classList.add('container-large');
                    }
                }
                
                window.addEventListener('resize', updateContainerClass);
                updateContainerClass();
            }
        }
    }
    
    // Prefers-reduced-motion handling
    function handleReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        function setReducedMotion(mediaQuery) {
            if (mediaQuery.matches) {
                document.documentElement.classList.add('reduce-motion');
            } else {
                document.documentElement.classList.remove('reduce-motion');
            }
        }
        
        setReducedMotion(prefersReducedMotion);
        prefersReducedMotion.addEventListener('change', setReducedMotion);
    }
    
    // Hardware acceleration management
    function manageHardwareAcceleration() {
        const acceleratedElements = document.querySelectorAll('.result-item');
        
        acceleratedElements.forEach(element => {
            element.addEventListener('transitionend', () => {
                if (!element.matches(':hover')) {
                    element.style.willChange = 'auto';
                }
            });
            
            element.addEventListener('mouseenter', () => {
                element.style.willChange = 'transform';
            });
            
            element.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    if (!element.matches(':hover')) {
                        element.style.willChange = 'auto';
                    }
                }, 300);
            });
        });
    }
    
    // Enhanced keyboard navigation
    function enhanceKeyboardNavigation() {
        const resultItems = document.querySelectorAll('.result-item');
        const recommendationItems = document.querySelectorAll('.recommendation-item');
        
        [...resultItems, ...recommendationItems].forEach((item, index) => {
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            
            if (item.classList.contains('result-item')) {
                item.setAttribute('aria-label', `View details for ${item.querySelector('.result-label')?.textContent || 'result'}`);
            } else if (item.classList.contains('recommendation-item')) {
                item.setAttribute('aria-label', `Recommendation: ${item.querySelector('h4')?.textContent || 'recommendation'}`);
            }
            
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const allItems = [...resultItems, ...recommendationItems];
                    const currentIndex = allItems.indexOf(item);
                    const nextIndex = (currentIndex + 1) % allItems.length;
                    allItems[nextIndex].focus();
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const allItems = [...resultItems, ...recommendationItems];
                    const currentIndex = allItems.indexOf(item);
                    const prevIndex = (currentIndex - 1 + allItems.length) % allItems.length;
                    allItems[prevIndex].focus();
                }
            });
        });
    }
    
    // Enhanced recommendations animations
    function enhanceRecommendationsAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    
                    if (target.classList.contains('recommendations') || target.classList.contains('recommendations-container')) {
                        target.classList.add('show');
                    }
                    
                    if (target.classList.contains('recommendation-item')) {
                        const delay = Array.from(target.parentNode.children).indexOf(target) * 100;
                        setTimeout(() => {
                            target.style.opacity = '1';
                            target.style.transform = 'translateY(0)';
                        }, delay);
                    }
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        document.querySelectorAll('.recommendations, .recommendations-container, .recommendation-item').forEach(item => {
            if (item.classList.contains('recommendation-item')) {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            }
            observer.observe(item);
        });
    }
    
    // Network-based optimizations
    function optimizeForNetwork() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                document.documentElement.classList.add('slow-connection');
                // Disable non-essential animations
                document.documentElement.classList.add('reduce-motion');
            }
            
            connection.addEventListener('change', () => {
                if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                    document.documentElement.classList.add('slow-connection');
                } else {
                    document.documentElement.classList.remove('slow-connection');
                }
            });
        }
    }
    
    // Initialize all enhancements
    function init() {
        updateBreakpoint();
        setViewportHeight();
        enhanceTouchInteractions();
        setupIntersectionObserver();
        optimizeScrolling();
        containerQueryPolyfill();
        handleReducedMotion();
        manageHardwareAcceleration();
        enhanceKeyboardNavigation();
        enhanceRecommendationsAnimations();
        optimizeForNetwork();
        
        // Event listeners
        window.addEventListener('resize', handleResize, { passive: true });
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                setViewportHeight();
                updateBreakpoint();
            }, 100);
        }, { passive: true });
        
        // Mark as initialized
        document.documentElement.classList.add('responsive-enhanced');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Export for other scripts if needed
    window.ResponsiveEnhancements = {
        getCurrentBreakpoint,
        updateBreakpoint,
        setViewportHeight
    };
    
})();
