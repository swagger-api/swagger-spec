#!/bin/bash

# Author: @ralfhandl

# run this script from the root of the repo. It is designed to be run by a GitHub workflow.

for filename in schemas/v3*/schema.yaml ; do
  vVersion=$(basename $(dirname "$filename"))
  version=${vVersion:1}
  lastCommitDate=$(git log -1 --format="%ad" --date=short "$filename")

  echo "$filename $lastCommitDate"
  mkdir -p deploy/oas/$version/schema
  node scripts/schema-convert.js "$filename" $lastCommitDate > deploy/oas/$version/schema/$lastCommitDate
  mv deploy/oas/$version/schema/*.md deploy/oas/$version/schema/$lastCommitDate.md

  filenameBase=$(dirname "$filename")/schema-base.yaml
  if [ -f "$filenameBase" ]; then
    echo "$filenameBase $lastCommitDate"
    mkdir -p deploy/oas/$version/schema-base
    node scripts/schema-convert.js "$filenameBase" $lastCommitDate > deploy/oas/$version/schema-base/$lastCommitDate
    mv deploy/oas/$version/schema-base/*.md deploy/oas/$version/schema-base/$lastCommitDate.md
  fi
done
