$ErrorActionPreference = "Stop"
$repo = Resolve-Path (Join-Path $PSScriptRoot "..")
$src = Join-Path $repo "src-tauri/icons-b64"
$dst = Join-Path $repo "src-tauri/icons"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Get-ChildItem $src -Filter *.b64 | ForEach-Object {
  $outName = $_.BaseName
  $bytes = [Convert]::FromBase64String((Get-Content $_.FullName -Raw).Trim())
  [IO.File]::WriteAllBytes((Join-Path $dst $outName), $bytes)
}
Write-Host "Materialized icons into $dst"
