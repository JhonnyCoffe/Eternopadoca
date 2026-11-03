$folders = @('C:\Users', 'C:\Windows', 'C:\ProgramData', 'C:\Program Files', 'C:\Program Files (x86)', 'C:\tmp', 'C:\inetpub', 'C:\Python315')
foreach ($f in $folders) {
    if (Test-Path $f) {
        Write-Host "=== $f ==="
        try {
            $sum = (Get-ChildItem -Path $f -Recurse -File -ErrorAction SilentlyContinue -Depth 3 | Measure-Object -Property Length -Sum).Sum
            Write-Host ("Aprox: {0:N2} GB" -f ($sum/1GB))
        } catch {
            Write-Host "Erro ao ler"
        }
    } else {
        Write-Host "=== $f (não existe) ==="
    }
}
