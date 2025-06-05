const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const fetch = require('node-fetch');
// XRPL EVM Faucet URL
const FAUCET_URL = 'https://faucet.evm-sidechain.xrpl.org/accounts';

router.get('/generate-xrpl-evm-wallet', (req, res) => {
  try {
    const wallet = ethers.Wallet.createRandom();

    return res.json({
      success: true,
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic.phrase
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Wallet generation failed.' });
  }
});

module.exports = router;