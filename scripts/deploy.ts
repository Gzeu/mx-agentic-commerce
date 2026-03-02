/**
 * Script for deploying smart contracts to MultiversX testnet/devnet.
 * Used for the `contracts:deploy` script.
 */

import {
  Account,
  Address,
  SmartContract,
  Transaction,
  TransactionPayload,
  TokenPayment,
} from "@multiversx/sdk-core/out";
import { UserSigner } from "@multiversx/sdk-wallet/out";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers/out";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Configuration
const NETWORK_URL = "https://devnet-api.multiversx.com";
const CHAIN_ID = "D"; // 'D' for Devnet, 'T' for Testnet
const WALLET_PEM_PATH = process.env.WALLET_PEM || "../agent.pem";

const provider = new ApiNetworkProvider(NETWORK_URL);

async function deployContract(contractName: string, wasmPath: string, signer: UserSigner) {
  console.log(`\n--- Deploying ${contractName} ---`);
  
  if (!fs.existsSync(wasmPath)) {
    console.error(`WASM file not found at ${wasmPath}. Please build the contracts first.`);
    return;
  }

  const wasmBuffer = fs.readFileSync(wasmPath);
  
  // Get sender account state
  const senderAddress = signer.getAddress();
  const accountOnNetwork = await provider.getAccount(senderAddress);
  const account = new Account(senderAddress);
  account.update(accountOnNetwork);

  // Prepare deployment transaction
  const deployTx = new Transaction({
    nonce: account.getNonceThenIncrement(),
    receiver: Address.Zero(),
    value: TokenPayment.egldFromAmount(0),
    gasLimit: 60000000n,
    data: TransactionPayload.contractDeploy(wasmBuffer, []), // Add args if constructor needs them
    chainID: CHAIN_ID,
  });

  // Sign transaction
  const serializedTx = deployTx.serializeForSigning();
  const signature = await signer.sign(serializedTx);
  deployTx.applySignature(signature);

  // Send to network
  const txHash = await provider.sendTransaction(deployTx);
  console.log(`[Tx sent] Hash: ${txHash}`);
  
  console.log("Waiting for confirmation...");
  const watcher = provider.awaitTransactionCompleted(txHash);
  await watcher;
  
  // Calculate contract address
  const smartContract = new SmartContract({});
  // Wait a bit to ensure API indexes the SC address
  await new Promise(r => setTimeout(r, 2000));
  
  const txDetails = await provider.getTransaction(txHash);
  const scAddress = txDetails.logs.events.find(e => e.identifier === "SCDeploy")?.address?.bech32();

  console.log(`✅ ${contractName} successfully deployed!`);
  console.log(`📍 Contract Address: ${scAddress || "Check explorer using TxHash"}`);
  
  return scAddress;
}

async function main() {
  console.log("Starting Smart Contract Deployment...");

  if (!fs.existsSync(WALLET_PEM_PATH)) {
    console.error(`Wallet PEM file not found at ${WALLET_PEM_PATH}. Please generate one.`);
    process.exit(1);
  }

  const pemText = fs.readFileSync(WALLET_PEM_PATH, { encoding: "utf8" });
  const signer = UserSigner.fromPem(pemText);
  console.log(`Deployer Address: ${signer.getAddress().bech32()}`);

  try {
    // 1. Build Contracts (executing mxpy via shell)
    console.log("\nBuilding contracts...");
    execSync("cd contracts/agent-registry && mxpy contract build", { stdio: 'inherit' });
    execSync("cd contracts/commerce-engine && mxpy contract build", { stdio: 'inherit' });
    execSync("cd contracts/reputation-nft && mxpy contract build", { stdio: 'inherit' });

    // 2. Deploy AgentRegistry
    const registryAddress = await deployContract(
      "AgentRegistry", 
      "contracts/agent-registry/output/agent-registry.wasm", 
      signer
    );

    // 3. Deploy CommerceEngine
    const commerceAddress = await deployContract(
      "CommerceEngine", 
      "contracts/commerce-engine/output/commerce-engine.wasm", 
      signer
    );

    // 4. Deploy ReputationNFT
    const repNftAddress = await deployContract(
      "ReputationNFT", 
      "contracts/reputation-nft/output/reputation-nft.wasm", 
      signer
    );

    console.log("\n=========================================");
    console.log("🎉 DEPLOYMENT SUMMARY");
    console.log("=========================================");
    console.log(`AGENT_REGISTRY_ADDRESS=${registryAddress}`);
    console.log(`COMMERCE_ENGINE_ADDRESS=${commerceAddress}`);
    console.log(`REPUTATION_NFT_ADDRESS=${repNftAddress}`);
    console.log("=========================================");
    console.log("Please copy these addresses into your .env file!");

  } catch (error: any) {
    console.error("\nDeployment failed:", error.message);
  }
}

main();
