// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

struct Light {
    address xmtpAddress;
    string roomName;
    bool on;
}

contract SmartHomeRegistry is Ownable {
    error LightAlreadyRegistered();
    error LightNotFound();
    error NotOperator();

    mapping(address => Light) public lights;
    address[] lightAddresses;

    mapping(address => bool) public operators;

    constructor(address admin) Ownable(admin) {
        operators[admin] = true;
    }

    modifier onlyOperator() {
        if (!operators[msg.sender]) revert NotOperator();
        _;
    }

    event RegisterLight(address indexed xmtpAddress, string roomName);

    function registerLight(
        address xmtpAddress,
        string calldata roomName
    ) public onlyOwner {
        if (lights[xmtpAddress].xmtpAddress != address(0))
            revert LightAlreadyRegistered();
        lights[xmtpAddress] = Light({
            xmtpAddress: xmtpAddress,
            roomName: roomName,
            on: false
        });
        lightAddresses.push(xmtpAddress);
        emit RegisterLight(xmtpAddress, roomName);
    }

    event RemoveLight(address indexed xmtpAddress);

    function removeLight(address xmtpAddress) public onlyOwner {
        uint256 lightAddressesLength = lightAddresses.length;
        for (uint256 i; i < lightAddressesLength; ++i) {
            if (lightAddresses[i] == xmtpAddress) {
                lightAddresses[i] = lightAddresses[lightAddressesLength - 1];
                lightAddresses.pop();
            }
        }

        delete lights[xmtpAddress];

        emit RemoveLight(xmtpAddress);
    }

    event SetOperator(address indexed operator, bool enabled);

    function setOperator(address operator, bool enabled) public onlyOwner {
        operators[operator] = enabled;
        emit SetOperator(operator, enabled);
    }

    event ToggleLight(address indexed xmtpAddress, bool on);

    function toggleLight(address xmtpAddress, bool on) public onlyOperator {
        if (lights[xmtpAddress].xmtpAddress == address(0))
            revert LightNotFound();
        lights[xmtpAddress].on = on;
        emit ToggleLight(xmtpAddress, on);
    }

    function makePrompt() public view returns (string memory prompt) {
        uint256 lightAddressesLength = lightAddresses.length;
        for (uint256 i; i < lightAddressesLength; ++i) {
            address xmtpAddress = lightAddresses[i];
            prompt = string.concat(
                prompt,
                '"',
                lights[xmtpAddress].roomName,
                '":',
                address2str(xmtpAddress),
                lights[xmtpAddress].on ? ":ON," : ":OFF,"
            );
        }
    }

    function address2str(address a) internal pure returns (string memory) {
        return Strings.toHexString(uint256(uint160(a)), 20);
    }
}
