import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  Address,
  SmartContractQueriesController,
  Transaction,
  TransactionPayload,
  AbiRegistry
} from "@multiversx/sdk-core";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";
import z from "zod";

// Constants
const NETWORK_URL = process.env.MULTIVERSX_NETWORK || "https://devnet-api.multiversx.com";
const provider = new ApiNetworkProvider(NETWORK_URL);
const queryController = new SmartContractQueriesController({ provider });

const QUEST_ENGINE_ADDRESS = process.env.QUEST_ENGINE_ADDRESS || "erd1qqqqqqqqqqqqqpgq...questengine";
const AGENT_IDENTITY_ADDRESS = process.env.AGENT_IDENTITY_ADDRESS || "erd1qqqqqqqqqqqqqpgq...agentidentity";

// Initialize MCP Server
const server = new Server(
  {
    name: "syndicate-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_quest_details",
        description: "Citește starea și detaliile unui quest de pe contractul QuestEngine de pe MultiversX.",
        inputSchema: z.object({
          questId: z.number().describe("ID-ul unic al quest-ului"),
        }),
      },
      {
        name: "prepare_accept_quest",
        description: "Generează payload-ul tranzacției necesare pentru a accepta un quest (fără să o semneze).",
        inputSchema: z.object({
          questId: z.number().describe("ID-ul unic al quest-ului"),
          agentAddress: z.string().describe("Adresa EGLD a agentului care acceptă quest-ul"),
        }),
      },
      {
        name: "get_agent_skills",
        description: "Citește tokenii SBT (Soulbound Tokens) asociați unui agent de pe contractul AgentIdentity, reprezentând skill-urile acestuia.",
        inputSchema: z.object({
          agentAddress: z.string().describe("Adresa EGLD a agentului"),
        }),
      }
    ],
  };
});

// Handle Tool Executions
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error("Missing arguments");
  }

  try {
    switch (name) {
      case "get_quest_details": {
        const { questId } = args as { questId: number };
        
        // Create an on-chain query to get quest info
        const query = queryController.createQuery({
            contract: QUEST_ENGINE_ADDRESS,
            function: "getQuestDetails",
            arguments: [questId.toString()],
        });
        
        const response = await queryController.runQuery(query);
        // In production, we would use AbiRegistry to parse the response
        // For this MVP, we return the raw base64/hex data directly
        return {
          content: [{ type: "text", text: JSON.stringify({
            status: "success",
            network: NETWORK_URL,
            questId,
            returnData: response.returnData.map(d => Buffer.from(d, 'base64').toString('hex'))
          })}]
        };
      }

      case "prepare_accept_quest": {
        const { questId, agentAddress } = args as { questId: number, agentAddress: string };
        
        // The function name on the SC to accept a quest
        const scFunc = "acceptQuest";
        // Format argument as hex
        const questIdHex = questId.toString(16).padStart(8, '0');
        
        const payload = new TransactionPayload(`${scFunc}@${questIdHex}`);
        
        // Prepare a raw transaction object
        const tx = new Transaction({
            data: payload,
            gasLimit: 5000000n,
            sender: agentAddress,
            receiver: QUEST_ENGINE_ADDRESS,
            value: 0n,
            chainID: "D" // Devnet ID, or '1' for mainnet
        });

        return {
          content: [{ type: "text", text: JSON.stringify({
            status: "prepared",
            receiver: QUEST_ENGINE_ADDRESS,
            data: payload.toString(),
            gasLimit: tx.gasLimit.toString(),
            value: "0",
            message: "Transaction constructed. Ready for signature."
          })}]
        };
      }

      case "get_agent_skills": {
        const { agentAddress } = args as { agentAddress: string };
        
        const addressObj = Address.fromBech32(agentAddress);
        
        const query = queryController.createQuery({
            contract: AGENT_IDENTITY_ADDRESS,
            function: "getAgentSkills",
            arguments: [addressObj.hex()],
        });
        
        const response = await queryController.runQuery(query);
        
        return {
          content: [{ type: "text", text: JSON.stringify({
            status: "success",
            agent: agentAddress,
            skillsHex: response.returnData.map(d => Buffer.from(d, 'base64').toString('hex'))
          })}]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error executing tool ${name}: ${error.message}` }],
      isError: true
    };
  }
});

// Start Server
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SYNDICATE MCP Server running on stdio");
}

run().catch(console.error);