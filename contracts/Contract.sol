//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

contract Contract {

    address public nftAddress;
    address payable public seller;
    address public buyer;
    address public inspector;

    uint public nftId;
    mapping (uint => uint) public nftPrice;
    mapping (uint => bool) public verifiedMap;
    mapping (address => mapping (uint => bool)) approvedAuction;


    constructor(address payable _seller, address _buyer, address _inspector, address _nftAddress) {
        seller = _seller;
        buyer = _buyer;
        inspector = _inspector;
        nftAddress = _nftAddress;

    }

    modifier OnlyBuyer() {
        require(msg.sender == buyer, "Only the buyer could call this method");
        _;
    }

    modifier OnlySeller() {
        require(msg.sender == seller, "Only the seller could call this method");
        _;
    }

    modifier OnlyInspector() {
        require(msg.sender == inspector, "Only the inspector could call this method");
        _;
    }

    function verifyNft(uint _nftId) public OnlyInspector() {
        verifiedMap[_nftId] = true;
    }

    function auctionOffer(uint _nftId, uint _offer) public OnlySeller() {
        nftPrice[_nftId] = _offer;
    }

    function approveAuctionOffer(address _seller, uint _nftId) public OnlyBuyer() {
        approvedAuction[_seller][_nftId] = true;
        delete nftPrice[_nftId]; // Pendiente
    }

    function transferOwnership(uint _nftId, address _nftAdress, address _seller, address _buyer) payable public {
        require(verifiedMap[_nftId] == true);
        require(approvedAuction[_seller][_nftId] == true);
        require(msg.value >= nftPrice[_nftId]);

        (bool success, ) = payable(seller).call{value: msg.value}(
            ""
        );
        require(success);

        IERC721(_nftAdress).transferFrom(_seller, _buyer, _nftId);
    }


}
