import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("NSE Stock Tools MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});