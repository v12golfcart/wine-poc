#!/usr/bin/env python3
"""
Wine Analysis Test Runner

Reads test images from test_data/images/, calls the /api/analyze-wine-image endpoint,
and compares results with expected outcomes from test_data/expected_results.json.

Usage: python3 test_runner.py
"""

import os
import json
import requests
import time
import unicodedata
from pathlib import Path

# Configuration
API_BASE_URL = "http://localhost:5001"
TEST_DATA_DIR = Path("test_data")
IMAGES_DIR = TEST_DATA_DIR / "images"
EXPECTED_RESULTS_FILE = TEST_DATA_DIR / "expected_results.json"

def load_expected_results():
    """Load expected results from JSON file"""
    try:
        with open(EXPECTED_RESULTS_FILE, 'r') as f:
            data = json.load(f)
        # Filter out instruction entries
        return {k: v for k, v in data.items() if not k.startswith('_')}
    except Exception as e:
        print(f"❌ Error loading expected results: {e}")
        return {}

def call_api(image_path):
    """Call the wine analysis API with an image file"""
    try:
        with open(image_path, 'rb') as f:
            files = {'image': f}
            response = requests.post(
                f"{API_BASE_URL}/api/analyze-wine-image",
                files=files,
                timeout=30
            )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"API Error {response.status_code}: {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection Error: Is the backend server running at {API_BASE_URL}?")
        return None
    except Exception as e:
        print(f"❌ API call error: {e}")
        return None

def normalize_string(s):
    """Normalize string: remove accents, lowercase, strip whitespace"""
    if not s:
        return ""
    # Remove accents using NFD normalization
    normalized = unicodedata.normalize('NFD', str(s))
    # Filter out combining characters (accents)
    without_accents = ''.join(c for c in normalized if unicodedata.category(c) != 'Mn')
    return without_accents.lower().strip()

def levenshtein_distance(s1, s2):
    """Calculate Levenshtein distance between two strings"""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    
    if len(s2) == 0:
        return len(s1)
    
    previous_row = list(range(len(s2) + 1))
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    
    return previous_row[-1]

def similarity_ratio(s1, s2):
    """Calculate similarity ratio (0.0 to 1.0) using Levenshtein distance"""
    if not s1 and not s2:
        return 1.0
    if not s1 or not s2:
        return 0.0
    
    distance = levenshtein_distance(normalize_string(s1), normalize_string(s2))
    max_len = max(len(s1), len(s2))
    return 1.0 - (distance / max_len)

def exact_match_year(expected, actual):
    """Exact match for year field (null means any year is okay)"""
    if expected is None:  # null means any year is acceptable
        return True, f"✅ Year: null (any year OK) vs {actual}"
    if actual is None:
        return False, f"❌ Year: expected {expected}, got null"
    if expected == actual:
        return True, f"✅ Year: {expected}"
    return False, f"❌ Year: expected {expected}, got {actual}"

def exact_match_field(expected, actual, field_name, max_distance=2):
    """Exact match for string fields (within 1-2 characters Levenshtein distance)"""
    if not expected and not actual:
        return True, f"✅ {field_name}: both empty"
    if not expected or not actual:
        return False, f"❌ {field_name}: one empty - expected '{expected}', got '{actual}'"
    
    distance = levenshtein_distance(normalize_string(expected), normalize_string(actual))
    if distance <= max_distance:
        return True, f"✅ {field_name}: '{expected}' ≈ '{actual}' (distance: {distance})"
    else:
        return False, f"❌ {field_name}: '{expected}' ≠ '{actual}' (distance: {distance})"

def exact_match_winery(expected_wineries, actual_wineries):
    """Exact match for winery field (list of wineries)"""
    if not expected_wineries and not actual_wineries:
        return True, "✅ Winery: both empty"
    if not expected_wineries or not actual_wineries:
        return False, f"❌ Winery: one empty - expected {expected_wineries}, got {actual_wineries}"
    
    # For simplicity, check if any expected winery matches any actual winery
    for expected in expected_wineries:
        for actual in actual_wineries:
            distance = levenshtein_distance(normalize_string(expected), normalize_string(actual))
            if distance <= 2:
                return True, f"✅ Winery: '{expected}' ≈ '{actual}' (distance: {distance})"
    
    return False, f"❌ Winery: no match between {expected_wineries} and {actual_wineries}"

