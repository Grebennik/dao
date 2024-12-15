// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.19;

interface IMembershipPlugin {
    event MemberAdded(address indexed member);
    event MemberRemoved(address indexed member);

    function initialize(address[] memory _initialMembers) external;
    function addMember(address _member) external;
    function removeMember(address _member) external;
    function isMember(address _account) external view returns (bool);
    function getMembersCount() external view returns (uint256);
    function getAllMembers() external view returns (address[] memory);
}