# Run the node boot under V8's --prof tick logger (the tick log survives a
# kill, unlike --cpu-prof), kill it N seconds after the first "Spawn Entity"
# line (the silent room-entry phase, round 14j), then process the tick log.
#
#   powershell -File scripts/recomp/profile/prof_stuck.ps1 -AfterSpawn 90 -Tag stuck
#   powershell -File scripts/recomp/profile/prof_stuck.ps1 -Tag notier -NodeFlags "--no-wasm-tier-up"
#   python scripts/recomp/profile/prof_window.py output/recomp/profile/v8-stuck.json 170
#
# Windows samples at the 15.6 ms timer, so a 90-s window is ~5,800 ticks.
param([int]$AfterSpawn = 90, [string]$Tag = "stuck", [string]$NodeFlags = "",
      [string]$OutDir = "output\recomp\profile")
$ErrorActionPreference = "Continue"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
$inst = Join-Path $repo ".scratch\game-instance"
$out = Join-Path $repo $OutDir
New-Item -ItemType Directory -Force $out | Out-Null
$log = Join-Path $out "run-prof-$Tag.log"
$v8log = Join-Path $inst "v8-$Tag.log"
Remove-Item $v8log -ErrorAction SilentlyContinue
if (-not $env:ISAAC_INPUT) { $env:ISAAC_INPUT = "420:Enter,470:Enter,520:Enter,580:Enter,640:Enter,700:Enter,760:Enter" }
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "node"
$psi.Arguments = "--prof --no-logfile-per-isolate --logfile=v8-$Tag.log $NodeFlags ../../output/recomp/lift/boot/boot_integration.mjs ../../output/recomp/host/isaac.segs.bin main"
$psi.WorkingDirectory = $inst
$psi.UseShellExecute = $false
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$p = [System.Diagnostics.Process]::Start($psi)
$w = [System.IO.StreamWriter]::new($log)
$w.AutoFlush = $true
$spawnAt = $null
$t0 = Get-Date
$errTask = $p.StandardError.ReadLineAsync()
$outTask = $p.StandardOutput.ReadLineAsync()
while (-not $p.HasExited) {
  $got = $false
  foreach ($pair in @(@([ref]$errTask, $p.StandardError), @([ref]$outTask, $p.StandardOutput))) {
    $task = $pair[0].Value
    if ($task.Wait(20)) {
      $line = $task.Result
      if ($null -ne $line) {
        $w.WriteLine($line)
        if ($null -eq $spawnAt -and $line -like "*Spawn Entity*") { $spawnAt = Get-Date; $w.WriteLine("[prof] spawn seen at +{0:N0}s" -f ((Get-Date) - $t0).TotalSeconds) }
        $got = $true
      }
      $pair[0].Value = $pair[1].ReadLineAsync()
    }
  }
  if ($null -ne $spawnAt -and ((Get-Date) - $spawnAt).TotalSeconds -ge $AfterSpawn) {
    $w.WriteLine("[prof] killing at +{0:N0}s after spawn" -f $AfterSpawn)
    Stop-Process -Id $p.Id -Force
    break
  }
  if (((Get-Date) - $t0).TotalSeconds -ge 900) { $w.WriteLine("[prof] 900 s cap, killing"); Stop-Process -Id $p.Id -Force; break }
  if (-not $got) { Start-Sleep -Milliseconds 10 }
}
$w.Close()
Start-Sleep -Seconds 2
Set-Location $inst
# PowerShell's > writes UTF-16; prof_window.py / prof_hist.py accept that.
node --prof-process --preprocess "v8-$Tag.log" > (Join-Path $out "v8-$Tag.json")
node --prof-process "v8-$Tag.log" > (Join-Path $out "v8-$Tag.txt")
"[prof] done: " + (Join-Path $out "v8-$Tag.txt") + " (tick log " + (Get-Item $v8log).Length + " bytes)"
