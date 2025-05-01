import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import http from 'http';
import WebSocket from "ws";
import { router } from './router';
import { wssHandler } from './wsClient';
import { initLogger } from './log/logger';
import { HTTP_PORT, MONGODB_URI, WSS_PORT } from './config';

// logger
initLogger()

// API routes
const app = express();
app.use(bodyParser.json());
app.use('/api/v1', router);

// Connect to MONGODB
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('- Connected to MongoDB');
})
.catch((error) => {
  console.error('- Error connecting to MongoDB:', error);
});

// Create HTTP server
app.listen(HTTP_PORT, () => {
  console.log(`- [ HTTP ] Server listening on port ${HTTP_PORT}`);
});

// Create WEBSOCKET server
const server = http.createServer();
const wss = new WebSocket.Server({ server });
wss.on("connection", wssHandler);
server.listen(WSS_PORT, () => {
  console.log("- [ WSS ] Server is running on port:", WSS_PORT);
});