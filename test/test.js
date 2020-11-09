const { assert } = require("chai");

describe("Escrow", function() {
  let contract;
  let depositor;
  let beneficiary;
  let arbiter;
  const deposit = ethers.utils.parseEther("1");
  beforeEach(async () => {
    depositor = ethers.provider.getSigner(0);
    beneficiary = ethers.provider.getSigner(1);
    arbiter = ethers.provider.getSigner(2);
    const Escrow = await ethers.getContractFactory("Escrow");
    contract = await Escrow.deploy(arbiter.getAddress(), beneficiary.getAddress(), {
      value: deposit
    });
    await contract.deployed();
  });

  it("should be funded initially", async function() {
    let balance = await ethers.provider.getBalance(contract.address);
    assert.equal(balance.toString(), deposit.toString());
  });

  describe("after approval from address other than the arbiter", () => {
    it("should revert", async () => {
        let ex;
        try {
            await contract.connect(beneficiary).approve();
        }
        catch (_ex) {
            ex = _ex;
        }
        assert(ex, "Attempted to approve the Escrow from the beneficiary address. Expected transaction to revert!");
    });
  });

  describe("after approval from the arbiter", () => {
    it("should transfer balance to beneficiary", async () => {
        const before = await ethers.provider.getBalance(beneficiary.getAddress());
        const approve = await contract.connect(arbiter).approve();
        const after = await ethers.provider.getBalance(beneficiary.getAddress());
        assert.equal(after.sub(before).toString(), deposit.toString());
    });
  });
});
