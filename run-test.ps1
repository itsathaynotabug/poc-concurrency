param(
    [string]$testFile = "lost-update-test.js",
    [int]$waitSeconds = 2
)

# Reseta o banco de dados
Write-Host "🔄 Resetando banco de dados..." -ForegroundColor Cyan
node setup-db.js

# Aguarda um tempo para garantir que o json-server está pronto
Write-Host "⏳ Aguardando $waitSeconds segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds $waitSeconds

# Roda o teste
Write-Host "🚀 Inicializando teste: $testFile" -ForegroundColor Green
k6 run $testFile
