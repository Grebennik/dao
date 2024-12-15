// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.19;

import "@aragon/osx/framework/plugin/setup/PluginSetup.sol";
import "./MembershipPlugin.sol";

contract MembershipPluginSetup is PluginSetup {
    struct MembershipSettings {
        address[] initialMembers;
    }

    /// @notice The implementation contract version to be used in new plugin instances
    MembershipPlugin private immutable pluginImplementation;
    bytes32 private constant EXECUTE_PERMISSION_ID = keccak256("EXECUTE_PERMISSION");

    constructor() {
        pluginImplementation = new MembershipPlugin();
    }

    function prepareInstallation(
        address _dao,
        bytes memory _data
    ) external returns (address plugin, PreparedSetupData memory preparedSetupData) {
        // Decode installation data
        MembershipSettings memory settings = abi.decode(_data, (MembershipSettings));

        // Deploy plugin proxy
        plugin = createERC1967Proxy(
            address(pluginImplementation),
            abi.encodeWithSelector(MembershipPlugin.initialize.selector, settings.initialMembers)
        );

        // Prepare permissions
        PermissionLib.MultiTargetPermission[] memory permissions = new PermissionLib.MultiTargetPermission[](2);

        // Grant EXECUTE_PERMISSION on DAO to plugin
        permissions[0] = PermissionLib.MultiTargetPermission({
            operation: PermissionLib.Operation.Grant,
            where: _dao,
            who: plugin,
            condition: PermissionLib.NO_CONDITION,
            permissionId: EXECUTE_PERMISSION_ID
        });

        // Grant MANAGE_MEMBERS_PERMISSION on plugin to DAO
        permissions[1] = PermissionLib.MultiTargetPermission({
            operation: PermissionLib.Operation.Grant,
            where: plugin,
            who: _dao,
            condition: PermissionLib.NO_CONDITION,
            permissionId: MembershipPlugin(plugin).MANAGE_MEMBERS_PERMISSION_ID()
        });

        preparedSetupData.permissions = permissions;

        return (plugin, preparedSetupData);
    }

    function prepareUninstallation(
        address _dao,
        SetupPayload calldata _payload
    ) external view returns (PermissionLib.MultiTargetPermission[] memory permissions) {
        permissions = new PermissionLib.MultiTargetPermission[](2);

        // Revoke EXECUTE_PERMISSION on DAO from plugin
        permissions[0] = PermissionLib.MultiTargetPermission({
            operation: PermissionLib.Operation.Revoke,
            where: _dao,
            who: _payload.plugin,
            condition: PermissionLib.NO_CONDITION,
            permissionId: EXECUTE_PERMISSION_ID
        });

        // Revoke MANAGE_MEMBERS_PERMISSION on plugin from DAO
        permissions[1] = PermissionLib.MultiTargetPermission({
            operation: PermissionLib.Operation.Revoke,
            where: _payload.plugin,
            who: _dao,
            condition: PermissionLib.NO_CONDITION,
            permissionId: MembershipPlugin(_payload.plugin).MANAGE_MEMBERS_PERMISSION_ID()
        });

        return permissions;
    }

    function implementation() external view returns (address) {
        return address(pluginImplementation);
    }
}