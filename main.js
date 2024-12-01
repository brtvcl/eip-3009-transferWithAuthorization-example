require("dotenv").config();
const { ethers } = require("ethers");

(async () => {
  const senderPrivateKey = process.env.SENDER_PRIVATE_KEY;
  const receiverPublicKey = process.env.RECEIVER_PUBLIC_KEY;
  const sponsorPrivateKey = process.env.SPONSOR_PRIVATE_KEY;

  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

  const sponsor = new ethers.Wallet(sponsorPrivateKey, provider);

  // Log sponsors ETH
  const sponsorBalance = await provider.getBalance(sponsor.address);
  console.log("Sponsor's ETH balance:", ethers.formatEther(sponsorBalance));

  const usdc = new ethers.Contract(
    process.env.USDC_CONTRACT_ADDRESS,
    [
      {
        inputs: [{ internalType: "address", name: "from", type: "address" }],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "from", type: "address" },
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "value", type: "uint256" },
          { internalType: "uint256", name: "validAfter", type: "uint256" },
          { internalType: "uint256", name: "validBefore", type: "uint256" },
          { internalType: "bytes32", name: "nonce", type: "bytes32" },
          { internalType: "bytes", name: "signature", type: "bytes" },
        ],
        name: "transferWithAuthorization",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "from", type: "address" },
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "value", type: "uint256" },
          { internalType: "uint256", name: "validAfter", type: "uint256" },
          { internalType: "uint256", name: "validBefore", type: "uint256" },
          { internalType: "bytes32", name: "nonce", type: "bytes32" },
          { internalType: "uint8", name: "v", type: "uint8" },
          { internalType: "bytes32", name: "r", type: "bytes32" },
          { internalType: "bytes32", name: "s", type: "bytes32" },
        ],
        name: "transferWithAuthorization",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    sponsor
  );

  // Define the EIP-712 domain and message types
  const domain = {
    name: "USD Coin",
    version: "2",
    chainId: (await provider.getNetwork()).chainId,
    verifyingContract: process.env.USDC_CONTRACT_ADDRESS,
  };

  const types = {
    TransferWithAuthorization: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "validAfter", type: "uint256" },
      { name: "validBefore", type: "uint256" },
      { name: "nonce", type: "bytes32" },
    ],
  };

  const sender = new ethers.Wallet(senderPrivateKey);

  // Define the message
  const message = {
    from: sender.address,
    to: receiverPublicKey,
    value: ethers.parseUnits("2.0", 6), // 3 USDC with 6 decimals
    validAfter: 0,
    validBefore: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour
    nonce: ethers.hexlify(ethers.randomBytes(32)),
  };

  const signature = await sender.signTypedData(domain, types, message);

  const recoveredAddress = ethers.verifyTypedData(
    domain,
    types,
    message,
    signature
  );
  if (recoveredAddress !== message.from) {
    console.error("Recovered address:", recoveredAddress);
    console.error("Expected address:", message.from);
    console.error("Recovered address does not match 'from' address");
    throw new Error("Invalid signature");
  }

  // Extract v, r, s from the signature
  //   const { v, r, s } = ethers.Signature.from(signature);
  // You can either use v, r, s or the signature directly

  // Create the transaction
  const tx = await usdc.transferWithAuthorization(
    message.from,
    message.to,
    message.value,
    message.validAfter,
    message.validBefore,
    message.nonce,
    signature
    // v,
    // r,
    // s
  );

  console.log("Transaction hash:", tx.hash);
  console.log("Waiting for the transaction to be mined...");
  await tx.wait();

  // log sender usdc balance
  const senderUsdcBalance = await usdc.balanceOf(sender.address);
  // log receiver usdc balance
  const receiverUsdcBalance = await usdc.balanceOf(receiverPublicKey);
  console.log(
    "Sender's USDC balance:",
    ethers.formatUnits(senderUsdcBalance, 6)
  );
  console.log(
    "Receiver's USDC balance:",
    ethers.formatUnits(receiverUsdcBalance, 6)
  );
  console.log("Transaction mined!");
})();
