import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "node:fs";

import { UserSigner } from "@multiversx/sdk-wallet";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const pemPath = process.env.AGENT_WALLET_PEM ?? "./agent.pem";
const pemText = fs.readFileSync(pemPath, "utf8");
const signer = UserSigner.fromPem(pemText);
const agentAddress = signer.getAddress().bech32();

type MCPTool = {
  name: string;
  description?: string;
  inputSchema?: any; // JSON Schema
};

function mcpToolToOpenAITool(tool: MCPTool) {
  return {
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description ?? "",
      parameters: tool.inputSchema ?? { type: "object", properties: {} },
    },
  };
}

async function main() {
  const userPrompt =
    process.argv.slice(2).join(" ").trim() ||
    "Caută-mi cel mai bine plătit quest de tip RESEARCH și acceptă-l.";

  // Start MCP server as a subprocess (stdio transport)
  const transport = new StdioClientTransport({
    command: "node",
    args: ["../mcp-server/dist/index.js"], // ruleaza build-ul direct
  });

  const mcp = new Client(
    { name: "syndicate-agent", version: "1.0.0" },
    { capabilities: { tools: {}, resources: {}, prompts: {} } }
  );

  await mcp.connect(transport);

  const { tools } = await mcp.listTools();
  const openAITools = (tools as MCPTool[]).map(mcpToolToOpenAITool);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        `Ești un agent SYNDICATE pe MultiversX.\n` +
        `Adresa ta: ${agentAddress}\n` +
        `Folosește tool-urile MCP pentru citire on-chain și prepare tx.\n` +
        `Când accepți un quest, apelează prepare_accept_quest cu agentAddress=${agentAddress}, apoi explică user-ului ce tx trebuie semnat și trimis.`,
    },
    { role: "user", content: userPrompt },
  ];

  while (true) {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      tools: openAITools,
      tool_choice: "auto",
    });

    const msg = resp.choices[0]?.message;
    if (!msg) throw new Error("No model message");

    messages.push(msg);

    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      process.stdout.write((msg.content ?? "").trim() + "\n");
      break;
    }

    for (const call of msg.tool_calls) {
      const toolName = call.function.name;
      const toolArgs = JSON.parse(call.function.arguments || "{}");

      const toolResult = await mcp.callTool({ name: toolName, arguments: toolArgs });

      const asText =
        toolResult.content?.[0]?.type === "text"
          ? toolResult.content[0].text
          : JSON.stringify(toolResult.content);

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        name: toolName,
        content: asText,
      });
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
