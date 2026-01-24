#!/bin/bash
# scripts/test-api.sh
# API Test Script for Task Board

echo "═══════════════════════════════════════════════════════"
echo "  🧪 Task Board API Test Suite"
echo "═══════════════════════════════════════════════════════"
echo ""

BASE_URL="http://localhost:3000/api"
HTTPS_URL="https://taskboard.local/api"
PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local name="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    local expected="$5"
    local curl_args="$6"
    
    echo -n "Testing: $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s $curl_args "$url")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s $curl_args -X POST -H "Content-Type: application/json" -d "$data" "$url")
    elif [ "$method" = "PATCH" ]; then
        response=$(curl -s $curl_args -X PATCH -H "Content-Type: application/json" -d "$data" "$url")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s $curl_args -X DELETE "$url")
    fi
    
    if echo "$response" | grep -q "$expected"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "  Response: $response"
        ((FAILED++))
    fi
}

echo "=== Testing Backend (Direct) ==="
echo ""

# Test 1: Health Check
test_endpoint "Health Check" "GET" "$BASE_URL/health" "" "healthy"

# Test 2: Get All Tasks
test_endpoint "Get All Tasks" "GET" "$BASE_URL/tasks" "" "success"

# Test 3: Get Statistics
test_endpoint "Get Statistics" "GET" "$BASE_URL/tasks/stats" "" "total"

# Test 4: Create Task
test_endpoint "Create Task" "POST" "$BASE_URL/tasks" \
    '{"title":"Test Task from Script","priority":"MEDIUM"}' \
    "Task created"

# Test 5: Get Task by ID
test_endpoint "Get Task by ID" "GET" "$BASE_URL/tasks/1" "" "success"

# Test 6: Update Task Status
test_endpoint "Update Status" "PATCH" "$BASE_URL/tasks/1/status" \
    '{"status":"IN_PROGRESS"}' \
    "success"

echo ""
echo "=== Testing via HTTPS (Nginx) ==="
echo ""

# Test 7: HTTPS Health Check
test_endpoint "HTTPS Health" "GET" "$HTTPS_URL/health" "" "healthy" "-k"

# Test 8: HTTPS Get Tasks
test_endpoint "HTTPS Get Tasks" "GET" "$HTTPS_URL/tasks" "" "success" "-k"

echo ""
echo "=== Links ==="
echo ""
echo "UI (direct):        http://localhost:3000/"
echo "API health (direct): http://localhost:3000/api/health"
echo "UI (nginx):         https://taskboard.local/"
echo "API health (nginx): https://taskboard.local/api/health"
if command -v getent >/dev/null 2>&1; then
    if ! getent hosts taskboard.local >/dev/null 2>&1; then
        echo ""
        echo "Note: taskboard.local not found in /etc/hosts."
        echo "Add: 127.0.0.1 taskboard.local"
    fi
fi
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Test Results: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"
echo "═══════════════════════════════════════════════════════"
