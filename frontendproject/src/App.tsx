import { useState, useEffect } from 'react';
import { abi } from "./abi";

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  ConnectButton
} from '@rainbow-me/rainbowkit';
import {WagmiProvider, useWriteContract} from 'wagmi';
import {getAccount, watchContractEvent} from '@wagmi/core';
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

const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet, polygon, optimism, base, linea, zkSync, localhost],
  ssr: false
});
const queryClient = new QueryClient();



function TransactForm() {
  const {status, data: hash, error, writeContract } = useWriteContract();
  const [nftAddress, setNftAddress] = useState('');
  const [nftId, setNftId] = useState(0);
  const [receivedAddress, setReceivedAddress] = useState(null);
  const [receivedId, setReceivedId] = useState(0);

  useEffect(() => {
    const unwatch = watchContractEvent(config, {
      address: contractAddress,
      abi,
      eventName: 'gift',
      onLogs(logs) {
        console.log('Log', logs);
        console.log('whodunit?', getAccount(config));
        console.log(logs.length);
        for (const log of logs) {
          console.log('Processing',log);
          const args = log.args;
          if (args.who === getAccount(config).address) {
            console.log('Is user!');
            setReceivedAddress(args.what);
            setReceivedId(args.id);
            console.log(receivedId);
          } else {
            console.log('Not user:',args.who);
          }
        }
      }
    });
  });

  async function submitApproval(e) {
    e.preventDefault();

    writeContract({
        address: nftAddress,
        abi,
        functionName: 'setApprovalForAll',
        args: [contractAddress, true]
    });
  }

  async function execute(e) {
    e.preventDefault();

    writeContract({
      address: contractAddress,
      abi,
      functionName: 'swap',
      args: [nftAddress, nftId]
    });
  }

return (
    <>
    <form>
      NFT contract address:
      <input name="contract" type="text" minLength="3" maxLength="42" size="44" value={nftAddress} onChange={e=>{setNftAddress(e.target.value)}} />
      <button onClick={submitApproval} id="approve" type="submit">Approve transaction</button><br />
      NFT ID: <input type="number" id="nftid" min="0" value={nftId} onChange={e=>{setNftId(e.target.value)}} />
      <button onClick={execute} id="execute" type="submit">Trade</button>
    </form>
    {status} {error && String(error)}
    {receivedAddress && <div>Received NFT! Contract: {receivedAddress} ID: {String(receivedId)}</div>}
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
