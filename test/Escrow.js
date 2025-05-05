const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Contract', () => {
    let buyer, seller, inspector
    let contract, art

    beforeEach(async () => {
        //Set up Accounts
        [buyer, seller, inspector] = await ethers.getSigners()

        //Deploy ArtNft
        const Art = await ethers.getContractFactory("Art")
        art = await Art.deploy()

        //Mint
        let transaction = await art.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
        await transaction.wait()

        //Deploy Contract
        const Contract = await ethers.getContractFactory("Contract")
        contract = await contract.deploy(
            seller.address,
            buyer.address,
            inspector.address,
            art.address
        )
    })

})
