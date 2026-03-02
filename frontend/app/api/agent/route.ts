import { NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

const SYSTEM_PROMPT = `You are SYNDICATE, an advanced AI Commerce Agent running on the MultiversX blockchain.
You help users execute blockchain transactions, swap tokens, accept quests, negotiate deals, and interact with DeFi protocols.

You must ALWAYS respond with a valid JSON object in this exact format:
{
  "traces": ["trace line 1", "trace line 2", ...],
  "reply": "Your natural language response to the user",
  "transaction": null OR { "receiver": "erd1...", "data": "base64orAscii", "gasLimit": "10000000", "value": "0" }
}

Trace lines simulate the internal agent pipeline. Always include 3-5 realistic traces like:
- [UCP] Received Intent: "..."
- [MCP Client] Querying on-chain context...
- [A2A] Discovering peer agents...
- [x402] Evaluating micropayment gateway...
- [ACP] Generating transaction payload...

For blockchain transactions on MultiversX mainnet:
- Quest acceptance: receiver erd1qqqqqqqqqqqqqpgqq484ndp9x5rrdtdjtt0944062c3e5l4w7yqsck92ca
- Token swap via AshSwap: receiver erd1qqqqqqqqqqqqqpgqa0fsfsqn8h0nsvw5f9aemc2qxx23xxz82j8qz5w8t0
- Commerce orders: receiver erd1qqqqqqqqqqqqqpgqn88zcxm7knsr322vff6r5r5md7469aev7yqsz3vryz
- gasLimit for simple txs: "5000000", complex: "20000000"
- value in denomination (1 EGLD = 1000000000000000000)

If the user is just chatting or asking questions (no transaction needed), set transaction to null.
Always be helpful, concise, and technically accurate about MultiversX/blockchain topics.
Respond in the same language the user writes in.`;

async function triggerDiscordHook(message: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message })
    });
  } catch (e) {
    console.log('Webhook failed silently', e);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, userAddress } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'Agent not configured. Missing API key.' }, { status: 500 });
    }

    const userContext = userAddress
      ? `User wallet address: ${userAddress}. Network: MultiversX Mainnet.`
      : 'User is not connected to a wallet.';

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mx-agentic-commerce-frontend.vercel.app',
        'X-Title': 'SYNDICATE Commerce Agent'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `${userContext}\n\nUser message: ${prompt}` }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter error:', errText);
      return NextResponse.json({ error: 'LLM request failed', details: errText }, { status: 502 });
    }

    const llmData = await response.json();
    const rawContent = llmData.choices?.[0]?.message?.content;

    if (!rawContent) {
      return NextResponse.json({ error: 'Empty response from LLM' }, { status: 502 });
    }

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      parsed = {
        traces: ['[UCP] Received intent', '[LLM] Processing...'],
        reply: rawContent,
        transaction: null
      };
    }

    // Fire Discord webhook in background
    if (userAddress) {
      triggerDiscordHook(`**[SYNDICATE Agent]** \`${userAddress.slice(0, 10)}...\` → "${prompt.slice(0, 80)}"`);
    }

    return NextResponse.json({
      traces: parsed.traces || [],
      reply: parsed.reply || 'Agent processed your request.',
      transaction: parsed.transaction || null
    });

  } catch (error) {
    console.error('Agent API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
