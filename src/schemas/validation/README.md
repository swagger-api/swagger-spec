# OpenAPI 3.X.Y JSON Schema

This directory contains the YAML sources for generating the JSON Schemas for validating OpenAPI definitions of versions 3.X.Y, which are published on [https://spec.openapis.org](https://spec.openapis.org).

Due to limitations of GitHub pages, the schemas on the spec site are served with `Content-Type: application/octet-stream`, but should be interpreted as `application/schema+json`.

The sources in this directory, which have `WORK-IN-PROGRESS` in their `$id`s, are _not intended for direct use_.

## Schema `$id` dates

The published schemas on the spec site have an _iteration date_ in their `id`s.
This allows the schemas for a release line to be updated independent of the spec patch release cycle.

The iteration version of the JSON Schema can be found in the `$id` field.
For example, the value of `$id: https://spec.openapis.org/oas/3.1/schema/2021-03-02` means this iteration was created on March 2nd, 2021.

We are [working on](https://github.com/OAI/OpenAPI-Specification/issues/4152) how to best provide programmatic access for determining the latest date for each schema.

## Choosing which schema to use

There are two schemas to choose from for versions 3.1 and greater, both of which have an `$id` that starts with `https://spec.openapis.org/oas/3.X/` and ends with the iteration date:

* `https://spec.openapis.org/oas/3.X/schema/{date}`, source: `schema.yaml` — A self-contained schema that _does not_ validate Schema Objects beyond `type: [object, boolean]`
* `https://spec.openapis.org/oas/3.X/meta/{date}`, source: `meta.yaml` — The vocabulary metaschema for OAS 3.X's extensions to draft 2020-12
* `https://spec.openapis.org/oas/3.X/dialect/base/{date}`, source: `base.yaml` — The dialect metaschema that extends the standard `draft/2020-12` metaschema by adding the OAS "base" vocabulary
* `https://spec.openapis.org/oas/3.1/schema-base/{date}`, source: `schema-base.yaml` — A schema that combines the self-contained schema and the "base" dialect schema to validate Schema Objects with the dialect; this schema does not allow changing `$schema` or `jsonSchemaDialect` to other dialects

The name "base" for the dialect was intended to indicate that the OAS dialect could be further extended.

An additional schema that validates the Schema Object with the OAS 3.X dialect but does not restrict changing `$schema` is [under consideration](https://github.com/OAI/OpenAPI-Specification/issues/4147).

## Improving the schemas

As a reminder, the JSON Schema is not the source of truth for the Specification. In cases of conflicts between the Specification itself and the JSON Schema, the Specification wins. Also, some Specification constraints cannot be represented with the JSON Schema so it's highly recommended to employ other methods to ensure compliance.

The schema only validates the mandatory aspects of the OAS.
Validating requirements that are optional, or field usage that has undefined or ignored behavior are not within the scope of this schema.
Schemas to perform additional optional validation are [under consideration](https://github.com/OAI/OpenAPI-Specification/issues/4141).

Improvements can be submitted by opening a PR against the `vX.Y-dev` branch of the respective specification version.

Modify the `schema.yaml` file and add test cases for your changes.

The TSC will then:
- Run tests on the updated schema
- Update the iteration version
- Publish the new version

The [test suite](../../../tests/schema) is part of this package.

```bash
npm install
npm test
```
