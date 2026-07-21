import os
import re

colors = ['bg', 'surface', 'surface-alt', 'border', 'ink', 'muted', 'amber', 'amber-soft', 'rec']
counts = {c: 0 for c in colors}

pattern = re.compile(r'\b(?:bg|text|border|ring|fill|stroke)-(' + '|'.join(colors) + r')\b')

src_dir = r'c:\scrubbed\src'

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.css'):
            with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                content = f.read()
                matches = pattern.findall(content)
                for match in matches:
                    counts[match] += 1

# Special check for bg color in globals.css as it might not be prefixed with Tailwind classes
with open(os.path.join(src_dir, 'app', 'globals.css'), 'r', encoding='utf-8') as f:
    if '#0F141F' in f.read():
        counts['bg'] += 1

print("Color Counts:")
for c, count in sorted(counts.items(), key=lambda item: item[1]):
    print(f"{c}: {count}")
