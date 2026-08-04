$env:PGPASSWORD="Moby0019!!!!"

$timestamp = Get-Date -Format "yyyy-MM-dd_HHmm"

.\pg_dump.exe `
  -h db.qrmnglzylrrdhcvashmx.supabase.co `
  -p 5432 `
  -U postgres `
  -d postgres `
  -Fc `
  -f "C:\AITTBackup\AITT_PreSoftLaunch_$timestamp.backup"