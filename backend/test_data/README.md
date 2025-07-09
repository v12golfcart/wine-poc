# Test Data Setup

This directory contains test data for systematically evaluating wine image analysis.

## Directory Structure

```
test_data/
├── images/          # Your 4-5 test images go here
├── expected_results.json  # Maps each image to expected output
├── prompts.json     # Current validation/detection prompts
└── README.md        # This file
```

## How to Set Up Test Cases

### 1. Add Test Images
- Place 4-5 test images in the `images/` folder
- Use descriptive filenames (e.g., `wine_bottle_clear.jpg`, `menu_restaurant.jpg`, `not_wine_food.jpg`)
- Include variety: clear wine bottles, wine menus, non-wine images, edge cases

### 2. Define Expected Results
Edit `expected_results.json` to map each image filename to its expected behavior:

```json
{
  "your_image.jpg": {
    "should_validate": true,     // Should validation pass?
    "expected_wines": [          // What wines should be detected?
      {
        "wineries": ["Winery Name"],
        "name": "Wine Name",
        "year": "2020",           // or null if not visible
        "varietal": "Cabernet Sauvignon",
        "region": "Napa Valley",  // or null if not visible
        "scores": []              // Array of critic scores, can be empty
      }
    ]
  }
}
```

### 3. Test Cases to Include

**Positive Cases:**
- Clear wine bottle with readable label
- Restaurant wine menu with multiple wines
- Wine list with pricing and descriptions

**Edge Cases:**
- Blurry wine image (should validate but maybe no wines detected)
- Partial wine bottle (cut off label)
- Wine menu with poor lighting

**Negative Cases:**
- Food image (no wine)
- Random objects
- Text document (not wine-related)

## Expected Results Format

- `should_validate`: Whether the image should pass validation (contains wine content)
- `expected_wines`: Array of wine objects you expect to be extracted
- Use `null` for fields that aren't visible/identifiable
- Use empty arrays `[]` for missing scores or when no wines should be detected

## Next Steps

After setting up your test data:
1. Run the test runner to get baseline scores
2. Modify prompts in `prompts.json` 
3. Re-run tests to see improvements
4. Iterate until satisfied with accuracy 