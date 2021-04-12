let ERC20 = artifacts.require("ERC20"); // contractName
const {
  constants, // Common constants, like the zero address and largest integers
  expectRevert // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");
const {
  assert
} = require("chai");

const chai = require("chai");
chai.should();

contract("ERC20", (accounts) => {
  const _name = "MyToken";
  const _symbol = "MTK";
  const initialSupply = 1000;
  const owner = accounts[0];
  const anotherAccount = accounts[3];
  const recipient = accounts[2];
  beforeEach(async () => {
    this.token = await ERC20.new(_name, _symbol);
    await this.token.mint(owner, initialSupply);
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

  describe("totalSupply", () => {
    it("returns the total amount of tokens", async () => {
      const totalSupply = await this.token.totalSupply();
      assert.equal(totalSupply, initialSupply);
    });
  });

  describe("balanceOf", () => {
    describe("when the requested account has no tokens", () => {
      it("returns zero", async () => {
        const otherAccount = accounts[4];
        const balanceOf = await this.token.balanceOf(otherAccount);
        assert.equal(balanceOf, 0);
      });
    });

    describe("when the requested account has some tokens", () => {
      it("returns the total amount of tokens by Owner", async () => {
        const balanceOf = await this.token.balanceOf(owner);
        assert.equal(balanceOf, initialSupply);
      });
    });
  });

  describe("transfer", () => {
    describe("when the recipient is not the zero address", () => {
      const to = recipient;

      describe("when the sender does not have enough balance", () => {
        const amount = initialSupply + 1;

        it("reverts", async () => {
          await expectRevert(this.token.transfer(to, amount, {
              from: owner
            }),
            "ERC20: Transfer amount exceeds balance"
          );
        });
      });

      describe("when the sender has enough balance", () => {
        const amount = initialSupply;

        it("transfers the requested amount", async () => {
          await this.token.transfer(to, amount, {
            from: owner
          });
          const ownerBalance = await this.token.balanceOf(owner);
          const recipientBalance = await this.token.balanceOf(to);
          assert.equal(ownerBalance, 0);
          assert.equal(recipientBalance, initialSupply);
        });

        it("emits a transfer event", async () => {
          const result = await this.token.transfer(to, amount, {
            from: owner
          });
          const log = result.logs[0];
          assert.equal(log.event, "Transfer");
          assert.equal(log.args.from, owner);
          assert.equal(log.args.to, recipient);
          assert.equal(log.args.value, amount);
        });
      });
    });

    describe("when the recipient is the zero address", () => {
      const to = constants.ZERO_ADDRESS;
      const amount = initialSupply;
      it("reverts", async () => {
        await expectRevert(this.token.transfer(to, amount, {
            from: owner
          }),
          "ERC20: Can't transfer from the zero address"
        );
      });
    });
  });

  describe("allowance", () => {
    const otherAccount = accounts[4];
    describe("when the requested account has no approval", () => {
      it("returns zero", async () => {
        const allowanceAmount = await this.token.allowance(owner,otherAccount);
        assert.equal(allowanceAmount, 0);
      });
    });

    describe("when the requested account has approval", () => {
      beforeEach(async () => {
        await this.token.approve(otherAccount, 100, {
          from: owner
        });
      });
      it("returns the total amount of allowance tokens by [Owner][otherAccount]", async () => {
        const allowanceAmount = await this.token.allowance(owner,otherAccount);
        assert.equal(allowanceAmount, 100);
      });
    });
  })

  describe("approve", () => {
    describe("when the spender is not the zero address", () => {
      const spender = recipient;

      describe("when the sender has enough balance", () => {
        const amount = 100;

        it("emits an approval event", async () => {
          const result = await this.token.approve(spender, amount, {from: owner});

          const log = result.logs[0];
          assert.equal(log.event, "Approval");
          assert.equal(log.args.owner, owner);
          assert.equal(log.args.spender, spender);
          assert.equal(log.args.value, amount);
        });

        describe("when there was no approved amount before", () => {
          it("approves the requested amount", async () => {
            await this.token.approve(spender, amount, {
              from: owner
            });
            const allowanceAmount = await this.token.allowance(owner, spender);
            assert.equal(allowanceAmount, amount);
          });
        });

        describe("when the spender had an approved amount",  () => {
          beforeEach(async () => {
            await this.token.approve(spender, 200, {
              from: owner
            });
          });

          it('approves the requested amount and replaces the previous one', async  () => {
            await this.token.approve(spender, amount, {
              from: owner
            });
            const allowanceAmount = await this.token.allowance(owner, spender);
            assert.equal(allowanceAmount, amount);
          });
        });
      });

      describe("when the sender does not have enough balance",  () => {
        const amount = 101;

        it("emits an approval event", async () => {
          const result = await this.token.approve(spender, amount, {
            from: owner
          });
          const log = result.logs[0];
          assert.equal(log.event, "Approval");
          assert.equal(log.args.owner, owner);
          assert.equal(log.args.spender, spender);
          assert.equal(log.args.value, amount);
        });

        describe("when there was no approved amount before", () => {
          it("approves the requested amount", async () => {
            await this.token.approve(spender, amount, {
              from: owner
            });
            const allowanceAmount = await this.token.allowance(owner, spender);
            assert.equal(allowanceAmount, amount);
          });
        });

        describe("when the spender had an approved amount", () => {
          beforeEach(async () => {
            await this.token.approve(spender, 1, {
              from: owner
            });
          });

          it("approves the requested amount and replaces the previous one", async () => {
            await this.token.approve(spender, amount, {
              from: owner
            });
            const allowanceAmount = await this.token.allowance(owner, spender);
            assert.equal(allowanceAmount, amount);
          });
        });
      });
    });

    describe("when the spender is the zero address",  () => {
      const amount = initialSupply;
      const spender = constants.ZERO_ADDRESS;

      it("reverts", async () => {
        await expectRevert(this.token.approve(spender, amount, {
            from: owner
          }),
          "ERC20: Approve from the zero address"
        );
      });
    });
  });

  describe("transferFrom", () => {
    const spender = accounts[1];

    describe("when the recipient is not the zero address", () => {
      const to = anotherAccount;

      describe("when the spender has enough approved balance", () => {
        beforeEach(async () => {
          await this.token.approve(spender, 1000, { from: owner });
        });

        describe("when the owner has enough balance", () => {
          const amount = 1000;

          it("transfers the requested amount", async () => {
            await this.token.transferFrom(owner, to, amount, { from: spender });
            const ownerBalance = await this.token.balanceOf(owner);
            const recipientBalance = await this.token.balanceOf(to);
            assert.equal(ownerBalance, 0);
            assert.equal(recipientBalance, amount);
          });

          it("decreases the spender allowance", async () => {
            await this.token.transferFrom(owner, to, amount, { from: spender });
             const allowanceBalance = await this.token.allowance(owner, spender);
            assert.equal(allowanceBalance, 0);
          });

          it("emits a transfer event", async () => {
            const result = await this.token.transferFrom(owner, to, amount, {
              from: spender
            });
            const log = result.logs[0];
            assert.equal(log.event, "Transfer");
            assert.equal(log.args.from, owner);
            assert.equal(log.args.to, to);
            assert.equal(log.args.value, amount);
          });
        });

        describe("when the owner does not have enough balance", () => {
          const amount = 1001;

          it("reverts", async () => {
              await expectRevert(this.token.transferFrom(owner, to, amount,{
                from: spender
              }),
              "ERC20: Transfer amount exceeds balance"
            );
          });
        });
    });

      describe("when the spender does not have enough approved balance", () => {
        beforeEach(async () => {
          await this.token.approve(spender, 999, { from: owner });
        });

        describe("when the owner has enough balance", () => {
          const amount = 1000;

          it("reverts", async () => {
            await expectRevert(this.token.transferFrom(owner, to, amount,
              { from: spender }
              ),
              "ERC20: Transfer amount exceeds allowance"
            );
          });
        });

        describe("when the owner does not have enough balance", () => {
          const amount = 1001;

          it("reverts", async () => {
            await expectRevert(this.token.transferFrom(owner, to, amount,
              { from: spender }
              ),
              "ERC20: Transfer amount exceeds balance"
            );
          });
        });
      });
    });

    describe("when the recipient is the zero address", () => {
      const amount = 1000;
      const to = constants.ZERO_ADDRESS;

      beforeEach(async () => {
        await this.token.approve(spender, amount, { from: owner });
      });

      it("reverts", async () => {
        await expectRevert(this.token.transferFrom(owner, to, amount,{
            from: spender
          }), 
          "ERC20: Can't transfer from the zero address"
        );
      });
    });
  });

  describe("Mint", () => {
    beforeEach('minting', async  () => {
      const { logs } = await this.token.mint(recipient, initialSupply);
      this.log = logs[0];
    });
    
    it("Mint 1500 token to Owner address", async () => {
      const result = await this.token.mint(owner, 1500);
      const log = result.logs[0];
      assert.equal(log.event, "Transfer");
      assert.equal(log.args.from, constants.ZERO_ADDRESS);
      assert.equal(log.args.to, owner);
    });

    it("rejects a null account", async () => {
      await expectRevert(
        this.token.mint(constants.ZERO_ADDRESS, 500),
        "ERC20: mint to the zero address"
      );
    });

    it("emits Transfer event", async () => {
      assert.equal(this.log.event, "Transfer");
      assert.equal(this.log.args.from, constants.ZERO_ADDRESS);
      assert.equal(this.log.args.to, recipient);
      assert.equal(this.log.args.value, initialSupply);
      
    });
  });
});