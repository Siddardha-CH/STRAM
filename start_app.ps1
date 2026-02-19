# Start Backend and Frontend for CodeRefine

$backendPath = "d:\hck\STRAM\backend"
$frontendPath = "d:\hck\STRAM\coderefine-ui"

Write-Host "Starting CodeRefine..." -ForegroundColor Cyan

# Start Backend
Write-Host "Launching Backend (Port 8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; echo 'Starting Backend...'; py -m uvicorn main:app --port 8000 --reload"

# Start Frontend
Write-Host "Launching Frontend (Port 5173)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; echo 'Starting Frontend...'; npm run dev"

Write-Host "Both services launched in new windows!" -ForegroundColor Yellow
Write-Host "Press any key to exit this launcher..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
