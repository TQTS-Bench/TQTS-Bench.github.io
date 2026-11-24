@echo off
cd /d "%~dp0"
echo TQTS-Bench preview: http://127.0.0.1:8765/
echo Press Ctrl+C to stop the local preview.
python -m http.server 8765 --bind 127.0.0.1
