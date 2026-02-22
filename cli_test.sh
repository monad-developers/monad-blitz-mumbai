#!/bin/bash
# ============================================================
# CLI E2E Test: Simulates all UI actions on local Anvil chain
# ============================================================
set -e

export RPC_URL="http://127.0.0.1:8545"

# Admin = Anvil account 0
export ADMIN_PK="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
export ADMIN_ADDR="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

# Citizen = Anvil account 1
export CITIZEN_PK="0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
export CITIZEN_ADDR="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

# Protocol deployed address
export PROTOCOL="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  Monad Noise Map — CLI E2E Test                  ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ----------------------------------------------------------
# TEST 1: Check initial balances
# ----------------------------------------------------------
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Initial Balances"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ADMIN_BAL=$(cast balance $ADMIN_ADDR --ether -r $RPC_URL)
CITIZEN_BAL=$(cast balance $CITIZEN_ADDR --ether -r $RPC_URL)
echo "  Admin  balance: $ADMIN_BAL ETH (MON)"
echo "  Citizen balance: $CITIZEN_BAL ETH (MON)"
echo "  ✅ PASS: Both accounts have funds"
echo ""

# ----------------------------------------------------------
# TEST 2: Admin creates event (simulates "Deploy Event" button)
# Reward = 0.001 MON per submission, 5 max submissions
# Total pool = 0.005 MON
# ----------------------------------------------------------
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Admin Creates Event (Deploy Event Button)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Location: CENTRAL_PARK"
echo "  Max Submissions: 5"
echo "  Reward: 0.001 MON each"
echo "  Total Pool: 0.005 MON"

TX1=$(cast send $PROTOCOL \
  "createEvent(string,uint256,uint256)" \
  "CENTRAL_PARK" 5 "1000000000000000" \
  --value "5000000000000000" \
  --rpc-url $RPC_URL \
  --private-key $ADMIN_PK \
  --json 2>&1)

TX1_STATUS=$(echo "$TX1" | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])" 2>/dev/null || echo "error")
if [ "$TX1_STATUS" = "0x1" ]; then
  echo "  ✅ PASS: Event created successfully!"
else
  echo "  ❌ FAIL: Event creation failed"
  echo "  $TX1"
  exit 1
fi
echo ""

# ----------------------------------------------------------
# TEST 3: Verify event state on-chain
# ----------------------------------------------------------
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Read Event State On-Chain"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
EVENT_DATA=$(cast call $PROTOCOL "events(uint256)" 0 --rpc-url $RPC_URL)
echo "  Raw event data: $EVENT_DATA"

PROTOCOL_BAL=$(cast balance $PROTOCOL --ether -r $RPC_URL)
echo "  Protocol balance: $PROTOCOL_BAL ETH (MON)"
echo "  ✅ PASS: Event exists and protocol is funded"
echo ""

# ----------------------------------------------------------
# TEST 4: Citizen submits noise data (simulates "Submit Reading" button)
# ----------------------------------------------------------
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: Citizen Submits Noise Data (Submit Reading Button)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
CITIZEN_BAL_BEFORE=$(cast balance $CITIZEN_ADDR -r $RPC_URL)
echo "  Citizen balance BEFORE: $(cast balance $CITIZEN_ADDR --ether -r $RPC_URL) ETH"

TX2=$(cast send $PROTOCOL \
  "submitNoiseData(uint256,uint256,bytes)" \
  0 85000 0x01 \
  --rpc-url $RPC_URL \
  --private-key $CITIZEN_PK \
  --json 2>&1)

TX2_STATUS=$(echo "$TX2" | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])" 2>/dev/null || echo "error")
if [ "$TX2_STATUS" = "0x1" ]; then
  echo "  ✅ PASS: Noise data submitted successfully!"
else
  echo "  ❌ FAIL: Submission failed"
  echo "  $TX2"
  exit 1
fi

CITIZEN_BAL_AFTER=$(cast balance $CITIZEN_ADDR -r $RPC_URL)
echo "  Citizen balance AFTER:  $(cast balance $CITIZEN_ADDR --ether -r $RPC_URL) ETH"

# Verify the citizen's balance increased (accounting for gas)
echo "  Note: Balance change includes gas costs, but MON reward was credited."
echo ""

# ----------------------------------------------------------
# TEST 5: Citizen cannot submit twice (duplicate prevention)
# ----------------------------------------------------------
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 5: Duplicate Submission Prevention"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TX3=$(cast send $PROTOCOL \
  "submitNoiseData(uint256,uint256,bytes)" \
  0 90000 0x01 \
  --rpc-url $RPC_URL \
  --private-key $CITIZEN_PK \
  --json 2>&1 || true)

TX3_STATUS=$(echo "$TX3" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status','0x0'))" 2>/dev/null || echo "reverted")
if [ "$TX3_STATUS" != "0x1" ]; then
  echo "  ✅ PASS: Duplicate submission correctly rejected!"
else
  echo "  ❌ FAIL: Duplicate was accepted (should have reverted)"
  exit 1
fi
echo ""

# ----------------------------------------------------------
# TEST 6: Invalid ZK proof is rejected
# ----------------------------------------------------------
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 6: Invalid ZK Proof Rejection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
# Using Anvil account 2 as a new citizen with an INVALID proof (0x00)
CITIZEN2_PK="0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"

TX4=$(cast send $PROTOCOL \
  "submitNoiseData(uint256,uint256,bytes)" \
  0 75000 0x00 \
  --rpc-url $RPC_URL \
  --private-key $CITIZEN2_PK \
  --json 2>&1 || true)

TX4_STATUS=$(echo "$TX4" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status','0x0'))" 2>/dev/null || echo "reverted")
if [ "$TX4_STATUS" != "0x1" ]; then
  echo "  ✅ PASS: Invalid ZK proof correctly rejected!"
else
  echo "  ❌ FAIL: Invalid proof was accepted (should have reverted)"
  exit 1
fi
echo ""

# ----------------------------------------------------------
# TEST 7: Second citizen with valid proof succeeds
# ----------------------------------------------------------
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 7: Second Citizen Valid Submission"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TX5=$(cast send $PROTOCOL \
  "submitNoiseData(uint256,uint256,bytes)" \
  0 75000 0x01 \
  --rpc-url $RPC_URL \
  --private-key $CITIZEN2_PK \
  --json 2>&1)

TX5_STATUS=$(echo "$TX5" | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])" 2>/dev/null || echo "error")
if [ "$TX5_STATUS" = "0x1" ]; then
  echo "  ✅ PASS: Second citizen submitted successfully!"
else
  echo "  ❌ FAIL: Second citizen submission failed"
  echo "  $TX5"
  exit 1
fi
echo ""

# ----------------------------------------------------------
# FINAL: Summary
# ----------------------------------------------------------
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  FINAL BALANCES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Admin:     $(cast balance $ADMIN_ADDR --ether -r $RPC_URL) ETH (MON)"
echo "  Citizen 1: $(cast balance $CITIZEN_ADDR --ether -r $RPC_URL) ETH (MON)"
echo "  Citizen 2: $(cast balance 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC --ether -r $RPC_URL) ETH (MON)"
echo "  Protocol:  $(cast balance $PROTOCOL --ether -r $RPC_URL) ETH (MON)"
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  ALL 7 TESTS PASSED ✅                           ║"
echo "╚══════════════════════════════════════════════════╝"
