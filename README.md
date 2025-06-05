# 🎮 Daily Claim DApp – XRPL EVM Multichain Buff Tracker

Welcome to the **Daily Claim DApp**, a browser-based Node.js/Express web application that allows users to earn and track multichain buffs by interacting with an XRPL EVM smart contract. Designed as part of the broader **DragonKill** metaverse, this app serves as the prototype for multichain reward mechanics, bridging gameplay outcomes to on-chain benefits.

---

## 🚀 Features

- 🧠 **Smart Contract Integration (XRPL EVM Sidechain)**  
  Interact directly with a deployed contract on the [XRPL EVM Sidechain](https://evm-sidechain.xrpl.org/).

- ⛓️ **Multichain Buff System**  
  Track player buffs earned from defeating bosses representing multiple chains (e.g. Ethereum, Solana, Avalanche).

- 🕓 **Cooldown & Reward System**  
  Implements 24-hour cooldown tracking and reward claiming via `claim()` function in smart contract.

- 🛠️ **MongoDB Integration**  
  Uses MongoDB to persist buff states and enable faster queries without always calling the chain.

- 🎮 **Game-Integrated Assets**  
  Includes audio for in-game events (boss death, hits, power-ups) to tie into the larger retro-style game environment.

- 🧪 **EJS Frontend Rendering**  
  Lightweight EJS templating used for displaying UI and interacting with smart contracts through forms or buttons.

---

## 📁 Project Structure

daily-claim-dapp/
├── config/ # Contract and DB configs
├── models/ # Mongoose schema for buff tracking
├── public/assets/music # Game sound FX and music
├── routes/ # Express route handlers (claim, buff, contract APIs)
├── views/ # EJS templates
├── index.js # Express server entry point
├── .env.example # Sample environment config---

## 🔐 Environment Variables

Create a `.env` file (already `.gitignore`d) in the root folder based on `.env.example`:

```env
XRPL_PRIVATE_KEY=your_private_metamask_key_here
PORT=3000
MONGO_URI=mongodb://localhost:27017/daily-claim-dapp
```
# Install dependencies
npm install

# Run MongoDB (if not already running)
mongod

# Start the server
node index.js


function addBuff(address user, string memory network);
function claim();
function lastClaim(address user) public view returns (uint256);
function getCooldownRemaining(address user) public view returns (uint256);
function getActiveNetworks(address user, string[] memory networks) public view returns (bytes32[]);

Deployed at:
Contract Address: 0x40140c0cf5e6b5c9df777012c1e8599afdafc8ff
RPC: https://rpc-evm-sidechain.xrpl.org

```
| Method | Endpoint                | Description                       |
| ------ | ----------------------- | --------------------------------- |
| POST   | `/api/add-buff`         | Adds or refreshes a network buff  |
| POST   | `/api/claim-rewards`    | Claims daily rewards (if allowed) |
| POST   | `/api/next-claim-time`  | Returns time remaining to claim   |
| POST   | `/api/get-active-buffs` | Lists currently active buffs      |
```


🧩 Coming Soon
🎯 Axelar integration for remote chain reward dispatch

🌐 Full game deployment with daily boss rotations

🔄 Auto-refreshing frontend UI with cooldown tracking

🎨 NFT minting from buffs via XRPL XLS-20 standard

📜 License
MIT © 2025 Derek Heinrichs

🧠 Learn More
🔗 XRPL EVM Sidechain

🔗 Axelar GMP Docs
