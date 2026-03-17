#!/bin/bash
set -eu

echo "Installing backend dependencies..."
cd backend
npm install

echo "Installing frontend dependencies..."
cd ../frontend
npm install

echo "Building frontend..."
npm run build

echo "Frontend built successfully!"
echo "App is ready to start"
