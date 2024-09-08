import { config as dotenv } from "dotenv"
dotenv()

import { getRedisClient } from "./lib/redis.js";
import { run, HandlerContext } from "@xmtp/message-kit";
import { startCron } from "./lib/cron.js";
import {
  RedisClientType,
  RedisModules,
  RedisFunctions,
  RedisScripts,
} from "@redis/client";

import { createPublicClient, createWalletClient, defineChain, http } from 'viem';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from "viem/accounts";
import SmartHomeAIABI from "./SmartHomeAIABI.js";
import { LIGHT_DB } from "./lightdb.js";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const AGENT_ADDRESS = '0xF834cF13Bb85b28937cc31Db7Ab0a1820412C02a'

const galadriel = defineChain({
  id: 696969,
  name: 'Galadriel Devnet',
  nativeCurrency: { name: 'Galadriel', symbol: 'GAL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://devnet.galadriel.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer.galadriel.com',
      apiUrl: 'https://explorer.galadriel.com/api',
    },
  },
  testnet: true,
})

// Initialize the Public Client
const publicClient = createPublicClient({
  chain: galadriel, // Specify the chain, e.g., mainnet, goerli, etc.
  transport: http(), // HTTP transport for connecting to an RPC endpoint
});

// Initialize the Wallet Client
const walletClient = createWalletClient({
  chain: galadriel, // Use the same chain as publicClient
  transport: http(), // Specify the transport type, usually http for RPC connections
});

const account = privateKeyToAccount(process.env.KEY! as `0x${string}`)

run(async (context: HandlerContext) => {
  const {
    v2client,
    message: {
      content: { content: text },
      typeId,
      sender,
    },
  } = context;

  if (typeId !== "text") {
    /* If the input is not text do nothing */
    return;
  }

  console.log('Received message', text)

  let message = "";
  if (!text) {
    message = "Welcome! Please type any prompt you want to do with your smart home. Here are some examples:\n\n- Turn on workspace light\n- Give me light status";
  } else {
    if (!text) {
      message = "Please enter some prompt!"
    } else {
      try {
        const hash = await walletClient.writeContract({
          account,
          address: AGENT_ADDRESS,
          abi: SmartHomeAIABI,
          functionName: 'sendMessage',
          args: [text],
        })
    
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
    
        if (!receipt.logs || receipt.status != 'success') {
          message = 'ERROR: Transaction Reverted'
        } else {
          const runIdRaw = receipt.logs.find(x => x.topics[0] == "0x03551b986d041cbc5634e1ecf13ea7eb57c58e6ed33c521fc03c6f524e128317")?.topics[1]
    
          if (!runIdRaw) {
            message = 'ERROR: Missing run ID'
          } else {
            const runId = BigInt(parseInt(runIdRaw))
    
            while (true) {
              try {
                const response = await publicClient?.readContract({
                  address: AGENT_ADDRESS,
                  abi: SmartHomeAIABI,
                  functionName: 'messageResponse',
                  args: [runId],
                })
  
                if (response) {
                  const isOn = response.startsWith('TGLOON')
                  const isOff = response.startsWith('TGLOFF')
  
                  if (isOn || isOff) {
                    const xmtpAddress = response.split(':')[1]
                    const metadata = LIGHT_DB.find(x => x.xmtpAddress.toLowerCase() == xmtpAddress.toLowerCase())
  
                    if (metadata) {
                      if (isOn) {
                        message = `Turned ON ${metadata.roomName} light`
                      } else {
                        message = `Turned OFF ${metadata.roomName} light`
                      }
                    } else {
                      message = response
                    }
                  } else {
                    message = response
                  }
  
                  break
                }
              } catch (err) {
                console.error(err)
              }
    
              await wait(500);
            }
          }
        }
      } catch (err) {
        console.error(err)
        message = 'Internal Server Error'
      }
    }
  }

  //Send the message
  await context.reply(message);
});
