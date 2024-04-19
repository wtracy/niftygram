// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Exchange} from "../src/Exchange.sol";
import {MyNFT} from "./ERC721Mock.sol";
import {ERC721Holder} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract ExchangeTest is Test, ERC721Holder {
	Exchange ex;
	MyNFT mock;

	function setUp() public {
		ex = new Exchange();
		mock = new MyNFT("","","");
		mock.mint(address(this));
		mock.mint(address(this));
	}

	function test_whatever() public {
		mock.safeTransferFrom(address(this), address(ex), 1);
		assertEq(address(ex), mock.ownerOf(1));

		/*assertEq(ex.current, address(mock));
		assertEq(ex.currentId, 0);*/

		mock.approve(address(ex), 2);
		ex.swap(address(mock), 2);
		assertEq(address(ex), mock.ownerOf(2));
		assertEq(address(this), mock.ownerOf(1));
	}
}
