#!/bin/bash
cd /home/sylvinhio/GeTime2/backend

# Tuer les anciens processus
pkill -f "php artisan serve" || true
sleep 1

# Démarrer le serveur en arrière-plan
nohup php artisan serve --host 127.0.0.1 --port 8000 > /tmp/laravel.log 2>&1 &
sleep 3

echo "Server started"

# Test simple
python3 << 'EOF'
import requests
import time

for i in range(3):
    try:
        response = requests.get(
            "http://127.0.0.1:8000/api/establishment",
            timeout=2
        )
        print(f"Attempt {i+1}: Status {response.status_code}")
        if response.status_code != 404:
            break
    except:
        print(f"Attempt {i+1}: Connection failed")
        time.sleep(1)
EOF
