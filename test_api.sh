#!/bin/bash

TOKEN="1|LHVbBWXyLUs7tbz60jchCtH3HUOIfm3eLdyFldmA4589a110"
BASE_URL="http://127.0.0.1:8000/api"

echo "================================"
echo "TESTING ALL API ENDPOINTS"
echo "================================"
echo ""

# Test Campus
echo ">>> CAMPUS ENDPOINTS"
echo "GET /api/campuses"
curl -s -X GET "$BASE_URL/campuses" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" | jq '.data | length'
echo ""

# Test Establishment
echo ">>> ESTABLISHMENT ENDPOINTS"
echo "GET /api/establishments"
curl -s -X GET "$BASE_URL/establishments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" | jq '.data | length'
echo ""

# Test Sector
echo ">>> SECTOR ENDPOINTS"
echo "GET /api/sectors"
curl -s -X GET "$BASE_URL/sectors" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" | jq '.data | length'
echo ""

# Test Specialty
echo ">>> SPECIALTY ENDPOINTS"
echo "GET /api/specialties"
curl -s -X GET "$BASE_URL/specialties" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" | jq '.data | length'
echo ""

# Test Subject
echo ">>> SUBJECT ENDPOINTS"
echo "GET /api/subjects"
curl -s -X GET "$BASE_URL/subjects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" | jq '.data | length'
echo ""

# Test Room
echo ">>> ROOM ENDPOINTS"
echo "GET /api/rooms"
curl -s -X GET "$BASE_URL/rooms" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" | jq '.data | length'
echo ""

# Test Level
echo ">>> LEVEL ENDPOINTS"
echo "GET /api/levels"
curl -s -X GET "$BASE_URL/levels" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" | jq '.data | length'
echo ""

# Test Year
echo ">>> YEAR ENDPOINTS"
echo "GET /api/years"
curl -s -X GET "$BASE_URL/years" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" | jq '.data | length'
echo ""

# Test Programmer
echo ">>> PROGRAMMER ENDPOINTS"
echo "GET /api/programmers"
curl -s -X GET "$BASE_URL/programmers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" | jq '.data | length'
echo ""

# Test Programmation
echo ">>> PROGRAMMATION ENDPOINTS"
echo "GET /api/programmations"
curl -s -X GET "$BASE_URL/programmations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" | jq '.data | length'
echo ""

# Test Disponibility
echo ">>> DISPONIBILITY ENDPOINTS"
echo "GET /api/disponibilities"
curl -s -X GET "$BASE_URL/disponibilities" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" | jq '.data | length'
echo ""

# Test SpecialtyProgrammation
echo ">>> SPECIALTY PROGRAMMATION ENDPOINTS"
echo "GET /api/specialty-programmations"
curl -s -X GET "$BASE_URL/specialty-programmations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" | jq '.data | length'
echo ""

echo "================================"
echo "ALL TESTS COMPLETED"
echo "================================"
