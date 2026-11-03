Write-Host "=== ESPAÇO LIVRE E TOTAL C: ==="
$vol = Get-Volume -DriveLetter C
Write-Host ("Tamanho total: {0:N2} GB" -f ($vol.Size/1GB))
Write-Host ("Livre: {0:N2} GB" -f ($vol.SizeRemaining/1GB))
Write-Host ("Usado: {0:N2} GB" -f (($vol.Size - $vol.SizeRemaining)/1GB))
Write-Host ""
Write-Host "=== MAIORES ARQUIVOS INDIVIDUAIS (MB) - Top 20 ==="
Get-ChildItem C:\ -Recurse -File -ErrorAction SilentlyContinue | Sort-Object Length -Descending | Select-Object -First 20 | Select-Object Name, @{N="SizeMB";E={[math]::Round($_.Length/1MB,2)}}, @{N="FullPath";E={$_.FullName}} | Format-Table -AutoSize
Write-Host ""
Write-Host "=== MAIORES PASTAS (MB) - Top 20 ==="
Get-ChildItem C:\ -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        $dir = $_.FullName
        $sum = (Get-ChildItem -Path $dir -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        [PSCustomObject]@{ Pasta = $_.Name; SizeMB = [math]::Round($sum / 1MB, 2); FullPath = $dir }
    } catch {}
} | Sort-Object SizeMB -Descending | Select-Object -First 20 | Format-Table -AutoSize
