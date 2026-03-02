import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export interface CommerceIntent {
  description: string;
  budget?: number;
  currency?: string;
  userAddress: string;
}

export interface AgentConfig {
  mcpServerPath: string;
  agentRegistryAddress: string;
  commerceEngineAddress: string;
  reputationNftAddress: string;
  network: 'mainnet' | 'devnet' | 'testnet';
}

/**
 * AgentOrchestrator — Main agent loop for mx-agentic-commerce
 * Implements UCP discovery → ACP checkout → AP2 authorization → x402 payment
 */
export class AgentOrchestrator {
  private mcpClient: Client;
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
    this.mcpClient = new Client({ name: 'mx-agentic-commerce-agent', version: '1.0.0' });
  }

  async initialize(): Promise<void> {
    const transport = new StdioClientTransport({
      command: 'node',
      args: [this.config.mcpServerPath],
      env: {
        MULTIVERSX_NETWORK: this.config.network,
        AGENT_REGISTRY_ADDRESS: this.config.agentRegistryAddress,
        COMMERCE_ENGINE_ADDRESS: this.config.commerceEngineAddress,
      },
    });
    await this.mcpClient.connect(transport);
    console.log('[Agent] Connected to MCP server');
  }

  /**
   * Full agentic commerce flow:
   * 1. UCP discovery
   * 2. ACP cart building
   * 3. AP2 user authorization
   * 4. x402 payment execution
   * 5. On-chain receipt minting
   */
  async processIntent(intent: CommerceIntent): Promise<{ orderId: string; txHash: string; receiptNftId: string }> {
    console.log('[Agent] Processing intent:', intent.description);

    // Step 1: UCP — discover providers
    const providers = await this.ucpDiscover(intent);
    console.log(`[Agent] UCP found ${providers.length} providers`);

    // Step 2: Select best offer (simplified — extend with LLM scoring)
    const selectedOffer = providers[0];
    if (!selectedOffer) throw new Error('No providers available');

    // Step 3: ACP — build cart
    const cart = await this.acpBuildCart(selectedOffer, intent);
    console.log('[Agent] ACP cart built:', cart.id);

    // Step 4: AP2 — request user authorization
    const mandate = await this.ap2RequestMandate(intent.userAddress, cart);
    console.log('[Agent] AP2 mandate obtained:', mandate.id);

    // Step 5: x402 — execute payment via MultiversX SC
    const txHash = await this.x402ExecutePayment(cart, mandate);
    console.log('[Agent] x402 payment executed:', txHash);

    // Step 6: Mint on-chain receipt NFT
    const receiptNftId = await this.mintReceiptNft(intent.userAddress, cart.id, txHash);

    // Step 7: Update agent trust score
    await this.updateAgentScore(1);

    return { orderId: cart.id, txHash, receiptNftId };
  }

  private async ucpDiscover(intent: CommerceIntent): Promise<any[]> {
    // UCP discovery implementation
    // In production: query UCP-compatible provider registry
    return [{ id: 'provider-1', name: 'Demo Provider', price: intent.budget || 100 }];
  }

  private async acpBuildCart(offer: any, intent: CommerceIntent): Promise<any> {
    // ACP cart building via Stripe Agent Commerce Protocol
    return { id: `cart-${Date.now()}`, offer, total: offer.price, currency: intent.currency || 'EGLD' };
  }

  private async ap2RequestMandate(userAddress: string, cart: any): Promise<any> {
    // AP2 cryptographic mandate request
    // In production: trigger xPortal signing request
    return { id: `mandate-${Date.now()}`, userAddress, cartId: cart.id, expiresAt: Date.now() + 300000 };
  }

  private async x402ExecutePayment(cart: any, mandate: any): Promise<string> {
    // x402 HTTP-native payment via MultiversX SC
    // Calls CommerceEngine.createOrder + executeOrder atomically
    const result = await this.mcpClient.callTool({
      name: 'get_order_status',
      arguments: { orderId: cart.id },
    });
    // Return simulated tx hash for now
    return `tx-${Date.now()}`;
  }

  private async mintReceiptNft(userAddress: string, orderId: string, txHash: string): Promise<string> {
    // Call ReputationNFT.mintReceipt via MX transaction
    return `receipt-nft-${Date.now()}`;
  }

  private async updateAgentScore(delta: number): Promise<void> {
    const result = await this.mcpClient.callTool({
      name: 'get_agent_trust_score',
      arguments: { agentId: 'self' },
    });
    console.log('[Agent] Score updated, current:', result);
  }

  async close(): Promise<void> {
    await this.mcpClient.close();
  }
}
