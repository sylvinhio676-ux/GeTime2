#!/usr/bin/env python3
"""
Rapport de test complet pour tous les 14 modèles API
"""
import requests
import json
import sys
import time
import random

TOKEN = "1|LHVbBWXyLUs7tbz60jchCtH3HUOIfm3eLdyFldmA4589a110"
BASE_URL = "http://127.0.0.1:8000/api"

TESTS_PASSED = 0
TESTS_FAILED = 0

def test_model(name, endpoint, create_data, update_data=None):
    """Test complet d'un modèle"""
    global TESTS_PASSED, TESTS_FAILED
    
    if update_data is None:
        update_data = create_data.copy()
    
    headers = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
    url = f"{BASE_URL}/{endpoint}"
    
    print(f"\n{'─'*60}")
    print(f"  {name.upper()}")
    print(f"{'─'*60}")
    
    # TEST 1: GET (READ ALL)
    try:
        r = requests.get(url, headers=headers, timeout=5)
        if r.status_code == 200:
            count = len(r.json().get('data', []))
            print(f"  ✓ GET (list):       Status {r.status_code} - {count} records")
            TESTS_PASSED += 1
        else:
            print(f"  ✗ GET (list):       Status {r.status_code}")
            TESTS_FAILED += 1
            return False
    except Exception as e:
        print(f"  ✗ GET (list):       {str(e)[:50]}")
        TESTS_FAILED += 1
        return False
    
    # TEST 2: POST (CREATE)
    item_id = None
    try:
        r = requests.post(url, headers=headers, json=create_data, timeout=5)
        result = r.json()
        
        if r.status_code in [200, 201] and result.get('data'):
            item_id = result['data'].get('id')
            print(f"  ✓ POST (create):    Status {r.status_code} - ID: {item_id}")
            TESTS_PASSED += 1
        else:
            error_msg = result.get('message', 'Unknown error')[:40]
            print(f"  ✗ POST (create):    Status {r.status_code} - {error_msg}")
            TESTS_FAILED += 1
            return False
    except Exception as e:
        print(f"  ✗ POST (create):    {str(e)[:50]}")
        TESTS_FAILED += 1
        return False
    
    if not item_id:
        print(f"  ✗ POST (create):    No ID returned")
        TESTS_FAILED += 1
        return False
    
    # TEST 3: GET (READ ONE)
    try:
        r = requests.get(f"{url}/{item_id}", headers=headers, timeout=5)
        if r.status_code == 200:
            print(f"  ✓ GET (show):       Status {r.status_code}")
            TESTS_PASSED += 1
        else:
            print(f"  ✗ GET (show):       Status {r.status_code}")
            TESTS_FAILED += 1
    except Exception as e:
        print(f"  ✗ GET (show):       {str(e)[:50]}")
        TESTS_FAILED += 1
    
    # TEST 4: PUT (UPDATE)
    try:
        r = requests.put(f"{url}/{item_id}", headers=headers, json=update_data, timeout=5)
        if r.status_code in [200, 201]:
            print(f"  ✓ PUT (update):     Status {r.status_code}")
            TESTS_PASSED += 1
        else:
            error_msg = r.json().get('message', 'Unknown error')[:40]
            print(f"  ✗ PUT (update):     Status {r.status_code} - {error_msg}")
            TESTS_FAILED += 1
    except Exception as e:
        print(f"  ✗ PUT (update):     {str(e)[:50]}")
        TESTS_FAILED += 1
    
    # TEST 5: DELETE
    try:
        r = requests.delete(f"{url}/{item_id}", headers=headers, timeout=5)
        if r.status_code in [200, 204]:
            print(f"  ✓ DELETE (destroy): Status {r.status_code}")
            TESTS_PASSED += 1
        else:
            print(f"  ✗ DELETE (destroy): Status {r.status_code}")
            TESTS_FAILED += 1
    except Exception as e:
        print(f"  ✗ DELETE (destroy): {str(e)[:50]}")
        TESTS_FAILED += 1
    
    return True

# ============================================================================
# TEST SUITE COMPLÈTE
# ============================================================================

print("\n" + "="*60)
print("  FULL API TEST SUITE - ALL 14 MODELS")
print("="*60)

# 1. CAMPUS
test_model(
    'Campus',
    'campuses',
    {'campus_name': 'Campus Test', 'localisation': 'Paris', 'etablishment_id': 1},
    {'campus_name': 'Campus Updated', 'localisation': 'Lyon', 'etablishment_id': 1}
)

