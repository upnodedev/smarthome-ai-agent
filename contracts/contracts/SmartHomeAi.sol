// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/IOracle.sol";
import "./SmartHomeRegistry.sol";

contract SmartHomeAi is Ownable {
    address public immutable oracleAddress; // use latest: https://docs.galadriel.com/oracle-address
    SmartHomeRegistry public immutable registry;
    IOracle.OpenAiRequest private config;

    mapping(uint256 => IOracle.Message) internal messageHistory;
    mapping(uint256 => string) internal messageResponse;

    string public preMessage;
    string public postMessage;

    uint private runCount;

    constructor(address initialOracleAddress, SmartHomeRegistry registryRegistry) Ownable(msg.sender) {
        oracleAddress = initialOracleAddress;
        registry = registryRegistry;

        config = IOracle.OpenAiRequest({
            model : "gpt-4-turbo", // gpt-4-turbo gpt-4o
            frequencyPenalty : 21, // > 20 for null
            logitBias : "", // empty str for null
            maxTokens : 1000, // 0 for null
            presencePenalty : 21, // > 20 for null
            responseFormat : "{\"type\":\"text\"}",
            seed : 0, // null
            stop : "", // null
            temperature : 10, // Example temperature (scaled up, 10 means 1.0), > 20 means null
            topP : 101, // Percentage 0-100, > 100 means null
            tools : "",
            toolChoice : "", // "none" or "auto"
            user : "" // null
        });
    }

    function setPreMessage(string memory newMessage) public onlyOwner {
        preMessage = newMessage;
    }

    function setPostMessage(string memory newMessage) public onlyOwner {
        postMessage = newMessage;
    }

    event SendMessage(uint256 indexed runId, string userMessage, string dbMessage, string fullMessage);
    function sendMessage(string memory _message) public returns (uint256 runId) {
        string memory dbMessage = registry.makePrompt();
        string memory fullMessage = string.concat(preMessage, dbMessage, postMessage, _message);

        IOracle.Message memory message = createTextMessage("user", fullMessage);
        runId = runCount++;
        messageHistory[runId] = message;

        IOracle(oracleAddress).createOpenAiLlmCall(runId, config);

        emit SendMessage(runId, _message, dbMessage, fullMessage);
    }

    // required for Oracle
    event OracleResponse(uint256 indexed runId, bool isError, string message);
    function onOracleOpenAiLlmResponse(
        uint runId,
        IOracle.OpenAiResponse memory _response,
        string memory _errorMessage
    ) public {
        require(msg.sender == oracleAddress, "Caller is not oracle");

        string memory response;
        bool isError = false;
        if (bytes(_errorMessage).length > 0) {
            response = _errorMessage;
            isError = true;
        } else {
            response = _response.content;
            bool isOn = startsWith(response, "TGLOON:");
            bool isOff = startsWith(response, "TGLOFF:");

            if (isOn || isOff) {
                string memory xmtpAddressStr = substring(response, 7);
                address xmtpAddress = toAddress(xmtpAddressStr);
                registry.toggleLight(xmtpAddress, isOn);
            }
        }

        messageResponse[runId] = response;

        emit OracleResponse(runId, isError, response);
    }

    // required for Oracle
    function getMessageHistory(
        uint runId
    ) public view returns (IOracle.Message[] memory) {
        IOracle.Message[] memory messages = new IOracle.Message[](1);
        messages[0] = messageHistory[runId];
        return messages;
    }

    // @notice Creates a text message with the given role and content
    // @param role The role of the message
    // @param content The content of the message
    // @return The created message
    function createTextMessage(string memory role, string memory content) private pure returns (IOracle.Message memory) {
        IOracle.Message memory newMessage = IOracle.Message({
            role: role,
            content: new IOracle.Content[](1)
        });
        newMessage.content[0].contentType = "text";
        newMessage.content[0].value = content;
        return newMessage;
    }

    function startsWith(string memory str, string memory prefix) internal pure returns (bool) {
        bytes memory strBytes = bytes(str);
        bytes memory prefixBytes = bytes(prefix);

        // Check if the prefix is longer than the string
        if (prefixBytes.length > strBytes.length) {
            return false;
        }

        // Compare the characters of the prefix with the start of the string
        for (uint256 i = 0; i < prefixBytes.length; i++) {
            if (strBytes[i] != prefixBytes[i]) {
                return false;
            }
        }

        return true;
    }

    // Function to extract a substring from a string
    function substring(
        string memory str,
        uint256 startIndex
    ) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        uint256 endIndex = strBytes.length;

        require(startIndex < endIndex, "Invalid indices");

        bytes memory result = new bytes(endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }

    function toAddress(string memory str) internal pure returns (address) {
        bytes memory strBytes = bytes(str);
        require(strBytes.length == 42, "Invalid address length"); // "0x" + 40 hex chars

        uint160 addr = 0;
        for (uint256 i = 2; i < 42; i++) {
            uint160 b = uint160(uint8(strBytes[i]));
            if (b >= 48 && b <= 57) {
                // 0-9
                b -= 48;
            } else if (b >= 65 && b <= 70) {
                // A-F
                b -= 55;
            } else if (b >= 97 && b <= 102) {
                // a-f
                b -= 87;
            } else {
                revert("Invalid character in address string");
            }
            addr = addr * 16 + b;
        }

        return address(addr);
    }
}