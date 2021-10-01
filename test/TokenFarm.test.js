const TokenFarm = artifacts.require('TokenFarm')
const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')

//chai will help us in assertion
//or it will help in writing better test throughout the project

require('chai')
    .use(require('chai-as-promised'))
    .should()

// this function is a helping function created to avoid using web3.utils.toWei again and again during tranfer of DAPP Tokens
    function tokens(n) {
        return web3.utils.toWei(n, 'ether');
      }
      // Test Function
      contract('TokenFarm', ([owner, investor]) => {
        let daiToken, dappToken, tokenFarm
        
        // this function runs before all the describe function so that we dont have to load contracts again and again in each describe function
        before(async () => {
          // Load Contracts
          daiToken = await DaiToken.new()
          dappToken = await DappToken.new()
          tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)
      
          // Transfer all Dapp tokens to farm (1 million)
          //here in place of 1000000 we can use that helping function
          await dappToken.transfer(tokenFarm.address, tokens('1000000'))
      
          // Send tokens to investor
          //owner and investor defined above in contract(Token Farm,   )
          await daiToken.transfer(investor, tokens('100'), { from: owner })
        })
      
        describe('Mock DAI deployment', async () => {
          it('has a name', async () => {
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
          })
        })
      
        describe('Dapp Token deployment', async () => {
          it('has a name', async () => {
            const name = await dappToken.name()
            assert.equal(name, 'DApp Token')
          })
        })
      
        describe('Token Farm deployment', async () => {
          it('has a name', async () => {
            const name = await tokenFarm.name()
            assert.equal(name, 'Dapp Token Farm')
          })
          
          /// Test to check that TokenFarm Contract has Tokens
          it('contract has tokens', async () => {
            let balance = await dappToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), tokens('1000000'))
          })
        })
      
        // test function for function stakeTokens defined in TokenFarm.sol
        describe('Farming tokens', async () => {
      
          it('rewards investors for staking mDai tokens', async () => {
            let result
      
            // Check investor balance before staking
            result = await daiToken.balanceOf(investor)

            // so we know its 100 DAI tokens before they stake..as in ganache accounts...soe here 
            // we say 100 tokens... if we change it to some other value then the test will fail and the 'investor mock....' msg will be displayed
            assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct before staking')
      
            // now if everyhting is coreect here then we can go furher and check for stake token and all its deposits isstaked hasstaked functionalities
            // Stake Mock DAI Tokens :-- this is done in 2nd line form here below
            // but before that the 1st line approves from the investors side that tokenfarm can stake DAI Tokens on his behalf
            // this is a very imp point bcz without that approval tokenFarm function cant be called and executed
            // if executed then the test will fail..hence 1st line is extremely important
            // here we have approved and staked 100 DAI Tokens
            await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor })
            await tokenFarm.stakeTokens(tokens('100'), { from: investor })
      
            // Check staking result
            result = await daiToken.balanceOf(investor)
            // the value of DAItoken is for 0 we are checking bcz there shouldnt be any balance left in their wallet
            // after they staked all the 100 DAI Tokens
            assert.equal(result.toString(), tokens('0'), 'investor Mock DAI wallet balance correct after staking')
      
            // now we check for balance in token farm which should be credited with 100 DAItokens just transfered from invsetors wallet
            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('100'), 'Token Farm Mock DAI balance correct after staking')
      
            // make sure that the staking balance is also 100
            // stakingbalance is the mapping function we had created in TokenFarm.sol file to check how many tokens investor is currently stakiing
            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')
      
            // check for investor is currently staking or not
            // for that also we had defined a mapping function isStaking to keep track of that status of investor
            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'true', 'investor staking status correct after staking')
      
            // Issue Tokens
            await tokenFarm.issueTokens({ from: owner })
      
            // Check balances after issuance
            // check for 100 DAPP tokens bcz invsestor has deposited 100 DAI Tokens so it should get 100 DAPP tokens
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor DApp Token wallet balance correct affter issuance')
      
            // Ensure that only onwer can issue tokens
            await tokenFarm.issueTokens({ from: investor }).should.be.rejected;
      
            // Unstake tokens
            await tokenFarm.unstakeTokens({ from: investor })
      
            // Check results after unstaking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct after staking')
      
            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('0'), 'Token Farm Mock DAI balance correct after staking')
      
            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after staking')
      
            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'false', 'investor staking status correct after staking')
          })
        })
      
      })