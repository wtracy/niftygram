import {useState, useEffect} from 'react';
import { abi } from "./abi";

import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
  ConnectButton
} from '@rainbow-me/rainbowkit';

import {Address} from 'viem';
import {WagmiProvider, useWriteContract, useAccount, useChainId} from 'wagmi';
import {watchContractEvent, WatchContractEventReturnType} from '@wagmi/core';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

import {Chain} from '@covalenthq/client-sdk';
import {GoldRushProvider, NFTDetailView, NFTPicker} from '@covalenthq/goldrush-kit';
import "@covalenthq/goldrush-kit/styles.css";

import {config, chainLookup} from './ChainConfig';
import busyUrl from '../busy.gif';

const queryClient = new QueryClient();
var watchHandle:WatchContractEventReturnType|null = null; // useRef() ?

function TransactForm() {
  const [nftAddress, setNftAddress] = useState(null);
  const [nftId, setNftId] = useState(BigInt(0));
  const [receivedAddress, setReceivedAddress] = useState<Address|null>(null);
  const [receivedId, setReceivedId] = useState<BigInt>(BigInt(0));
  const [swapStarted, setSwapStarted] = useState(false);

  // Will be used for coordinating transaction preparation and launching
  //const [approveTransactionReady, setApproveTransactionReady] = useState(false);
  //const [swapTransactionReady, setSwapTransactionReady] = useState(false);

  const chainId = useChainId();
  const currentChain = chainLookup[chainId];

  function transactionFailed(err:any) {
    console.error(err);
    setSwapStarted(false);
  }

  // TODO: usePrepareContractWrite
  const {status, data: _, error, writeContract } = useWriteContract(
      {mutation: {onError: transactionFailed}});

  var rawUserAddress = useAccount().address;
  var userAddress = '';
  if (rawUserAddress != undefined) {
    userAddress = rawUserAddress.toString();
  }

  useEffect(() => {
    history.replaceState({address: null, id: BigInt(0)}, '');
    onpopstate = (event) => {
      const newAddress = event.state.address;
      if (newAddress == null) {
        setNftAddress(null);
      } else {
        setNftId(event.state.id);
        setNftAddress(event.state.address);
      }
    }
  }, []);


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
      const address = currentChain.address;
      watchHandle = watchContractEvent(config, {
        address,
        abi,
        eventName: 'gift',
        onLogs(logs) {
          for (const log of logs) {
            const args = log.args;
            if (args.who === rawUserAddress) {
              if (watchHandle != null)
                watchHandle(); // cancel watch
              const what = args.what as Address;
              const id = args.id as BigInt;
              setReceivedAddress(what);
              setReceivedId(id);
              setSwapStarted(false);

              // TODO: Write state?
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


  async function selectNFT(collection:any, token:any) {
    // This variables will be used for synchronizing access to prepared transactions
    /*setApproveTransactionReady(false);
    setSwapTransactionReady(false);*/

    history.pushState({address: collection.contract_address, id: token.token_id}, '');

    setNftId(token.token_id);
    setNftAddress(collection.contract_address);
    setReceivedAddress(null);

    // This fails on zkSync
    /*const result = await prepareTransactionRequest(config, {
          address: nftAddress,
          abi,
          functionName: 'setApprovalForAll',
          args: [currentChain.address, true]
    });
    setApproveTransactionReady(true);*/
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
          (swapStarted)?((status==='pending')?<div>Swap pending...</div>:<div><img className="w-1/2 object-scale-down" src={busyUrl}/><br/>Unwrapping NFT...</div>):
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
