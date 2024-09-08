import { useCallback, useEffect, useState } from "react"
import { usePublicClient, useWriteContract } from "wagmi"
import SmartHomeRegistryABI from "./abi/SmartHomeRegistryABI"
import SmartHomeAIABI from "./abi/SmartHomeAIABI"
import ConnectButton from "./ConnectButton"

type LightResponse = [`0x${string}`, string, boolean]

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const REGISTRY_ADDRESS = '0x9a312aDFEA6A91eefdb8c7396F820d9B6460B5b2'
const AGENT_ADDRESS = '0xF834cF13Bb85b28937cc31Db7Ab0a1820412C02a'

const LIGHT_DB = [
  {
    xmtpAddress: '0xC95A792EAa763e2a421D4e69028Bda89a8562Ca5',
    roomName: 'Bedroom 1',
  },
  {
    xmtpAddress: '0xf4c775745dcB4bA888FE63F17bF03D28DBA54294',
    roomName: 'Bedroom 2',
  },
  {
    xmtpAddress: '0x60112a38Cb7a165D7089aAF43f77A5d53eFC1286',
    roomName: 'Bedroom 3',
  },
  {
    xmtpAddress: '0xb1956626438724c69Df340406795D404AD774f90',
    roomName: 'Living Room',
  },
  {
    xmtpAddress: '0xA79ae97452A4c5aCb92419fe3be3CbD3a7a17364',
    roomName: 'Play Zone',
  },
  {
    xmtpAddress: '0x1F5C3E486DB709edd174fc4763AC4D645CB1E600',
    roomName: 'Workspace',
  },
]

