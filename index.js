require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const BuffMap = require('./models/BuffMap');

//establish routes
const generateRoutes = require('./routes/generate');
const claimRoutes = require('./routes/claim');
const xrplEVMRoutes = require('./routes/xrpl-evm-contract-api');
//establish mongodb connection
const connectDB = require('./config/db');
connectDB();
// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Define a route for the homepage
app.get('/', (req, res) => {
  res.render('index', { title: 'Multichain DApp' });
});

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Needed for JSON body parsing
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', generateRoutes);
app.use('/api', claimRoutes);
app.use('/api', xrplEVMRoutes);

// New cooldown endpoint
const { ethers } = require('ethers');

const XRPL_RPC = 'https://rpc-evm-sidechain.xrpl.org';
const supportedNetworks = ["Avalanche", "Ethereum", "XRPL-EVM", "Fantom", "Polygon", "Moonbeam", "Celo", "Base", "Arbitrum", "Optimism", "BSC", "Linea", "Zeta", "Scroll"];
const CONTRACT_ADDRESS = '0x40140c0cf5e6b5c9df777012c1e8599afdafc8ff';
const ABI = [
  "function addBuff(address,string)",                                        // add or refresh a buff
  "function claim()",                                                 // claim a buff for a network
  "function getCooldownRemaining(address) view returns (uint256)",          // get cooldown time left
  "function playerBuffs(address,string) view returns (uint256)",            // raw timestamp of buff
  "function lastClaim(address) view returns (uint256)",                     // last claim timestamp
  "function getActiveNetworks(address,string[]) view returns (bytes32[])"   // ✅ corrected signature
];
const provider = new ethers.JsonRpcProvider(XRPL_RPC);
//const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
const signer = new ethers.Wallet(process.env.XRPL_PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);  // ✅ Use signer!
app.get('/', (req, res) => {
  res.render('index'); // or whatever your EJS file is named
});
/*
app.post('/api/next-claim-time', async (req, res) => {
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
app.post('/api/claim-rewards', async (req, res) => {
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
app.post('/api/add-buff', async (req, res) => {
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

app.post("/api/get-active-buffs", async (req, res) => {
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
*/


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
