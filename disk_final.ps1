Write-Host "=== USO DO DISCO C: ==="
$vol = Get-Volume -DriveLetter C
Write-Host ("Total: {0:N2} GB" -f ($vol.Size/1GB))
Write-Host ("Usado: {0:N2} GB" -f (($vol.Size - $vol.SizeRemaining)/1GB))
Write-Host ("Livre: {0:N2} GB ({1:P1})" -f ($vol.SizeRemaining/1GB), ($vol.SizeRemaining/$vol.Size))
Write-Host ""
Write-Host "=== PASTAS PRINCIPAIS (MB aproximado - profundidade limitada) ==="
$pastas = @('C:\Users', 'C:\Windows', 'C:\ProgramData', 'C:\Program Files', 'C:\Program Files (x86)', 'C:\Python315', 'C:\tmp', 'C:\inetpub', 'C:\DeepSeek')
foreach ($p in $pastas) {
    if (Test-Path $p) {
        $sum = (Get-ChildItem -Path $p -Recurse -File -ErrorAction SilentlyContinue -Depth 2 | Measure-Object -Property Length -Sum).Sum
        Write-Host ("{0,-30} {1:N2} GB" -f $p, ($sum/1GB))
    } else {
        Write-Host ("{0,-30} NÃO EXISTE" -f $p)
    }
}
Write-Host ""
Write-Host "=== MAIORES ARQUIVOS EM C:\USERS (MB) ==="
Get-ChildItem 'C:\Users' -Recurse -File -ErrorAction SilentlyContinue -Depth 3 | Sort-Object Length -Descending | Select-Object -First 15 | Select-Object Name, @{N='MB';E={[math]::Round($_.Length/1MB,1)}}, FullName | Format-Table -AutoSize
