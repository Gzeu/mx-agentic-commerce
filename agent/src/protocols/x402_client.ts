import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";
import { Address, Transaction, TransactionPayload } from "@multiversx/sdk-core";
import { UserSigner } from "@multiversx/sdk-wallet";

const NETWORK_URL = process.env.MULTIVERSX_API_URL ?? "https://devnet-api.multiversx.com";
const CHAIN_ID = process.env.MULTIVERSX_CHAIN_ID ?? "D";
const provider = new ApiNetworkProvider(NETWORK_URL, { clientName: "syndicate-x402" });

type X402Requirement = {
  network?: string;
  address: string;          // erd1...
  amountEGLD: string;       // "0.005"
  ap2Credential?: string;   // opaque
};

function parseXPaymentRequired(headerValue: string): X402Requirement {
  // Example: "multiversx-devnet; address=erd1...; amount=0.005EGLD; ap2_credential=xyz"
  const parts = headerValue.split(";").map((p) => p.trim());
  const out: any = { network: parts[0] };

  for (const part of parts.slice(1)) {
    const [k, v] = part.split("=").map((s) => s.trim());
    if (!k || v == null) continue;
    if (k === "address") out.address = v;
    if (k === "amount") out.amountEGLD = v.replace(/EGLD/i, "");
    if (k === "ap2_credential") out.ap2Credential = v;
  }

  if (!out.address || !out.amountEGLD) {
    throw new Error(`Invalid X-Payment-Required header: ${headerValue}`);
  }
  return out as X402Requirement;
}

function egldToWei(amount: string): bigint {
  // decimal string -> 18 decimals
  const [intPart, fracPartRaw = ""] = amount.trim().split(".");
  const fracPart = (fracPartRaw + "0".repeat(18)).slice(0, 18);
  const full = `${intPart}${fracPart}`.replace(/^0+/, "") || "0";
  return BigInt(full);
}

async function awaitFinality(txHash: string) {
  const anyProvider: any = provider;
  if (typeof anyProvider.awaitTransactionComplete === "function") {
    await anyProvider.awaitTransactionComplete(txHash);
    return;
  }
  if (typeof anyProvider.awaitTransactionCompleted === "function") {
    await anyProvider.awaitTransactionCompleted(txHash);
    return;
  }
  // fallback: no-op (caller may poll manually)
}

export async function fetchWithX402(
  url: string,
  signer: UserSigner,
  init: RequestInit = {},
  opts: { ap2CredentialOverride?: string } = {}
): Promise<any> {
  const first = await fetch(url, init);
  if (first.status !== 402) {
    if (!first.ok) throw new Error(`HTTP ${first.status}`);
    return first.json();
  }

  const headerValue = first.headers.get("x-payment-required") ?? first.headers.get("X-Payment-Required");
  if (!headerValue) throw new Error("402 received, but missing X-Payment-Required header");

  const req = parseXPaymentRequired(headerValue);
  const receiver = Address.fromBech32(req.address);

  const sender = signer.getAddress();
  const account = await provider.getAccount(sender);

  const valueWei = egldToWei(req.amountEGLD);

  // Critical: build payment tx (simple EGLD transfer) as proof for x402 gate
  const tx = new Transaction({
    sender,
    receiver,
    value: valueWei,
    gasLimit: 50_000n,
    chainID: CHAIN_ID,
    nonce: BigInt(account.nonce),
    data: new TransactionPayload("x402_payment"),
  });

  const toSign = tx.serializeForSigning();
  const signature = await signer.sign(toSign);
  tx.applySignature(signature);

  const txHash = await provider.sendTransaction(tx);
  await awaitFinality(txHash);

  const ap2 = opts.ap2CredentialOverride ?? req.ap2Credential ?? "";

  const retryHeaders = new Headers(init.headers);
  retryHeaders.set("X-Payment", `token=${txHash}; amount=${req.amountEGLD}EGLD; ap2_credential=${ap2}`);

  const retry = await fetch(url, { ...init, headers: retryHeaders });
  if (!retry.ok) throw new Error(`HTTP ${retry.status} after x402 payment`);
  return retry.json();
}
