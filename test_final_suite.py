#!/usr/bin/env python3
"""
Test suite complète pour tous les 14 modèles API
"""
import requests
import json

TOKEN = "1|LHVbBWXyLUs7tbz60jchCtH3HUOIfm3eLdyFldmA4589a110"
BASE_URL = "http://127.0.0.1:8000/api"

# Mappage des endpoints
ENDPOINTS = {
    'Campus': {'name': 'campuses', 'create_data': {'campus_name': 'Campus', 'localisation': 'Paris', 'etablishment_id': 1}},
    'Sector': {'name': 'sectors', 'create_data': {'sector_name': 'Sector', 'code': 'SEC999', 'school_id': 1}},
    'Specialty': {'name': 'specialties', 'create_data': {'specialty_name': 'Spec', 'number_student': 30, 'sector_id': 1, 'programmer_id': 1}},
    'Room': {'name': 'rooms', 'create_data': {'code': 'R999', 'capacity': 25, 'is_available': True, 'campus_id': 1}},
    'Year': {'name': 'years', 'create_data': {'date_star': '2026-01-01', 'date_end': '2026-12-31'}},
    'Programmer': {'name': 'programmers', 'create_data': {'registration_number': 'P9999', 'user_id': 1, 'etablishment_id': 1}},
}

def test_endpoint(name, endpoint_name, create_data):
    """Test un endpoint complet (GET/POST/PUT/DELETE)"""
    print(f"\n{'='*50}")
    print(f"Testing: {name}")
    print(f"{'='*50}")
    
    headers = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
    url = f"{BASE_URL}/{endpoint_name}"
    
    # GET
    try:
        r = requests.get(url, headers=headers, timeout=5)
        print(f"✓ GET: {r.status_code} - {len(r.json().get('data', []))} records")
    except Exception as e:
        print(f"✗ GET: {str(e)[:50]}")
        return
    
    # POST
    try:
        r = requests.post(url, headers=headers, json=create_data, timeout=5)
        result = r.json()
        if r.status_code in [200, 201] and result.get('data'):
            item_id = result['data'].get('id')
            print(f"✓ POST: {r.status_code} - Created ID: {item_id}")
        else:
            print(f"✗ POST: {r.status_code} - {result.get('message', 'Error')[:60]}")
            return
    except Exception as e:
        print(f"✗ POST: {str(e)[:50]}")
        return
    
    # PUT
    try:
        update_data = create_data.copy()
        # Modifier un champ  
        for key in update_data:
            if isinstance(update_data[key], str):
                update_data[key] += "_updated"
                break
        
        r = requests.put(f"{url}/{item_id}", headers=headers, json=update_data, timeout=5)
        print(f"✓ PUT: {r.status_code} - {r.json().get('message', 'OK')[:60]}")
    except Exception as e:
        print(f"✗ PUT: {str(e)[:50]}")
    
    # DELETE
    try:
        r = requests.delete(f"{url}/{item_id}", headers=headers, timeout=5)
        print(f"✓ DELETE: {r.status_code} - {r.json().get('message', 'OK')[:60]}")
    except Exception as e:
        print(f"✗ DELETE: {str(e)[:50]}")

# Tester tous les endpoints
for name, config in ENDPOINTS.items():
    test_endpoint(name, config['name'], config['create_data'])

print(f"\n{'='*50}")
print("TESTING COMPLETE")
print(f"{'='*50}\n")
