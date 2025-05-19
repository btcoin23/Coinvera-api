import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:8080"); // Replace with your WebSocket server URL

const testSubscribe = () => {
  ws.addEventListener("open", () => {
    const payload = {
      apiKey: "4265f8c42ba4daf900da3cad5d12d124946d7588", // Replace with your actual API key
      // method: "subscribePrice", //subscribeTrade
      method: "subscribeTrade", //subscribeTrade
      tokens: ["3aAbAGx2Hebip2bcqyAS5RnKwmUiaUsTiMExteQwpump"], //account or token to be watched
    };
    ws.send(JSON.stringify(payload));
  });
  
  ws.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    console.log("Received:", message);
    
    // Check if the message contains an subscribeId after 20s
    const unsubscribeId = message.subscribeId;
    if(unsubscribeId){
      setTimeout(() => {
        testUnsubscribe(unsubscribeId)
      }, 20 * 1000);
    }
  });
}

const testUnsubscribe = (unsubscribeId: number) => {
  const payload = {
    apiKey: "4265f8c42ba4daf900da3cad5d12d124946d7588", // Replace with your actual API key
    // method: "unsubscribePrice", //unsubscribeTrade
    method: "unsubscribeTrade", //unsubscribeTrade
    unsubscribeId, //account or token to unsubscribe
  };
  ws.send(JSON.stringify(payload));
}

testSubscribe();
// testUnsubscribe();