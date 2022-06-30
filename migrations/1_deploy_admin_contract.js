const AllowlistUtils = require('../scripts/allowlist_utils');

const Admin = artifacts.require("./Admin.sol");

module.exports = async(deployer, network) => {
    await deployer.deploy(Admin);
    console.log("   > Admin contract deployed with address = " + Admin.address);

    let instance = await Admin.deployed();

    if(AllowlistUtils.isInitialAdminAccountsAvailable()) {
        console.log("   > Adding Initial Admin Accounts ...");
        let initialAdminAccounts = AllowlistUtils.getInitialAdminAccounts();
        if (initialAdminAccounts.length > 0) {
            let adminAddedResult = await instance.addAdmins(initialAdminAccounts);
            console.log ("   > Initial admin accounts added : " + initialAdminAccounts); 
        }
    } 
}
