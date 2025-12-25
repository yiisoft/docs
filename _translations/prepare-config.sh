#!/bin/bash

currentDir=$(dirname "$(readlink -f "$0")")
projectDir=$(dirname "$currentDir")

baseConfig="$currentDir/po4a-base.conf"
outputConfig="$currentDir/po4a.conf"
srcDir="$projectDir/src"

sourceDirs=("cookbook" "guide" "internals")
sourceFiles=("index.md")

cat "$baseConfig" > "$outputConfig"
echo "" >> "$outputConfig"

for sourceFile in "${sourceFiles[@]}"; do
    if [ -f "$srcDir/$sourceFile" ]; then
        potPath=$(echo "$sourceFile" | tr '/' '_')
        echo "[type: markdown] ../src/$sourceFile \$lang:../src/\$lang/$sourceFile pot=$potPath" >> "$outputConfig"
    fi
done

for sourceDir in "${sourceDirs[@]}"; do
    if [ -d "$srcDir/$sourceDir" ]; then
        find "$srcDir/$sourceDir" -name "*.md" -type f | LC_ALL=C sort | while read -r file; do
            relPath="${file#$srcDir/}"
            potPath=$(echo "$relPath" | tr '/' '_')
            echo "[type: markdown] ../src/$relPath \$lang:../src/\$lang/$relPath pot=$potPath" >> "$outputConfig"
        done
    fi
done

echo "Configuration file generated successfully: $outputConfig"
