import { NextResponse } from 'next/server';

// This is an API Route in Next.js that bridges the Frontend UI to your Node.js Agent Orchestrator.
// In a full production app, this would instantiate the MCP Client and talk to OpenAI.
// For the MVP frontend connection step, we simulate the orchestrator responding with real payload structure.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, userAddress } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Simulate Orchestrator Logic -> MCP Server Call -> Return Tx Payload
    const isQuestRequest = prompt.toLowerCase().includes('quest') || prompt.toLowerCase().includes('accept');
    
    let traces = [
      `[UCP] Received Intent: "${prompt}"`,
      `[MCP Client] Interrogating on-chain context for address: ${userAddress?.slice(0, 10)}...`
    ];

    let reply = "";
    let transaction = null;

    if (isQuestRequest) {
      traces.push("[MCP Server] Tool called: prepare_accept_quest(questId: 1)");
      traces.push("[x402] No micropayment required for this Smart Contract read.");
      
      reply = "I found a highly-rewarding RESEARCH quest for you. I've prepared the smart contract transaction. Please sign it to accept the quest and start earning XP!";
      
      transaction = {
        receiver: "erd1qqqqqqqqqqqqqpgqq484ndp9x5rrdtdjtt0944062c3e5l4w7yqsck92ca", // Example QuestEngine SC
        data: "acceptQuest@00000001",
        gasLimit: "5000000",
        value: "0"
      };
    } else {
      traces.push("[UCP] Found 2 API providers for your intent.");
      traces.push("[x402] Gateway requires 0.005 EGLD. Simulating atomic payment via Agent Wallet...");
      traces.push("[ACP] Successfully negotiated items and generated a mock transaction.");
      
      reply = "I've negotiated the best option from the discovery protocol. You can confirm the commerce checkout by signing the transaction below.";
      
      transaction = {
        receiver: "erd1qqqqqqqqqqqqqpgqn88zcxm7knsr322vff6r5r5md7469aev7yqsz3vryz", // Example CommerceEngine SC
        data: "createOrder@6d6f636b5f6f72646572", // "mock_order" in hex
        gasLimit: "10000000",
        value: "50000000000000000" // 0.05 EGLD
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
