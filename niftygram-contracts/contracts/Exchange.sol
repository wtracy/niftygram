//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";

error NotNFT();

contract Exchange is IERC721Receiver, ERC1155Receiver 
{
	event gift(
		address indexed who,
		address what,
		uint256 id);

	bytes4 constant erc721id = type(IERC721).interfaceId;
	bytes4 constant erc1155id = type(IERC1155).interfaceId;

	address current;
	uint256 currentId;

	function onERC721Received(
		address,
		address,
		uint256 id,
		bytes calldata
	) external returns (bytes4) {
		current = msg.sender;
		currentId = id;

		return IERC721Receiver.onERC721Received.selector;
	}

	function onERC1155Received(
		address,
		address,
		uint256 id,
		uint256,
		bytes calldata
	) external returns (bytes4) {
		current = msg.sender;
		currentId = id;

		return IERC1155Receiver.onERC1155Received.selector;
	}

	function onERC1155BatchReceived(
		address,
		address,
		uint256[] calldata,
		uint256[] calldata,
		bytes calldata
	) external pure returns (bytes4) { return 0; }

	function swap(address inbound, uint256 inId) external payable {
		emit gift(msg.sender, address(current), currentId);

		if (IERC165(current).supportsInterface(erc721id))
			IERC721(current).safeTransferFrom(address(this), msg.sender, currentId);
		else
			IERC1155(current).safeTransferFrom(address(this), msg.sender, currentId, 1, "");

		IERC165 i = IERC165(inbound);
		if (!i.supportsInterface(type(IERC165).interfaceId))
			revert NotNFT();
		if (i.supportsInterface(erc721id))
			IERC721(inbound).safeTransferFrom(msg.sender, address(this), inId);
		else if (i.supportsInterface(erc1155id))
			IERC1155(inbound).safeTransferFrom(msg.sender, address(this), inId, 1, "");
		else
			revert NotNFT();
	}
}
