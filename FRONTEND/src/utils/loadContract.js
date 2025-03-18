import contractABI from "../abis/CollegeAttendance.json";

const loadContract = async (web3) => {
  // Hardcode the contract address
  const contractAddress = "0xE18C9888139938e0207f29317e79BD86332D3b39";
  const rawAbi = contractABI.abi[0];
  const abi = Array.isArray(rawAbi) ? rawAbi : contractABI.abi;
  const contract = new web3.eth.Contract(abi, contractAddress);
  
  console.log("Available contract methods:", 
    Object.keys(contract.methods).filter(key => typeof key === 'string' && !key.startsWith('0x')));
  
  return contract;
};

export default loadContract;