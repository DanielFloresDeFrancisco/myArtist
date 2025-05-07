import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// ABIs
import Art from './abis/Art.json'
import Contract from './abis/Contract.json'

// Config
import config from './config.json';

function App() {
  const [provider, setProvider] = useState(null)
  const [contract, setContract] = useState(null)

  const [account, setAccount] = useState(null)

  const [pieces, setPieces] = useState([])
  const [piece, setPiece] = useState({})
  const [toggle, setToggle] = useState(false);

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)
    const network = await provider.getNetwork()

    const art = new ethers.Contract(config[network.chainId].art.address, Art, provider)
    const totalSupply = await art.totalSupply()
    const pieces = []

    for (var i = 1; i <= totalSupply; i++) {
      const uri = await art.tokenURI(i)
      const response = await fetch(uri)
      const metadata = await response.json()
      pieces.push(metadata)
    }

    setPieces(pieces)

    const contract = new ethers.Contract(config[network.chainId].contract.address, Contract, provider)
    setContract(contract)

    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = ethers.utils.getAddress(accounts[0])
      setAccount(account);
    })
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  const togglePop = (piece) => {
    setPiece(piece)
    toggle ? setToggle(false) : setToggle(true);
  }

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />

      <div className='cards__section'>

        <h3>NFTs For You</h3>

        <hr />

        <div className='cards'>
          {pieces.map((piece, index) => (
            <div className='card' key={index} onClick={() => togglePop(piece)}>
              <div className='card__image'>
                <img src={piece.image} alt="NFT" />
              </div>
              <div className='card__info'>
                <h4>{piece.attributes[0].value} ETH</h4>
                <p>
                  <strong>{piece.attributes[2].value}</strong> bds |
                  <strong>{piece.attributes[3].value}</strong> ba |
                  <strong>{piece.attributes[4].value}</strong> sqft
                </p>
                <p>{piece.address}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {toggle && (
        <Home piece={piece} provider={provider} account={account} contract={contract} togglePop={togglePop} />
      )}

    </div>
  );
}

export default App;