import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "mcp-excel-server",
  version: "1.0.0"
});

// Add an addition tool
server.registerTool("add",
  {
    title: "Addition Tool",
    description: "Add two numbers",
    inputSchema: { a: z.number(), b: z.number() }
  },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }]
  })
);

// Add a dynamic greeting resource
server.registerResource(
  "excel",
  new ResourceTemplate("excel://{name}", { list: undefined }),
  { 
    title: "Excel Resource",      // Display name for UI
    description: "Dynamic Excel generator"
  },
  async (uri, { name }) => ({
    contents: [{
      uri: uri.href,
      text: `Excel file for ${name}`
    }]
  })
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
//await server.connect(transport);      <<<<<<<<<