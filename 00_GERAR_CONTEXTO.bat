@echo off
setlocal

:: Define o nome do arquivo de saida
set "OUTPUT_FILE=Projeto_Contexto_Completo.txt"

echo Gerando relatorio de contexto em %OUTPUT_FILE%...
echo Isso pode levar alguns segundos...

:: Inicia o arquivo (sobrescreve se existir)
echo [RELATORIO DE CONTEXTO DO PROJETO MEDISHIFTNEO] > %OUTPUT_FILE%
echo Gerado em: %DATE% %TIME% >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%

:: ======================================================
:: 1. ESTRUTURA DE PASTAS
:: ======================================================
echo ====================================================== >> %OUTPUT_FILE%
echo [ESTRUTURA DE PASTAS E ARQUIVOS] >> %OUTPUT_FILE%
echo (Ignorando 'node_modules' e '.git' para maior clareza) >> %OUTPUT_FILE%
echo ====================================================== >> %OUTPUT_FILE%

:: Lista a arvore, /F para arquivos, /A para caracteres ASCII
:: O 'findstr /V' e usado para EXCLUIR linhas que contem "node_modules" ou ".git"
tree /F /A | findstr /V /I /C:"node_modules" /C:".git" >> %OUTPUT_FILE%

echo. >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%

:: ======================================================
:: 2. CONTEUDO DOS ARQUIVOS
:: ======================================================
echo ====================================================== >> %OUTPUT_FILE%
echo [CONTEUDO DOS ARQUIVOS DE CODIGO-FONTE] >> %OUTPUT_FILE%
echo ====================================================== >> %OUTPUT_FILE%

:: --- ARQUIVOS DA RAIZ ---
call :PrintFile ".env"
call :PrintFile "01_INICIAR_BACKEND.bat"
call :PrintFile "02_INICIAR_FRONTEND.bat"
call :PrintFile "00_GERAR_CONTEXTO.bat"

:: --- ARQUIVOS DO BACKEND ---
echo. >> %OUTPUT_FILE%
echo --- INICIO BACKEND --- >> %OUTPUT_FILE%
for /R .\backend %%F in (*.js, *.prisma, package.json) do (
    echo "%%F" | findstr /V /I /C:"node_modules" > nul
    if errorlevel 0 (
        call :PrintFile "%%F"
    )
)
echo --- FIM BACKEND --- >> %OUTPUT_FILE%

:: --- ARQUIVOS DO FRONTEND ---
echo. >> %OUTPUT_FILE%
echo --- INICIO FRONTEND --- >> %OUTPUT_FILE%

:: Arquivos principais do frontend
call :PrintFile "frontend\package.json"
call :PrintFile "frontend\public\index.html"

:: Arquivos da pasta 'src' (JSX, JS, CSS)
for /R .\frontend\src %%F in (*.jsx, *.js, *.css) do (
    echo "%%F" | findstr /V /I /C:"node_modules" > nul
    if errorlevel 0 (
        call :PrintFile "%%F"
    )
)
echo --- FIM FRONTEND --- >> %OUTPUT_FILE%


echo. >> %OUTPUT_FILE%
echo [FIM DO RELATORIO] >> %OUTPUT_FILE%

echo.
echo Concluido!
echo O arquivo %OUTPUT_FILE% foi gerado/atualizado na pasta do projeto.
echo.
echo Proximo passo: Abra esse arquivo, copie TODO o conteudo e cole aqui no chat.

:: Encerra o script principal
goto :eof

:: ======================================================
:: SUBROTINA :PrintFile
:: Imprime um cabecalho e o conteudo de um arquivo
:: Parametro %1: Caminho do arquivo
:: ======================================================
:PrintFile
if not exist %1 (
    echo [AVISO] Arquivo nao encontrado: %~1 >> %OUTPUT_FILE%
) else (
    echo. >> %OUTPUT_FILE%
    echo ------------------------------------------------------ >> %OUTPUT_FILE%
    echo [ARQUIVO]: %~1 >> %OUTPUT_FILE%
    echo ------------------------------------------------------ >> %OUTPUT_FILE%
    type %1 >> %OUTPUT_FILE%
    echo. >> %OUTPUT_FILE%
)
goto :eof
pause