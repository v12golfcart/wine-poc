#!/usr/bin/env python3
"""
Utility script to generate the full detection prompt with varietals/critics injected.
Use this to copy the prompt for testing in ChatGPT or other tools.

Usage: python3 get_prompt.py
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from agents.detection_agent import load_prompts_config

def main():
    print("🍷 Wine Detection Prompt Generator")
    print("=" * 50)
    
    # Load configuration
    config = load_prompts_config()
    if not config:
        print("❌ Error: Could not load prompts.json")
        print("💡 Make sure test_data/prompts.json exists and is valid JSON")
        return
    
    # Load arrays and template
    varietals = config.get("varietals", [])
    prompt_template = config["detection"]["prompt_template"]
    
    # Build the dynamic prompt
    varietals_list = ", ".join(varietals)
    final_prompt = prompt_template.format(
        varietals_list=varietals_list
    )
    
    # Display info
    print(f"✅ Loaded {len(varietals)} varietals")
    print(f"✅ Model: {config['detection']['model']}")
    print(f"✅ Max tokens: {config['detection']['max_tokens']}")
    print()
    
    print("📋 FULL DETECTION PROMPT (ready to copy/paste):")
    print("=" * 50)
    print(final_prompt)
    print("=" * 50)
    print()
    print("💡 Copy the text above and paste it into ChatGPT!")
    print("💡 Upload your wine image and ChatGPT will extract wine data using the same prompt.")

if __name__ == "__main__":
    main() 