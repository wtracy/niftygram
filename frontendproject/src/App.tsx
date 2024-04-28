import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { abi } from "./abi";

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
  zkSync,
  localhost
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

import './App.css'

const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet, polygon, optimism, base, linea, zkSync, localhost],
  ssr: false
});
const queryClient = new QueryClient();

function TransactForm() {
  const {status, data: hash, error, writeContract } = useWriteContract();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log('submit()');
    const formData = new FormData(e.target as HTMLFormElement);
    const contractAddress = formData.get('contract') as string;
    const nftId = formData.get('nftid') as integer;
    console.log('writeContract()');
    writeContract({
      address: contractAddress,
      abi,
      functionName: 'setApprovalForAll',
      args: [contractAddress, true]
    });
    console.log('writeContract() called');
  }

  return (
    <>
    <form onSubmit={submit}>
      NFT contract address: <input name="contract" type="text" minLength="3" maxLength="42" size="42" />
      NFT ID: <input type="number" id="nftid" min="0" />
      <button type="submit">Approve transaction</button>
    </form>
    {status} {error && String(error)}
    {hash && <div>Transaction hash: {hash}</div>}
    </>);
}

function App() {
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
      <TransactForm />
      </RainbowKitProvider>
      </QueryClientProvider>
      </WagmiProvider>
    </>
  )
}

export default App
