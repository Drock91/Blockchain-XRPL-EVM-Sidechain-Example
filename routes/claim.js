require('dotenv').config();
const express = require('express');
const router = express.Router();
const { contract } = require('../config/contractConfig.js');

router.post('/api/next-claim-time', async (req, res) => {
  console.error('Starting: /api/next-claim-time');
  const { userAddress } = req.body;
  if (!userAddress) {
    return res.status(400).json({ success: false, error: 'Missing user address.' });
  }

  try {
    const lastClaim = await contract.lastClaim(userAddress);
    const cooldown = 86400; // 24 hours
    const now = Math.floor(Date.now() / 1000);
    const nextClaim = parseInt(lastClaim.toString()) + cooldown;
    const secondsLeft = Math.max(nextClaim - now, 0);

    res.json({ success: true, secondsLeft, nextClaimUnix: nextClaim });
  } catch (err) {
    console.error('Error fetching claim time:', err);
    res.status(500).json({ success: false, error: 'Unable to fetch next claim time.' });
  }
});
router.post('/api/claim-rewards', async (req, res) => {
  console.log('Starting: /api/claim-rewards');
  const { userAddress } = req.body;

  if (!userAddress) {
    return res.status(400).json({ success: false, error: 'Missing user address.' });
  }

  try {
    const lastClaim = await contract.lastClaim(userAddress);
    const cooldown = 86400; // 24 hours in seconds
    const now = Math.floor(Date.now() / 1000);
    const nextClaim = parseInt(lastClaim.toString()) + cooldown;

    if (now < nextClaim) {
      const secondsLeft = nextClaim - now;
      return res.status(200).json({
        success: false,
        error: `Cooldown active. Try again in ${secondsLeft} seconds.`,
        secondsLeft,
        nextClaimUnix: nextClaim
      });
    }

    // Claim is allowed, now send the transaction
    const tx = await contract.claim(); // assumes `contract` is connected with signer
    const receipt = await tx.wait();

    return res.status(200).json({
      success: true,
      message: 'Claim successful',
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    });

  } catch (err) {
    console.error('Error processing claim:', err);
    return res.status(500).json({
      success: false,
      error: err.reason || err.message || 'Claim transaction failed'
    });
  }
});


module.exports = router;
