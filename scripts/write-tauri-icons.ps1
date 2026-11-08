$ErrorActionPreference = "Stop"
$repo = Resolve-Path (Join-Path $PSScriptRoot "..")
$src = Join-Path $repo "src-tauri/icons-b64"
$dst = Join-Path $repo "src-tauri/icons"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
$files = Get-ChildItem $src -Filter *.b64
if ($files.Count -ne 5) { exit 43 }
exit 0
