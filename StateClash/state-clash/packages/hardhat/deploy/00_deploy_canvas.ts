import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the Canvas contract to the target network.
 */
const deployCanvas: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;

    await deploy("Canvas", {
        from: deployer,
        args: [],
        log: true,
        autoMine: true,
    });

    console.log("✅ Canvas contract deployed!");
};

export default deployCanvas;

deployCanvas.tags = ["Canvas"];
