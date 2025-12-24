#!/bin/bash

currentDir=$(dirname "$(readlink -f "$0")")
projectDir=$(dirname "$currentDir")

baseConfig="$currentDir/po4a-base.conf"
outputConfig="$currentDir/po4a.conf"
sourceDir="$projectDir/src/en"

cat "$baseConfig" > "$outputConfig"
echo "" >> "$outputConfig"

find "$sourceDir" -name "*.md" -type f | sort | while read -r file; do
    relPath="${file#$sourceDir/}"
    potPath=$(echo "$relPath" | tr '/' '_')
    echo "[type: markdown] ../src/en/$relPath \$lang:../src/\$lang/$relPath pot=$potPath" >> "$outputConfig"
done

echo "Configuration file generated successfully: $outputConfig"
