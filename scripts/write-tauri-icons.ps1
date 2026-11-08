$ErrorActionPreference = "Stop"

function Write-StepSummary($text) {
  if ($env:GITHUB_STEP_SUMMARY) {
    $text | Out-File -FilePath $env:GITHUB_STEP_SUMMARY -Append -Encoding utf8
  }
  Write-Host $text
}

try {
  Write-StepSummary "icons step: script body started (pwsh $($PSVersionTable.PSVersion))"

  $repo = Resolve-Path (Join-Path $PSScriptRoot "..")
  $src = Join-Path $repo "src-tauri/icons-b64"
  $dst = Join-Path $repo "src-tauri/icons"

  Write-StepSummary "src = $src (exists: $(Test-Path $src))"

  if (-not (Test-Path $src)) { exit 42 }
  New-Item -ItemType Directory -Force -Path $dst | Out-Null

  $files = Get-ChildItem $src -Filter *.b64
  Write-StepSummary "found $($files.Count) .b64 files"
  if (-not $files) { exit 43 }

  foreach ($f in $files) {
    $outName = $f.BaseName
    $clean = ((Get-Content $f.FullName -Raw) -replace '\s', '')
    try {
      $bytes = [Convert]::FromBase64String($clean)
    } catch {
      Write-StepSummary "DECODE FAIL $($f.Name): $($_.Exception.Message)"
      exit 44
    }
    [IO.File]::WriteAllBytes((Join-Path $dst $outName), $bytes)
    Write-StepSummary "wrote $outName ($($bytes.Length) bytes)"
  }
  Write-StepSummary "icons step: SUCCESS"
} catch {
  Write-StepSummary "icons step UNEXPECTED ERROR: $($_.Exception.Message) at $($_.InvocationInfo.ScriptLineNumber)"
  exit 45
}
