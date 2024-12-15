// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.19;

import "@aragon/osx/core/plugin/PluginUUPSUpgradeable.sol";
import "./interfaces/IMembershipPlugin.sol";
import "./libraries/MembershipHelpers.sol";

contract MembershipPlugin is IMembershipPlugin, PluginUUPSUpgradeable {
    using MembershipHelpers for address[];

    bytes32 public constant MANAGE_MEMBERS_PERMISSION_ID = keccak256("MANAGE_MEMBERS_PERMISSION");

    mapping(address => bool) public members;
    address[] public membersList;

    constructor() {
        _disableInitializers();
    }

    function initialize(address[] memory _initialMembers) external initializer {
        __PluginUUPSUpgradeable_init(IDAO(msg.sender));
        
        for (uint256 i = 0; i < _initialMembers.length; i++) {
            _addMember(_initialMembers[i]);
        }
    }

    function addMember(address _member) external auth(MANAGE_MEMBERS_PERMISSION_ID) {
        _addMember(_member);
    }

    function removeMember(address _member) external auth(MANAGE_MEMBERS_PERMISSION_ID) {
        _removeMember(_member);
    }

    function isMember(address _account) external view returns (bool) {
        return members[_account];
    }

    function getMembersCount() external view returns (uint256) {
        return membersList.length;
    }

    function getAllMembers() external view returns (address[] memory) {
        return membersList;
    }

    function _addMember(address _member) internal {
        MembershipHelpers.validateMemberAddress(_member);
        require(!members[_member], "Already a member");

        members[_member] = true;
        membersList.push(_member);

        emit MemberAdded(_member);
    }

    function _removeMember(address _member) internal {
        require(members[_member], "Not a member");
        members[_member] = false;
        
        require(membersList.removeFromArray(_member), "Member not found in list");
        emit MemberRemoved(_member);
    }

    function _authorizeUpgrade(address) internal override auth(MANAGE_MEMBERS_PERMISSION_ID) {}

    // Remove the pluginType override since we're inheriting it from PluginUUPSUpgradeable
}