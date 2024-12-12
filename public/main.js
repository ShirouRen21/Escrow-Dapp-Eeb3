import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.6.2/+esm";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "transactionId",
        type: "uint256",
      },
    ],
    name: "TransactionConfirmed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "transactionId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "seller",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "TransactionCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_transactionId",
        type: "uint256",
      },
    ],
    name: "confirmTransaction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_seller",
        type: "address",
      },
    ],
    name: "createTransaction",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "transactionCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "transactions",
    outputs: [
      {
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        internalType: "address",
        name: "seller",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isConfirmed",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "createdAt",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

let contract;
let signer;

// Tombol Connect Wallet
document.getElementById("connectWallet").addEventListener("click", async () => {
  try {
    // Request akses ke MetaMask
    if (window.ethereum == null) {
      throw new Error("MetaMask tidak terdeteksi");
    }

    // Meminta akun
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    // Membuat provider dan signer (perbedaan utama di Ethers v6)
    const provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    // Mendapatkan alamat wallet
    const address = await signer.getAddress();
    document.getElementById(
      "walletAddress"
    ).textContent = `Terhubung: ${address}`;

    // Tampilkan form transaksi
    document.getElementById("transactionForm").style.display = "block";

    // Inisialisasi kontrak (perbedaan sintaks di v6)
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // Muat transaksi yang sudah ada
    await loadTransactions();
  } catch (error) {
    console.error("Koneksi wallet gagal:", error);
    alert("Gagal terhubung dengan wallet. Pastikan MetaMask terinstal.");
  }
});

// Tombol Submit Transaksi
document.getElementById("submitButton").addEventListener("click", async () => {
  try {
    const sellerAddress = document.getElementById("sellerAddress").value;
    const amount = document.getElementById("amount").value;

    // Validasi input
    if (!sellerAddress || !amount) {
      alert("Harap isi semua kolom");
      return;
    }

    // Kirim transaksi ke kontrak (perbedaan utama di v6)
    const tx = await contract.createTransaction(sellerAddress, {
      value: ethers.parseEther(amount),
    });

    // Tunggu konfirmasi transaksi
    await tx.wait();

    // Muat ulang daftar transaksi
    await loadTransactions();

    // Reset form
    document.getElementById("sellerAddress").value = "";
    document.getElementById("amount").value = "";
  } catch (error) {
    console.error("Gagal membuat transaksi:", error);
    alert("Gagal membuat transaksi. Periksa kembali input Anda.");
  }
});

// Fungsi untuk memuat daftar transaksi
async function loadTransactions() {
  try {
    const transactionsTable = document.getElementById("transactions");
    transactionsTable.innerHTML = ""; // Bersihkan tabel

    // Dapatkan jumlah total transaksi
    const transactionCount = await contract.transactionCount();

    // Iterasi melalui setiap transaksi
    for (let i = 0; i < transactionCount; i++) {
      const transaction = await contract.transactions(i);

      const row = transactionsTable.insertRow();
      row.insertCell(0).textContent = i;
      row.insertCell(1).textContent = transaction.seller;
      row.insertCell(2).textContent = ethers.formatEther(transaction.amount);
      row.insertCell(3).textContent = transaction.isConfirmed
        ? "Sukses"
        : "Pending";

      const actionCell = row.insertCell(4);
      if (!transaction.isConfirmed) {
        const confirmButton = document.createElement("button");
        confirmButton.textContent = "Konfirmasi";
        confirmButton.onclick = () => confirmTransaction(i);
        actionCell.appendChild(confirmButton);
      }
    }
  } catch (error) {
    console.error("Gagal memuat transaksi:", error);
  }
}

// Fungsi untuk mengonfirmasi transaksi
async function confirmTransaction(transactionId) {
  try {
    const tx = await contract.confirmTransaction(transactionId);
    await tx.wait();
    await loadTransactions();
  } catch (error) {
    console.error("Gagal mengonfirmasi transaksi:", error);
    alert("Gagal mengonfirmasi transaksi");
  }
}

// Tambahkan event listener untuk perubahan akun di MetaMask
if (window.ethereum) {
  window.ethereum.on("accountsChanged", async () => {
    // Muat ulang halaman atau perbarui status koneksi
    window.location.reload();
  });
}
