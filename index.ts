import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { get_price, get_trend, should_i_buy } from "./agent.js";

const server = new McpServer({
  name: "NSE Stock Tools",
  version: "1.0.0",
  description: "Tools for interacting with NSE stock data",
  capabilities: {
    resources: {},
    tools: {},
    sampling: {}
  },
});

server.tool(
  "get_price",
  "Get the latest price of a stock",
  {
    symbol: z.string().describe("Stock symbol (e.g. INFY, TCS, RELIANCE)"),
  },
  get_price,
);

server.tool(
  "get_trend",
  "Get the stock price trend over given days (default 30)",
  {
    symbol: z.string().describe("Stock symbol (e.g. INFY, TCS, RELIANCE)"),
    days: z.number().optional().describe("Number of days for the trend (default 30)"),
  },
  get_trend,
);

server.tool(
  "should_i_buy",
  "Should I buy this stock? (based on recent trend)",
  {
    symbol: z.string().describe("Stock symbol (e.g. INFY, TCS, RELIANCE)"),
  },
  should_i_buy,
);

// async function main() {
//   const transport = new StdioServerTransport();
//   await server.connect(transport);
//   console.error("NSE Stock Tools MCP Server running on stdio");
// }

// main().catch((error) => {
//   console.error("Fatal error in main():", error);
//   process.exit(1);
// });

const app = express();
const transports: { [sessionId: string]: SSEServerTransport } = {};

app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  transports[transport.sessionId] = transport;

  console.log("SSE session started:", transport.sessionId);

  res.on("close", () => {
    console.log(" SSE session closed:", transport.sessionId);
    delete transports[transport.sessionId];
  });

  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];

  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send("No transport found for sessionId");
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
});