import {
  getDefaultConfig,
} from '@rainbow-me/rainbowkit';

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

import {Address} from 'viem';
import {Chain} from '@covalenthq/client-sdk';

export const config = getDefaultConfig({
  appName: 'Niftygram',
  // TODO: make wallet connect work!!!
  projectId: '15f074c13391ad418e74f898a88f7765',
  chains: [/*mainnet, */polygon, /*optimism,*/ base, /*baseSepolia,*/ linea, zkSync, zkSyncSepoliaTestnet, /*localhost*/],
  ssr: false
});

export const chainLookup:{[key:number]:{address:Address,name:Chain,fee:bigint}} = {
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


