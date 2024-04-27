export const abi = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {name: 'to', type: 'address' },
      {name: 'tokenId', type: 'uint256'}],
    outputs: [],
  },
] as const;