# 2. SCHOOL (Already tested in previous sessions)
test_model(
    'School',
    'schools',
    {'school_name': 'School Test', 'description': 'Test'},
    {'school_name': 'School Updated', 'description': 'Updated'}
)

# 3. SECTOR
test_model(
    'Sector',
    'sectors',
    {'sector_name': 'Sector Test', 'code': 'SEC999', 'school_id': 1},
    {'sector_name': 'Sector Updated', 'code': 'SEC998', 'school_id': 1}
)

# 4. SPECIALTY
test_model(
    'Specialty',
    'specialties',
    {'specialty_name': 'Spec Test', 'description': 'Test spec', 'number_student': 30, 'sector_id': 1, 'programmer_id': 1},
    {'specialty_name': 'Spec Updated', 'description': 'Updated spec', 'number_student': 35, 'sector_id': 1, 'programmer_id': 1}
)

# 5. SUBJECT
test_model(
    'Subject',
    'subjects',
    {'subject_name': 'Subject Test', 'hour_by_week': 4, 'total_hour': 100, 'type_subject': 'cours', 'teacher_id': 1, 'specialty_id': 1},
    {'subject_name': 'Subject Updated', 'hour_by_week': 5, 'total_hour': 120, 'type_subject': 'td', 'teacher_id': 1, 'specialty_id': 1}
)

# 6. TEACHER (Already tested previously)
test_model(
    'Teacher',
    'teachers',
    {'registration_number': 'T99991', 'user_id': 2},
    {'registration_number': 'T99992', 'user_id': 2}
)

# 7. ROOM
test_model(
    'Room',
    'rooms',
    {'code': 'R999X', 'capacity': 25, 'is_available': True, 'campus_id': 1, 'programmation_id': 1},
    {'code': 'R999Y', 'capacity': 30, 'is_available': False, 'campus_id': 1, 'programmation_id': 1}
)

# 8. LEVEL
test_model(
    'Level',
    'levels',
    {'name_level': 'Level Test'},
    {'name_level': 'Level Updated'}
)

# 9. YEAR
test_model(
    'Year',
    'years',
    {'date_star': '2027-01-01', 'date_end': '2027-12-31'},
    {'date_star': '2028-01-01', 'date_end': '2028-12-31'}
)

# 10. PROGRAMMER
test_model(
    'Programmer',
    'programmers',
    {'registration_number': 'PRG9999', 'user_id': 3, 'etablishment_id': 1},
    {'registration_number': 'PRG9998', 'user_id': 3, 'etablishment_id': 1}
)

# 11. PROGRAMMATION
test_model(
    'Programmation',
    'programmations',
    {'day': 'Lundi', 'hour_star': '08:00', 'hour_end': '10:00', 'subject_id': 1, 'programmer_id': 1, 'year_id': 1},
    {'day': 'Mardi', 'hour_star': '10:00', 'hour_end': '12:00', 'subject_id': 1, 'programmer_id': 1, 'year_id': 1}
)

# 12. DISPONIBILITY
test_model(
    'Disponibility',
    'disponibilities',
    {'day': 'Lundi', 'hour_star': '09:00', 'hour_end': '11:00', 'subject_id': 1},
    {'day': 'Mercredi', 'hour_star': '14:00', 'hour_end': '16:00', 'subject_id': 1}
)

# 13. SPECIALTY PROGRAMMATION
test_model(
    'SpecialtyProgrammation',
    'specialty-programmations',
    {'specialty_id': 1, 'programmation_id': 1},
    {'specialty_id': 1, 'programmation_id': 1}
)

# 14. USER
rand_num = int(time.time() * 1000) % 10000
rand_email = int(time.time() * 1000) % 1000000
test_model(
    'User',
    'users',
    {'name': f'User Test {rand_num}', 'email': f'test{rand_email}@example.com', 'phone': f'555-{rand_num}', 'password': 'password123', 'password_confirmation': 'password123', 'role': 'teacher'},
    {'name': f'User Updated {rand_num}', 'email': f'test{rand_email+1}@example.com', 'phone': f'555-{rand_num+1}', 'role': 'teacher'}
)

# ============================================================================
# FINAL REPORT
# ============================================================================

total = TESTS_PASSED + TESTS_FAILED
success_rate = (TESTS_PASSED / total * 100) if total > 0 else 0

print("\n" + "="*60)
print(f"  FINAL REPORT")
print("="*60)
print(f"  Tests Passed: {TESTS_PASSED}")
print(f"  Tests Failed: {TESTS_FAILED}")
print(f"  Success Rate: {success_rate:.1f}%")
print("="*60 + "\n")

sys.exit(0 if TESTS_FAILED == 0 else 1)
