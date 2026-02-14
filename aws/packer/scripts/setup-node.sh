#!/bin/bash
set -e

sudo apt-get update -y
sudo apt-get install -y docker.io

sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Copiar app
mkdir -p /home/ubuntu/app
cp -r /tmp/mimo-movies/* /home/ubuntu/app
cd /home/ubuntu/app

# Build imagen Docker ✅
sudo docker build -t mimo-movies .