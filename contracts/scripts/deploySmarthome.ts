import {ethers} from "hardhat";


async function main() {
  if (!process.env.ORACLE_ADDRESS) {
    throw new Error("ORACLE_ADDRESS env variable is not set.");
  }
  const oracleAddress: string = process.env.ORACLE_ADDRESS;
  await deploySmartHome(oracleAddress);
}


async function deploySmartHome(oracleAddress: string) {
  // const registry = await ethers.deployContract("SmartHomeRegistry")
  // await registry.waitForDeployment();
  // console.log(`Registry contract deployed to ${registry.target}`);

  const agent = await ethers.deployContract("SmartHomeAi", [oracleAddress, '0x9a312aDFEA6A91eefdb8c7396F820d9B6460B5b2' /*await registry.getAddress()*/], {});
  await agent.waitForDeployment();
  console.log(`AI contract deployed to ${agent.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});