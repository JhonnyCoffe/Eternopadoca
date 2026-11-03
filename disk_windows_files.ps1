Write-Host "=== ARQUIVOS MAIORES NO WINDOWS (profundidade 2, MB) ==="
Get-ChildItem 'C:\Windows' -Recurse -File -Depth 2 -ErrorAction SilentlyContinue | Sort-Object Length -Descending | Select-Object -First 20 | Select-Object Name, @{N='MB';E={[math]::Round($_.Length/1MB,2)}}, FullName | Format-Table -AutoSize
