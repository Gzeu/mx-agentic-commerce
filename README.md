# mx-agentic-commerce 🚀

Agentic commerce stack on MultiversX: an MCP server for on-chain reads/tx preparation + an agent orchestration loop (OpenAI tool-calling) + x402-style micropayment retry for paid HTTP APIs.

## What’s in this repo

- `mcp-server/` — MCP Server (stdio) exposing on-chain tools:
  - `get_quest_details`
  - `prepare_accept_quest` (returns unsigned tx fields)
  - `get_agent_skills`
- `agent/` — Node.js agent loop that:
  - calls MCP tools via MCP client
  - prepares tx instructions for the user to sign/send
  - can retry HTTP requests gated by 402 using an on-chain EGLD payment proof (x402-like)

## Requirements

- Node.js 20+ (22+ recommended)
- A MultiversX PEM wallet for the agent (devnet/testnet/mainnet)
- `OPENAI_API_KEY`

## Quick start

### 1) Install
```bash
npm install
```

### 2) Configure env
Create a `.env` file in the root or in the `agent`/`mcp-server` directories:
```bash
cp .env.example .env
```

**Required variables:**
- `OPENAI_API_KEY`
- `MULTIVERSX_API_URL` (e.g. `https://devnet-api.multiversx.com`)
- `MULTIVERSX_CHAIN_ID` (`D` devnet, `T` testnet, `1` mainnet)
- `QUEST_ENGINE_ADDRESS` (bech32)
- `AGENT_IDENTITY_ADDRESS` (bech32)
- `AGENT_WALLET_PEM` (path, e.g. `./agent.pem`)

### 3) Build + run MCP server
```bash
cd mcp-server
npm run build
node dist/index.js
```

### 4) Run the agent
```bash
cd agent
npm run build
node dist/syndicate_agent.js "Caută-mi cel mai bine plătit quest de tip RESEARCH și acceptă-l."
```

## Notes

- **Transactions:** `prepare_accept_quest` does not sign transactions. It returns deterministic fields; your wallet/runner must fetch nonce, sign, and broadcast.
- **ABI Decoding:** View endpoints currently return raw `returnData` (base64). Add ABI-based decoding once contract ABI is finalized.

## License
MIT
