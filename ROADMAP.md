# 🗺️ mx-agentic-commerce | Roadmap (2026 - 2027)

> **Welcome to the Supernova Era.** 
> With sub-600ms block times and sub-second finality now live on MultiversX (March 2026), AI agents can finally negotiate, transact, and settle synchronously at human-conversation speeds. 
>
> `mx-agentic-commerce` is an open-source framework designed to be the foundational layer for this new paradigm. This roadmap outlines our path from an early-stage prototype to a production-ready, multi-agent Web3 commerce ecosystem.

---

## 📍 Current Status (Early March 2026)
- [x] **Frontend**: Next.js + Tailwind UI with a glassmorphism Agent Terminal.
- [x] **Wallet Integration**: xPortal & DeFi Wallet connection + basic signing via `@multiversx/sdk-dapp`.
- [x] **Smart Contracts**: Rust implementations for Agent Registry, Commerce Engine, and Reputation NFTs (Supernova compatible).
- [x] **Protocols**: Basic stubs and traces for UCP (Discovery), ACP (Checkout), and x402 (Machine micropayments).
- [x] **A2A Logic**: Basic Agent-to-Agent negotiation traces (e.g., automated discount negotiation).
- [x] **Gamification**: Base reputation XP tracking and ranking logic.

---

## 🎯 Milestone 1: Visibility & Gamified Onboarding (Q2 2026)
*Focus: Quick wins, community attraction, and proving the "Wow" factor.*

- **[Visibility] Live Public Demo**: Hosted on Vercel (Devnet) for frictionless testing by the community.
- **[Visibility] Ecosystem Assets**: High-quality architecture diagrams and a 2-minute video walkthrough demonstrating a sub-second agentic checkout.
- **[Gamification] Social Hooks**: 
  - Discord bot that pings when a new Agent is registered or a high-XP commerce intent is fulfilled.
  - Automated X (Twitter) bot posting weekly Top 10 Agent Leaderboards.
- **[Utility] Real dApp Feeds (Basic)**: Hook the UCP discovery layer into a real Testnet NFT marketplace or DeFi faucet (e.g., swapping tokens via AshSwap testnet).
- **[Community] Hackathon Ready**: Package the repository as a one-click template for the upcoming MultiversX Global Hackathon.

---

## 🧠 Milestone 2: Deep Protocol & Identity Alignment (Q3 2026)
*Focus: Deepening MultiversX native features to allow true autonomous behaviors.*

- **[Identity] MX-8004 Integration**: Upgrade the Agent Registry to issue standardized sovereign identities (MX-8004) for every registered AI agent.
- **[Automation] AP2 Delegation Framework**: Implement Google AP2 / native MultiversX delegation. Users will set on-chain allowances (e.g., "Agent can spend max 0.5 EGLD/day") so the Agent can sign routine commerce transactions without interrupting the user.
- **[UX] Relayed v3 Transactions**: Integrate Relayed v3 so the AI Agent pays the gas fees for the user's discovery and negotiation phases, completely abstracting blockchain friction.
- **[Gamification] Soulbound Achievements**: Transition from simple XP to issuing Soulbound Tokens (SBTs) for achievements like *"Whale Negotiator"*, *"First A2A Trade"*, and unlockable visual "Skins" for the UI Agent Terminal.

---

## 🐝 Milestone 3: Multi-Agent Swarms & Real Commerce (Q4 2026)
*Focus: Scaling from single-agent tasks to decentralized swarm intelligence.*

- **[A2A Swarms] Delegation Chains**: Enable complex intents. Example: 
  *User* ➡️ *Shopping Agent* ➡️ *Negotiator Agent* ➡️ *DeFi Agent (swaps tokens to pay)* ➡️ *Checkout*.
- **[Integration] Full MCP Ecosystem**: Expand the Model Context Protocol (MCP) server to allow the Agent to read live liquidity pools, validate smart contract states, and verify user token holdings dynamically before making UCP requests.
- **[Utility] Production Commerce Feeds**: Partner with xoxno or real-world merchants (via Stripe/MultiversX integrations) to allow the Agent to buy physical/digital goods directly from the prompt.
- **[A2A] Cryptographic Peer Discovery**: Move A2A peer discovery to a decentralized Libp2p layer, allowing external developers' agents to discover and negotiate with our network.

---

## 🛠️ Milestone 4: Production DX & Ecosystem Expansion (Q1 2027)
*Focus: Security, developer experience (DX), and Mainnet readiness.*

- **[DX] CLI Scaffolding**: Launch `npx create-mx-agent` to allow any developer to spin up a fully configured UCP/ACP/A2A agent in 30 seconds.
- **[Testing] E2E Framework**: Comprehensive integration tests spanning Rust smart contracts (via `sc-meta`) and TypeScript agent logic.
- **[Security] Smart Contract Audits**: Finalize internal and external security reviews for the Commerce Engine and Agent Registry contracts.
- **[Launch] Mainnet Activation**: Deploy the verified, gas-optimized contracts to the MultiversX Mainnet. 

---

## 🤝 How to Contribute
We are actively looking for Rust developers, AI prompt engineers, and frontend wizards. Pick an issue from the board, drop a PR, and your Agent will earn on-chain contributor XP!