const Marketplace = artifacts.require("./Marketplace.sol")

require("chai")
  .use(require("chai-as-promised"))
  .should()

contract("Marketplce", ([deployer, seller, buyer]) => {
  let marketplace

  before(async () => {
    marketplace = await Marketplace.deployed()
  }) 

  describe("deployment", async() => {
    it("deploys successfully", async() => {
        const address = await marketplace.address
        assert.notEqual(address, 0x0)
        assert.notEqual(address, "")
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
    })

    it("has a name", async() => {
        const name = await marketplace.name()
        assert.equal(name, "Dapp University Marketplace")
    })
  })

  describe("products", async() => {
    let result, productCount
    before(async () => {
        result = await marketplace.createProduct("iPhone X", web3.utils.toWei("1", "Ether"), { from: seller })
        productCount = await marketplace.productCount()
    }) 
    it("creates products", async() => {
        assert.equal(productCount, 1)
        const event = result.logs[0].args
        assert.equal(event.id.toNumber(), productCount.toNumber(), "id is correct")
        assert.equal(event.name, "iPhone X", "name is correct")
        assert.equal(event.price, web3.utils.toWei("1", "Ether"), "price is correct")
        assert.equal(event.owner, seller, "address is correct")
        assert.equal(event.purchased, false, "purchased is correct")

        await await marketplace.createProduct("", web3.utils.toWei("1", "Ether"), { from: seller }).should.be.rejected;
        await await marketplace.createProduct("iPhone X", 0, { from: seller }).should.be.rejected;
    })

    it("lists products", async() => {
      const product = await marketplace.products(productCount)
      assert.equal(product.id.toNumber(), productCount.toNumber(), "id is correct")
      assert.equal(product.name, "iPhone X", "name is correct")
      assert.equal(product.price, web3.utils.toWei("1", "Ether"), "price is correct")
      assert.equal(product.owner, seller, "address is correct")
      assert.equal(product.purchased, false, "purchased is correct")
    })

    it("sells products", async() => {
      let oldSellerBal
      oldSellerBal = await web3.eth.getBalance(seller)
      oldSellerBal = new web3.utils.BN(oldSellerBal)
      result = await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei("1", "Ether") })
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), productCount.toNumber(), "id is correct")
      assert.equal(event.name, "iPhone X", "name is correct")
      assert.equal(event.price, web3.utils.toWei("1", "Ether"), "price is correct")
      assert.equal(event.owner, buyer, "address is correct")
      assert.equal(event.purchased, true, "purchased is correct")

      let newSellerBal
      newSellerBal = await web3.eth.getBalance(seller)
      newSellerBal = new web3.utils.BN(newSellerBal)

      let price
      price = new web3.utils.BN(event.price)
      const expectedBal = oldSellerBal.add(price)
      assert.equal(newSellerBal.toString(), expectedBal.toString(), "seller balance changed correctly")

      await marketplace.purchaseProduct(99, { from: buyer, value: web3.utils.toWei("1", "Ether") }).should.be.rejected;
      await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei("0.5", "Ether") }).should.be.rejected;
      await marketplace.purchaseProduct(productCount, { from: deployer, value: web3.utils.toWei("1", "Ether") }).should.be.rejected;
      await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei("1", "Ether") }).should.be.rejected;
    })
  })
})