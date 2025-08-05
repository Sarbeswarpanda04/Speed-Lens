const CACHE_NAME = 'network-speed-tracker-v1';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './manifest.json'
];

// External resources to cache with fallback
const externalResources = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async (cache) => {
                console.log('Opened cache');
                
                // Cache local resources first
                await cache.addAll(urlsToCache);
                
                // Try to cache external resources, but don't fail if they can't be cached
                const externalPromises = externalResources.map(async (url) => {
                    try {
                        await cache.add(url);
                        console.log('Cached external resource:', url);
                    } catch (error) {
                        console.warn('Failed to cache external resource:', url, error);
                    }
                });
                
                await Promise.allSettled(externalPromises);
                return true;
            })
    );
});

// Fetch event - serve cached content when offline with network-first strategy
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests and non-GET requests
    if (!event.request.url.startsWith(self.location.origin) && 
        !event.request.url.includes('fonts.googleapis.com') &&
        !event.request.url.includes('cdnjs.cloudflare.com')) {
        return;
    }
    
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        // Network first, then cache strategy for better mobile performance
        fetch(event.request)
            .then((response) => {
                // If network request is successful, update cache and return response
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // If network fails, try to serve from cache
                return caches.match(event.request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        
                        // If no cached version, return offline page for HTML requests
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return new Response(`
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <title>Offline - Speed Lens</title>
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <style>
                                        body { 
                                            font-family: Arial, sans-serif; 
                                            text-align: center; 
                                            padding: 20px;
                                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                            color: white;
                                            min-height: 100vh;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            flex-direction: column;
                                        }
                                        .offline-content {
                                            background: rgba(255,255,255,0.1);
                                            padding: 40px;
                                            border-radius: 20px;
                                            backdrop-filter: blur(10px);
                                        }
                                        button {
                                            background: #4CAF50;
                                            color: white;
                                            border: none;
                                            padding: 15px 30px;
                                            border-radius: 25px;
                                            font-size: 16px;
                                            cursor: pointer;
                                            margin-top: 20px;
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="offline-content">
                                        <h1>📡 You're Offline</h1>
                                        <p>Speed Lens requires an internet connection to perform speed tests.</p>
                                        <p>Please check your connection and try again.</p>
                                        <button onclick="window.location.reload()">Retry</button>
                                    </div>
                                </body>
                                </html>
                            `, {
                                headers: { 'Content-Type': 'text/html' }
                            });
                        }
                        
                        // For other requests, return a generic offline response
                        return new Response('Offline', { status: 503 });
                    });
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync for speed tests
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        // Check if the app is running and perform background tasks
        const clients = await self.clients.matchAll();
        if (clients.length > 0) {
            // Send message to active clients
            clients.forEach(client => {
                client.postMessage({
                    type: 'BACKGROUND_SYNC',
                    data: 'Background sync completed'
                });
            });
        }
        console.log('Background sync completed');
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Periodic background sync for mobile devices
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'speed-test-reminder') {
        event.waitUntil(sendSpeedTestReminder());
    }
});

async function sendSpeedTestReminder() {
    const options = {
        body: 'Time for your regular speed test!',
        icon: './favicon.ico',
        badge: './favicon.ico',
        vibrate: [200, 100, 200],
        tag: 'speed-test-reminder',
        requireInteraction: false,
        actions: [
            {
                action: 'test-now',
                title: 'Test Now'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };

    return self.registration.showNotification('Speed Lens', options);
}

// Push notifications with better mobile support
self.addEventListener('push', (event) => {
    let options = {
        body: 'Speed test reminder',
        icon: './favicon.ico',
        badge: './favicon.ico',
        vibrate: [100, 50, 100],
        tag: 'speed-tracker',
        requireInteraction: false,
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
            url: './'
        },
        actions: [
            {
                action: 'test-speed',
                title: 'Test Speed Now',
                icon: './favicon.ico'
            },
            {
                action: 'close',
                title: 'Close',
                icon: './favicon.ico'
            }
        ]
    };

    // Handle push data if available
    if (event.data) {
        try {
            const data = event.data.json();
            options.body = data.body || options.body;
            options.title = data.title || 'Speed Lens';
        } catch (e) {
            options.body = event.data.text() || options.body;
        }
    }

    event.waitUntil(
        self.registration.showNotification('Speed Lens', options)
    );
});

// Handle notification clicks with better mobile navigation
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const action = event.action;
    const url = event.notification.data?.url || './';

    if (action === 'test-speed' || !action) {
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then((clientList) => {
                    // If the app is already open, focus it
                    for (let client of clientList) {
                        if (client.url.includes(url) && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    
                    // If not open, open new window/tab
                    if (clients.openWindow) {
                        return clients.openWindow(url);
                    }
                })
        );
    }
});
