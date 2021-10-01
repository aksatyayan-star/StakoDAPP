// script that allow deployer to issue tokens anytime we want to
// truffle allows us to write scripts that we acn run them from command line and issue tokens that way

//import smart contract first
const TokenFarm = artifacts.require('TokenFarm')

module.exports = async function(callback){
     let tokenFarm = await TokenFarm.deployed()
     await tokenFarm.issueTokens()

     //Code goes here
     console.log("Tokens Issued")

     callback()
}