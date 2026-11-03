Write-Host "=== DESKTOP / FOTOSD ==="
$fotosPath = "C:\Users\Kawan\Desktop\FOTOSD"
if (Test-Path $fotosPath) {
    $files = Get-ChildItem -Path $fotosPath -File -ErrorAction SilentlyContinue
    $totalMB = ($files | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host ("Total arquivos: {0}" -f $files.Count)
    Write-Host ("Total tamanho: {0:N2} MB ({1:N2} GB)" -f $totalMB, ($totalMB/1024))
    $files | Sort-Object Length -Descending | Select-Object -First 5 | Select-Object Name, @{N="MB";E={[math]::Round($_.Length/1MB,1)}} | Format-Table -AutoSize
} else {
    Write-Host "Pasta não encontrada"
}
