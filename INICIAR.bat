@echo off
title Cardapio Digital - Servidor
cd /d "%~dp0"

if not exist node_modules (
  echo Instalando dependencias pela primeira vez...
  call npm install
)

echo.
echo Abrindo o app em http://localhost:3000
echo Para parar o servidor, feche esta janela.
echo.

start "" cmd /c "timeout /t 6 /nobreak >nul & start http://localhost:3000"
call npm run dev
pause
