@echo off
setlocal
cd /d "%~dp0"

echo ===================================================
echo   [BEE VS HORNETS] 小蜜蜂大戰虎頭蜂 - 街機伺服器
echo ===================================================
echo 正在檢測本機執行環境...

set PORT=8080

:: 1. 檢測 Python
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] 檢測到 Python，啟動 http.server 在 http://localhost:%PORT% ...
    start "" "http://localhost:%PORT%"
    python -m http.server %PORT%
    goto :eof
)

:: 2. 檢測 Node.js npx
where npx >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] 檢測到 Node.js，啟動 serve 在 http://localhost:%PORT% ...
    start "" "http://localhost:%PORT%"
    npx serve -l %PORT% .
    goto :eof
)

:: 3. 若皆無，使用 Windows 原生 PowerShell 迷你 HTTP 伺服器
echo [OK] 使用 Windows 原生 PowerShell 靜態伺服器 (免安裝任何額外軟體)...
start "" "http://localhost:%PORT%"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$listener = New-Object System.Net.HttpListener; ^
   $listener.Prefixes.Add('http://localhost:%PORT%/'); ^
   $listener.Start(); ^
   Write-Host '伺服器已啟動: http://localhost:%PORT%/ (按 Ctrl+C 可關閉)'; ^
   while ($listener.IsListening) { ^
     $ctx = $listener.GetContext(); ^
     $req = $ctx.Request; ^
     $res = $ctx.Response; ^
     $path = $req.Url.LocalPath.TrimStart('/'); ^
     if ([string]::IsNullOrEmpty($path)) { $path = 'index.html' }; ^
     $filePath = Join-Path (Get-Location) $path; ^
     if (Test-Path $filePath -PathType Leaf) { ^
       $bytes = [System.IO.File]::ReadAllBytes($filePath); ^
       $ext = [System.IO.Path]::GetExtension($filePath).ToLower(); ^
       $mime = switch ($ext) { ^
         '.html' { 'text/html; charset=utf-8' } ^
         '.js'   { 'application/javascript; charset=utf-8' } ^
         '.css'  { 'text/css; charset=utf-8' } ^
         '.json' { 'application/json' } ^
         '.png'  { 'image/png' } ^
         default { 'application/octet-stream' } ^
       }; ^
       $res.ContentType = $mime; ^
       $res.ContentLength64 = $bytes.Length; ^
       $res.OutputStream.Write($bytes, 0, $bytes.Length); ^
     } else { ^
       $res.StatusCode = 404; ^
     }; ^
     $res.Close(); ^
   }"
