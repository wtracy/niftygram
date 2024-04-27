import { useState } from 'react';
import { useWriteContract } from 'wagmi';
//import { abi } from "./abi";

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

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const tokenId = formData.get('contract') as string
  }

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
      <form>
      NFT contract address: <input name="contract" type="text" minlength="3" maxlength="42" size="42" /><button type="submit">Approve transaction</button>
      </form>
      </RainbowKitProvider>
      </QueryClientProvider>
      </WagmiProvider>
    </>
  )
}

export default App
