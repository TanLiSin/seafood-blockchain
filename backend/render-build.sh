#!/usr/bin/env bash

echo "🛠️ Installing system dependencies for psycopg2..."
apt-get update && apt-get install -y libpq-dev gcc

echo "🐍 Installing Python packages..."
pip install --upgrade pip
pip install -r requirements.txt
