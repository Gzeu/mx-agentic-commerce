import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { ApiNetworkProvider } from '@multiversx/sdk-network-providers';
import { Address, SmartContract, AbiRegistry } from '@multiversx/sdk-core';

const NETWORK = process.env.MULTIVERSX_NETWORK || 'mainnet';
const API_URL = NETWORK === 'mainnet'
  ? 'https://api.multiversx.com'
  : 'https://devnet-api.multiversx.com';

const AGENT_REGISTRY = process.env.AGENT_REGISTRY_ADDRESS || '';
const COMMERCE_ENGINE = process.env.COMMERCE_ENGINE_ADDRESS || '';

const provider = new ApiNetworkProvider(API_URL, { clientName: 'mx-agentic-commerce-mcp' });

const server = new McpServer({
  name: 'mx-agentic-commerce',
  version: '1.0.0',
});

// ---- TOOLS ----

server.tool(
  'get_agent_trust_score',
  'Get the on-chain trust score and XP of a registered agent',
  { agentId: z.string().describe('Agent ID (hex or bech32)') },
  async ({ agentId }) => {
    try {
      const query = provider.queryContract({
        address: new Address(AGENT_REGISTRY),
        func: 'getAgentScore',
        args: [agentId],
      });
      const result = await (await query);
      return { content: [{ type: 'text', text: JSON.stringify({ agentId, score: result }) }] };
    } catch (e) {
      return { content: [{ type: 'text', text: `Error: ${(e as Error).message}` }], isError: true };
    }
  }
);

server.tool(
  'get_order_status',
  'Get the current status of a commerce order on-chain',
  { orderId: z.string().describe('Order ID') },
  async ({ orderId }) => {
    try {
      const query = provider.queryContract({
        address: new Address(COMMERCE_ENGINE),
        func: 'getOrderStatus',
        args: [orderId],
      });
      const result = await (await query);
      return { content: [{ type: 'text', text: JSON.stringify({ orderId, status: result }) }] };
    } catch (e) {
      return { content: [{ type: 'text', text: `Error: ${(e as Error).message}` }], isError: true };
    }
  }
);

server.tool(
  'get_account_balance',
  'Get EGLD balance of a MultiversX address',
  { address: z.string().describe('MultiversX address (erd1...)') },
  async ({ address }) => {
    try {
      const account = await provider.getAccount(new Address(address));
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            address,
            balance: account.balance.toString(),
            nonce: account.nonce,
          })
        }]
      };
    } catch (e) {
      return { content: [{ type: 'text', text: `Error: ${(e as Error).message}` }], isError: true };
    }
  }
);

server.tool(
  'get_network_stats',
  'Get current MultiversX network statistics (Supernova)',
  {},
  async () => {
    try {
      const stats = await provider.getNetworkGeneralStatistics();
      return { content: [{ type: 'text', text: JSON.stringify(stats) }] };
    } catch (e) {
      return { content: [{ type: 'text', text: `Error: ${(e as Error).message}` }], isError: true };
    }
  }
);

// ---- RESOURCES ----

server.resource(
  'leaderboard',
  'mx-commerce://leaderboard',
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: 'Top agents leaderboard endpoint — query AgentRegistry for top 20 agents by trust score.',
      mimeType: 'text/plain',
    }]
  })
);

// ---- START ----

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[MCP] mx-agentic-commerce MCP server started');
}

main().catch(console.error);
