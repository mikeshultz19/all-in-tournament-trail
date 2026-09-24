[CmdletBinding()]
param(
    [ValidateSet('staging', 'production')]
    [string]$Target = 'staging',
    [string]$OutputDirectory = 'backups'
)

$ErrorActionPreference = 'Stop'

# Set these in the current PowerShell process; do not put hostnames or secrets here.
$hostVariable = if ($Target -eq 'staging') { 'AITT_STAGING_DB_HOST' } else { 'AITT_PRODUCTION_DB_HOST' }
$databaseVariable = if ($Target -eq 'staging') { 'AITT_STAGING_DB_NAME' } else { 'AITT_PRODUCTION_DB_NAME' }
$userVariable = if ($Target -eq 'staging') { 'AITT_STAGING_DB_USER' } else { 'AITT_PRODUCTION_DB_USER' }

$dbHost = [Environment]::GetEnvironmentVariable($hostVariable, 'Process')
$dbName = [Environment]::GetEnvironmentVariable($databaseVariable, 'Process')
$dbUser = [Environment]::GetEnvironmentVariable($userVariable, 'Process')
if ([string]::IsNullOrWhiteSpace($dbHost) -or [string]::IsNullOrWhiteSpace($dbName) -or [string]::IsNullOrWhiteSpace($dbUser)) {
    throw "Set $hostVariable, $databaseVariable, and $userVariable in this PowerShell process before running."
}

$securePassword = Read-Host "Enter the $Target database password" -AsSecureString
$passwordPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
    $env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPtr)
    New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $outputPath = Join-Path $OutputDirectory "aitt-$Target-$stamp.dump"
    & pg_dump --format=custom --no-owner --no-acl --host=$dbHost --username=$dbUser --dbname=$dbName --file=$outputPath
    if ($LASTEXITCODE -ne 0) { throw "pg_dump failed for the $Target target." }
    Write-Output "Backup written to $outputPath"
}
finally {
    $env:PGPASSWORD = $null
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPtr)
}
