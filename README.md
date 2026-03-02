# mx-agentic-commerce 🚀

> **Gamified AI Agentic Commerce Platform on MultiversX** — Full Universal Agentic Commerce Stack (UCP/ACP/x402/MCP/AP2), Next.js + xPortal frontend, Rust smart contracts optimized for Supernova.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MultiversX](https://img.shields.io/badge/MultiversX-Supernova-blue)](https://multiversx.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)

---

## 🎯 Overview

`mx-agentic-commerce` is a **gamified, agent-first commerce platform** built on MultiversX mainnet, leveraging the full **Universal Agentic Commerce Stack** live in 2026:

| Protocol | Role |
|----------|------|
| **UCP** (Google Universal Commerce Protocol) | Discovery & structured commerce lifecycle |
| **ACP** (OpenAI + Stripe Agent Commerce Protocol) | Programmatic checkout & execution |
| **x402** (Coinbase HTTP-native payments) | Machine-to-machine instant settlement |
| **MCP** (Model Context Protocol) | Structured on-chain state access + safe VM calls |
| **AP2** (Google Agent Payments Protocol) | Cryptographic authorization & delegated intent |

The platform is **gamified** — agents earn XP, badges, and reputation scores on-chain. Users interact via quests, leaderboards, and NFT receipts. Other AI agents can integrate and trade autonomously.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js 15)                 │
│   xPortal Wallet Connect │ Gamified UI │ Leaderboard    │
└────────────────────────┬────────────────────────────────┘
                         │ REST / WebSocket
┌────────────────────────▼────────────────────────────────┐
│              AGENT ORCHESTRATOR (Node.js)               │
│  MCP Client │ UCP Discovery │ ACP Checkout │ AP2 Auth   │
└──────┬──────────────┬──────────────┬────────────────────┘
       │ x402 pay     │ MCP calls    │ ACP requests
┌──────▼──────┐ ┌─────▼──────┐ ┌───▼──────────────────────┐
│ External    │ │ MCP Server │ │  MultiversX Blockchain   │
│ APIs/Svcs   │ │ (on-chain  │ │  Supernova Mainnet       │
│ (x402 gated)│ │  state)    │ │  <600ms blocks           │
└─────────────┘ └────────────┘ └──────────────────────────┘
                                        │
                    ┌───────────────────┼──────────────────┐
                    ▼                   ▼                  ▼
             AgentRegistry      CommerceEngine       ReputationNFT
             (Rust SC)          (Rust SC)            (Rust SC)
```

### End-to-End Flow

1. **User/Agent** submits a commerce intent (natural language or structured)
2. **UCP** discovers compatible providers & offers
3. **Agent** negotiates and selects optimal combination
4. **ACP** builds the cart and checkout session
5. **AP2** requests delegated authorization from user
6. **x402** executes atomic payment via MultiversX smart contract
7. **ReputationNFT** contract mints on-chain receipt/itinerary NFT
8. Agent earns XP + trust score update on `AgentRegistry`

---

## 📁 Project Structure

```
mx-agentic-commerce/
├── contracts/                    # Rust Smart Contracts (mx-sdk-rs)
│   ├── agent-registry/           # Agent registration, XP, trust scores
│   ├── commerce-engine/          # Order lifecycle, ACP checkout on-chain
│   └── reputation-nft/           # SFT/NFT receipts & badges
├── mcp-server/                   # MCP Server — on-chain state bridge
│   ├── src/
│   │   ├── index.ts
│   │   ├── tools/                # MCP tool definitions
│   │   └── resources/            # On-chain resource readers
│   └── package.json
├── agent/                        # Agent Orchestrator
│   ├── src/
│   │   ├── orchestrator.ts       # Main agent loop
│   │   ├── ucp/                  # UCP discovery client
│   │   ├── acp/                  # ACP checkout client
│   │   ├── x402/                 # x402 payment handler
│   │   └── ap2/                  # AP2 authorization
│   └── package.json
├── frontend/                     # Next.js 15 + xPortal
│   ├── app/
│   │   ├── page.tsx              # Main gamified dashboard
│   │   ├── quests/               # Quest system UI
│   │   ├── leaderboard/          # Agent leaderboard
│   │   └── profile/              # User/Agent profile + NFT receipts
│   ├── components/
│   └── package.json
├── docs/
│   ├── architecture.md
│   ├── smart-contracts.md
│   ├── mcp-integration.md
│   ├── x402-payments.md
│   └── deployment.md
└── README.md
```

---

## 🔧 Smart Contracts

### 1. `AgentRegistry`
Registers AI agents on-chain with XP tracking and trust scores.

```rust
// Key endpoints
#[endpoint(registerAgent)]
fn register_agent(&self, agent_id: ManagedBuffer, metadata_url: ManagedBuffer)

