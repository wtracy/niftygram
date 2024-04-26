import { useState } from 'react'

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  ConnectButton
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  linea,
  base,
  zkSync
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

import './App.css'

const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet, polygon, optimism, base, linea, zkSync],
  ssr: false
});
const queryClient = new QueryClient();

function App() {
  const [count, setCount] = useState(0)

  // Connect wallet
  // Set chain
  // Select NFT
  // Execute
  // Wait
  // Show received NFT

  return (
    <>
      <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
      <ConnectButton />
      </RainbowKitProvider>
      </QueryClientProvider>
      </WagmiProvider>
    </>
  )
}

export default App
