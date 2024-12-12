// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Escrow {
    struct Transaction {
        address buyer;
        address seller;
        uint256 amount;
        bool isConfirmed;
        uint256 createdAt;
    }

    event TransactionCreated(
        uint256 transactionId,
        address buyer,
        address seller,
        uint256 amount
    );
    event TransactionConfirmed(uint256 transactionId);

    mapping(uint256 => Transaction) public transactions;
    uint256 public transactionCount;

    // Membuat transaksi baru
    function createTransaction(address _seller) external payable {
        transactions[transactionCount] = Transaction({
            buyer: msg.sender,
            seller: _seller,
            amount: msg.value,
            isConfirmed: false,
            createdAt: block.timestamp
        });

        emit TransactionCreated(
            transactionCount,
            msg.sender,
            _seller,
            msg.value
        );
        transactionCount++;
    }

    // Mengonfirmasi transaksi dan mengirim Ether ke penjual
    function confirmTransaction(uint256 _transactionId) external {
        Transaction storage txn = transactions[_transactionId];
        require(txn.buyer == msg.sender, "Only buyer can confirm");
        require(!txn.isConfirmed, "Transaction already confirmed");

        txn.isConfirmed = true;

        // Transfer Ether ke penjual
        payable(txn.seller).transfer(txn.amount);
    }
}
