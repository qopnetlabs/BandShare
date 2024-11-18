const socket = io(); // Dynamically connect to WebSocket server
let bandwidthUsed = 0;
let tokens = 0;
let networkData = [];

const bandwidthElement = document.getElementById('bandwidth');
const tokensElement = document.getElementById('tokens');

const ctx = document.getElementById('networkGraph').getContext('2d');
const networkGraph = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Bandwidth Usage (MB)',
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false
        }]
    },
    options: {
        scales: {
            y: { beginAtZero: true }
        }
    }
});

socket.on('connect', () => console.log('Connected to WebSocket server'));
socket.on('disconnect', () => console.warn('Disconnected from WebSocket server'));

socket.on('update', (data) => {
    console.log('Received data:', data);
    bandwidthUsed = data.bandwidthUsed;
    tokens = data.tokens;
    networkData = data.networkData;

    updateUI();
    updateGraph();
});

function updateUI() {
    bandwidthElement.textContent = bandwidthUsed.toFixed(2);
    tokensElement.textContent = tokens;
}

function updateGraph() {
    if (networkData.length === 0) return;

    const times = networkData.map(entry => entry.time);
    const bandwidths = networkData.map(entry => entry.bandwidth);

    networkGraph.data.labels = times;
    networkGraph.data.datasets[0].data = bandwidths;
    networkGraph.update();
}
