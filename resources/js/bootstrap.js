import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally — Echo's Reverb connector expects a
// Pusher-compatible client to be present (options.client, options.Pusher,
// or window.Pusher).
window.Pusher = Pusher;

// Sanitize environment-supplied host/port values (remove surrounding quotes
// if the .env contains quoted strings). This guards against accidental
// quoting which breaks WebSocket host resolution in some setups.
const rawHost = import.meta.env.VITE_REVERB_HOST || window.location.hostname;
const wsHost = typeof rawHost === 'string' ? rawHost.replace(/^\"?(.*?)\"?$/,'$1') : rawHost;
const rawPort = import.meta.env.VITE_REVERB_PORT;
const wsPort = rawPort ? Number(String(rawPort).replace(/^\"?(.*?)\"?$/,'$1')) : 8080;
const rawScheme = import.meta.env.VITE_REVERB_SCHEME || 'http';
const scheme = typeof rawScheme === 'string' ? rawScheme.replace(/^\"?(.*?)\"?$/,'$1') : rawScheme;

// Helpful debug output in dev — will show the host/port/key Echo will try to
// connect to. Remove or silence in production.
if (import.meta.env.DEV) {
	// eslint-disable-next-line no-console
	console.debug('Echo (Reverb) config:', { wsHost, wsPort, scheme, key: import.meta.env.VITE_REVERB_APP_KEY });
}

// Initialize Echo for Laravel Reverb (WebSocket) broadcaster
window.Echo = new Echo({
	broadcaster: 'reverb',
	key: import.meta.env.VITE_REVERB_APP_KEY || 'local',
	wsHost,
	wsPort,
	wssPort: wsPort,
	forceTLS: scheme === 'https',
	enabledTransports: ['ws', 'wss'],
	scheme,
});
