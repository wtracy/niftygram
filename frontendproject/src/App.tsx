import {useState} from 'react';
import { abi } from "./abi";

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  ConnectButton
} from '@rainbow-me/rainbowkit';

import {Address} from 'viem';
import {WagmiProvider, useWriteContract, useChainId} from 'wagmi';
import {getAccount, watchContractEvent/*, getChainId*/} from '@wagmi/core';
import {
  //mainnet,
  polygon,
  //optimism,
  linea,
  //lineaSepolia,
  base,
  //baseSepolia,
  zkSync,
  zkSyncSepoliaTestnet,
  //localhost
} from 'wagmi/chains';

import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

import {Chain} from '@covalenthq/client-sdk';
import {GoldRushProvider, NFTDetailView, NFTPicker} from '@covalenthq/goldrush-kit';
import "@covalenthq/goldrush-kit/styles.css";

import busyUrl from '../busy.gif';

const config = getDefaultConfig({
  appName: 'Niftygram',
  // TODO: make wallet connect work!!!
  projectId: '15f074c13391ad418e74f898a88f7765',
  chains: [/*mainnet, */polygon, /*optimism,*/ base, /*baseSepolia,*/ linea, zkSync, zkSyncSepoliaTestnet/*, localhost*/],
  ssr: false
});
const queryClient = new QueryClient();

const chainLookup:{[key:number]:{address:Address,name:Chain,fee:bigint}} = {
  137: {
    name: 'matic-mainnet',
    address: '0x6D4753aD181D67Bd0a26E044d6D8c72Bf953ca61',
    fee: BigInt(100000000000000000)
  },
  300: {
    name: 'zksync-sepolia-testnet' as Chain,
    address: '0xc6b699D29d58Db9e9Cc687884CF5A7c4DD63D316',
    fee: BigInt(0)
  },
  324: {
    name: 'zksync-mainnet',
    address: '0x633c38E744F6A1F39cf12DeaD8fEEf368A6Aa255',
    fee: BigInt(0)
  },
  /*59141: {
    name: 'linea-sepolia-testnet',
    address: '0xCAa02a3e6642554be7cCD5576C7CE4561a1E5A49',
    fee: BigInt(0)
  },*/
  59144: {
    name: 'linea-mainnet',
    address: '0xeD1855D68C96B47210aeb2C20C7E911e26A6031b',
    fee: BigInt(0)
  },
  84532: {
    name: 'base-sepolia-testnet',
    address: '0xCAa02a3e6642554be7cCD5576C7CE4561a1E5A49',
    fee: BigInt(10000000000000)
  },
  8453: {
    name: 'base-mainnet',
    address: '0x6E8a2f205516E94cB18c5B8791F055d289A52f91',
    fee: BigInt(100000000000000)
  }
};

function TransactForm() {
  const [nftAddress, setNftAddress] = useState(null);
  const [nftId, setNftId] = useState(BigInt(0));
  const [receivedAddress, setReceivedAddress] = useState<Address|null>(null);
  const [receivedId, setReceivedId] = useState<BigInt>(BigInt(0));
  const [swapStarted, setSwapStarted] = useState(false);

  const chainId = useChainId();
  const currentChain = chainLookup[chainId];

  function transactionFailed(err:any) {
    console.error(err);
    setSwapStarted(false);
  }

  // TODO: usePrepareContractWrite
  // TODO: push browser history
  // TODO: respond to chain change
  const {status, data: _, error, writeContract } = useWriteContract(
      {mutation: {onError: transactionFailed}});

  async function submitApproval(e:any) {
    e.preventDefault();

    if (nftAddress != null) {
      writeContract({
          address: nftAddress,
          abi,
          functionName: 'setApprovalForAll',
          args: [currentChain.address, true]
      });
      setSwapStarted(false);
    } else {
      console.error('Cannot write to NFT contract with null address.');
    }
  }

  async function execute(e:any) {
    e.preventDefault();

    if (nftAddress != null) {
      /* TODO: release watch: const unwatch =*/ 
      const address = currentChain.address;
      watchContractEvent(config, {
        address,
        abi,
        eventName: 'gift',
        onLogs(logs) {
          for (const log of logs) {
            const args = log.args;
            if (args.who === getAccount(config).address) {
              const what = args.what as Address;
              const id = args.id as BigInt;
              setReceivedAddress(what);
              setReceivedId(id);
              setSwapStarted(false);
            }
          }
        }
      });

      writeContract({
        address: currentChain.address,
        abi,
        functionName: 'swap',
        args: [nftAddress, nftId],
        value: currentChain.fee
      });
      setSwapStarted(true);
    } else {
      console.error('Cannot write to exchange contract with null address.');
    }
  }


  function selectNFT(collection:any, token:any) {
    setNftAddress(collection.contract_address);
    setNftId(token.token_id);
  }

  var rawAddress = getAccount(config).address;
  var userAddress = '';
  if (rawAddress != undefined) {
    userAddress = rawAddress.toString();
  }
  var chainName:Chain = 'eth-mainnet';
  if (currentChain != undefined)
    chainName = currentChain.name;

  return (
  <>
    <div>{error && String(error)}</div>
    <div className="flex justify-center">
    <GoldRushProvider apikey={import.meta.env.VITE_COVALENT_KEY}>
    {
    (nftAddress == null) ?
        <div className="p-5"><NFTPicker address={userAddress} chain_names={[chainName]} on_nft_click={selectNFT} /></div>
    :
      (receivedAddress == null) ? 

      <div className="p-2">
        {(!swapStarted||status==='pending') && <NFTDetailView chain_name={chainName} collection_address={nftAddress} token_id={nftId.toString()} />}
        {
          // TODO: Hide old NFT when unwrapping starts
          (swapStarted)?((status==='pending')?<div align="center">Swap pending...</div>:<div align="center"><img className="w-1/2 object-scale-down" src={busyUrl}/><br/>Unwrapping NFT...</div>):
          <>
          <form>
          <div className="p-2 flex justify-around">
            <div><button className="text-white hover:border-black bg-gradient-to-b from-fuchsia-500 via-purple-700 to-violet-900 hover:bg-gradient-to-br" onClick={submitApproval} id="approve" type="submit" disabled={status==='pending'}>Approve transaction</button></div>
            <div><button className="text-white hover:border-black bg-gradient-to-b from-fuchsia-500 via-purple-700 to-violet-900 hover:bg-gradient-to-br" onClick={execute} id="execute" type="submit" disabled={status==='pending'}>Swap</button></div>
          </div>
          </form>
          {(status==='pending')&&<div>Submitting approval...</div>}
          </> 
        }
      </div>

      :
      <div className="flex justify-center">
      <div className="p-5">You received:</div>
      <NFTDetailView chain_name={chainName} collection_address={receivedAddress} token_id={receivedId.toString()} />
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
      <div className="flex p-2 w-screen justify-end">
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
