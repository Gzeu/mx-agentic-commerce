import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import OpenAI from "openai";
import dotenv from "dotenv";
import { fetchWithx402 } from "./protocols/x402_client.js";
import { UserSigner } from "@multiversx/sdk-wallet";
import fs from "fs";

dotenv.config();

// Load OpenAI Config
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Load Agent's Blockchain Identity
const pemText = fs.readFileSync(process.env.AGENT_WALLET_PEM || "./agent.pem", { encoding: "utf8" });
const agentSigner = UserSigner.fromPem(pemText);
const agentAddress = agentSigner.getAddress().bech32();

async function main() {
  console.log(`Starting SYNDICATE Agent. Identity: ${agentAddress}`);

  // 1. Initialize MCP Client to talk to the local MCP Server
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["ts-node", "../mcp-server/src/index.ts"]
  });

  const mcpClient = new Client(
    { name: "syndicate-orchestrator", version: "1.0.0" },
    { capabilities: { prompts: {}, resources: {}, tools: {} } }
  );

  await mcpClient.connect(transport);
  
  // 2. Fetch available tools from the MultiversX MCP Server
  const toolsResponse = await mcpClient.listTools();
  const tools = toolsResponse.tools;

  // Map MCP tools to OpenAI function calling schema
  const openAITools = tools.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: "object",
        properties: tool.inputSchema.properties,
        required: Object.keys(tool.inputSchema.properties || {}),
      },
    },
  }));

  const userPrompt = "Caută-mi cel mai bine plătit quest de tip RESEARCH și acceptă-l. Dacă trebuie să cauți date pe un API plătit cu x402, folosește-l.";
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { 
        role: "system", 
        content: `You are an autonomous AI agent in the SYNDICATE protocol on MultiversX.
        You have access to on-chain tools via the MCP Server.
        Your EGLD Address is ${agentAddress}.
        Whenever you need to accept a quest, use the prepare_accept_quest tool and pass your address.`
    },
    { role: "user", content: userPrompt }
  ];

  console.log(`[User]: ${userPrompt}\n`);

  // 3. Agentic Loop
  let isDone = false;
  while (!isDone) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      tools: openAITools,
      tool_choice: "auto",
    });

    const responseMessage = response.choices[0].message;
    messages.push(responseMessage);

    // If the LLM decided to call a tool
    if (responseMessage.tool_calls) {
      for (const toolCall of responseMessage.tool_calls) {
        console.log(`[Agent Calling Tool]: ${toolCall.function.name}(${toolCall.function.arguments})`);
        
        // Execute the tool via MCP
        const toolResult = await mcpClient.callTool({
          name: toolCall.function.name,
          arguments: JSON.parse(toolCall.function.arguments),
        });

        const content = toolResult.content[0].type === "text" 
            ? toolResult.content[0].text 
            : JSON.stringify(toolResult.content);

        console.log(`[Tool Result]: ${content}`);

        // Pass result back to LLM
        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: toolCall.function.name,
          content: content,
        });
      }
    } else {
      // No more tool calls, we have the final answer
      console.log(`[Agent Final Response]: ${responseMessage.content}`);
      isDone = true;
    }
  }
  
  // Optional: Demonstrate x402 Micropayment execution
  console.log("\n--- Simulating x402 HTTP external fetch ---");
  try {
     const data = await fetchWithx402("https://api.external-research.com/v1/data", agentSigner);
     console.log("[x402 Result]:", data);
  } catch (err: any) {
     console.error("[x402 Simulation Ended]:", err.message);
  }
}

main().catch(console.error);