Write-Host "=== ESPACO LIVRE E TOTAL C: ==="
$vol = Get-Volume -DriveLetter C
Write-Host ("Tamanho total: {0:N2} GB" -f ($vol.Size/1GB))
Write-Host ("Livre: {0:N2} GB" -f ($vol.SizeRemaining/1GB))
Write-Host ("Usado: {0:N2} GB" -f (($vol.Size - $vol.SizeRemaining)/1GB))
Write-Host ""
Write-Host "=== PASTAS RAIZ DO C: (tamanho aproximado em MB) ==="
Get-ChildItem -Path C:\ -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        $folder = $_.FullName
        $files = Get-ChildItem -Path $folder -Recurse -File -ErrorAction SilentlyContinue
        $total = ($files | Measure-Object -Property Length -Sum).Sum / 1MB
        [PSCustomObject]@{ Pasta = $_.Name; TamanhoMB = [math]::Round($total, 1); Caminho = $folder }
    } catch { $null }
} | Sort-Object TamanhoMB -Descending | Select-Object -First 15 | Format-Table -AutoSize
