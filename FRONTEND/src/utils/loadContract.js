import contractABI from "../abis/CollegeAttendance.json";

const loadContract = async (web3) => {
  try {
    // Get contract address from environment variable
    const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
    
    if (!contractAddress) {
      throw new Error("Contract address not found in environment variables");
    }
    
    // Log the ABI structure to debug
    console.log("Contract ABI:", contractABI);
    console.log("Contract Address:", contractAddress);
    
    // Ensure we have a valid ABI
    if (!contractABI || !Array.isArray(contractABI)) {
      throw new Error("Invalid ABI structure");
    }

    // Create the contract instance
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    
    // Log available methods
    console.log("Available contract methods:", 
      Object.keys(contract.methods).filter(key => typeof key === 'string' && !key.startsWith('0x')));
    
    return contract;
  } catch (error) {
    console.error("Error loading contract:", error);
    throw error;
  }
};

export default loadContract;