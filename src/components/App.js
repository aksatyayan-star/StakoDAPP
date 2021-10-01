import React, { Component } from 'react'
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

class App extends Component {

  // this function connects the app to blockchain-- the whole

  // the below function is a life cycle fumction in react
  async componentWillMount(){
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    // console.log(accounts)  ==  == to check account fetched in the console of the browser whwre our app is opened
    //Array(1)0: "0xb87c73205C8eC609EfaD93F0776183a8998d4Ca4"length: 1__proto__: Array(0)
    // we will get this in the console whose address matchs with the 2nd investors address in ganache and also same connected with metamask
    
    this.setState({ account: accounts[0] })
    // this function will update the below account set to 0x0 to the actual account provided by metamask
    // and we pass that down to the navbar <Navbar account={this.state.account} /> here and we should see it appear on our app page
  
    const networkId = await web3.eth.net.getId() // to get the network id of ganache...we can verify it in abis json files in network section
    // console.log(networkId) // to view the network id in console of our app page  5777 we will get to see this...if matches with what in json file then fine
    
    
    // we need two things to create the javascript version of smart contract web3
    // we need the abi and we need address so abi is imported at the top and adress we fetch like the 1st line of this function below for dai same for dapp and tokenfarm
    
    // Load DaiToken
    const daiTokenData = DaiToken.networks[networkId]
    if(daiTokenData) {
      //web 3 version of smart contract
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address) // create js varsion of smart contract web3 
      this.setState({ daiToken }) // we load this converted smart contract to state daiToken{} which we have initialized in constructor(props) below
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call() // fetch balance refer web3 documentation for understanding this and even the upper contract line
      this.setState({ daiTokenBalance: daiTokenBalance.toString() }) // we load the fetched balance in state daiTokenBalance initialized in constructor(props) below
      //console.log({balance: daiTokenBalance})
      // display balance in console
      // we got {balance: "1000000000000000000000000"} this in console on web page
    } else {
      window.alert('DaiToken contract not deployed to detected network.')
    }
  
    // Load DappToken
    const dappTokenData = DappToken.networks[networkId]
    if(dappTokenData) {
      const dappToken = new web3.eth.Contract(DappToken.abi, dappTokenData.address)
      this.setState({ dappToken })
      let dappTokenBalance = await dappToken.methods.balanceOf(this.state.account).call()
      this.setState({ dappTokenBalance: dappTokenBalance.toString() })
    } else {
      window.alert('DappToken contract not deployed to detected network.')
    }

    // Load TokenFarm
    const tokenFarmData = TokenFarm.networks[networkId]
    if(tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      this.setState({ tokenFarm })
      // small diff here inspite of balanceOf we are using satakingBalance function here in TokenFarm
      let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance: stakingBalance.toString() })
    } else {
      window.alert('TokenFarm contract not deployed to detected network.')
    }

    this.setState({ loading: false }) // when all the data is fetched from blockchain we will set laoding to false
    //this whole async loadBlockchainData() function was to load data from blockchain
    // initially it is set true in the constructor(props) state loading variable
    // if we will remove this line i.e loading always to true then our app page will alwys diplay content as ...Loading defined in the render function below
    // as we gave the condition when loading is done then display the contents of Main.js file else display Loading...
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  stakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.daiToken.methods.approve(this.state.tokenFarm._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.tokenFarm.methods.stakeTokens(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  unstakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.tokenFarm.methods.unstakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }
  
  // state object that contains all the items
  // act as database

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',//deafault account set to 0x0 visisble in top right corner of our app
      daiToken: {},
      dappToken: {}, // we are loading daitoken,dapptoken and tokenfarm smart contrscts and storing them in this state
      tokenFarm: {},  // as said earlier state acts as a database
      daiTokenBalance: '0',
      dappTokenBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }

  render() {
    let content
    /// what this thing does that when content is loading it will show loading
    // else it will show the content of main.js file
    if(this.state.loading){
      content = <p id="loader" className="text-center">Loading....</p>
    }
    else{
      content= <Main 
        daiTokenBalance={this.state.daiTokenBalance}
        dappTokenBalance={this.state.dappTokenBalance}
        stakingBalance={this.state.stakingBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
      />
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
