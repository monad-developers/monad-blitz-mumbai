import { createPublicClient, createWalletClient, http, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import dotenv from 'dotenv';

dotenv.config();

// Define the Monad Testnet chain configuration
export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_MONAD_RPC || 'https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
});

const privateKey = process.env.PRIVATE_KEY;
const registryAddress = process.env.NEXT_PUBLIC_SCHISM_REGISTRY as `0x${string}`;

if (!privateKey) {
  throw new Error("PRIVATE_KEY is not defined in environment variables.");
}

if (!registryAddress) {
  throw new Error("NEXT_PUBLIC_SCHISM_REGISTRY address is not defined in environment variables.");
}

// Convert private key to Viem Account
const account = privateKeyToAccount(privateKey as `0x${string}`);

// Create Public Client for querying state/logs
export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

// Create Wallet Client for writing/sending transactions
export const walletClient = createWalletClient({
  account,
  chain: monadTestnet,
  transport: http(),
});

// ABI for the SchismRegistry contract
export const schismRegistryAbi = [
  {
    "type": "function",
    "name": "recordSchism",
    "inputs": [
      { "name": "parentId", "type": "uint256", "internalType": "uint256" },
      { "name": "newId", "type": "uint256", "internalType": "uint256" },
      { "name": "justification", "type": "string", "internalType": "string" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "recordAlliance",
    "inputs": [
      { "name": "ideologyA", "type": "uint256", "internalType": "uint256" },
      { "name": "ideologyB", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "SchismRecorded",
    "inputs": [
      { "name": "parentId", "type": "uint256", "indexed": false, "internalType": "uint256" },
      { "name": "newId", "type": "uint256", "indexed": false, "internalType": "uint256" },
      { "name": "justification", "type": "string", "indexed": false, "internalType": "string" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "AllianceRecorded",
    "inputs": [
      { "name": "ideologyA", "type": "uint256", "indexed": false, "internalType": "uint256" },
      { "name": "ideologyB", "type": "uint256", "indexed": false, "internalType": "uint256" }
    ],
    "anonymous": false
  }
] as const;

/**
 * Call on-chain recordSchism on the SchismRegistry contract.
 */
export async function recordSchismOnChain(parentId: number, newId: number, justification: string) {
  console.log(`Submitting on-chain recordSchism transaction: parent=${parentId}, new=${newId}...`);
  const hash = await walletClient.writeContract({
    address: registryAddress,
    abi: schismRegistryAbi,
    functionName: 'recordSchism',
    args: [BigInt(parentId), BigInt(newId), justification],
  });
  console.log(`Transaction submitted. Hash: ${hash}`);
  
  // Wait for transaction receipt
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
  return { hash, blockNumber: receipt.blockNumber };
}

/**
 * Call on-chain recordAlliance on the SchismRegistry contract.
 */
export async function recordAllianceOnChain(ideologyA: number, ideologyB: number) {
  console.log(`Submitting on-chain recordAlliance transaction: A=${ideologyA}, B=${ideologyB}...`);
  const hash = await walletClient.writeContract({
    address: registryAddress,
    abi: schismRegistryAbi,
    functionName: 'recordAlliance',
    args: [BigInt(ideologyA), BigInt(ideologyB)],
  });
  console.log(`Transaction submitted. Hash: ${hash}`);
  
  // Wait for transaction receipt
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
  return { hash, blockNumber: receipt.blockNumber };
}
