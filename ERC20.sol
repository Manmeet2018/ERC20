// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interface/IERC20.sol";
import "./extensions/IERC20Metadata.sol";

/**
 * @dev Implementation of the {IERC20} interface.
 * @notice To add token to the supply use _mint.
 */

contract ERC20 is IERC20Metadata, IERC20 {
    mapping (address => mapping (address => uint256)) private _allowances;

    mapping (address => uint256) private _balances;
    
    uint256 private _totalSupply;

    string private _name;
    string private _symbol;

    /**
     * @dev Sets the values for {name} and {symbol}.
     * @notice All two of these values(_name & _symbol) are immutable: they can only be set once during
     * construction.
     */
    constructor (string memory name_, string memory symbol_) payable {
        _name = name_;
        _symbol = symbol_;
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view virtual override returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `5`, a balance of `505` tokens should
     * be displayed to a user as `50.5505` (`505505 / 10 ** 5`).
     *
     * Tokens usually opt for a value of 18, imitating the relationship between
     * Ether and Wei(lower denomination).
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    /**
     * @dev See {Interface IERC20-totalSupply}.
     */
    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev See {Interface IERC20-balanceOf}.
     */
    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev See {Interface IERC20-transfer}.
     * @notice `recipient` cannot be the zero address.
     * @notice The caller must have a balance of at least `amount`.
     */
    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    /**
     * @dev See {Interface IERC20-allowance}.
     */
    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @dev See {Interface IERC20-approve}.
     * @notice `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of {ERC20}.
     *
     * @param `sender` and `recipient` cannot be the zero address.
     * @param `sender` must have a balance of at least `amount`.
     * @notice the caller must have allowance for ``sender``'s tokens of at least
     * `amount`.
     */
    function transferFrom(address sender, 
                          address recipient, 
                          uint256 amount) 
                          public virtual override returns (bool) {
        
        _transfer(sender, recipient, amount);
        require(_allowances[sender][msg.sender] >= amount, "ERC20: Transfer amount exceeds allowance");
        _approve(sender, msg.sender, _allowances[sender][msg.sender] - amount);

        return true;
    }

    /**
     * @dev Moves tokens `amount` from `sender` to `recipient`.
     * Emits a {Transfer} event.
     * @notice `sender` cannot be the zero address.
     * @notice `recipient` cannot be the zero address.
     * @notice `sender` must have a balance of at least `amount`.
     */
    function _transfer(address sender, address recipient, uint256 amount) internal virtual {
        require(sender != address(0) && recipient != address(0), "ERC20: Can't transfer from the zero address");
        require(_balances[sender] >= amount && amount > 0, "ERC20: Transfer amount exceeds balance");
        
        _balances[sender] -= amount;
        _balances[recipient] += amount;

        emit Transfer(sender, recipient, amount);
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner` s tokens.
     * Emits an {Approval} event.
     * @notice `owner` cannot be the zero address.
     * @notice `spender` cannot be the zero address.
     */
    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0) && spender != address(0), "ERC20: Approve from the zero address");
        
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /** @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     * @notice Emits a {Transfer} event with `from` set to the zero address.
     * @notice `to` cannot be the zero address.
     */
    function mint(address account, uint256 amount) public  {
        require(account != address(0), "ERC20: mint to the zero address");

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }
}
