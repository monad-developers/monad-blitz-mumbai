# Deploying to Monad Testnet

Once you have tested locally on Anvil, use this guide to deploy onto the live Monad Testnet.

## 1. Get Monad Testnet RPC & Tokens
1. Visit the Monad Official Discord or documentation to get the latest public Testnet RPC URL (e.g., `https://testnet-rpc.monad.xyz/`).
2. Use the Monad Faucet in their Discord or web portal to get some testnet $MON tokens to your deployer wallet.

## 2. Set Environment Variables
In your terminal, temporarily export your real wallet private key (or use a `.env` file):

```bash
export PRIVATE_KEY="your-real-testnet-private-key-here"
export MONAD_RPC_URL="https://testnet-rpc.monad.xyz/"
```

## 3. Deploy the Smart Contracts
Run the standard Foundry deployment script targeting the external RPC URL:

```bash
cd contracts
forge script script/Deploy.s.sol:DeployScript --rpc-url $MONAD_RPC_URL --broadcast
```

## 4. Update the Frontend
Once deployed, copy the new contract address from the deployment output and place it in the frontend's constants file:

```typescript
// frontend/src/lib/contracts.ts
export const PROTOCOL_ADDRESS = "0xYourNewMonadTestnetAddress" as const;
```

Update your Wagmi providers (`Providers.tsx`) to point to the custom Monad Testnet using the chain configuration instead of Local Anvil.
