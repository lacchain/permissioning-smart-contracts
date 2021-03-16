pragma solidity 0.5.9;

import "./AccountRulesList.sol";


contract ExposedAccountRulesList is AccountRulesList {

    function _size() public view returns (uint256) {
        return sizeAccounts();
    }

    function _exists(address _account) public view returns (bool) {
        return existsAccount(_account);
    }

    function _add(address _account) public returns (bool) {
        return addNewAccount(_account);
    }

    function _addAll(address[] memory accounts) public returns (bool) {
        return addAllAccounts(accounts);
    }

    function _remove(address _account) public returns (bool) {
        return removeOldAccount(_account);
    }
}
