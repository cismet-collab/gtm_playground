/* Simple overlay static server
   - Serves base from dev-deployment/
   - Overrides only the /dev path from local/dev/
   - PORT configurable via env
   - BASE (deployment directory) configurable via env DEPLOY_DIR (default: dev-deployment)
*/

const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 4201;
const DEPLOY_DIR = process.env.DEPLOY_DIR || 'dev-deployment'; // or 'live-deployment'
const VSCODE_PROXY_URI = process.env.VSCODE_PROXY_URI;

const app = express();

const BASE_DIR = path.join(__dirname, DEPLOY_DIR);
const DEV_OVERRIDE_DIR = path.join(__dirname, 'local', 'dev');

// Serve overrides for only /dev path first
app.use('/dev', express.static(DEV_OVERRIDE_DIR, {
    etag: false,
    lastModified: false,
    cacheControl: false,
    maxAge: 0,
    fallthrough: true,
}));

// Serve the rest from the base deployment
app.use(express.static(BASE_DIR, {
    extensions: ['html'],
    etag: false,
    lastModified: false,
    cacheControl: false,
    maxAge: 0,
}));

// Shareable startup helper: append configServer derived from current public URL and redirect
app.get('/startupForLocalDevelopment', (_req, res) => {
    res.sendFile(path.join(__dirname, 'local', 'startup.html'));
});

// SPA fallback to the base index.html (safe for hash routing too)
app.get('*', (_req, res) => {
    res.sendFile(path.join(BASE_DIR, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Serving from: ${BASE_DIR}`);

    if (VSCODE_PROXY_URI) {
        const baseUrl = VSCODE_PROXY_URI.replace('{{port}}', PORT);
        console.log("\n\n\n\n\n🚨🚨🚨 use this url 👇 for local development: ")
        console.log(`External URL: ${baseUrl}startupForLocalDevelopment`);
      } else {
        console.log(`Local URL: http://localhost:${PORT}/startupForLocalDevelopment`);
      }
});
