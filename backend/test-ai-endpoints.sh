#!/bin/bash
# Quick test script for AI endpoints

echo "Starting backend server..."
npm run start:dev &
SERVER_PID=$!

# Wait for server to start
sleep 10

echo "Testing AI endpoints..."

# Test endpoint availability (without auth for now)
echo "GET /api/ai/hints/quality"
curl -s http://localhost:5555/api/ai/hints/quality | head -c 100
echo ""

# Cleanup
kill $SERVER_PID 2>/dev/null

echo "Test complete!"
