import { useState, useEffect } from 'react';
import { abi } from "./abi";

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  ConnectButton
} from '@rainbow-me/rainbowkit';

import {WagmiProvider, useWriteContract, useChainId} from 'wagmi';
import {getAccount, watchContractEvent/*, getChainId*/} from '@wagmi/core';
import {
  //mainnet,
  polygon,
  optimism,
  linea,
  //lineaSepolia,
  base,
  baseSepolia,
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
  chains: [/*mainnet, */polygon, optimism, base, baseSepolia, linea, zkSync, zkSyncSepoliaTestnet, localhost],
  ssr: false
});
const queryClient = new QueryClient();

const chainLookup = {
  137: {
    name: 'matic-mainnet',
    address: '0x6D4753aD181D67Bd0a26E044d6D8c72Bf953ca61',
    fee: 0
  },
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
  84532: {
    name: 'base-sepolia-testnet',
    address: '0xCAa02a3e6642554be7cCD5576C7CE4561a1E5A49',
    fee: 10000000000000
  },
  8453: {
    name: 'base-mainnet',
    address: '0x6E8a2f205516E94cB18c5B8791F055d289A52f91',
    fee: 0
  }
};

function TransactForm() {
  const [nftAddress, setNftAddress] = useState(null);
  const [nftId, setNftId] = useState(0);
  const [receivedAddress, setReceivedAddress] = useState(null);
  const [receivedId, setReceivedId] = useState(0);
  const [swapStarted, setSwapStarted] = useState(false);

  const chainId = useChainId();
  const currentChain = chainLookup[chainId];

  function transactionFailed({}, {}) {
    setSwapStarted(false);
  }

  // TODO: usePrepareContractWrite
  // TODO: push browser history
  // TODO: respond to chain change
  const {status, data: _, error, writeContract } = useWriteContract(
      {mutation: {onError: transactionFailed}});

  useEffect(() => {
    /*const unwatch =*/ watchContractEvent(config, {
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

  async function submitApproval(e:any) {
    e.preventDefault();

    writeContract({
        address: nftAddress,
        abi,
        functionName: 'setApprovalForAll',
        args: [currentChain.address, true]
    });
    setSwapStarted(false);
  }

  async function execute(e:any) {
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


  function selectNFT(collection:any, token:any) {
    setNftAddress(collection.contract_address);
    setNftId(token.token_id);
  }

  return (
  <>
    <div>{error && String(error)}</div>
    <div class="flex justify-center">
    <GoldRushProvider apikey={import.meta.env.VITE_COVALENT_KEY}>
    {
    (nftAddress == null) ?
        <div class="p-5"><NFTPicker address={getAccount(config).address} chain_names={[currentChain.name]} on_nft_click={selectNFT} /></div>
    :
      (receivedAddress == null) ? 

      <div class="p-2">
        {(!swapStarted||status==='pending') && <NFTDetailView chain_name={currentChain.name} collection_address={nftAddress} token_id={nftId} />}
        {
          // TODO: Hide old NFT when unwrapping starts
          (swapStarted)?((status==='pending')?<div>Swap pending...</div>:<div><img class="w-1/2 object-scale-down" src="busy.gif"/><br/>Unwrapping NFT...</div>):
          <>
          <form>
          <div class="p-2 flex justify-around">
            <div><button class="text-white hover:border-black bg-gradient-to-b from-fuchsia-500 via-purple-700 to-violet-900 hover:bg-gradient-to-br" onClick={submitApproval} id="approve" type="submit" disabled={status==='pending'}>Approve transaction</button></div>
            <div><button class="text-white hover:border-black bg-gradient-to-b from-fuchsia-500 via-purple-700 to-violet-900 hover:bg-gradient-to-br" onClick={execute} id="execute" type="submit" disabled={status==='pending'}>Swap</button></div>
          </div>
          </form>
          {(status==='pending')&&<div>Submitting approval...</div>}
          </> 
        }
      </div>

      :
      <div class="flex justify-center">
      <div class="p-5">You received:</div>
      <NFTDetailView chain_name={currentChain.name} collection_address={receivedAddress} token_id={receivedId.toString()} />
      </div>
    }
    </GoldRushProvider>
    </div>
  </>
  );
}

function App() {
  return (
    <>
      <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
      <div class="flex p-2 w-screen justify-end">
      <RainbowKitProvider>
      <ConnectButton />
      </RainbowKitProvider>
      </div>
      <TransactForm />
      </QueryClientProvider>
      </WagmiProvider>
    </>
  )
}

export default App
