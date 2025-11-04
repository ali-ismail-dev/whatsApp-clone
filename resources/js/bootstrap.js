import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally — Echo's Reverb connector expects a
// Pusher-compatible client to be present (options.client, options.Pusher,
// or window.Pusher).
window.Pusher = Pusher;
// Initialize Echo for Laravel Reverb (WebSocket) broadcaster
window.Echo = new Echo({
	broadcaster: 'reverb',
	key: import.meta.env.VITE_REVERB_APP_KEY || 'local',
	wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
	wsPort: import.meta.env.VITE_REVERB_PORT ? Number(import.meta.env.VITE_REVERB_PORT) : 8080,
	wssPort: import.meta.env.VITE_REVERB_PORT ? Number(import.meta.env.VITE_REVERB_PORT) : 8080,
	forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
	enabledTransports: ['ws', 'wss'],
	scheme: import.meta.env.VITE_REVERB_SCHEME || 'http',
});
