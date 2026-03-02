/**
 * Script utility to trigger Discord Webhooks for Gamification & Notifications
 * Call this from the Agent Orchestrator to broadcast Agent achievements.
 */

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || "";

export async function notifyDiscord(agentAddress: string, actionType: "Quest" | "A2A_Trade" | "DeFi_Swap", details: string) {
  if (!DISCORD_WEBHOOK_URL) {
    console.log(`[Social Mock] Would have pinged Discord: Agent ${agentAddress.slice(0, 8)}... performed ${actionType}`);
    return;
  }

  const colors = {
    "Quest": 3447003,      // Blue
    "A2A_Trade": 15105570, // Orange
    "DeFi_Swap": 10181046, // Purple
  };

  const payload = {
    username: "Syndicate Oracle",
    avatar_url: "https://multiversx.com/favicon.ico",
    embeds: [
      {
        title: `🤖 Agent Action Detected!`,
        description: `Agent \`${agentAddress.slice(0, 10)}...\` just executed a high-value action on the Supernova Devnet.`,
        color: colors[actionType],
        fields: [
          {
            name: "Category",
            value: actionType,
            inline: true
          },
          {
            name: "Details",
            value: details,
            inline: false
          }
        ],
        footer: {
          text: "mx-agentic-commerce • Sub-second finality"
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      console.log("[Discord] Webhook delivered successfully.");
    } else {
      console.error("[Discord] Webhook failed:", res.statusText);
    }
  } catch (err) {
    console.error("[Discord] Error dispatching webhook:", err);
  }
}
