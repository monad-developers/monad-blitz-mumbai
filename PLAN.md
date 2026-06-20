# Cult Simulator — Full Build Plan
### Stack: Next.js + Neon (Postgres) + Monad (Foundry / ERC-8004 / x402)

---

## 1. Stack & Architecture

| Layer | Tool | What lives here |
|---|---|---|
| App | Next.js (App Router) | Frontend + API routes / server actions |
| Off-chain data | Neon (serverless Postgres) | Ideologies, doctrine text, chat logs, events, feedback — fast, cheap, no gas |
| On-chain identity | ERC-8004 (already deployed on Monad) | Prophet identity NFT + agent card + reputation |
| On-chain log | Custom contract via Monad Foundry | Schism + alliance records only |
| On-chain payments | x402 | Pay-per-interaction with a prophet |

**Rule of thumb:** anything high-frequency (chat, reflection state, event feed) stays in Neon. Only what needs to be *portable, verifiable, or paid for* touches Monad. This keeps the chain footprint small and the hackathon build fast — most of your 10 USPs are pure Neon + Next.js, only 3 touch Monad directly (F1/F7 identity, F10 chain log, F2/F4 payments).

---

## 2. Neon Postgres + Next.js Setup

1. Create a Neon project, copy the **pooled** connection string (serverless-safe).
2. `npm install @neondatabase/serverless` (or use Prisma/Drizzle with the Neon driver adapter — Drizzle is faster to set up for a one-day hackathon).
3. `.env.local`:
   ```
   DATABASE_URL=postgres://<user>:<password>@<project>.neon.tech/<db>?sslmode=require
   ```
4. Minimal schema:
   ```sql
   ideologies(id, name, founder_prophet_id, doctrine_version, followers, reputation, treasury)
   prophets(id, ideology_id, personality, history, goal, erc8004_token_id)
   doctrine_versions(id, ideology_id, version, text, reason, created_at)
   events(id, type, ideology_id, payload, created_at)
   feedback(id, ideology_id, user_id, text, created_at)
   schisms(id, parent_ideology_id, new_ideology_id, justification, created_at)
   ```
5. Query from Next.js Route Handlers (`app/api/.../route.ts`) or Server Actions — no separate backend needed.

---

## 3. Monad Foundry — Smart Contract Tooling

Used for ONE thing in this build: a minimal `SchismRegistry` contract that logs schism + alliance events on-chain. Everything else stays off-chain in Neon.

**Install:**
```bash
curl -L https://foundry.category.xyz | bash
foundryup --network monad
```
This installs `forge`, `cast`, `anvil`, `chisel` with Monad support.

**Scaffold a project (Monad-configured template):**
```bash
forge init --template monad-developers/foundry-monad cult-sim-contracts
cd cult-sim-contracts
```

**`foundry.toml`:**
```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
eth-rpc-url = "https://testnet-rpc.monad.xyz"
chain_id = 10143
```

**Contract sketch (`src/SchismRegistry.sol`):**
```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract SchismRegistry {
    event SchismRecorded(uint256 parentId, uint256 newId, string justification);
    event AllianceRecorded(uint256 ideologyA, uint256 ideologyB);

    function recordSchism(uint256 parentId, uint256 newId, string calldata justification) external {
        emit SchismRecorded(parentId, newId, justification);
    }

    function recordAlliance(uint256 ideologyA, uint256 ideologyB) external {
        emit AllianceRecorded(ideologyA, ideologyB);
    }
}
```

**Compile:** `forge compile`

