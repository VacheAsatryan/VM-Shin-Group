#!/bin/bash

# Find all tsx and ts files in src/
FILES=$(find src/ -type f \( -name "*.tsx" -o -name "*.ts" \))

for file in $FILES; do
  # Replace border-white/[0-9]+ with border-gold-border
  sed -i '' -E 's/([[:space:]"'\'']|^)border-(white|gray|neutral|zinc|stone|slate)(\/[0-9]+)?([[:space:]"'\'']|$)/\1border-gold-border\4/g' "$file"
  
  # Replace hover:border-white/[0-9]+ with hover:border-gold-border-hover
  sed -i '' -E 's/([[:space:]"'\'']|^)hover:border-(white|gray|neutral|zinc|stone|slate)(\/[0-9]+)?([[:space:]"'\'']|$)/\1hover:border-gold-border-hover\4/g' "$file"

  # Also replace group-hover:border-white/... with group-hover:border-gold-border-hover
  sed -i '' -E 's/([[:space:]"'\'']|^)group-hover:border-(white|gray|neutral|zinc|stone|slate)(\/[0-9]+)?([[:space:]"'\'']|$)/\1group-hover:border-gold-border-hover\4/g' "$file"
  
  # Replace focus:border-white/... with focus:border-gold-border-hover
  sed -i '' -E 's/([[:space:]"'\'']|^)focus:border-(white|gray|neutral|zinc|stone|slate)(\/[0-9]+)?([[:space:]"'\'']|$)/\1focus:border-gold-border-hover\4/g' "$file"
done

