import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:8080"); // Replace with your WebSocket server URL

const testSubscribe = () => {
  ws.addEventListener("open", () => {
    const payload = {
      apiKey: "15111b24be6f5e9d2d311ffc597641ec71f1d1d9", // Replace with your actual API key
      method: "subscribePrice", //subscribeTrade
      tokens: ["BKdY9X6u9hucgaXbuZ8vVgLvRhPVjT27jrxix7J4pump", "3kBEZJLh8oCFApS3vqkgun3V9ronYh1J8EKzrksT6VEb"], //account or token to be watched
    };
    ws.send(JSON.stringify(payload));
  });
  
  ws.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    console.log("Received:", message);
  });
}

const testUnsubscribe = () => {
  const payload = {
    apiKey: "15111b24be6f5e9d2d311ffc597641ec71f1d1d9", // Replace with your actual API key
    method: "unsubscribePrice", //unsubscribeTrade
    unsubscribeId: 1354861354861, //account or token to unsubscribe
  };
  ws.send(JSON.stringify(payload));
}

testSubscribe();
// testUnsubscribe();