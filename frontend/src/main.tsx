import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'
import Homepage from './Homepage';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { defineChain } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi';

export const galadriel = defineChain({
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

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = '84ae9c084581a3b379c0e705b920dc26'

// 2. Create wagmiConfig
const metadata = {
  name: 'Smart Home Agent',
  description: 'Smart agent for smart home',
  // url: 'https://smarthomeagent.singular.sh', // origin must match your domain & subdomain
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [galadriel] as const
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
})

// 3. Create modal
createWeb3Modal({
  metadata,
  wagmiConfig: config,
  projectId,
  enableAnalytics: true // Optional - defaults to your Cloud configuration
})

const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage></Homepage>,
  },
]);

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)


