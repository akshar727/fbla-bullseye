#!/usr/bin/env python3
"""
Simple line counter for the project.
Counts lines of code, excluding common non-code directories.
"""

import os
from pathlib import Path
from collections import defaultdict

# Directories to skip
SKIP_DIRS = {
    'node_modules', '.next', '.git', 'dist', 'build', 
    '__pycache__', '.vscode', '.idea', 'venv', 'env', '.vercel'
}

# File extensions to count as code
CODE_EXTENSIONS = {
    '.ts', '.tsx', '.js', '.jsx', '.py', '.css', '.html',
     '.yaml', '.yml', '.md', '.sql', '.sh'
}

def count_lines_in_file(filepath):
    """Count lines in a single file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return len(f.readlines())
    except (UnicodeDecodeError, PermissionError):
        return 0

def count_project_lines(root_dir):
    """Count lines of code in the project."""
    stats = defaultdict(lambda: {'files': 0, 'lines': 0})
    total_files = 0
    total_lines = 0
    
    root_path = Path(root_dir)
    
    for dirpath, dirnames, filenames in os.walk(root_path):
        # Remove skip directories from the walk
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        
        for filename in filenames:
            filepath = Path(dirpath) / filename
            ext = filepath.suffix.lower()
            
            # Check if it's a code file
            if ext in CODE_EXTENSIONS:
                lines = count_lines_in_file(filepath)
                stats[ext]['files'] += 1
                stats[ext]['lines'] += lines
                total_files += 1
                total_lines += lines
    
    return stats, total_files, total_lines

def main():
    """Main function."""
    # Get the directory where the script is located
    script_dir = Path(__file__).parent
    
    print("Counting lines of code in the project...\n")
    
    stats, total_files, total_lines = count_project_lines(script_dir)
    
    # Sort by line count (descending)
    sorted_stats = sorted(stats.items(), key=lambda x: x[1]['lines'], reverse=True)
    
    print(f"{'Extension':<12} {'Files':<10} {'Lines':<10}")
    print("-" * 35)
    
    for ext, data in sorted_stats:
        print(f"{ext:<12} {data['files']:<10} {data['lines']:<10,}")
    
    print("-" * 35)
    print(f"{'TOTAL':<12} {total_files:<10} {total_lines:<10,}")
    print(f"\nTotal lines of code: {total_lines:,}")

if __name__ == "__main__":
    main()
