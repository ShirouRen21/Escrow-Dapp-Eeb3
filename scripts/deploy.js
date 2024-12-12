async function main() {
  const Escrow = await ethers.getContractFactory("Escrow"); // Ambil kontrak
  const escrow = await Escrow.deploy(); // Deploy kontrak

  console.log("Transaction Hash:", escrow.deploymentTransaction()?.hash); // Transaksi deploy

  await escrow.waitForDeployment(); // Tunggu hingga kontrak selesai di-deploy

  console.log("Escrow deployed to:", escrow.target); // Alamat kontrak
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
  console.log("Contract:", escrow);
console.log("Deployment Transaction:", escrow.deploymentTransaction());
});
