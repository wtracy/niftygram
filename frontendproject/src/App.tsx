import { useState, useEffect } from 'react';
import { abi } from "./abi";

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  ConnectButton
} from '@rainbow-me/rainbowkit';

import {WagmiProvider, useWriteContract, useChainId} from 'wagmi';
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
    address: '0xc6b699D29d58Db9e9Cc687884CF5A7c4DD63D316',
    fee: 0
  },
  324: {
    name: 'zksync-mainnet',
    address: '0x633c38E744F6A1F39cf12DeaD8fEEf368A6Aa255',
    fee: 0
  },
  59141: {
    name: 'linea-sepolia-testnet',
    address: '0xCAa02a3e6642554be7cCD5576C7CE4561a1E5A49',
    fee: 0
  },
  59144: {
    name: 'linea-mainnet',
    address: '0xeD1855D68C96B47210aeb2C20C7E911e26A6031b',
    fee: 0
  },
};

function TransactForm() {
  const [nftAddress, setNftAddress] = useState(null);
  const [nftId, setNftId] = useState(0);
  const [receivedAddress, setReceivedAddress] = useState(null);
  const [receivedId, setReceivedId] = useState(0);
  const [swapStarted, setSwapStarted] = useState(false);

  const currentChain = chainLookup[useChainId(config)];

  function transactionFailed(a, b) {
    setSwapStarted(false);
  }

  // TODO: usePrepareContractWrite
  const {status, data: hash, error, writeContract } = useWriteContract(
      {mutation: {onError: transactionFailed}});

  useEffect(() => {
    const unwatch = watchContractEvent(config, {
      address: currentChain.address,
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
        args: [currentChain.address, true]
    });
    setSwapStarted(false);
  }

  async function execute(e) {
    e.preventDefault();

    writeContract({
      address: currentChain.address,
      abi,
      functionName: 'swap',
      args: [nftAddress, nftId],
      value: currentChain.fee
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
        <NFTPicker address={getAccount(config).address} chain_names={[currentChain.name]} on_nft_click={selectNFT} />
    :
      (receivedAddress == null) ? 
      <>
        <NFTDetailView chain_name={currentChain.name} collection_address={nftAddress} token_id={nftId} />
        {
          (swapStarted)?((status==='pending')?<div>Swap pending...</div>:<div>Unwrapping NFT...</div>):
          <>
          <form>
            <button class="text-white hover:border-black bg-gradient-to-b from-fuchsia-500 via-purple-700 to-violet-900 hover:bg-gradient-to-br" onClick={submitApproval} id="approve" type="submit" disabled={status==='pending'}>Approve transaction</button>
            <button class="text-white hover:border-black bg-gradient-to-b from-fuchsia-500 via-purple-700 to-violet-900 hover:bg-gradient-to-br" onClick={execute} id="execute" type="submit" disabled={status==='pending'}>Swap</button>
          </form>
          {(status==='pending')&&<div>Submitting approval...</div>}
          </> 
        }
      </>
      :
      <>
      <div>You received:</div>
      <NFTDetailView chain_name={currentChain.name} collection_address={receivedAddress} token_id={receivedId} />
      </>
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
