pragma solidity >=0.4.21 <0.9.0;

// introduce this with DAI and DAPP token..
import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm{
    // Take DAI Token and issue DAPP Token...thats all this smart contract does
    // All codes goes here....
    string public name = "Dapp Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;
    address public owner;
    // public means we can access the name var from outside the smart contract also...
// The code we will write will be of taking DAI deposits and issuing DAPP Tokens...

    //mapping function ...its like key-> value pair
    // pass it key it will give the value
    // here the key is address of investor and value will be how many tokens they are currently stakiing

    mapping(address => uint) public stakingBalance;

    // array that stores all the addresses of investors that have ever staked
    // so that we can issue them rewards later

    address[] public stakers;

    // we are defining one more mappinf function to check or tell the app if the investor has staked or not
    // here key is again address of investor that we will pass on to mapping function
    // to get to know the value which is boool here as we need to know just true or false
    // whether investor has staked yes or not

    mapping(address => bool) public hasStaked;

    // mapping function that determines investors current mapping status

    mapping(address => bool) public isStaking;

    // so here its kind of like we have to update and define each state in soidity


    //costructor wth arguments of type dapptoken and daitoken same as name of solidity smart contracts....
    constructor(DappToken _dappToken, DaiToken _daiToken) public
    {
        // we are passing adress of dapptoken and daitoken as an argument in this construcor..
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
        // we are storing adress in thsese var to acess it form outside this constructor as _daiToken and _dappToken are local var
    }

    // 1 Stakes Token....user will deposit DAI Token (Deposit)
    // Internal Work of this function:-Tranfer DAI Tokens to this smart contract....Token Farm

    function stakeTokens(uint _amount) public {

        // Require amount greater than 0
        // Require function in solidity is like if that condition given inside require function evaluates to true
        // then functio will run... i.e further steps inside of stakeTokens function will be executed
        // but if its wrong or false then function will get terminated with the msg writeen in th require function
        require(_amount >0, "amount cannot be 0");

        //Transfer Mock DAI Tokens to this contract for staking
        // transferFrom function is defined there in the DaiToken.sol file...all ERC20 tokens have this
        // this function lets someone else move token for you
        //here it allows the contract to move the funds on the behalf of the investor
        // but there is also another function there in DaiToken.sol i.e approve so 
        // in that function the investor first must approve the tokens before they can stake them which allows transferFrom function to get called
        // we will see this in action in test 
        // the tranfer function defined in the DaiToken.sol file is diff as there user itself tranfers or spends the token
        daiToken.transferFrom(msg.sender, address(this), _amount);
        // sender who initiated the function
        // adress(this) is address of this file TokenFarm.sol
        // _amount is amount of DAI Tokens
        // so if we compare the arguments here with those defined in the tranferFrom function in DaiToken.symbol
        //function transferFrom(address _from, address _to, uint256 _value)
        // address _from is sender or investor
        // address _to is address(this) as sender or invsetor is sending or Staking DAI tokens to this Token farm
        // and value is amount of DAI Tokens
    
        //updating staking balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;
    
        // Add user to stakers array only if they havent staked already to avoid repetition
        // as one user can also stake more than once tht why to avoid getting their name added twice
        // we are using this if function

        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }
    

        // update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
}

    //2 Unstaking Tokens (Withdraw)

    function unstakeTokens() public {

        //Fetch staking balance
        uint balance = stakingBalance[msg.sender];

        require(balance >0, "staking balance cannot be 0");

        //Trasfer from the App back to the user
        //Transfer mock DAI tokens to this contract for staking

        daiToken.transfer(msg.sender, balance);

        //Reset staking balance
        // it is 0 as they withdrew all the tokens from the app
        stakingBalance[msg.sender] = 0;

        //Update staking status
        // false as they are not staking anymore
        isStaking[msg.sender] = false;
    }

    //3 Issuing Token (Earning Interest)

    function issueTokens() public{

        // as this is issuing token function so owner of contract or application should be able to call this function
        require(msg.sender == owner, "caller must be the owner");

        //for issuing tokens we will have to iterate through address array where we stored the investors addresses
        for (uint i=0 ; i<stakers.length; i++)
        {
            address recipient = stakers[i];

            // we are finding out how much DAI tokens a investor staked and we will issue them that amount of DAPP tokens
            uint balance = stakingBalance[recipient];

            //comparing this with the tranfer function defined in DappToken.sol...
            // function transfer(address _to, uint256 _value)
            // address _to is recipient and _value is balance
            if(balance > 0){
            dappToken.transfer(recipient, balance);
            }
        }
    }
}