#[endpoint(updateTrustScore)]
fn update_trust_score(&self, agent_id: ManagedBuffer, delta: i64)

#[view(getAgentScore)]
fn get_agent_score(&self, agent_id: &ManagedBuffer) -> u64
```

### 2. `CommerceEngine`
Handles the full ACP order lifecycle on-chain with x402 settlement.

```rust
#[payable("EGLD")]
#[endpoint(createOrder)]
fn create_order(&self, order_id: ManagedBuffer, provider: ManagedAddress, amount: BigUint)

#[endpoint(executeOrder)]
fn execute_order(&self, order_id: ManagedBuffer)

#[endpoint(refundOrder)]
fn refund_order(&self, order_id: ManagedBuffer)
```

### 3. `ReputationNFT`
Mints verifiable NFT receipts and achievement badges.

```rust
#[endpoint(mintReceipt)]
fn mint_receipt(&self, to: ManagedAddress, order_id: ManagedBuffer, metadata: ManagedBuffer)

#[endpoint(awardBadge)]
fn award_badge(&self, to: ManagedAddress, badge_type: u8)
```

---

## 🤖 MCP Server

The MCP server exposes on-chain state and VM calls as structured tools for LLMs:

```typescript
// Example MCP tool definition
server.addTool({
  name: "get_agent_trust_score",
  description: "Get the on-chain trust score of an agent",
  parameters: z.object({ agentId: z.string() }),
  execute: async ({ agentId }) => {
    const score = await multiversxClient.queryContract({
      contract: AGENT_REGISTRY_ADDRESS,
      func: "getAgentScore",
      args: [agentId],
    });
    return { score: score.toString() };
  },
});
```

---

## 💳 x402 Payment Flow

HTTP-native micropayments to external APIs:

```http
GET /api/flight-data?route=OTP-BCN&date=2026-06-01
X-Payment: x402 token=<signed_multiversx_tx> amount=0.001EGLD
X-Payment-Network: multiversx-mainnet
```

---

## 🎮 Gamification System

- **Quests** — Complete commerce flows to earn XP
- **Badges** — NFT achievements minted on-chain
- **Leaderboard** — Top agents by trust score & volume
- **Agent Ranks** — Bronze → Silver → Gold → Diamond
- **Guild System** — Agent swarms forming collaborative guilds

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- Rust + `mxpy` CLI
- MultiversX wallet (xPortal)

### 1. Clone & Install
```bash
git clone https://github.com/Gzeu/mx-agentic-commerce.git
cd mx-agentic-commerce
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Fill in: MULTIVERSX_NETWORK, CONTRACT_ADDRESSES, MCP_API_KEY
```

### 3. Deploy Smart Contracts (Testnet)
```bash
cd contracts/agent-registry
mxpy contract build
mxpy contract deploy --network testnet --pem wallet.pem
```

### 4. Start MCP Server
```bash
cd mcp-server && npm run dev
```

### 5. Start Frontend
```bash
cd frontend && npm run dev
# Open http://localhost:3000
```

---

## 🔒 Security

- Multi-sig required for critical contract upgrades
- Reentrancy guards on all payable endpoints
- Rate limiting on MCP server endpoints
- Minimal oracle dependency (price feeds via trusted aggregators)
- Audit-friendly: minimal storage, clear ownership model
- AP2 mandate expiry + revocation support

---

## 🗺️ Roadmap

- [x] Smart contract architecture design
- [ ] `AgentRegistry` contract — testnet deploy
- [ ] `CommerceEngine` contract — testnet deploy
- [ ] `ReputationNFT` contract — testnet deploy
- [ ] MCP Server v1
- [ ] Agent Orchestrator v1
- [ ] Frontend — gamified dashboard
- [ ] xPortal wallet integration
- [ ] Mainnet deploy (post-Supernova)
- [ ] Multi-agent swarms (guild system)
- [ ] ZK privacy layer (MX-8004 trust layer)

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

**🚀 Powered by MultiversX Supernova | ⚡ Built for Agentic Commerce | 🎮 Gamified by Design**

*Author: George Pricop (@Gzeu)*
