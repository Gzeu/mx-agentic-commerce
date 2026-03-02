import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import {
  Address,
  Transaction,
  TransactionPayload,
} from "@multiversx/sdk-core";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";

const NETWORK_URL = process.env.MULTIVERSX_API_URL ?? "https://devnet-api.multiversx.com";
const CHAIN_ID = process.env.MULTIVERSX_CHAIN_ID ?? "D";

const QUEST_ENGINE_ADDRESS = process.env.QUEST_ENGINE_ADDRESS!;
const AGENT_IDENTITY_ADDRESS = process.env.AGENT_IDENTITY_ADDRESS!;

const provider = new ApiNetworkProvider(NETWORK_URL, { clientName: "syndicate-mcp" });

function requireEnv(name: string, value?: string): string {
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function encodeU64ToHex(value: number | bigint): string {
  const v = BigInt(value);
  if (v < 0n) throw new Error("u64 cannot be negative");
  const hex = v.toString(16);
  return hex.padStart(16, "0"); // 8 bytes => 16 hex chars
}

const toolSchemas = {
  get_quest_details: {
    type: "object",
    properties: {
      questId: { type: "integer", minimum: 0 },
    },
    required: ["questId"],
    additionalProperties: false,
  },
  prepare_accept_quest: {
    type: "object",
    properties: {
      questId: { type: "integer", minimum: 0 },
      agentAddress: { type: "string", description: "erd1..." },
    },
    required: ["questId", "agentAddress"],
    additionalProperties: false,
  },
  get_agent_skills: {
    type: "object",
    properties: {
      agentAddress: { type: "string", description: "erd1..." },
    },
    required: ["agentAddress"],
    additionalProperties: false,
  },
} as const;

const server = new Server(
  { name: "syndicate-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_quest_details",
        description: "Read quest state from QuestEngine (view endpoint).",
        inputSchema: toolSchemas.get_quest_details,
      },
      {
        name: "prepare_accept_quest",
        description: "Prepare (unsigned) transaction fields for acceptQuest(questId).",
        inputSchema: toolSchemas.prepare_accept_quest,
      },
      {
        name: "get_agent_skills",
        description: "Read agent SBT skills from AgentIdentity (view endpoint).",
        inputSchema: toolSchemas.get_agent_skills,
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (!args) throw new Error("Missing arguments");

  // Validate required envs once we actually use them
  requireEnv("QUEST_ENGINE_ADDRESS", QUEST_ENGINE_ADDRESS);
  requireEnv("AGENT_IDENTITY_ADDRESS", AGENT_IDENTITY_ADDRESS);

  try {
    if (name === "get_quest_details") {
      const { questId } = args as { questId: number };

      const res = await provider.queryContract({
        address: Address.fromBech32(QUEST_ENGINE_ADDRESS),
        func: "getQuestDetails",
        args: [encodeU64ToHex(questId)],
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              ok: true,
              questId,
              // ReturnData is base64 array (network-provider behavior); return raw for now
              returnDataBase64: res.returnData ?? [],
              returnCode: res.returnCode,
              returnMessage: res.returnMessage,
            }),
          },
        ],
      };
    }

    if (name === "prepare_accept_quest") {
      const { questId, agentAddress } = args as { questId: number; agentAddress: string };

      const data = `acceptQuest@${encodeU64ToHex(questId)}`;

      // Note: we don't sign; we only prepare deterministic fields.
      // Nonce is intentionally omitted here (agent will fetch it before signing).
      const tx = new Transaction({
        sender: Address.fromBech32(agentAddress),
        receiver: Address.fromBech32(QUEST_ENGINE_ADDRESS),
        value: 0n,
        gasLimit: 8_000_000n,
        chainID: CHAIN_ID,
        data: new TransactionPayload(data),
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              ok: true,
              kind: "unsigned_tx",
              fields: {
                sender: agentAddress,
                receiver: QUEST_ENGINE_ADDRESS,
                value: "0",
                gasLimit: tx.getGasLimit().toString(),
                chainId: CHAIN_ID,
                data,
              },
            }),
          },
        ],
      };
    }

    if (name === "get_agent_skills") {
      const { agentAddress } = args as { agentAddress: string };

      const res = await provider.queryContract({
        address: Address.fromBech32(AGENT_IDENTITY_ADDRESS),
        func: "getAgentSkills",
        args: [Address.fromBech32(agentAddress).hex()],
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              ok: true,
              agentAddress,
              returnDataBase64: res.returnData ?? [],
              returnCode: res.returnCode,
              returnMessage: res.returnMessage,
            }),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: "text", text: `Tool error (${name}): ${error?.message ?? String(error)}` }],
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SYNDICATE MCP Server running on stdio");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
