import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ORACLE_ADDRESS = process.env.ORACLE_ADDRESS!

const SmartHomeModule = buildModule("SmartHomeModule", (m) => {
  const registry = m.contract("SmartHomeRegistry");
  const ai = m.contract("SmartHomeAi", [ORACLE_ADDRESS, registry]);

  return { registry, ai };
});

export default SmartHomeModule;
