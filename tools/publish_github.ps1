param([switch]$Public, [string]$Account)
$ErrorActionPreference = 'Stop'
$publishArgs = @('-X', 'utf8', (Join-Path $PSScriptRoot 'publish_github.py'))
if ($Public) { $publishArgs += '--public' }
if ($Account) { $publishArgs += @('--account', $Account) }
& python @publishArgs
if ($LASTEXITCODE -ne 0) { throw 'Publication did not complete. See the message above.' }
