#!/usr/bin/env bash

# Author: @ralfhandl

# Run this script from the root of the repo. It is designed to be run by a GitHub workflow.

schemaDir="src/schemas/validation"
branch=$(git branch --show-current)

if [[ $branch =~ ^v([0-9]+\.[0-9]+\.[0-9]+) ]]; then
  deploydir="./deploy/oas/${BASH_REMATCH[1]}"
else
  deploydir="./deploy-preview"
fi

# create the date-stamped schemas
publish_schema() {
  local schema="$1"
  local date="$2"

  local base=$(basename $schema '.yaml')
  local target=$deploydir/$base/$date

  mkdir -p $deploydir/$base
  # replace the WORK-IN-PROGRESS placeholder
  sed -e "s/${base}\\/WORK-IN-PROGRESS/${base}\\/${date}/g" $schemaDir/$schema > $target.yaml

  node scripts/yaml2json/yaml2json.js "$target.yaml"
  rm "$target.yaml"
  mv "$target.json" "$target"
  echo " * $newestCommitDate: $schema"
}

echo === Building schemas into $deploydir

# list of schemas to process, dependent schemas come first
schemas=(meta.yaml dialect.yaml schema.yaml schema-base.yaml)

# publish each schema using its or any of its dependencies newest commit date.
maxDate=""
for schema in "${schemas[@]}"; do
  if [ -f  "$schemaDir/$schema" ]; then
    newestCommitDate=$(git log -1 --format="%ad" --date=short "$schemaDir/$schema")

    # the newest date across a schema and all its dependencies is its date stamp
    if [ "$newestCommitDate" \> "$maxDate" ]; then
      maxDate=$newestCommitDate
    fi

    publish_schema "$schema" "$maxDate"
  fi
done

echo === Built
