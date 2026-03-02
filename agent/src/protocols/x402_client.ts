import { UserSigner } from "@multiversx/sdk-wallet";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";
import { Transaction, TransactionPayload, Address } from "@multiversx/sdk-core";

// Uses MultiversX Supernova (Sub-300ms finality)
const NETWORK_URL = process.env.MULTIVERSX_NETWORK || "https://devnet-api.multiversx.com";
const provider = new ApiNetworkProvider(NETWORK_URL);

/**
 * Wrapper over native fetch that implements x402 Agentic Micropayments.
 * If a 402 is returned, it parses the required amount, signs a transaction on MultiversX,
 * waits for the ultra-fast Supernova finality, and retries the request.
 */
export async function fetchWithx402(url: string, signer: UserSigner, init?: RequestInit): Promise<any> {
    // 1. Make the initial request
    let response = await fetch(url, init);

    // 2. Check for x402 Payment Required
    if (response.status === 402) {
        console.log(`[x402] 402 Payment Required for ${url}. Parsing headers...`);
        
        const paymentHeader = response.headers.get("x-payment-required");
        if (!paymentHeader) throw new Error("402 received but no x-payment-required header provided.");
        
        // Expected format: "multiversx-mainnet; address=erd1...; amount=0.005EGLD; ap2_credential=xyz123"
        const params = parsePaymentHeader(paymentHeader);
        
        if (!params.address || !params.amount) {
            throw new Error("Invalid x-payment-required header format.");
        }

        console.log(`[x402] Executing atomic payment of ${params.amount} to ${params.address}`);

        // 3. Construct and sign the transaction
        const senderAddress = signer.getAddress();
        const account = await provider.getAccount(senderAddress);
        
        // Convert "0.005" to the denomination (18 decimals)
        const amountInWei = BigInt(parseFloat(params.amount) * 1e18);

        const tx = new Transaction({
            nonce: BigInt(account.nonce),
            receiver: params.address,
            sender: senderAddress.bech32(),
            value: amountInWei,
            gasLimit: 50000n,
            data: new TransactionPayload("x402_payment"),
            chainID: "D" // Devnet
        });

        const serializedTx = tx.serializeForSigning();
        const signature = await signer.sign(serializedTx);
        tx.applySignature(signature);

        // 4. Broadcast and wait for Supernova finality (<300ms)
        const txHash = await provider.sendTransaction(tx);
        console.log(`[x402] Tx sent: ${txHash}. Waiting for Supernova finality...`);
        
        // Utilizing the 2026 sdk-core quick awaiter
        await provider.awaitTransactionCompleted(txHash);
        console.log(`[x402] Payment finalized on-chain!`);

        // 5. Retry original request with the Payment proof header
        const retryHeaders = new Headers(init?.headers);
        retryHeaders.set("x-payment", `token=${txHash}; amount=${params.amount}EGLD; ap2_credential=${params.ap2Credential}`);

        const retryInit = { ...init, headers: retryHeaders };
        response = await fetch(url, retryInit);

        if (!response.ok) {
            throw new Error(`Request failed after x402 payment. Status: ${response.status}`);
        }
    }

    // Return the successful JSON payload
    if (response.ok) {
        return response.json();
    }
    
    throw new Error(`HTTP Error: ${response.status}`);
}

/**
 * Helper to parse the 402 requirement header string
 */
function parsePaymentHeader(header: string) {
    const parts = header.split(";").map(p => p.trim());
    const result: any = { network: parts[0] };
    
    for (let i = 1; i < parts.length; i++) {
        const [key, val] = parts[i].split("=");
        if (key === "address") result.address = val;
        if (key === "amount") result.amount = val.replace("EGLD", "");
        if (key === "ap2_credential") result.ap2Credential = val;
    }
    return result;
}