export default function Homepage() {
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [prompt, setPrompt] = useState('')
  const [promptResponse, setPromptResponse] = useState('');

  const [lights, setLights] = useState<{[id: string]: boolean}>({
    // Bedroom 1
    '0xC95A792EAa763e2a421D4e69028Bda89a8562Ca5': false,
    // Bedroom 2
    '0xf4c775745dcB4bA888FE63F17bF03D28DBA54294': false,
    // Bedroom 3
    '0x60112a38Cb7a165D7089aAF43f77A5d53eFC1286': false,
    // Living Room
    '0xb1956626438724c69Df340406795D404AD774f90': false,
    // Play Zone
    '0xA79ae97452A4c5aCb92419fe3be3CbD3a7a17364': false,
    // Workspace
    '0x1F5C3E486DB709edd174fc4763AC4D645CB1E600': false,
  })

  const refreshLights = useCallback(async () => {
    if (publicClient) {
      const promises: Promise<LightResponse>[] = []

      for (const { xmtpAddress } of LIGHT_DB) {
        promises.push(
          publicClient.readContract({
            address: REGISTRY_ADDRESS,
            abi: SmartHomeRegistryABI,
            functionName: 'lights',
            args: [xmtpAddress as `0x${string}`]
          }) as any
        )
      }

      const responses = await Promise.all(promises)

      const lights: {[id: string]: boolean} = {}

      for (let i = 0; i < responses.length; i++) {
        const response = responses[i]
        lights[response[0]] = response[2]
      }

      setLights(lights)
    }
  }, [publicClient, setLights])

  const submitAgent = useCallback(async (message: string) => {
    if (publicClient) {
      const hash = await writeContractAsync({
        address: AGENT_ADDRESS,
        abi: SmartHomeAIABI,
        functionName: 'sendMessage',
        args: [message],
      })

      setPromptResponse('Processing...')
  
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
  
      console.log(receipt?.logs)
  
      if (!receipt.logs || receipt.status != 'success') {
        setPromptResponse('ERROR: Transaction Reverted')
      } else {
        const runIdRaw = receipt.logs.find(x => x.topics[0] == "0x03551b986d041cbc5634e1ecf13ea7eb57c58e6ed33c521fc03c6f524e128317")?.topics[1]
  
        if (!runIdRaw) {
          setPromptResponse('ERROR: Missing run ID')
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
                      setPromptResponse(`Turned ON ${metadata.roomName} light`)
                    } else {
                      setPromptResponse(`Turned OFF ${metadata.roomName} light`)
                    }
                  } else {
                    setPromptResponse(response)
                  }
                } else {
                  setPromptResponse(response)
                }

                refreshLights()
                break
              }
            } catch (err) {
              console.error(err)
            }
  
            await wait(500);
          }
        }
      }
    }
  }, [publicClient, writeContractAsync, refreshLights])

  useEffect(() => {
    if (publicClient) {
      refreshLights();
    }
  }, [publicClient])

  return (
    <div className="container h-full mx-auto">
      <div className="flex justify-center items-center h-full">
        <div className="grid grid-cols-2 w-full">
          <div className="flex justify-center">
            <div className="relative">
              <div>
                <img src="/FloorPlanHackathon.png" style={{
                  height: 600,
                }}></img>
              </div>

              {/* Bedroom 2 */}
              {lights['0xf4c775745dcB4bA888FE63F17bF03D28DBA54294'] === false &&
                <div className="absolute" style={{
                  top: 61,
                  left: 0,
                }}>
                  <img src="/Bedroom2.png" style={{
                    height: 150,
                  }}></img>
                </div>
              }

              {/* Bedroom 3 */}
              {lights['0x60112a38Cb7a165D7089aAF43f77A5d53eFC1286'] === false &&
                <div className="absolute" style={{
                  top: 61,
                  left: 135,
                }}>
                  <img src="/Bedroom3.png" style={{
                    height: 150,
                  }}></img>
                </div>
              }

              {/* Play Zone */}
              {lights['0xA79ae97452A4c5aCb92419fe3be3CbD3a7a17364'] === false &&
                <div className="absolute" style={{
                  top: 210,
                  left: 0,
                }}>
                  <img src="/PlayZone.png" style={{
                    height: 204,
                  }}></img>
                </div>
              }

              {/* Workspace */}
              {lights['0x1F5C3E486DB709edd174fc4763AC4D645CB1E600'] === false &&
                <div className="absolute" style={{
                  top: 210,
                  left: 135,
                }}>
                  <img src="/Workspace.png" style={{
                    height: 202,
                  }}></img>
                </div>
              }

              {/* Living Room */}
              {lights['0xb1956626438724c69Df340406795D404AD774f90'] === false &&
                <div className="absolute" style={{
                  top: 412,
                  left: 135,
                }}>
                  <img src="/LivingRoom.png" style={{
                    height: 150,
                  }}></img>
                </div>
              }

              {/* Bedroom 1 */}
              {lights['0xC95A792EAa763e2a421D4e69028Bda89a8562Ca5'] === false &&
                <div className="absolute" style={{
                  top: 410,
                  left: 0,
                }}>
                  <img src="/Bedroom1.png" style={{
                    height: 150,
                  }}></img>
                </div>
              }

            </div>
          </div>

          <div>
            <div className="mb-3">
              <ConnectButton />
            </div>

            <div className="mb-5">
              <textarea
                className="w-full h-20 border p-3"
                placeholder="Enter prompt here (Ex: Turn on Bedroom light / Please give me light status)"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
              ></textarea>

              <div
                className="rounded-lg bg-[#0056E1] text-white text-lg p-2 text-center my-2 hover:cursor-pointer hover:bg-blue-800 transition"
                onClick={() => submitAgent(prompt)}
              >
                Ask Smart Agent
              </div>

              {promptResponse &&
                <div className="rounded-lg bg-gray-200 p-3 mt-3">
                  <div><b>Smart Agent Response</b></div>
                  <div className="whitespace-pre-line">{promptResponse}</div>
                </div>
              }
            </div>

            <div>
              <div className="mb-1 text-lg">
                <b>Light Status</b>
              </div>

              {LIGHT_DB.map(({ xmtpAddress, roomName }) => (
                <div className="grid" style={{
                  gridTemplateColumns: '30px 110px 1fr',
                }}>
                  <div>
                  {lights[xmtpAddress] ? '🟢' : '🔴'}
                  </div>
                  <div>
                    {roomName}
                  </div>
                  <div>
                    {lights[xmtpAddress] ? 'ON' : 'OFF'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}