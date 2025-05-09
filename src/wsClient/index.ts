import { PlanLimit } from "../config";
import User from "../models/User";
import { subscribeTrading, unsubscribeTrading } from "./subscribeTrading";

type Tsubscription = {
  subscribeId: number;
  tokens: string[];
  stream: any;
};

const wssClientsList = new Map<
  number,
  {
    ws: WebSocket;
    tSubscriptions: Tsubscription[];
  }
>();

const subscribeTrade = async (data: any, clientId: number, ws: WebSocket) => {
  const apiKey = data.apiKey;
  if(!apiKey) 
    throw new Error("API key is required");
  const user = await User.findOne({ "plan.apiKey": apiKey });
  if (!user) 
    throw new Error("Invalid API key");
  if (Array.isArray(data.tokens)) {
    if (data.tokens.length <= 0) 
      throw new Error("No tokens provided");
    if (data.tokens.length > PlanLimit[(user as User).plan.level].wssBatch)
      throw new Error("Exceeded token limit for this plan");

    const subscribeId = Date.now();
    wssClientsList.get(clientId)!.tSubscriptions.push(
      {
        subscribeId,
        tokens: data.tokens,
        stream: subscribeTrading(data.tokens, ws),
      }
    );
    ws.send(
      JSON.stringify({
        type: "subscribeTrade",
        status: "success",
        tokens: data.tokens,
        subscribeId,
      })
    );
  } else throw new Error("Invalid tokens format");
}

const unsubscribeTrade = async (data: any, clientId: number, ws: WebSocket) => {
  const apiKey = data.apiKey;
  if(!apiKey) 
    throw new Error("API key is required");
  const unSubscribeId = data.unSubscribeId;
  if(!unSubscribeId) 
    throw new Error("UnsubscribeId is required");
  const user = await User.findOne({ "plan.apiKey": apiKey });
  if (!user) 
    throw new Error("Invalid API key");
  // if (Array.isArray(data.tokens)) {
    if (data.tokens.length <= 0) 
      throw new Error("No tokens provided");
    wssClientsList.get(clientId)!.tSubscriptions = wssClientsList
      .get(clientId)!
      .tSubscriptions.filter((_tsubscription) => {
        if (_tsubscription.subscribeId === unSubscribeId)
          unsubscribeTrading(_tsubscription.stream);
        else return _tsubscription;
      });
    ws.send(
      JSON.stringify({
        type: "unsubscribeTrade",
        status: "success",
        tokens: data.tokens,
        unSubscribeId,
      })
    );
  // } else {
  //   wssClientsList.get(clientId)!.tSubscriptions = [];
  //   ws.send(
  //     JSON.stringify({
  //       type: "unsubscribeTrade",
  //       status: "success",
  //     })
  //   );
  // }
}

export const wssHandler = (ws: WebSocket) => {
  const clientId = Date.now();
  console.log("Client connected, id:", clientId);
  wssClientsList.set(clientId, {
    ws,
    tSubscriptions: [],
  });

  ws.onmessage = async (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data as string);
      // Handle different message types
      switch (data.method) {
        case "subscribeTrade":
          await subscribeTrade(data, clientId, ws);
          break;

        case "unsubscribeTrade":
          await unsubscribeTrade(data, clientId, ws);
          break;
        default:
          throw new Error("Unknown method");
      }
    } catch (error) {
      ws.send(
        JSON.stringify({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Error while processing request",
        })
      );
    }
  };

  ws.onopen = () => {
    console.log("WebSocket connection opened", clientId);
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed", clientId);
    wssClientsList.get(clientId)!.tSubscriptions.forEach((subToken) => {
      clearInterval(subToken.subscribeId);
    });
    wssClientsList.delete(clientId);
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    ws.close();
  };
};

// const subscribeTrading = (ca: string, clientWss: WebSocket) => {
//   return setInterval(async() => {
//     try{
//       const result = await getTokenInfo(ca);
//       clientWss.send(JSON.stringify(result));
//     }catch(error){
//       clientWss.send(JSON.stringify({
//         type: "error",
//         message:
//           error instanceof Error
//             ? error.message
//             : "Error while processing request",
//       }));
//     }
//   }, 2 * 1000);
// };
