import { useState, useEffect } from 'react';
import { abi } from "./abi";

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  ConnectButton
} from '@rainbow-me/rainbowkit';

import {WagmiProvider, useWriteContract} from 'wagmi';
import {getAccount, watchContractEvent, getChainId} from '@wagmi/core';
import {
  mainnet,
  polygon,
  optimism,
  linea,
  base,
  zkSync,
  zkSyncSepoliaTestnet,
  localhost
} from 'wagmi/chains';

import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

import {GoldRushProvider, NFTDetailView, NFTPicker} from '@covalenthq/goldrush-kit';
import "@covalenthq/goldrush-kit/styles.css";

const contractAddress = '0xc6b699D29d58Db9e9Cc687884CF5A7c4DD63D316'; // zkSync Sepolia address

const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet, polygon, optimism, base, linea, zkSync, zkSyncSepoliaTestnet, localhost],
  ssr: false
});
const queryClient = new QueryClient();

function TransactForm() {
  const [nftAddress, setNftAddress] = useState(null);
  const [nftId, setNftId] = useState(0);
  const [receivedAddress, setReceivedAddress] = useState(null);
  const [receivedId, setReceivedId] = useState(0);

  function restart(a, b) {
    console.log('a thing happened');
    console.log(a, b);
    /*setNftAddress(null);
    setReceivedAddress(null);*/
  }

  // TODO: usePrepareContractWrite
  const {status, data: hash, error, writeContract } = useWriteContract(
      {mutation: {onError: restart}});

  useEffect(() => {
    const unwatch = watchContractEvent(config, {
      address: contractAddress,
      abi,
      eventName: 'gift',
      onLogs(logs) {
        for (const log of logs) {
          const args = log.args;
          if (args.who === getAccount(config).address) {
            setReceivedAddress(args.what);
            setReceivedId(args.id);
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


  function selectNFT(collection, token) {
    setNftAddress(collection.contract_address);
    setNftId(token.token_id);
  }

  return (
    <div>{error && String(error)}
    <GoldRushProvider apikey={import.meta.env.VITE_COVALENT_KEY}>
    {
    (nftAddress == null) ?
        <NFTPicker address={getAccount(config).address} chain_names={['zksync-sepolia-testnet']} on_nft_click={selectNFT} />
    :
      (receivedAddress == null) ? 
      <>
        <NFTDetailView chain_name='zksync-sepolia-testnet' collection_address={nftAddress} token_id={nftId} />
        {//(status == ) ? <div>Unwrapping NFT!</div>:
        <form>
          <button onClick={submitApproval} id="approve" type="submit">Approve transaction</button>
          <button onClick={execute} id="execute" type="submit">Trade</button>
        </form>
        }
      </>
      :
      <NFTDetailView chain_name='zksync-sepolia-testnet' collection_address={receivedAddress} token_id={receivedId} />
    }
    </GoldRushProvider>
    {status} 
    </div>
  );
}

function App() {
  return (
    <>
      <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
      <ConnectButton /><br />
      </RainbowKitProvider>
      <TransactForm />
      </QueryClientProvider>
      </WagmiProvider>
    </>
  )
}

export default App
