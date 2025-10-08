# Test mint helper for Windows PowerShell
param(
  [string]$Keypair = "$env:USERPROFILE\.config\solana\devnet.json",
  [string]$Rpc = "https://api.devnet.solana.com"
)

Write-Host "Minting using keypair: $Keypair on $Rpc"
$cmd = ".\sugar-windows-latest.exe mint --keypair $Keypair --rpc-url $Rpc --log-level info"
Write-Host "Running: $cmd"
Invoke-Expression $cmd
