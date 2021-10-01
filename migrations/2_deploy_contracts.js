const TokenFarm = artifacts.require('TokenFarm')
const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')
//migration file puts new contracts in the blockchain
// so we import all daitoken , dapptoken and tokenfarm smartcontracts in this file

module.exports = async function(deployer, network, accounts) {
  
  //deploy mock DAI Token
  await deployer.deploy(DaiToken)
  const daiToken =  await DaiToken.deployed()

  //deploy DAPP Token
  await deployer.deploy(DappToken)
  const dappToken =  await DappToken.deployed()

  //deploy TokenFarm
  await deployer.deploy(TokenFarm, dappToken.address, daiToken.address)
  const tokenFarm = await TokenFarm.deployed()

  //all the tokens in a liquidy pool so that an app can distribute those tokens
// so transfer DAPP tokens to TokenFarm.. so that when a user deposits DAI token he ors he can be given DAPP token by liquidity mining or yield farming

//in solidity there is no decimal so here in ether or dapp 18 decimal places are there
// i.e 1 DAPP= 1.000000000000000000 in real world representation..
// but in solidity its written as 1000000000000000000 i.e 18 zeroes afer 1 without any decimal

  //Transfer all DAPP Tokens to TokenFarm i.e here 1000000
  await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')

  // in the ganache lets say the first account is associated with deploying smart contracts and all that in the ethereum network
  // and second or further accounts as investors

    //now Transfer 100 Mock DAI Tokens to investor...here to account no 2
  await daiToken.transfer(accounts[1], '100000000000000000000')

}