def approx_match_field(expected, actual, field_name, threshold=0.7):
    """Approximate match for string fields (70% similarity threshold)"""
    if not expected and not actual:
        return True, f"✅ {field_name}: both empty"
    if not expected or not actual:
        return False, f"❌ {field_name}: one empty - expected '{expected}', got '{actual}'"
    
    similarity = similarity_ratio(expected, actual)
    if similarity >= threshold:
        return True, f"✅ {field_name}: '{expected}' ≈ '{actual}' ({similarity:.2f} similarity)"
    else:
        return False, f"❌ {field_name}: '{expected}' ≠ '{actual}' ({similarity:.2f} similarity)"

def calculate_wine_similarity(expected_wine, actual_wine):
    """Calculate overall similarity between expected and actual wine"""
    matches = []
    scores = []
    
    # Exact matches
    year_match, year_msg = exact_match_year(expected_wine.get('year'), actual_wine.get('year'))
    matches.append(year_msg)
    scores.append(1.0 if year_match else 0.0)
    
    winery_match, winery_msg = exact_match_winery(expected_wine.get('wineries', []), actual_wine.get('wineries', []))
    matches.append(winery_msg)
    scores.append(1.0 if winery_match else 0.0)
    
    varietal_match, varietal_msg = exact_match_field(expected_wine.get('varietal'), actual_wine.get('varietal'), "Varietal")
    matches.append(varietal_msg)
    scores.append(1.0 if varietal_match else 0.0)
    
    # Approximate matches
    name_match, name_msg = approx_match_field(expected_wine.get('name'), actual_wine.get('name'), "Name")
    matches.append(name_msg)
    scores.append(1.0 if name_match else 0.0)
    
    region_match, region_msg = approx_match_field(expected_wine.get('region'), actual_wine.get('region'), "Region")
    matches.append(region_msg)
    scores.append(1.0 if region_match else 0.0)
    
    overall_score = sum(scores) / len(scores)
    return overall_score, matches

def match_wines(expected_wines, actual_wines, threshold=0.6):
    """Match expected wines with actual wines using similarity scores"""
    if not expected_wines and not actual_wines:
        return True, [], "✅ No wines expected or detected"
    
    if not expected_wines:
        return False, [], f"❌ Expected no wines, but detected {len(actual_wines)}"
    
    if not actual_wines:
        return False, [], f"❌ Expected {len(expected_wines)} wines, but detected none"
    
    matched_pairs = []
    unmatched_expected = []
    unmatched_actual = list(actual_wines)
    
    # Simple greedy matching - find best match for each expected wine
    for i, expected_wine in enumerate(expected_wines):
        best_score = 0.0
        best_match = None
        best_match_idx = -1
        best_details = []
        
        for j, actual_wine in enumerate(unmatched_actual):
            score, details = calculate_wine_similarity(expected_wine, actual_wine)
            if score > best_score:
                best_score = score
                best_match = actual_wine
                best_match_idx = j
                best_details = details
        
        if best_score >= threshold and best_match is not None:
            matched_pairs.append({
                'expected': expected_wine,
                'actual': best_match,
                'score': best_score,
                'details': best_details
            })
            unmatched_actual.pop(best_match_idx)
        else:
            unmatched_expected.append(expected_wine)
    
    # Calculate success
    total_expected = len(expected_wines)
    matched_count = len(matched_pairs)
    success_rate = matched_count / total_expected if total_expected > 0 else 0.0
    
    # Generate summary message
    if success_rate == 1.0 and len(unmatched_actual) == 0:
        summary = f"✅ Perfect match: {matched_count}/{total_expected} wines matched"
    elif success_rate >= 0.7:
        summary = f"⚠️ Good match: {matched_count}/{total_expected} wines matched ({success_rate:.1%})"
    else:
        summary = f"❌ Poor match: {matched_count}/{total_expected} wines matched ({success_rate:.1%})"
    
    return success_rate >= 0.7, matched_pairs, summary

def compare_validation(expected_should_validate, actual_valid):
    """Compare validation results"""
    if expected_should_validate == actual_valid:
        return True, "✅ Validation correct"
    else:
        return False, f"❌ Validation wrong: expected {expected_should_validate}, got {actual_valid}"

