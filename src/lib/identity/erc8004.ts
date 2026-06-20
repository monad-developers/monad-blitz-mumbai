import {
  createPublicClient,
  createWalletClient,
  decodeEventLog,
  http,
  isAddress,
  parseAbi,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { ENV } from "../config/env";

const transferEventAbi = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
]);

const mintAbi = parseAbi([
  "function mint(address to, string tokenURI) returns (uint256)",
  "function safeMint(address to, string tokenURI) returns (uint256)",
]);

export type MintIdentityInput = {
  prophetId: string;
  name: string;
  tokenUri: string;
};

function deterministicMockTokenId(prophetId: string): string {
  const base = prophetId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return String(100000 + base);
}

export async function mintProphetIdentity(
  input: MintIdentityInput,
): Promise<{ tokenId: string; txHash: string | null }> {
  if (ENV.mockLlm) {
    return {
      tokenId: deterministicMockTokenId(input.prophetId),
      txHash: null,
    };
  }

  if (!ENV.mintPrivateKey) {
    throw new Error("MONAD_MINTER_PRIVATE_KEY is required when MOCK_LLM=false");
  }

  if (!ENV.mintToAddress || !isAddress(ENV.mintToAddress)) {
    throw new Error("MONAD_MINTER_TO_ADDRESS must be a valid EVM address");
  }

  const account = privateKeyToAccount(ENV.mintPrivateKey as `0x${string}`);
  const walletClient = createWalletClient({
    account,
    chain: undefined,
    transport: http(ENV.monadRpc),
  });
  const publicClient = createPublicClient({ transport: http(ENV.monadRpc) });

  let hash: `0x${string}`;
  try {
    hash = await walletClient.writeContract({
      address: ENV.identityRegistry as `0x${string}`,
      abi: mintAbi,
      functionName: "mint",
      args: [ENV.mintToAddress as `0x${string}`, input.tokenUri],
      account,
      chain: null,
    });
  } catch {
    hash = await walletClient.writeContract({
      address: ENV.identityRegistry as `0x${string}`,
      abi: mintAbi,
      functionName: "safeMint",
      args: [ENV.mintToAddress as `0x${string}`, input.tokenUri],
      account,
      chain: null,
    });
  }

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const transferLog = receipt.logs.find((log) => {
    try {
      decodeEventLog({ abi: transferEventAbi, data: log.data, topics: log.topics });
      return true;
    } catch {
      return false;
    }
  });

  if (!transferLog) {
    throw new Error("Mint transaction succeeded but token ID could not be decoded");
  }

  const decoded = decodeEventLog({
    abi: transferEventAbi,
    data: transferLog.data,
    topics: transferLog.topics,
  });

  return {
    tokenId: String(decoded.args.tokenId),
    txHash: hash,
  };
}
