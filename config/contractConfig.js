require('dotenv').config();
const { ethers } = require('ethers');
const XRPL_RPC = 'https://rpc-evm-sidechain.xrpl.org';
const supportedNetworks = ["Avalanche", "Ethereum", "XRPL-EVM", "Fantom", "Polygon", "Moonbeam", "Celo", "Base", "Arbitrum", "Optimism", "BSC", "Linea", "Zeta", "Scroll"];
const CONTRACT_ADDRESS = '0x40140c0cf5e6b5c9df777012c1e8599afdafc8ff';
const ABI = [
  "function addBuff(address,string)",                                       // add or refresh a buff
  "function claim()",                                                       // claim a buff for a network
  "function getCooldownRemaining(address) view returns (uint256)",          // get cooldown time left
  "function playerBuffs(address,string) view returns (uint256)",            // raw timestamp of buff
  "function lastClaim(address) view returns (uint256)",                     // last claim timestamp
  "function getActiveNetworks(address,string[]) view returns (bytes32[])"   // ✅ corrected signature
];
const provider = new ethers.JsonRpcProvider(XRPL_RPC);
const signer = new ethers.Wallet(process.env.XRPL_PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);  // ✅ Use signer
 module.exports = {
  XRPL_RPC,
  supportedNetworks,
  CONTRACT_ADDRESS,
  ABI,
  provider,
  signer,
  contract
};