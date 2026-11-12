#!/bin/sh
cd "$(dirname "$0")"
echo "Starting the portfolio at http://localhost:8000  (Ctrl+C to stop)"
( sleep 1; open http://localhost:8000 2>/dev/null || xdg-open http://localhost:8000 2>/dev/null ) &
python3 -m http.server 8000 || python -m http.server 8000
