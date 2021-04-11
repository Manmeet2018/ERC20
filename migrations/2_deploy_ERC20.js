const ERC20 = artifacts.require("ERC20"); // contractName

module.exports = (deployer) => {
  const _name = "My Token";
  const _symbol = "MTK";
  deployer.deploy(ERC20, _name, _symbol);
};
