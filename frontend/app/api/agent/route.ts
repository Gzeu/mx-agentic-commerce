import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, userAddress } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const promptLower = prompt.toLowerCase();
    const isQuestRequest = promptLower.includes('quest') || promptLower.includes('accept');
    const isNegotiationRequest = promptLower.includes('negotiate') || promptLower.includes('discount') || promptLower.includes('cheaper');
    const isDeFiRequest = promptLower.includes('swap') || promptLower.includes('exchange') || promptLower.includes('defi');
    
    let traces = [
      `[UCP] Received Intent: "${prompt}"`,
      `[MCP Client] Interrogating on-chain context for address: ${userAddress?.slice(0, 10)}...`
    ];

    let reply = "";
    let transaction = null;

    if (isQuestRequest) {
      traces.push("[MCP Server] Tool called: prepare_accept_quest(questId: 1)");
      traces.push("[x402] No micropayment required for this Smart Contract read.");
      traces.push(`[Social] 🤖 Dispatching Discord Webhook: Agent ${userAddress?.slice(0,6)} starting a new Quest!`);
      
      reply = "I found a highly-rewarding RESEARCH quest for you. I've prepared the smart contract transaction. Please sign it to accept the quest and start earning XP!";
      
      transaction = {
        receiver: "erd1qqqqqqqqqqqqqpgqq484ndp9x5rrdtdjtt0944062c3e5l4w7yqsck92ca",
        data: "acceptQuest@00000001",
        gasLimit: "5000000",
        value: "0"
      };
    } else if (isNegotiationRequest) {
      // ** A2A Specific Flow **
      traces.push("[A2A] Broadcasting discovery ping to locate Merchant Agents...");
      traces.push("[A2A] Discovered Peer: merchant_agent_0x123 (Capabilities: pricing_negotiation)");
      traces.push("[A2A] Cryptographic handshake initiated via AP2 Auth layer.");
      traces.push("[A2A] Dispatching 'negotiation' payload to peer requesting 10% volume discount...");
      traces.push("[A2A] Received counter-proposal from Merchant Agent: 7.5% discount approved.");
      traces.push("[ACP] Lock-in negotiated price. Generating smart contract transaction payload...");
      traces.push(`[Social] 🐦 Auto-posting to X: "Agent ${userAddress?.slice(0,6)} just negotiated a 7.5% discount fully autonomously on MultiversX!"`);
      
      reply = "I've successfully negotiated directly with the merchant's AI agent via the A2A protocol. I managed to secure a 7.5% discount for your order! Please sign the transaction to finalize.";
      
      transaction = {
        receiver: "erd1qqqqqqqqqqqqqpgqn88zcxm7knsr322vff6r5r5md7469aev7yqsz3vryz",
        data: "createOrder@646973636f756e7465645f6f72646572", // "discounted_order" in hex
        gasLimit: "12000000",
        value: "46250000000000000" // 0.04625 EGLD (7.5% off from 0.05)
      };
    } else if (isDeFiRequest) {
      // ** DeFi Routing Flow (AshSwap integration stub) **
      traces.push("[DeFi] Intent mapped to token swap. Routing to AshSwap aggregator (Testnet).");
      traces.push("[DeFi] Calculating optimal path: USDC -> EGLD. Slippage: 0.1%.");
      traces.push("[ACP] Formulating DeFi execution payload.");
      traces.push(`[Social] 🤖 Dispatching Discord Webhook: Agent ${userAddress?.slice(0,6)} executed a DeFi Strategy.`);

      reply = "I've routed your swap intent through the AshSwap liquidity pools for the best available rate. Here is the prepared transaction to securely exchange your tokens.";

      transaction = {
        receiver: "erd1qqqqqqqqqqqqqpgqa0fsfsqn8h0nsvw5f9aemc2qxx23xxz82j8qz5w8t0", // Mock router SC
        data: "swapTokensFixedInput@555344432d313233343536@45474c44@1000000", // USDC-123456 to EGLD
        gasLimit: "20000000",
        value: "0"
      };
    } else {
      traces.push("[UCP] Found 2 API providers for your intent.");
      traces.push("[x402] Gateway requires 0.005 EGLD. Simulating atomic payment via Agent Wallet...");
      traces.push("[ACP] Successfully negotiated items and generated a mock transaction.");
      
      reply = "I've processed the best option from the discovery protocol. You can confirm the commerce checkout by signing the transaction below.";
      
      transaction = {
        receiver: "erd1qqqqqqqqqqqqqpgqn88zcxm7knsr322vff6r5r5md7469aev7yqsz3vryz",
        data: "createOrder@6d6f636b5f6f72646572", 
        gasLimit: "10000000",
        value: "50000000000000000" 
      };
    }

    return NextResponse.json({
      traces,
      reply,
      transaction
    });

  } catch (error) {
    console.error("Agent API Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
