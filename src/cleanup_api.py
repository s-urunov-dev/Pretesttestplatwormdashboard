#!/usr/bin/env python3
"""
Script to remove junk code from api.ts (lines 1783-1980)
"""

# Read the file
with open('lib/api.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Keep lines 1-1782 and skip 1783-1980
cleaned_lines = lines[:1782]  # Lines 1-1782 (0-indexed so 0-1781)

# Write back
with open('lib/api.ts', 'w', encoding='utf-8') as f:
    f.writelines(cleaned_lines)

print(f"✅ Cleaned! Removed lines 1783-1980")
print(f"   Original: {len(lines)} lines")
print(f"   Cleaned: {len(cleaned_lines)} lines")
print(f"   Removed: {len(lines) - len(cleaned_lines)} lines")
