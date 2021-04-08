// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Interface for the optional metadata functions from the ERC20 standard.
 * https://eips.ethereum.org/EIPS/eip-20
 */
interface IERC20Metadata {
    /**
     * @return Returns the name of the token.
     */
    function name() external view returns (string memory);

    /**
     * @return Returns the symbol of the token.
     */
    function symbol() external view returns (string memory);

    /**
     * @return Returns the decimals places of the token.
     */
    function decimals() external view returns (uint8);
}
