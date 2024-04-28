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
  {
    name: 'setApprovalForAll',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {name: 'operator', type: 'address'},
      {name: 'approved', type: 'bool'}
    ],
    outputs: []
  },
  {
    name: 'swap',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      {name: 'inbound', type: 'address'},
      {name: 'inId', type: 'uint256'}
    ],
    outputs: []
  }
] as const;
