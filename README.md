# mx-agentic-commerce
Supernova Devnet project demonstrating Agentic Commerce using UCP, ACP, x402, and MCP.

## 🚀 Features
- **Frontend dApp**: Next.js 15 UI with Glassmorphism, real EGLD balance, and Web3 wallet integration (xPortal).
- **Agent Terminal**: Chat interface simulating the Agent Orchestrator.
- **Smart Contracts**: Rust-based contracts for Agent Registry, Commerce Engine, and Reputation NFTs.
- **Agent-to-Agent (A2A)**: Implements peer-to-peer AI agent negotiation protocols.
- **Automated Deployment**: TypeScript script to compile and deploy WASM contracts directly to Devnet.

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Frontend
```bash
npm run dev:frontend
```
Open `http://localhost:3000` to interact with the Terminal. Try typing: *"Negotiate a cheaper price for me"*.

### 3. Deploy Smart Contracts to Devnet
Ensure you have a funded `agent.pem` file in the root directory.
```bash
npm run contracts:deploy
```

## 🏗️ Protocol Stack
- **UCP (Universal Commerce Protocol)**: Discovery of agent services.
- **ACP (Agent Commerce Protocol)**: Programmatic checkout.
- **x402**: Machine-to-machine HTTP payments.
- **A2A (Agent-to-Agent)**: Cryptographically secure negotiation between AI agents.
- **AP2**: Authorization and accountability layer.