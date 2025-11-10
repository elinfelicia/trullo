#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${YELLOW}=== Testing Trullo API ===${NC}\n"

# Test 1: Root endpoint
echo -e "${YELLOW}1. Testing root endpoint...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ Root endpoint works: $BODY${NC}\n"
else
    echo -e "${RED}✗ Root endpoint failed (HTTP $HTTP_CODE)${NC}\n"
    exit 1
fi

# Test 2: Create a user
echo -e "${YELLOW}2. Testing user registration...${NC}"
USER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/users" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Test User",
        "email": "test@example.com",
        "password": "testpassword123"
    }')
USER_HTTP_CODE=$(echo "$USER_RESPONSE" | tail -n1)
USER_BODY=$(echo "$USER_RESPONSE" | sed '$d')
if [ "$USER_HTTP_CODE" == "201" ]; then
    echo -e "${GREEN}✓ User created successfully${NC}"
    echo "$USER_BODY" | python3 -m json.tool 2>/dev/null || echo "$USER_BODY"
    USER_ID=$(echo "$USER_BODY" | python3 -c "import sys, json; print(json.load(sys.stdin)[0]['_id'] if isinstance(json.load(sys.stdin), list) else json.load(sys.stdin)['_id'])" 2>/dev/null)
    echo ""
else
    echo -e "${RED}✗ User creation failed (HTTP $USER_HTTP_CODE)${NC}"
    echo "$USER_BODY"
    echo ""
fi

# Test 3: Login
echo -e "${YELLOW}3. Testing user login...${NC}"
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/users/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "test@example.com",
        "password": "testpassword123"
    }')
LOGIN_HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')
if [ "$LOGIN_HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ Login successful${NC}"
    TOKEN=$(echo "$LOGIN_BODY" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
    echo "Token: ${TOKEN:0:50}..."
    echo ""
else
    echo -e "${RED}✗ Login failed (HTTP $LOGIN_HTTP_CODE)${NC}"
    echo "$LOGIN_BODY"
    echo ""
    TOKEN=""
fi

# Test 4: Get users (requires auth)
if [ ! -z "$TOKEN" ]; then
    echo -e "${YELLOW}4. Testing get users (authenticated)...${NC}"
    USERS_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/users" \
        -H "Authorization: Bearer $TOKEN")
    USERS_HTTP_CODE=$(echo "$USERS_RESPONSE" | tail -n1)
    USERS_BODY=$(echo "$USERS_RESPONSE" | sed '$d')
    if [ "$USERS_HTTP_CODE" == "200" ]; then
        echo -e "${GREEN}✓ Get users successful${NC}"
        echo "$USERS_BODY" | python3 -m json.tool 2>/dev/null || echo "$USERS_BODY"
        echo ""
    else
        echo -e "${RED}✗ Get users failed (HTTP $USERS_HTTP_CODE)${NC}"
        echo "$USERS_BODY"
        echo ""
    fi
fi

# Test 5: Create a task (requires auth)
if [ ! -z "$TOKEN" ]; then
    echo -e "${YELLOW}5. Testing create task (authenticated)...${NC}"
    TASK_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/tasks" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "title": "Test Task",
            "description": "This is a test task",
            "status": "To Do",
            "assignedTo": "'"$USER_ID"'"
        }')
    TASK_HTTP_CODE=$(echo "$TASK_RESPONSE" | tail -n1)
    TASK_BODY=$(echo "$TASK_RESPONSE" | sed '$d')
    if [ "$TASK_HTTP_CODE" == "201" ]; then
        echo -e "${GREEN}✓ Task created successfully${NC}"
        echo "$TASK_BODY" | python3 -m json.tool 2>/dev/null || echo "$TASK_BODY"
        TASK_ID=$(echo "$TASK_BODY" | python3 -c "import sys, json; print(json.load(sys.stdin)['_id'])" 2>/dev/null)
        echo ""
    else
        echo -e "${RED}✗ Task creation failed (HTTP $TASK_HTTP_CODE)${NC}"
        echo "$TASK_BODY"
        echo ""
    fi
fi

# Test 6: Get tasks (requires auth)
if [ ! -z "$TOKEN" ]; then
    echo -e "${YELLOW}6. Testing get tasks (authenticated)...${NC}"
    TASKS_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/tasks" \
        -H "Authorization: Bearer $TOKEN")
    TASKS_HTTP_CODE=$(echo "$TASKS_RESPONSE" | tail -n1)
    TASKS_BODY=$(echo "$TASKS_RESPONSE" | sed '$d')
    if [ "$TASKS_HTTP_CODE" == "200" ]; then
        echo -e "${GREEN}✓ Get tasks successful${NC}"
        echo "$TASKS_BODY" | python3 -m json.tool 2>/dev/null || echo "$TASKS_BODY"
        echo ""
    else
        echo -e "${RED}✗ Get tasks failed (HTTP $TASKS_HTTP_CODE)${NC}"
        echo "$TASKS_BODY"
        echo ""
    fi
fi

# Test 7: Create a project (requires auth)
if [ ! -z "$TOKEN" ]; then
    echo -e "${YELLOW}7. Testing create project (authenticated)...${NC}"
    PROJECT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/projects" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test Project",
            "description": "This is a test project"
        }')
    PROJECT_HTTP_CODE=$(echo "$PROJECT_RESPONSE" | tail -n1)
    PROJECT_BODY=$(echo "$PROJECT_RESPONSE" | sed '$d')
    if [ "$PROJECT_HTTP_CODE" == "201" ]; then
        echo -e "${GREEN}✓ Project created successfully${NC}"
        echo "$PROJECT_BODY" | python3 -m json.tool 2>/dev/null || echo "$PROJECT_BODY"
        echo ""
    else
        echo -e "${RED}✗ Project creation failed (HTTP $PROJECT_HTTP_CODE)${NC}"
        echo "$PROJECT_BODY"
        echo ""
    fi
fi

echo -e "${YELLOW}=== Testing Complete ===${NC}"

