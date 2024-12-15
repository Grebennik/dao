// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.19;

interface IPluginRepository {
    struct Version {
        address pluginSetup;
        bytes buildMetadata;
    }

    function createVersion(
        bytes32 _name,
        address _pluginSetup,
        bytes memory _buildMetadata
    ) external;

    function latestVersion(bytes32 _name) external view returns (Version memory);
}