**Get testnet funds:** [faucet.monad.xyz](https://faucet.monad.xyz)

**Deploy (keystore, recommended over raw private keys):**
```bash
cast wallet import monad-deployer --private-key $(cast wallet new | grep 'Private key:' | awk '{print $3}')
forge create src/SchismRegistry.sol:SchismRegistry --account monad-deployer --broadcast
```
Copy the deployed address into your Next.js `.env.local` as `NEXT_PUBLIC_SCHISM_REGISTRY`.

---

## 4. ERC-8004 — Prophet Identity

Each prophet gets a portable, ERC-721-based identity with an "agent card" (doctrine, personality, endpoint) and an on-chain reputation feed. **Already deployed on Monad — don't redeploy, just call the existing registries:**

- Identity Registry: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
- Reputation Registry: `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63`

**Flow:**
1. When a prophet is created (F1) or born from a schism (F7), mint an identity NFT on the Identity Registry. The token URI points to an agent card — host this as a simple Next.js API route returning JSON: `{ name, doctrine, personality, endpoint }`.
2. Store the returned `erc8004_token_id` on the `prophets` row in Neon.
3. When a user joins (F3) or gives feedback (F4), optionally submit structured feedback to the Reputation Registry so prophet trust is portable and on-chain.

For the hackathon, identity minting alone is enough to demo "these are real on-chain agents." Full reputation aggregation is a stretch goal — don't block the demo on it.

---

## 5. x402 — Agent Payments

Use case: gate ONE interaction behind a real payment to prove the "agent economy" story — recommended: pay $0.001 USDC per deep question to a prophet (F2).

**Install:**
```bash
npm install @x402/core @x402/evm @x402/fetch @x402/next
```

**`.env.local`:**
```
PAY_TO_ADDRESS=<prophet treasury wallet>
```

**Monad testnet constants:**
- Network: `eip155:10143`
- USDC (testnet): `0x534b2f3A21130d7a60830c2Df862319e593943A3`
- Facilitator: `https://x402-facilitator.molandak.org`

**Get testnet funds:**
- USDC: [faucet.circle.com](https://faucet.circle.com) → select USDC + Monad Testnet
- MON (gas): [faucet.monad.xyz](https://faucet.monad.xyz)

**Server side (Next.js route, sketch):**
```ts
// src/app/api/prophet/[id]/ask/route.ts
import { withX402, type RouteConfig } from "@x402/next";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";

const facilitator = new HTTPFacilitatorClient({ url: "https://x402-facilitator.molandak.org" });
const server = new x402ResourceServer(facilitator);

const routeConfig: RouteConfig = {
  accepts: { scheme: "exact", network: "eip155:10143", payTo: process.env.PAY_TO_ADDRESS!, price: "$0.001" },
  resource: "/api/prophet/[id]/ask",
};

async function handler(req: Request) {
  // run the roleplay agent (F2) and return the prophet's answer
}

export const POST = withX402(handler, routeConfig, server);
```

**Client side:** wrap `fetch` with `wrapFetchWithPayment` from `@x402/fetch`, sign the EIP-712 authorization with the connected wallet (wagmi) — no separate approval transaction, payment is gasless for the user.

Don't try to gate every feature behind x402 — one well-demoed paid interaction is worth more than five half-working ones.

---

## 6. Ownership, Updated With Monad Touchpoints
please refer feature-f.md for F refrence!
| Track | Owner | Features | Touches Monad/Neon for |
|---|---|---|---|
| Agent Intelligence | User 1 | F1, F5 ⭐, F7 ⭐⭐⭐ | Mints ERC-8004 identity on prophet creation/schism (§4); all reflection state in Neon (§2) |
| Chain & State | User 2 | F3, F4, F6, F10 | Owns the Neon schema (§2) end to end; builds & deploys SchismRegistry via Monad Foundry (§3); wires reputation feedback (§4) |
| Experience | User 3 | F2, F8, F9 | Builds the x402-gated chat endpoint (§5); reads Neon for the event feed |

---

## 7. Hour-by-Hour (10 hours, contract-first, max parallelism)

| Hour | User 1 | User 2 | User 3 |
|---|---|---|---|
| 0–0.5 | Lock shared schema | Spin up Neon, push schema, share `DATABASE_URL` | Pull schema, scaffold Next.js app |
| 0.5–1 | Push hardcoded ideology JSON | Install Monad Foundry, scaffold `SchismRegistry.sol` | Build UI against mock Neon rows |
| 1–3 | Real LLM gen for F1 + mint ERC-8004 identity | F3 Join Ideology (Neon write) | F2 Talk To Prophet (chat UI) |
| 3–5 | F5 Reflection Cycle ⭐ (concurrent across ideologies) | F4 Influence Doctrine | F8 Event Feed v1 |
| 5–7 | F7 Schism Generator ⭐⭐⭐ + mint new identity | Deploy `SchismRegistry` to testnet, write schism events, F6 Versioning | F8 Event Feed v2 (schisms, alliances) |
| 7–9 | Tune cadence/seed beliefs for a live demo schism | Finalize chain integration, clean repo | Build x402-gated ask endpoint (§5) |
| 9–10 | All three: merge, integration test, dry-run demo together | | |

## 8. Env Vars Checklist

```
DATABASE_URL=                          # Neon
PAY_TO_ADDRESS=                        # x402 prophet treasury wallet
NEXT_PUBLIC_MONAD_RPC=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_CHAIN_ID=10143
NEXT_PUBLIC_ERC8004_IDENTITY=0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
NEXT_PUBLIC_ERC8004_REPUTATION=0x8004BAa17C55a88189AE136b182e5fdA19dE9b63
NEXT_PUBLIC_X402_USDC=0x534b2f3A21130d7a60830c2Df862319e593943A3
NEXT_PUBLIC_X402_FACILITATOR=https://x402-facilitator.molandak.org
NEXT_PUBLIC_SCHISM_REGISTRY=           # filled in after Part 3 deploy
```

## 9. Submission Checklist
- [ ] Live deployment URL
- [ ] Public GitHub repository
- [ ] README with setup instructions
- [ ] 3-minute demo script rehearsed
- [ ] Reflection Cycle demonstrably evolving a doctrine
- [ ] At least one Schism demonstrably occurring, recorded on `SchismRegistry`
- [ ] Prophets minted as ERC-8004 identities
- [ ] At least one x402-gated paid interaction demoed
- [ ] Prophet Debate (F9) — only if time remains, not required for MVP