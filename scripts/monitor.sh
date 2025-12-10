#!/bin/bash

# Performance Monitoring Script
# Phase 11: Performance, DevOps & Deployment
# 
# This script monitors the performance of Gramps Web services
# Usage: ./scripts/monitor.sh

set -e

COMPOSE_FILE="docker-compose.prod.yml"

echo "=== Gramps Web Performance Monitor ==="
echo ""

# Check if services are running
echo "1. Service Status:"
docker-compose -f $COMPOSE_FILE ps
echo ""

# Container resource usage
echo "2. Resource Usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" \
  gramps-backend gramps-frontend gramps-db gramps-redis 2>/dev/null || echo "Services not running"
echo ""

# Database size
echo "3. Database Size:"
docker-compose -f $COMPOSE_FILE exec -T database \
  psql -U gramps -c "SELECT pg_size_pretty(pg_database_size('gramps')) AS size;" 2>/dev/null || echo "Database not accessible"
echo ""

# Redis memory usage
echo "4. Redis Cache Statistics:"
docker-compose -f $COMPOSE_FILE exec -T redis redis-cli INFO memory 2>/dev/null | grep -E "used_memory_human|maxmemory_human" || echo "Redis not accessible"
docker-compose -f $COMPOSE_FILE exec -T redis redis-cli INFO stats 2>/dev/null | grep -E "keyspace_hits|keyspace_misses" || echo "Redis not accessible"
echo ""

# Calculate cache hit rate
HITS=$(docker-compose -f $COMPOSE_FILE exec -T redis redis-cli INFO stats 2>/dev/null | grep keyspace_hits | cut -d: -f2 | tr -d '\r')
MISSES=$(docker-compose -f $COMPOSE_FILE exec -T redis redis-cli INFO stats 2>/dev/null | grep keyspace_misses | cut -d: -f2 | tr -d '\r')

if [ -n "$HITS" ] && [ -n "$MISSES" ]; then
  TOTAL=$((HITS + MISSES))
  if [ $TOTAL -gt 0 ]; then
    HIT_RATE=$(awk "BEGIN {printf \"%.2f\", ($HITS / $TOTAL) * 100}")
    echo "Cache Hit Rate: ${HIT_RATE}%"
  fi
fi
echo ""

# Check backend health
echo "5. Backend Health:"
curl -s http://localhost/api/metadata 2>/dev/null | jq '.' || echo "Backend not responding"
echo ""

# Check response times
echo "6. API Response Times:"
echo "Testing /api/metadata endpoint..."
TIME=$(curl -o /dev/null -s -w '%{time_total}\n' http://localhost/api/metadata 2>/dev/null || echo "N/A")
echo "Response time: ${TIME}s"
echo ""

# Disk usage
echo "7. Docker Volume Usage:"
docker system df -v 2>/dev/null | grep -A 5 "Local Volumes" || echo "Unable to get volume info"
echo ""

# Recent logs errors
echo "8. Recent Errors (last 10):"
docker-compose -f $COMPOSE_FILE logs --tail=100 2>/dev/null | grep -i error | tail -10 || echo "No recent errors"
echo ""

echo "=== Monitoring Complete ==="
echo ""
echo "For continuous monitoring, use:"
echo "  docker stats gramps-backend gramps-frontend gramps-db gramps-redis"
echo ""
echo "For detailed logs, use:"
echo "  docker-compose -f $COMPOSE_FILE logs -f [service_name]"
