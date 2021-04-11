let ERC20 = artifacts.require("ERC20"); // contractName

const chai = require("chai");
chai.should();

contract("ERC20", (accounts) => {
  const _name = "MyToken";
  const _symbol = "MTK";
  const initialSupply = 1000;
  const tokenOwner = accounts[0];
  const spender = accounts[1];
  const recipient = accounts[2];
  const approvalAmt = 200;
  const transferFromAmt = 150;
  beforeEach(async () => {
    this.token = await ERC20.new(_name, _symbol);
    await this.token.mint(tokenOwner, initialSupply);
  });

  describe("Token attributes", () => {
    it("has the correct Name", async () => {
      const name = await this.token.name();
      name.should.equal(_name);
    });

    it("has the correct Symbol", async () => {
      const symbol = await this.token.symbol();
      symbol.should.equal(_symbol);
    });
  });

  describe("Total supply", () => {
    it("returns the total amount of tokens to be 1000", async () => {
      const totalSupply = await this.token.totalSupply();
      assert.equal(totalSupply, initialSupply);
    });
  });

  describe("balanceOf", () => {
    it("Parent account has 1000 token", async () => {
      const balanceOf = await this.token.balanceOf(accounts[0]);
      assert.equal(balanceOf, initialSupply);
    });

    it("Child A account has 0 token", async () => {
      const balanceOf = await this.token.balanceOf(accounts[1]);
      assert.equal(balanceOf, 0);
    });

    it("Child B account has 0 token", async () => {
      const balanceOf = await this.token.balanceOf(accounts[2]);
      assert.equal(balanceOf, 0);
    });
  });

  describe("transfer", () => {
    it("Parent transfer 500 tokens to Child A", async () => {
      await this.token.transfer(accounts[1], 500, {
        from: accounts[0],
      });
      const balanceOfParent = await this.token.balanceOf(accounts[0]);
      const balanceOfChildA = await this.token.balanceOf(accounts[1]);

      assert.equal(balanceOfChildA, 500);
      assert.equal(balanceOfParent, 500);
    });
  });
  describe("transfer from", () => {
    describe("when the spender has enough approved balance", () => {
      beforeEach(async () => {
        await this.token.approve(spender, approvalAmt, { from: tokenOwner });
      });
      describe("when the token owner has enough balance", () => {
        it("transfers the requested amount", async () => {
          const tokenOwnerAmtBefore = await this.token.balanceOf(accounts[0]);
          await this.token.transferFrom(
            tokenOwner,
            recipient,
            transferFromAmt,
            { from: spender }
          );

          const tokenOwnerAmt = await this.token.balanceOf(accounts[0]);
          const recipientAmt = await this.token.balanceOf(accounts[2]);
          const ownerAmtTransferred = tokenOwnerAmtBefore - recipientAmt;
          assert.equal(tokenOwnerAmt, ownerAmtTransferred);
          assert.equal(recipientAmt, transferFromAmt);
        });
      });
      describe("when there was approved amount before", () => {
        it("check approval amount", async () => {
          const approvalAmtByOwner = await this.token.allowance(
            tokenOwner,
            spender
          );
          assert.equal(approvalAmtByOwner, approvalAmt);
        });
      });
    });
  });
});
