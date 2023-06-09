// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.5.0;

contract Marketplace {
    string public name;
    uint public productCount = 0;
    mapping(uint => Product) public products;

    struct Product {
        uint id;
        string name;
        uint price;
        address payable owner;
        bool purchased;
    }

    event ProductCreated(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    event productPurchased(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    constructor() public {
        name = "Dapp University Marketplace";
    }

    function createProduct(string memory _name, uint _price) public {
        productCount++;
        require(bytes(_name).length > 0);
        require(_price > 0);
        products[productCount] = Product(productCount, _name, _price, msg.sender, false);
        emit ProductCreated(productCount, _name, _price, msg.sender, false);
    }

    function purchaseProduct(uint _id) public payable {
        require(_id <= productCount && _id > 0);
        Product memory _product = products[_id];
        require(msg.value >= _product.price);
        require(!_product.purchased);
        address payable _seller = _product.owner;
        require(msg.sender != _seller);
        _product.owner = msg.sender;
        _product.purchased = true;
        products[_id] = _product;
        address(_seller).transfer(msg.value);
        emit productPurchased(_id, _product.name, _product.price, msg.sender, true);
    }
}