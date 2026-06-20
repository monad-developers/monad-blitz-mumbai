export const ENV = {
  databaseUrl: process.env.DATABASE_URL,
  mockLlm: (process.env.MOCK_LLM ?? "true").toLowerCase() === "true",
  llmApiUrl: process.env.LLM_API_URL,
  llmApiKey: process.env.LLM_API_KEY,
  llmModel: process.env.LLM_MODEL ?? "gpt-4o-mini",
  appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:3000",
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "10143"),
  monadRpc: process.env.NEXT_PUBLIC_MONAD_RPC ?? "https://testnet-rpc.monad.xyz",
  identityRegistry:
    process.env.NEXT_PUBLIC_ERC8004_IDENTITY ??
    "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
  mintPrivateKey: process.env.MONAD_MINTER_PRIVATE_KEY,
  mintToAddress: process.env.MONAD_MINTER_TO_ADDRESS,
  schismThreshold: Number(process.env.SCHISM_CRITICISM_THRESHOLD ?? "18"),
} as const;
