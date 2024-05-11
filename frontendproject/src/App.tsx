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

const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet, polygon, optimism, base, linea, zkSync, zkSyncSepoliaTestnet, localhost],
  ssr: false
});
const queryClient = new QueryClient();

const chainLookup = {
  300: {
    name: 'zksync-sepolia-testnet',
    address: '0xc6b699D29d58Db9e9Cc687884CF5A7c4DD63D316'
  }
};

function TransactForm() {
  const [nftAddress, setNftAddress] = useState(null);
  const [nftId, setNftId] = useState(0);
  const [receivedAddress, setReceivedAddress] = useState(null);
  const [receivedId, setReceivedId] = useState(0);
  const [swapStarted, setSwapStarted] = useState(false);

  function transactionFailed(a, b) {
    setSwapStarted(false);
  }

  // TODO: usePrepareContractWrite
  const {status, data: hash, error, writeContract } = useWriteContract(
      {mutation: {onError: transactionFailed}});

  useEffect(() => {
    const unwatch = watchContractEvent(config, {
      address: chainLookup[getChainId(config)].address,
      abi,
      eventName: 'gift',
      onLogs(logs) {
        for (const log of logs) {
          const args = log.args;
          if (args.who === getAccount(config).address) {
            setReceivedAddress(args.what);
            setReceivedId(args.id);
            setSwapStarted(false);
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
        args: [chainLookup[getChainId(config)].address, true]
    });
    setSwapStarted(false);
  }

  async function execute(e) {
    e.preventDefault();

    writeContract({
      address: chainLookup[getChainId(config)].address,
      abi,
      functionName: 'swap',
      args: [nftAddress, nftId]
    });
    setSwapStarted(true);
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
        <NFTPicker address={getAccount(config).address} chain_names={[chainLookup[getChainId(config)].name]} on_nft_click={selectNFT} />
    :
      (receivedAddress == null) ? 
      <>
        <NFTDetailView chain_name={chainLookup[getChainId(config)].name} collection_address={nftAddress} token_id={nftId} />
        {
          (swapStarted)?((status==='pending')?<div>Swap pending.</div>:<div>Unwrapping NFT...</div>):
          <form>
            <button onClick={submitApproval} id="approve" type="submit" disabled={status==='pending'}>Approve transaction</button>
            <button onClick={execute} id="execute" type="submit" disabled={status==='pending'}>Swap</button>
          </form>
        }
      </>
      :
      <NFTDetailView chain_name={chainLookup[getChainId(config)].name} collection_address={receivedAddress} token_id={receivedId} />
    }
    </GoldRushProvider>
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