def compare_wines(expected_wines, actual_wines):
    """Compare wine detection results using detailed matching"""
    wines_passed, matched_pairs, summary = match_wines(expected_wines, actual_wines)
    return wines_passed, summary, matched_pairs

def run_single_test(image_filename, expected_result):
    """Run a single test case"""
    print(f"\n🧪 Testing: {image_filename}")
    print("-" * 50)
    
    image_path = IMAGES_DIR / image_filename
    if not image_path.exists():
        print(f"❌ Image file not found: {image_path}")
        return False
    
    # Call API
    start_time = time.time()
    actual_result = call_api(image_path)
    end_time = time.time()
    
    if actual_result is None:
        print("❌ API call failed")
        return False
    
    print(f"⏱️  Processing time: {end_time - start_time:.2f}s")
    
    # Compare validation
    expected_should_validate = expected_result["should_validate"]
    actual_valid = actual_result.get("valid", False)
    
    validation_passed, validation_msg = compare_validation(expected_should_validate, actual_valid)
    print(validation_msg)
    
    # Compare wines (only if validation should pass)
    wines_passed = True
    wines_msg = ""
    matched_pairs = []
    
    if expected_should_validate:
        expected_wines = expected_result["expected_wines"]
        actual_wines = actual_result.get("wines", [])
        wines_passed, wines_msg, matched_pairs = compare_wines(expected_wines, actual_wines)
        print(wines_msg)
        
        # Show detailed wine matching results
        if matched_pairs:
            print(f"🍷 Detailed wine matches:")
            for i, pair in enumerate(matched_pairs[:3]):  # Show first 3 matches
                print(f"   Match {i+1} (score: {pair['score']:.2f}):")
                print(f"      Expected: {pair['expected'].get('name', 'Unknown')} by {pair['expected'].get('wineries', ['Unknown'])[0]}")
                print(f"      Detected: {pair['actual'].get('name', 'Unknown')} by {pair['actual'].get('wineries', ['Unknown'])[0]}")
                # Show field-by-field details
                for detail in pair['details']:
                    print(f"         {detail}")
            if len(matched_pairs) > 3:
                print(f"   ... and {len(matched_pairs) - 3} more matches")
        elif actual_wines and expected_wines:
            print(f"🍷 No successful matches found. Detected wines:")
            for i, wine in enumerate(actual_wines[:3]):
                print(f"   {i+1}. {wine.get('name', 'Unknown')} by {wine.get('wineries', ['Unknown'])[0]} ({wine.get('varietal', 'Unknown varietal')})")
            if len(actual_wines) > 3:
                print(f"   ... and {len(actual_wines) - 3} more")
    
    # Overall result
    overall_passed = validation_passed and wines_passed
    if overall_passed:
        print("✅ PASS")
    else:
        print("❌ FAIL")
        if not validation_passed:
            print(f"📝 Validation failed: expected {expected_should_validate}, got {actual_valid}")
        if expected_should_validate and not wines_passed:
            expected_count = len(expected_result['expected_wines'])
            actual_count = len(actual_result.get('wines', []))
            matched_count = len(matched_pairs) if matched_pairs else 0
            print(f"📝 Wine matching failed: {matched_count}/{expected_count} wines matched successfully")
    
    return overall_passed

def main():
    """Main test runner"""
    print("🍷 Wine Analysis Test Runner")
    print("=" * 50)
    
    # Load expected results
    expected_results = load_expected_results()
    if not expected_results:
        print("❌ No test cases found")
        return
    
    print(f"📋 Found {len(expected_results)} test cases")
    
    # Check if images directory exists
    if not IMAGES_DIR.exists():
        print(f"❌ Images directory not found: {IMAGES_DIR}")
        return
    
    # Run tests
    passed_tests = 0
    total_tests = len(expected_results)
    
    for image_filename, expected_result in expected_results.items():
        test_passed = run_single_test(image_filename, expected_result)
        if test_passed:
            passed_tests += 1
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    print(f"Total tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")
    print(f"Success rate: {(passed_tests / total_tests) * 100:.1f}%")
    
    if passed_tests == total_tests:
        print("\n🎉 All tests passed!")
    else:
        print(f"\n⚠️  {total_tests - passed_tests} test(s) failed")
        print("💡 Check the details above to debug issues")

if __name__ == "__main__":
    main() 