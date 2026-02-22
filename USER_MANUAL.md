# Monad Noise Map — Step-by-Step Verification Manual

## Prerequisites
- Foundry installed (`anvil`, `cast`, `forge` commands available)
- Node.js installed
- MetaMask browser extension installed

---

## PART 1: Start the Local Monad Network

### Step 1: Start Anvil (Local Monad Simulator)
Open a terminal and run:
```bash
cd ~/Desktop/monad/contracts
source ~/.zshenv
anvil
```

You will see 10 accounts each with 10000 ETH (this is MON on our local Monad).
**Keep this terminal open — it must stay running.**

Important addresses to note:
- **Account 0 (Admin)**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
  - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **Account 1 (Citizen)**: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` 
  - Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

> **Note**: Anvil always shows "ETH" in its output. On our local Monad simulation,
> this IS the native MON token. The frontend UI will correctly display "MON".

---

## PART 2: Deploy Smart Contracts

### Step 2: Deploy to Local Monad
Open a **second terminal** and run:
```bash
cd ~/Desktop/monad/contracts
source ~/.zshenv
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
forge script script/Deploy.s.sol:DeployScript --rpc-url http://127.0.0.1:8545 --broadcast
```

Expected output (look for these lines):
```
MockZKVerifier deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
NoiseSensingProtocol deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

✅ **Verification**: You should see `✅ [Success]` for both transactions.

---

## PART 3: CLI Verification (No Browser Needed)

### Step 3: Run the Automated CLI Test
In the same second terminal:
```bash
cd ~/Desktop/monad
source ~/.zshenv
bash cli_test.sh
```

This runs 7 tests automatically:
1. ✅ Checks initial balances
2. ✅ Admin creates an event (0.001 MON reward × 5 submissions = 0.005 MON pool)
3. ✅ Reads event state on-chain
4. ✅ Citizen submits noise data and receives MON
5. ✅ Duplicate submission is rejected
6. ✅ Invalid ZK proof is rejected
7. ✅ Second citizen successfully submits

Expected final output: `ALL 7 TESTS PASSED ✅`

### Step 4: Manual CLI Commands (Optional)
If you want to run individual commands yourself:

**Check a balance:**
```bash
cast balance 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --ether -r http://127.0.0.1:8545
```

**Admin creates an event (reward=0.001 MON, 3 submissions, pool=0.003 MON):**
```bash
cast send 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 \
  "createEvent(string,uint256,uint256)" \
  "MY_LOCATION" 3 1000000000000000 \
  --value 3000000000000000 \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```
> 1000000000000000 wei = 0.001 MON (same as 0.001 ETH in wei)

**Citizen submits noise data (eventId=0, noise=85dB, valid ZK proof 0x01):**
```bash
cast send 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 \
  "submitNoiseData(uint256,uint256,bytes)" \
  0 85000 0x01 \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

**Check citizen balance after (should increase by ~0.001):**
```bash
cast balance 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --ether -r http://127.0.0.1:8545
```

---

## PART 4: Frontend UI Verification

### Step 5: Setup MetaMask for Local Monad

1. Open MetaMask in your browser
2. Click the network dropdown → **Add Network** → **Add a network manually**
3. Fill in:
   - **Network Name**: `Monad Local`
   - **New RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `MON`
4. Click **Save**

### Step 6: Import Admin Account into MetaMask

1. In MetaMask, click your account icon → **Import Account**
2. Select "Private Key" and paste:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
3. Click **Import**
4. You should see ~10000 MON in this account

### Step 7: Start the Frontend
Open a **third terminal**:
```bash
cd ~/Desktop/monad/frontend
npm run dev
```

Open your browser to: **http://localhost:3000**

### Step 8: Test Admin Portal (Create Event)

1. Go to **http://localhost:3000/admin**
2. Click **Connect Wallet** → MetaMask will pop up → Approve
3. Fill in the form:
   - Location: `Central Park`
   - Required Data Points: `5`
   - Reward per Sub (MON): `0.001`
4. Click **Deploy Event to Network**
5. MetaMask will pop up asking to confirm the transaction
6. Confirm in MetaMask
7. ✅ You should see "Event Successfully Created!" with a green checkmark

### Step 9: Test Citizen Portal (Submit Noise Data)

1. In MetaMask, import Citizen account (Account 1):
   ```
   0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
   ```
2. Switch to this Citizen account in MetaMask
3. Go to **http://localhost:3000/citizen**
4. Click **Connect Wallet** → Approve
5. Move the decibel slider to any value
6. Click **Submit Reading & Earn MON**
7. Confirm in MetaMask
8. ✅ You should see the transaction confirmed and your MON balance update

---

## Quick Reference: Wei Conversion

| MON Amount | Wei Value             |
|------------|-----------------------|
| 0.001      | 1000000000000000      |
| 0.01       | 10000000000000000     |
| 0.1        | 100000000000000000    |
| 1          | 1000000000000000000   |

---

## Troubleshooting

**"Deploy Event" button does nothing:**
- Make sure MetaMask is connected to "Monad Local" network (Chain ID 31337)
- Make sure Anvil is running (just `anvil`, no special flags needed)
- Check browser console (F12) for error messages

**MetaMask shows "nonce too high":**
- This happens if you restart Anvil. In MetaMask:
  Settings → Advanced → Clear Activity Tab Data

**Transaction reverts:**
- Admin: Make sure you're using Account 0 (the deployer/admin)
- Citizen: Make sure an event exists (create one first via Admin portal)
- Citizen: Each citizen can only submit once per event
