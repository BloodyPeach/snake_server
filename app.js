
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const snakes = [];
const foods = [];

// WebSocket server logic

wss.on('connection', (ws) => {
    // Handle new player connection
    const snake = new Snake(); // Assuming Snake class is available globally
    const food = new Food(); // Assuming Food class is available globally
    snakes.push(snake);
    foods.push(food);

    // Send initial game state to the new player
    ws.send(JSON.stringify({ type: 'init', snake: snake.body, food: food.position }));

    // Handle player input
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        const { direction } = data;
        snake.direction = direction;
    });

    // Handle player disconnection
    ws.on('close', () => {
        const index = snakes.indexOf(snake);
        if (index !== -1) {
            snakes.splice(index, 1);
            foods.splice(index, 1);
        }
    });
});

// Game loop to update state and send updates to clients

setInterval(() => {
    snakes.forEach((snake, index) => {
        snake.move();
        snake.checkCollision();
        
        const head = snake.body[0];

        // Check collision with food
        if (head.x === foods[index].position.x && head.y === foods[index].position.y) {
            snake.grow();
            foods[index].generate();
        }
    });

    // Broadcast game state to all connected players
    const gameState = { type: 'update', snakes: snakes.map(snake => snake.body), foods: foods.map(food => food.position) };
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(gameState));
        }
    });
}, 200); // Adjust the interval based on the desired game speed

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});

