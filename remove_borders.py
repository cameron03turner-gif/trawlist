import os
import re

src_dir = r'c:\scrubbed\src'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We will look for lines containing 'bg-surface' (which matches bg-surface and bg-surface-alt)
    # and we will replace border classes in those lines.
    
    lines = content.split('\n')
    new_lines = []
    changed = False
    
    for line in lines:
        if 'bg-surface' in line and 'border' in line:
            original = line
            # Remove specific border strings
            line = line.replace(' border border-border', '')
            line = line.replace(' border-b border-border', '')
            line = line.replace(' border border-border/50', '')
            line = line.replace(' border border-transparent', '')
            line = line.replace(' border border-dashed border-border', '')
            line = line.replace('border border-border ', '')
            
            # Special cases
            line = line.replace('border-r border-b', '')
            line = line.replace('border border-amber/50', '')
            line = line.replace('border-b border-border/50', '')
            
            # Remove isolated border-border if left over
            line = line.replace(' border-border ', ' ')
            
            if line != original:
                changed = True
        new_lines.append(line)
        
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))
        print(f"Updated {filepath}")

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))
