import os

src_dir = r'c:\scrubbed\src'

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                for i, line in enumerate(lines):
                    if 'bg-surface' in line and 'border' in line:
                        print(f"{path}:{i+1}:{line.strip()}")
