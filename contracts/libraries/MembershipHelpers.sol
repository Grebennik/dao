// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.19;

library MembershipHelpers {
    function removeFromArray(address[] storage array, address element) internal returns (bool) {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == element) {
                array[i] = array[array.length - 1];
                array.pop();
                return true;
            }
        }
        return false;
    }

    function validateMemberAddress(address member) internal pure {
        require(member != address(0), "Invalid member address");
    }
}