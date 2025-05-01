import { PlanLimit } from "../config";
import User from "../models/User";
import { getTokenInfo } from "../router";

type SubToken = {
  ca: string;
  intervalId: number;
};

const wssClientsList = new Map<
  number,
  {
    ws: WebSocket;
    subTokens: SubToken[];
  }
>();

const subscribePrice = async (data: any, clientId: number, ws: WebSocket) => {
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

    wssClientsList.get(clientId)!.subTokens.push(
      ...data.tokens.map((ca: string) => ({
        ca,
        intervalId: subscribeTrading(ca, ws),
      }))
    );
    ws.send(
      JSON.stringify({
        type: "subscribePrice",
        status: "success",
        tokens: data.tokens,
      })
    );
  } else throw new Error("Invalid tokens format");
}

const unsubscribePrice = async (data: any, clientId: number, ws: WebSocket) => {
  const apiKey = data.apiKey;
  if(!apiKey) 
    throw new Error("API key is required");
  const user = await User.findOne({ "plan.apiKey": apiKey });
  if (!user) 
    throw new Error("Invalid API key");
  if (Array.isArray(data.tokens)) {
    if (data.tokens.length <= 0) 
      throw new Error("No tokens provided");
    wssClientsList.get(clientId)!.subTokens = wssClientsList
      .get(clientId)!
      .subTokens.filter((subToken) => {
        if (data.tokens.includes(subToken.ca))
          clearInterval(subToken.intervalId);
        else return subToken;
      });
    ws.send(
      JSON.stringify({
        type: "unsubscribePrice",
        status: "success",
        tokens: data.tokens,
      })
    );
  } else {
    wssClientsList.get(clientId)!.subTokens = [];
    ws.send(
      JSON.stringify({
        type: "unsubscribePrice",
        status: "success",
      })
    );
  }
}

export const wssHandler = (ws: WebSocket) => {
  const clientId = Date.now();
  console.log("Client connected, id:", clientId);
  wssClientsList.set(clientId, {
    ws,
    subTokens: [],
  });

  ws.onmessage = async (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data as string);
      // Handle different message types
      switch (data.method) {
        case "subscribePrice":
          await subscribePrice(data, clientId, ws);
          break;

        case "unsubscribePrice":
          await unsubscribePrice(data, clientId, ws);
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
    wssClientsList.get(clientId)!.subTokens.forEach((subToken) => {
      clearInterval(subToken.intervalId);
    });
    wssClientsList.delete(clientId);
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    ws.close();
  };
};

const subscribeTrading = (ca: string, clientWss: WebSocket) => {
  return setInterval(async() => {
    try{
      const result = await getTokenInfo(ca);
      clientWss.send(JSON.stringify(result));
    }catch(error){
      clientWss.send(JSON.stringify({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Error while processing request",
      }));
    }
  }, 2 * 1000);
};
