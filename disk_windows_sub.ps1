Write-Host "=== SUBPASTAS DO WINDOWS (MB aproximado - profundidade 1) ==="
Get-ChildItem 'C:\Windows' -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $folder = $_.FullName
    $sum = (Get-ChildItem -Path $folder -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    [PSCustomObject]@{ Pasta = $_.Name; TamanhoGB = [math]::Round($sum/1GB, 2) }
} | Sort-Object TamanhoGB -Descending | Select-Object -First 20 | Format-Table -AutoSize
