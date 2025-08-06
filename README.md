# NSE Stock Tools MCP Server

This is an MCP (Model Context Protocol) server that provides tools for interacting with NSE (National Stock Exchange of India) stock data.

## Installation

To set up the project, clone the repository and install the dependencies:

```bash
npm install
```

## Building the Project

To compile the TypeScript code, use the build script:

```bash
npm run build
```

This will output the compiled JavaScript files to the `dist` directory.

## Running the Server

You do not need to run the server, simply point the client to the binary generated at dist/index.js

## Connecting to the Server

To connect to this MCP server from clients like Claude, you can use the following command:

```bash
npx nse-mcp
```

## Available Tools

This server exposes the following tools:

### `get_price`

Get the latest price of a stock.

**Input Schema:**
```json
{
  "symbol": "string" // Stock symbol (e.g. INFY, TCS, RELIANCE)
}
```

**Example Usage (via MCP CLI):**
```bash
mcp-cli call get_price '{"symbol": "INFY"}'
```

### `get_trend`

Get the stock price trend over a given number of days (default 30).

**Input Schema:**
```json
{
  "symbol": "string", // Stock symbol (e.g. INFY, TCS, RELIANCE)
  "days": "number" // Optional: Number of days for the trend (default 30)
}
```

**Example Usage (via MCP CLI):**
```bash
mcp-cli call get_trend '{"symbol": "TCS", "days": 60}'
```

### `should_i_buy`

Provides advice on whether to buy a stock based on its recent trend.

**Input Schema:**
```json
{
  "symbol": "string" // Stock symbol (e.g. INFY, TCS, RELIANCE)
}
```

**Example Usage (via MCP CLI):**
```bash
mcp-cli call should_i_buy '{"symbol": "RELIANCE"}'
```
