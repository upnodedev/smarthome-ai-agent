export default [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "initialOracleAddress",
        "type": "address"
      },
      {
        "internalType": "contract SmartHomeRegistry",
        "name": "registryRegistry",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "runId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isError",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "message",
        "type": "string"
      }
    ],
    "name": "OracleResponse",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "runId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "userMessage",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "dbMessage",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "fullMessage",
        "type": "string"
      }
    ],
    "name": "SendMessage",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "runId",
        "type": "uint256"
      }
    ],
    "name": "getMessageHistory",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "role",
            "type": "string"
          },
          {
            "components": [
              {
                "internalType": "string",
                "name": "contentType",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "value",
                "type": "string"
              }
            ],
            "internalType": "struct IOracle.Content[]",
            "name": "content",
            "type": "tuple[]"
          }
        ],
        "internalType": "struct IOracle.Message[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "messageResponse",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "runId",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "string",
            "name": "id",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "content",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "functionName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "functionArguments",
            "type": "string"
          },
          {
            "internalType": "uint64",
            "name": "created",
            "type": "uint64"
          },
          {
            "internalType": "string",
            "name": "model",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "systemFingerprint",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "object",
            "type": "string"
          },
          {
            "internalType": "uint32",
            "name": "completionTokens",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "promptTokens",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "totalTokens",
            "type": "uint32"
          }
        ],
        "internalType": "struct IOracle.OpenAiResponse",
        "name": "_response",
        "type": "tuple"
      },
      {
        "internalType": "string",
        "name": "_errorMessage",
        "type": "string"
      }
    ],
    "name": "onOracleOpenAiLlmResponse",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "oracleAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "postMessage",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "preMessage",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "registry",
    "outputs": [
      {
        "internalType": "contract SmartHomeRegistry",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_message",
        "type": "string"
      }
    ],
    "name": "sendMessage",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "runId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "newMessage",
        "type": "string"
      }
    ],
    "name": "setPostMessage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "newMessage",
        "type": "string"
      }
    ],
    "name": "setPreMessage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const