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
        contract = await Contract.deploy(
            seller.address,
            buyer.address,
            inspector.address,
            art.address
        )

        transaction = await contract.connect(inspector).verifyNft(1)
        await transaction.wait()
    })

    describe("Deployment", () => {
        it("Returns NFT Address", async () => {
            const result = await contract.nftAddress()
            expect(result).to.be.equal(art.address)
        })

        it("Returns Buyer", async () => {
            const result = await contract.buyer()
            expect(result).to.be.equal(buyer.address)
        })

        it("Returns Seller", async () => {
            const result = await contract.seller()
            expect(result).to.be.equal(seller.address)
        })

        it("Returns Inspector", async () => {
            const result = await contract.inspector()
            expect(result).to.be.equal(inspector.address)
        })
    })

    describe("Verify NFT", () => {
        beforeEach(async () => {
            let transaction = await contract.connect(inspector).verifyNft(1)
            await transaction.wait()
        })

        it("Check if NFT is verified by Inspector", async () => {
            const result = await contract.verifiedMap(1)
            expect(result).to.be.equal(true)
        })
    })

    describe("Auction Process for buying an NFT", () => {
        it("Buyer makes an offer", async () => {
            let transaction = await contract.connect(buyer).auctionOffer(1,5)
            await transaction.wait()
        })

        it("Seller approves the offer", async () => {
            let transaction = await contract.connect(seller).approveAuctionOffer(seller.address, 1)
            await transaction.wait()
        })

        it("Check if it is really approved", async () => {
            const result = await contract.approvedAuction(seller.address, 1)
            expect(result).to.be.equal(true)
        })

        it("Buy Product and transfer ownership", async () => {
            let transaction = await contract.connect(buyer).transferOwnership(1, contract.nftAddress(), seller.address, buyer.address)
            await transaction.wait()
            const result = await art.ownerOf(1)
            expect(result).to.be.equal(buyer)
        })
    })

})
