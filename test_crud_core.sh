#!/bin/bash

TOKEN="1|LHVbBWXyLUs7tbz60jchCtH3HUOIfm3eLdyFldmA4589a110"
BASE_URL="http://127.0.0.1:8000/api"

echo "======================================"
echo "TESTING CREATE/UPDATE/DELETE OPERATIONS"
echo "======================================"
echo ""

# 1. CAMPUS
echo ">>> TEST 1: CAMPUS (POST/PUT/DELETE)"
echo "POST /api/campuses"
CAMPUS=$(curl -s -X POST "$BASE_URL/campuses" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"campus_name":"Campus Test 1","localisation":"Location A","etablishment_id":1}')
CAMPUS_ID=$(echo $CAMPUS | jq '.data.id')
echo "Created Campus ID: $CAMPUS_ID"
echo "Status: $(echo $CAMPUS | jq '.status')"
echo ""

echo "PUT /api/campuses/$CAMPUS_ID"
curl -s -X PUT "$BASE_URL/campuses/$CAMPUS_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"campus_name":"Campus Updated","localisation":"Location B","etablishment_id":1}' | jq '.message'
echo ""

echo "DELETE /api/campuses/$CAMPUS_ID"
curl -s -X DELETE "$BASE_URL/campuses/$CAMPUS_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.message'
echo ""
echo "---"
echo ""

# 2. ESTABLISHMENT
echo ">>> TEST 2: ESTABLISHMENT (POST/PUT/DELETE)"
echo "POST /api/establishments"
EST=$(curl -s -X POST "$BASE_URL/establishments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"etablishment_name":"Etablishment Test","description":"Test description","city":"Paris"}')
EST_ID=$(echo $EST | jq '.data.id')
echo "Created Establishment ID: $EST_ID"
echo "Status: $(echo $EST | jq '.status')"
echo ""

echo "PUT /api/establishments/$EST_ID"
curl -s -X PUT "$BASE_URL/establishments/$EST_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"etablishment_name":"Etablishment Updated","description":"Updated","city":"Lyon"}' | jq '.message'
echo ""

echo "DELETE /api/establishments/$EST_ID"
curl -s -X DELETE "$BASE_URL/establishments/$EST_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.message'
echo ""
echo "---"
echo ""

# 3. SECTOR
echo ">>> TEST 3: SECTOR (POST/PUT/DELETE)"
echo "POST /api/sectors"
SEC=$(curl -s -X POST "$BASE_URL/sectors" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sector_name":"Sector Test","code":"SEC123","school_id":1}')
SEC_ID=$(echo $SEC | jq '.data.id')
echo "Created Sector ID: $SEC_ID"
echo "Status: $(echo $SEC | jq '.status')"
echo ""

echo "PUT /api/sectors/$SEC_ID"
curl -s -X PUT "$BASE_URL/sectors/$SEC_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sector_name":"Sector Updated","code":"SEC456","school_id":1}' | jq '.message'
echo ""

echo "DELETE /api/sectors/$SEC_ID"
curl -s -X DELETE "$BASE_URL/sectors/$SEC_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.message'
echo ""
echo "---"
echo ""

# 4. ROOM
echo ">>> TEST 4: ROOM (POST/PUT/DELETE)"
echo "POST /api/rooms"
ROOM=$(curl -s -X POST "$BASE_URL/rooms" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"ROOM001","capacity":30,"is_available":true,"campus_id":1}')
ROOM_ID=$(echo $ROOM | jq '.data.id')
echo "Created Room ID: $ROOM_ID"
echo "Status: $(echo $ROOM | jq '.status')"
echo ""

echo "PUT /api/rooms/$ROOM_ID"
curl -s -X PUT "$BASE_URL/rooms/$ROOM_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"ROOM002","capacity":40,"is_available":false,"campus_id":1}' | jq '.message'
echo ""

echo "DELETE /api/rooms/$ROOM_ID"
curl -s -X DELETE "$BASE_URL/rooms/$ROOM_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.message'
echo ""
echo "---"
echo ""

# 5. LEVEL
echo ">>> TEST 5: LEVEL (POST/PUT/DELETE)"
echo "POST /api/levels"
LEVEL=$(curl -s -X POST "$BASE_URL/levels" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name_level":"Level 5"}')
LEVEL_ID=$(echo $LEVEL | jq '.data.id')
echo "Created Level ID: $LEVEL_ID"
echo "Status: $(echo $LEVEL | jq '.status')"
echo ""

echo "PUT /api/levels/$LEVEL_ID"
curl -s -X PUT "$BASE_URL/levels/$LEVEL_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name_level":"Level 6"}' | jq '.message'
echo ""

echo "DELETE /api/levels/$LEVEL_ID"
curl -s -X DELETE "$BASE_URL/levels/$LEVEL_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.message'
echo ""
echo "---"
echo ""

# 6. YEAR
echo ">>> TEST 6: YEAR (POST/PUT/DELETE)"
echo "POST /api/years"
YEAR=$(curl -s -X POST "$BASE_URL/years" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date_star":"2026-01-01","date_end":"2026-12-31"}')
YEAR_ID=$(echo $YEAR | jq '.data.id')
echo "Created Year ID: $YEAR_ID"
echo "Status: $(echo $YEAR | jq '.status')"
echo ""

echo "PUT /api/years/$YEAR_ID"
curl -s -X PUT "$BASE_URL/years/$YEAR_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date_star":"2027-01-01","date_end":"2027-12-31"}' | jq '.message'
echo ""

echo "DELETE /api/years/$YEAR_ID"
curl -s -X DELETE "$BASE_URL/years/$YEAR_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.message'
echo ""
echo "---"
echo ""

echo "======================================"
echo "CORE TESTS COMPLETED"
echo "======================================"
