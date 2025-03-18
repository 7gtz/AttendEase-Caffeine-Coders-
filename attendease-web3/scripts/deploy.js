const hre = require("hardhat");

async function main() {
  const deployedContract = await hre.ethers.deployContract("CollegeAttendance");
  await deployedContract.waitForDeployment();
  console.log(`College Attendance contract deployed to ${deployedContract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});