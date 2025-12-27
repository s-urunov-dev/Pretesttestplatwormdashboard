#!/usr/bin/env python3
"""
Script to fix AddQuestionPage.tsx by removing lines 646-653
Run this script to automatically fix the file
"""

# Read the file
with open('/pages/AddQuestionPage.tsx', 'r') as f:
    lines = f.readlines()

# Lines to delete: 646-653 (0-indexed: 645-652)
# These lines contain the old body-building code with `instruction` variable

# Print what we're deleting
print("Lines to DELETE (646-653):")
for i in range(645, 653):
    if i < len(lines):
        print(f"{i+1}: {lines[i].rstrip()}")

# Delete lines 645-652 (0-indexed)
new_lines = lines[:645] + lines[653:]

# Write back
with open('/pages/AddQuestionPage.tsx', 'w') as f:
    f.writelines(new_lines)

print("\n✅ File fixed! Lines 646-653 have been deleted.")
print(f"Old line count: {len(lines)}")
print(f"New line count: {len(new_lines)}")
