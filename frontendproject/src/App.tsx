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
    <div>
    <GoldRushProvider apikey={import.meta.env.VITE_COVALENT_KEY}>
    {
    (nftAddress === '') ?
        <NFTPicker address={getAccount(config).address} chain_names={['zksync-sepolia-testnet']} on_nft_click={selectNFT} />
    :
        <NFTDetailView chain_name='zksync-sepolia-testnet' collection_address={nftAddress} token_id={nftId} />
    }
    </GoldRushProvider>
    <form>
      NFT contract address:
      <input name="contract" type="text" minLength="3" maxLength="42" size="44" value={nftAddress} onChange={e=>{setNftAddress(e.target.value)}} />
      <button onClick={submitApproval} id="approve" type="submit">Approve transaction</button><br />
      NFT ID: <input type="number" id="nftid" min="0" value={nftId} onChange={e=>{setNftId(e.target.value)}} />
      <button onClick={execute} id="execute" type="submit">Trade</button>
    </form>
    {status} {error && String(error)}
    {receivedAddress && <div>Received NFT! Contract: {receivedAddress} ID: {String(receivedId)}</div>}
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
