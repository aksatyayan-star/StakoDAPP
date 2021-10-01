const Migrations = artifacts.require("Migrations");

//migration file puts new contracts in the blockchain

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
