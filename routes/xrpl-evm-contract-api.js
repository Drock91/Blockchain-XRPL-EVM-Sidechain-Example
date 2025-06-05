const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const BuffMap = require('../models/BuffMap');
const { supportedNetworks, signer, contract } = require('../config/contractConfig.js');

router.post('/api/add-buff', async (req, res) => {
  const { userAddress, network } = req.body;

  if (!userAddress || !network) {
    return res.status(400).json({
      success: false,
      error: 'Missing userAddress or network.',
    });
  }
  try {
    console.log('Raw req.body:', req.body);
    const checksummedAddress = ethers.getAddress(userAddress);
    const cleanNetwork = network.trim();
    console.log('Calling addBuff for:', checksummedAddress, 'on', cleanNetwork);
    console.log('Signer address:', signer.address);
    const balance = await signer.provider.getBalance(signer.address);
    console.log('Signer Balance:', ethers.formatEther(balance), 'XRP');
const activeBuffs = await contract.getActiveNetworks(checksummedAddress, supportedNetworks);
console.log('Got Active Buffs:', activeBuffs.length);
// Compare each returned bytes32 hash to your original supported network names
for (let hash of activeBuffs) {
  for (let name of supportedNetworks) {
    const hashed = ethers.keccak256(ethers.toUtf8Bytes(name));
    if (hashed === hash) {
      console.log(`✅ Active Network: ${name}`);
      break;
    }
  }
}
    const tx = await contract.addBuff(checksummedAddress, cleanNetwork);
    const receipt = await tx.wait();
    console.log('Transaction Receipt:', receipt);
    updateBuff(checksummedAddress, cleanNetwork);
    return res.json({
      success: true,
      message: `Buff added for ${checksummedAddress} on ${cleanNetwork}`,
      txHash: tx.hash,
    });
  } catch (error) {
    console.error('Error adding buff:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to add buff.',
      details: error,
    });
  }
});

router.post("/api/get-active-buffs", async (req, res) => {
  try {
    const { userAddress } = req.body;
    if (!userAddress) return res.status(400).json({ error: "Missing address" });

    const provider = new ethers.JsonRpcProvider("https://rpc-evm-sidechain.xrpl.org");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const checksummed = ethers.getAddress(userAddress);

    const result = await contract.getActiveNetworks(checksummed, supportedNetworks);

    const active = [];
    for (let hash of result) {
      for (let name of supportedNetworks) {
        const hashed = ethers.keccak256(ethers.toUtf8Bytes(name));
        if (hashed === hash) {
          active.push(name);
          break;
        }
      }
    }

    res.json({ success: true, buffs: active });
  } catch (err) {
    console.error("[get-active-buffs]", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});
async function updateBuff(address, network) {
  const now = new Date();
  await BuffMap.findOneAndUpdate(
    { address },
    { $set: { [`buffs.${network}`]: now } },
    { upsert: true, new: true }
  );
}
module.exports = router;
