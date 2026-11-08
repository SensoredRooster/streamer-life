$ErrorActionPreference = "Stop"
$repo = Resolve-Path (Join-Path $PSScriptRoot "..")
$src = Join-Path $repo "src-tauri/icons-b64"
$dst = Join-Path $repo "src-tauri/icons"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
$files = Get-ChildItem $src -Filter *.b64
if (-not $files) {
  Write-Error "No .b64 icon sources found in $src"
  exit 1
}
foreach ($f in $files) {
  $outName = $f.BaseName
  # Strip ALL whitespace (handles CRLF checkouts and wrapped base64)
  $clean = ((Get-Content $f.FullName -Raw) -replace '\s', '')
  try {
    $bytes = [Convert]::FromBase64String($clean)
  } catch {
    Write-Error "Failed to base64-decode $($f.Name): $($_.Exception.Message)"
    exit 1
  }
  [IO.File]::WriteAllBytes((Join-Path $dst $outName), $bytes)
  Write-Host "wrote $outName ($($bytes.Length) bytes)"
}
Write-Host "Materialized $($files.Count) icons into $dst"
