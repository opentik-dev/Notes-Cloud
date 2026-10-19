$ErrorActionPreference = "Stop"
node (Join-Path $PSScriptRoot "backup.mjs") @args
