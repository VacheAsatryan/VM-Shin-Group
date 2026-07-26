#!/bin/bash

# Find all tsx and ts files in src/
FILES=$(find src/ -type f \( -name "*.tsx" -o -name "*.ts" \))

for file in $FILES; do
  # Replace rgba(255,255,255,1) with rgba(245,194,27,1)
  sed -i '' -E 's/rgba\(255,255,255,1\)/rgba(245,194,27,1)/g' "$file"
  
  # Replace rgba(255,255,255,0.02) with rgba(245,194,27,0.05) to give it a bit more contrast
  sed -i '' -E 's/rgba\(255,255,255,0\.02\)/rgba(245,194,27,0.05)/g' "$file"

  # Replace rgba(255,255,255,0.03) with rgba(245,194,27,0.06)
  sed -i '' -E 's/rgba\(255,255,255,0\.03\)/rgba(245,194,27,0.06)/g' "$file"
  
  # Replace rgba(255,255,255,0.05) with rgba(245,194,27,0.08)
  sed -i '' -E 's/rgba\(255,255,255,0\.05\)/rgba(245,194,27,0.08)/g' "$file"
  
  # Also remove any remaining text-white to text-gold-primary if it's for decorative elements?
  # No, text-white is usually actual text.
done

