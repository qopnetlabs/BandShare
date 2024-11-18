const express = require('express');
const cors = require('cors');
const http = require('http');
const si = require('systeminformation');
const socketIo = require('socket.io');

const port = process.env.PORT || 3000;  // Use Replit-assigned port or fallback
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Enable CORS
app.use(cors());
app.use(express.json());

// Static Files
app.use(express.static('public'));

// Variables
let bandwidthUsed = 0;
let tokens = 0;
let previousBytes = 0;
let networkData = [];

// Conversion factor
const MB_TO_TOKENS = 0.01;

// Calculate bandwidth and emit updates
async function calculateBandwidth() {
    try {
        const netStats = await si.networkStats();
        const currentBytes = netStats[0]?.rx_bytes || 0;

        const bandwidthThisInterval = (currentBytes - previousBytes) / 1024 / 1024;
        if (bandwidthThisInterval > 0) {
            bandwidthUsed += bandwidthThisInterval;
            tokens = Math.floor(bandwidthUsed * MB_TO_TOKENS);
        }
        previousBytes = currentBytes;

        // Update networkData
        const time = new Date().toLocaleTimeString();
        networkData.push({ time, bandwidth: bandwidthThisInterval });
        if (networkData.length > 10) networkData.shift();

        // Emit data
        const updateData = { bandwidthUsed, tokens, networkData };
        io.emit('update', updateData);
        console.log('Emitted data:', updateData);
    } catch (error) {
        console.error('Error calculating bandwidth:', error);
    }
}

// WebSocket setup
io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('disconnect', () => console.log('Client disconnected'));
});

// Start the interval
setInterval(calculateBandwidth, 5000);

// Start server
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
