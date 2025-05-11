import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:8080"); // Replace with your WebSocket server URL

const testSubscribe = () => {
  ws.addEventListener("open", () => {
    const payload = {
      apiKey: "b2b690098747cdfb707825b8cb729624791dad1f", // Replace with your actual API key
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
    apiKey: "b2b690098747cdfb707825b8cb729624791dad1f", // Replace with your actual API key
    method: "unsubscribeTrade", //unsubscribeTrade
    unsubscribeId, //account or token to unsubscribe
  };
  ws.send(JSON.stringify(payload));
}

testSubscribe();
// testUnsubscribe();