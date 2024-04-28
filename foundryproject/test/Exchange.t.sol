// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {ERC721Mock} from "../src/ERC721Mock.sol";

import {ERC721Holder} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "lib/@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

import {Exchange} from "../src/Exchange.sol";

contract ExchangeTest is Test, ERC721Holder, ERC1155Holder {
	Exchange ex;

	ERC721Mock mock;
	Mock1155 mock1155;

	function setUp() public {
		ex = new Exchange();
		mock = new ERC721Mock("","","");
		mock.mint(address(this));
		mock.mint(address(this));
		mock1155 = new Mock1155();
	}

	function test_multiple721swaps() public {
		mock.safeTransferFrom(address(this), address(ex), 1);
		assertEq(address(ex), mock.ownerOf(1));

		mock.approve(address(ex), 2);
		ex.swap(address(mock), 2);
		assertEq(address(ex), mock.ownerOf(2));
		assertEq(address(this), mock.ownerOf(1));
	}

	function test_721then1155() public {
		mock.safeTransferFrom(address(this), address(ex), 1);
		assertEq(address(ex), mock.ownerOf(1));

		mock1155.setApprovalForAll(address(ex), true);
		ex.swap(address(mock1155), 2);
		assertEq(mock1155.balanceOf(address(ex), 2), 1);
		assertEq(address(this), mock.ownerOf(1));
	}

	function test_1155then721() public {
		mock1155.safeTransferFrom(address(this), address(ex), 1, 1, "");
		assertEq(mock1155.balanceOf(address(ex), 1), 1);

		mock.approve(address(ex), 1);
		ex.swap(address(mock), 1);
		assertEq(mock1155.balanceOf(address(ex), 1), 0);
		assertEq(address(ex), mock.ownerOf(1));
	}
}

contract Mock1155 is ERC1155 {
	constructor() ERC1155("") {
		uint256[] memory ids = new uint256[](2);
		uint256[] memory values = new uint256[](2);
		ids[0] = 1;
		ids[1] = 2;
		values[0] = 8;
		values[1] = 8;
		_mintBatch(msg.sender, ids, values, "");
	}
}
