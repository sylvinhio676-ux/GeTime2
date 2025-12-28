#!/usr/bin/env python3
import requests
import json
import time

TOKEN = "1|LHVbBWXyLUs7tbz60jchCtH3HUOIfm3eLdyFldmA4589a110"
BASE_URL = "http://127.0.0.1:8000/api"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json",
    "Accept": "application/json"
}

def test_endpoint(name, method, endpoint, data=None):
    """Test un endpoint avec les données fournie"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url, headers=HEADERS, timeout=5)
        elif method == "POST":
            response = requests.post(url, headers=HEADERS, json=data, timeout=5)
        elif method == "PUT":
            response = requests.put(url, headers=HEADERS, json=data, timeout=5)
        elif method == "DELETE":
            response = requests.delete(url, headers=HEADERS, timeout=5)
        
        result = response.json()
        return {
            "name": name,
            "status": response.status_code,
            "success": response.status_code in [200, 201],
            "message": result.get("message", ""),
            "data": result.get("data"),
            "error": result.get("message") if response.status_code >= 400 else None
        }
    except Exception as e:
        return {
            "name": name,
            "status": 0,
            "success": False,
            "error": str(e)
        }

print("="*60)
print("TESTING ALL 10 REMAINING MODELS")
print("="*60)
print()

# Test 1: Campus
print(">>> TEST 1: CAMPUS")
result = test_endpoint("Campus POST", "POST", "/campuses", {
    "campus_name": "Campus Test",
    "localisation": "Paris",
    "etablishment_id": 1
})
print(f"Status: {result['status']} - Success: {result['success']}")
if result['success']:
    campus_id = result['data'].get('id')
    print(f"Created ID: {campus_id}")
    
    # Test PUT
    put_result = test_endpoint("Campus PUT", "PUT", f"/campuses/{campus_id}", {
        "campus_name": "Campus Updated",
        "localisation": "Lyon",
        "etablishment_id": 1
    })
    print(f"Update: {put_result['success']}")
    
    # Test DELETE
    del_result = test_endpoint("Campus DELETE", "DELETE", f"/campuses/{campus_id}")
    print(f"Delete: {del_result['success']}")
else:
    print(f"Error: {result.get('error')}")
print()

# Test 2: Establishment
print(">>> TEST 2: ESTABLISHMENT")
result = test_endpoint("Establishment POST", "POST", "/establishments", {
    "etablishment_name": "Est Test",
    "description": "Test",
    "city": "Paris"
})
print(f"Status: {result['status']} - Success: {result['success']}")
if result['success']:
    est_id = result['data'].get('id')
    print(f"Created ID: {est_id}")
    
    put_result = test_endpoint("Establishment PUT", "PUT", f"/establishments/{est_id}", {
        "etablishment_name": "Est Updated",
        "description": "Updated",
        "city": "Lyon"
    })
    print(f"Update: {put_result['success']}")
    
    del_result = test_endpoint("Establishment DELETE", "DELETE", f"/establishments/{est_id}")
    print(f"Delete: {del_result['success']}")
else:
    print(f"Error: {result.get('error')}")
print()

# Test 3: Specialty
print(">>> TEST 3: SPECIALTY")
result = test_endpoint("Specialty POST", "POST", "/specialties", {
    "specialty_name": "Specialty Test",
    "description": "Test specialty",
    "number_student": 30,
    "sector_id": 1,
    "programmer_id": 1
})
print(f"Status: {result['status']} - Success: {result['success']}")
if result['success']:
    spec_id = result['data'].get('id')
    print(f"Created ID: {spec_id}")
    
    put_result = test_endpoint("Specialty PUT", "PUT", f"/specialties/{spec_id}", {
        "specialty_name": "Specialty Updated",
        "description": "Updated",
        "number_student": 40,
        "sector_id": 1,
        "programmer_id": 1
    })
    print(f"Update: {put_result['success']}")
    
    del_result = test_endpoint("Specialty DELETE", "DELETE", f"/specialties/{spec_id}")
    print(f"Delete: {del_result['success']}")
else:
    print(f"Error: {result.get('error')}")
print()

# Test 4: Subject
print(">>> TEST 4: SUBJECT")
result = test_endpoint("Subject POST", "POST", "/subjects", {
    "subject_name": "Subject Test",
    "hour_by_week": 4,
    "total_hour": 100,
    "type_subject": "theory",
    "teacher_id": 1,
    "specialty_id": 1
})
print(f"Status: {result['status']} - Success: {result['success']}")
if result['success']:
    subj_id = result['data'].get('id')
    print(f"Created ID: {subj_id}")
    
    put_result = test_endpoint("Subject PUT", "PUT", f"/subjects/{subj_id}", {
        "subject_name": "Subject Updated",
        "hour_by_week": 5,
        "total_hour": 120,
        "type_subject": "practice",
        "teacher_id": 1,
        "specialty_id": 1
    })
    print(f"Update: {put_result['success']}")
    
    del_result = test_endpoint("Subject DELETE", "DELETE", f"/subjects/{subj_id}")
    print(f"Delete: {del_result['success']}")
else:
    print(f"Error: {result.get('error')}")
print()

# Test 5: Room
print(">>> TEST 5: ROOM")
result = test_endpoint("Room POST", "POST", "/rooms", {
    "code": "ROOM_TEST_001",
    "capacity": 25,
    "is_available": True,
    "campus_id": 1
})
print(f"Status: {result['status']} - Success: {result['success']}")
if result['success']:
    room_id = result['data'].get('id')
    print(f"Created ID: {room_id}")
    
    put_result = test_endpoint("Room PUT", "PUT", f"/rooms/{room_id}", {
        "code": "ROOM_TEST_002",
        "capacity": 30,
        "is_available": False,
        "campus_id": 1
    })
    print(f"Update: {put_result['success']}")
    
    del_result = test_endpoint("Room DELETE", "DELETE", f"/rooms/{room_id}")
    print(f"Delete: {del_result['success']}")
else:
    print(f"Error: {result.get('error')}")
print()

# Test 6: Programmer
print(">>> TEST 6: PROGRAMMER")
result = test_endpoint("Programmer POST", "POST", "/programmers", {
    "registration_number": "P20259999",
    "user_id": 1,
    "etablishment_id": 1
})
print(f"Status: {result['status']} - Success: {result['success']}")
if result['success']:
    prog_id = result['data'].get('id')
    print(f"Created ID: {prog_id}")
    
    put_result = test_endpoint("Programmer PUT", "PUT", f"/programmers/{prog_id}", {
        "registration_number": "P20259998",
        "user_id": 1,
        "etablishment_id": 1
    })
    print(f"Update: {put_result['success']}")
    
    del_result = test_endpoint("Programmer DELETE", "DELETE", f"/programmers/{prog_id}")
    print(f"Delete: {del_result['success']}")
else:
    print(f"Error: {result.get('error')}")
print()

# Test 7: Programmation
print(">>> TEST 7: PROGRAMMATION")
result = test_endpoint("Programmation POST", "POST", "/programmations", {
    "day": "Monday",
    "hour_star": "08:00",
    "hour_end": "10:00",
    "subject_id": 1,
    "programmer_id": 1,
    "year_id": 1
})
print(f"Status: {result['status']} - Success: {result['success']}")
if result['success']:
    prgm_id = result['data'].get('id')
    print(f"Created ID: {prgm_id}")
    
    put_result = test_endpoint("Programmation PUT", "PUT", f"/programmations/{prgm_id}", {
        "day": "Tuesday",
        "hour_star": "10:00",
        "hour_end": "12:00",
        "subject_id": 1,
        "programmer_id": 1,
        "year_id": 1
    })
    print(f"Update: {put_result['success']}")
    
    del_result = test_endpoint("Programmation DELETE", "DELETE", f"/programmations/{prgm_id}")
    print(f"Delete: {del_result['success']}")
else:
    print(f"Error: {result.get('error')}")
print()

# Test 8: Disponibility
print(">>> TEST 8: DISPONIBILITY")
result = test_endpoint("Disponibility POST", "POST", "/disponibilities", {
    "day": "Monday",
    "hour_star": "09:00",
    "hour_end": "11:00",
    "subject_id": 1
})
print(f"Status: {result['status']} - Success: {result['success']}")
if result['success']:
    disp_id = result['data'].get('id')
    print(f"Created ID: {disp_id}")
    
    put_result = test_endpoint("Disponibility PUT", "PUT", f"/disponibilities/{disp_id}", {
        "day": "Wednesday",
        "hour_star": "14:00",
        "hour_end": "16:00",
        "subject_id": 1
    })
    print(f"Update: {put_result['success']}")
    
    del_result = test_endpoint("Disponibility DELETE", "DELETE", f"/disponibilities/{disp_id}")
    print(f"Delete: {del_result['success']}")
else:
    print(f"Error: {result.get('error')}")
print()

print("="*60)
print("ALL TESTS COMPLETED")
print("="*60)
