let ERC20 = artifacts.require("ERC20"); // contractName
const {
  constants, // Common constants, like the zero address and largest integers
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

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
      const result = await this.token.transfer(spender, 500, {
        from: tokenOwner,
      });
      const log = result.logs[0];
      assert.equal(log.event, "Transfer");
      assert.equal(log.args.from, tokenOwner);
      assert.equal(log.args.to, spender);
    });
    it("reverts when transferring tokens to the zero address", async () => {
      await expectRevert(
        this.token.transfer(constants.ZERO_ADDRESS, 0, {
          from: tokenOwner,
        }),
        "ERC20: Can't transfer from the zero address"
      );
    });
  });

  describe("transfer from", () => {
    describe("when the spender has enough approved balance", () => {
      beforeEach(async () => {
        await this.token.approve(spender, approvalAmt, { from: tokenOwner });
      });
      describe("when the token owner has enough balance", () => {
        it("transfers the requested amount which is less than or equal to the approval amount", async () => {
          const result = await this.token.transferFrom(
            tokenOwner,
            recipient,
            transferFromAmt,
            { from: spender }
          );
          const log = result.logs[0];
          assert.equal(log.event, "Transfer");
          assert.equal(log.args.from, tokenOwner);
          assert.equal(log.args.to, recipient);
        });
        it("transfers the requested amount which is more than or equal to the approval amount", async () => {
          await expectRevert(
            this.token.transferFrom(tokenOwner, recipient, initialSupply, {
              from: spender,
            }),
            "ERC20: Transfer amount exceeds allowance"
          );
        });
        it("transfers the requested amount which is more than or equal to the approval amount", async () => {
          await expectRevert(
            this.token.transferFrom(
              constants.ZERO_ADDRESS,
              recipient,
              initialSupply,
              {
                from: spender,
              }
            ),
            "ERC20: Can't transfer from the zero address"
          );
        });
        it("transfers the requested amount which is more than or equal to the approval amount", async () => {
          await expectRevert(
            this.token.transferFrom(
              tokenOwner,
              constants.ZERO_ADDRESS,
              initialSupply,
              {
                from: spender,
              }
            ),
            "ERC20: Can't transfer from the zero address"
          );
        });
      });
      describe("Approval", () => {
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

  describe("Mint", () => {
    it("Mint to Zero address", async () => {
      await expectRevert(
        this.token.mint(constants.ZERO_ADDRESS, 500, {
          from: tokenOwner,
        }),
        "ERC20: mint to the zero address"
      );
    });
  });
});
