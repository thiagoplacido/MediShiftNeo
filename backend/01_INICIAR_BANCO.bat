@echo off
REM Este script executa o node para configurar o banco de dados.

echo [MediShiftNeo] Iniciando configuracao do banco de dados...
echo.

REM Registra o log
echo [%date% %time%] Executando database.js >> setup_log.txt

REM Executa o script de banco de dados
node database.js

echo.
echo [MediShiftNeo] Configuracao concluida.
pause