# OpenAPI Specification

## Version 3.2.0

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [BCP 14](https://tools.ietf.org/html/bcp14) [RFC2119](https://tools.ietf.org/html/rfc2119) [RFC8174](https://tools.ietf.org/html/rfc8174) when, and only when, they appear in all capitals, as shown here.

This document is licensed under [The Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0.html).

## Introduction

The OpenAPI Specification (OAS) defines a standard, language-agnostic interface to HTTP APIs which allows both humans and computers to discover and understand the capabilities of the service without access to source code, documentation, or through network traffic inspection. When properly defined, a consumer can understand and interact with the remote service with a minimal amount of implementation logic.

An OpenAPI Description can then be used by documentation generation tools to display the API, code generation tools to generate servers and clients in various programming languages, testing tools, and many other use cases.

For examples of OpenAPI usage and additional documentation, please visit [[?OpenAPI-Learn]].

For extension registries and other specifications published by the OpenAPI Initiative, as well as the authoritative rendering of this specification, please visit [spec.openapis.org](https://spec.openapis.org/).

## Definitions

### OpenAPI Description

An OpenAPI Description (OAD) formally describes the surface of an API and its semantics. It is composed of an [entry document](#openapi-description-structure), which must be an OpenAPI Document, and any/all of its referenced documents. An OAD uses and conforms to the OpenAPI Specification, and MUST contain at least one [paths](#paths-object) field, [components](#oas-components) field, or [webhooks](#oas-webhooks) field.

### OpenAPI Document

An OpenAPI Document is a single JSON or YAML document that conforms to the OpenAPI Specification. An OpenAPI Document compatible with OAS 3.\*.\* contains a required [`openapi`](#oas-version) field which designates the version of the OAS that it uses.

### Schema

A "schema" is a formal description of syntax and structure.
This document serves as the [schema](#schema) for the OpenAPI Specification format; a non-authoritative JSON Schema based on this document is also provided on [spec.openapis.org](https://spec.openapis.org) for informational purposes.
This specification also _uses_ schemas in the form of the [Schema Object](#schema-object).

### Object

When capitalized, the word "Object" refers to any of the Objects that are named by section headings in this document.

### Path Templating

Path templating refers to the usage of template expressions, delimited by curly braces (`{}`), to mark a section of a URL path as replaceable using path parameters.

Each template expression in the path MUST correspond to a path parameter that is included in the [Path Item](#path-item-object) itself and/or in each of the Path Item's [Operations](#operation-object). An exception is if the path item is empty, for example due to ACL constraints, matching path parameters are not required.

The value for these path parameters MUST NOT contain any unescaped "generic syntax" characters described by [RFC3986](https://tools.ietf.org/html/rfc3986#section-3): forward slashes (`/`), question marks (`?`), or hashes (`#`).

The path templating is defined by the following [ABNF](https://tools.ietf.org/html/rfc5234) syntax

```abnf
path-template                  = "/" *( path-segment "/" ) [ path-segment ]
path-segment                   = 1*( path-literal / template-expression )
path-literal                   = 1*pchar
template-expression            = "{" template-expression-param-name "}"
template-expression-param-name = 1*( %x00-7A / %x7C / %x7E-10FFFF ) ; every UTF8 character except { and }

pchar               = unreserved / pct-encoded / sub-delims / ":" / "@"
unreserved          = ALPHA / DIGIT / "-" / "." / "_" / "~"
pct-encoded         = "%" HEXDIG HEXDIG
sub-delims          = "!" / "$" / "&" / "'" / "(" / ")"
                    / "*" / "+" / "," / ";" / "="
```

Here, `pchar`, `unreserved`, `pct-encoded` and `sub-delims` definitions are taken from [RFC 3986](https://tools.ietf.org/html/rfc3986). The `path-template` is directly derived from [RFC 3986, section 3.3](https://datatracker.ietf.org/doc/html/rfc3986#section-3.3).

See also [Appendix C: Using RFC6570-Based Serialization](#appendix-c-using-rfc6570-based-serialization) for additional guidance.

### Media Types

Media type definitions are spread across several resources.
The media type definitions SHOULD be in compliance with [RFC6838](https://tools.ietf.org/html/rfc6838).

Some examples of possible media type definitions:

```text
  text/plain; charset=utf-8
  application/json
  application/vnd.github+json
  application/vnd.github.v3+json
  application/vnd.github.v3.raw+json
  application/vnd.github.v3.text+json
  application/vnd.github.v3.html+json
  application/vnd.github.v3.full+json
  application/vnd.github.v3.diff
  application/vnd.github.v3.patch
```

### HTTP Status Codes

The HTTP Status Codes are used to indicate the status of the executed operation.
Status codes SHOULD be selected from the available status codes registered in the [IANA Status Code Registry](https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml).

### Case Sensitivity

As most field names and values in the OpenAPI Specification are case-sensitive, this document endeavors to call out any case-insensitive names and values.
However, the case sensitivity of field names and values that map directly to HTTP concepts follow the case sensitivity rules of HTTP, even if this document does not make a note of every concept.

### Undefined and Implementation-Defined Behavior

This specification deems certain situations to have either _undefined_ or _implementation-defined_ behavior.

Behavior described as _undefined_ is likely, at least in some circumstances, to result in outcomes that contradict the specification.
This description is used when detecting the contradiction is impossible or impractical.
Implementations MAY support undefined scenarios for historical reasons, including ambiguous text in prior versions of the specification.
This support might produce correct outcomes in many cases, but relying on it is NOT RECOMMENDED as there is no guarantee that it will work across all tools or with future specification versions, even if those versions are otherwise strictly compatible with this one.

Behavior described as _implementation-defined_ allows implementations to choose which of several different-but-compliant approaches to a requirement to implement.
This documents ambiguous requirements that API description authors are RECOMMENDED to avoid in order to maximize interoperability.
Unlike undefined behavior, it is safe to rely on implementation-defined behavior if _and only if_ it can be guaranteed that all relevant tools support the same behavior.

## Specification

### Versions

The OpenAPI Specification is versioned using a `major`.`minor`.`patch` versioning scheme. The `major`.`minor` portion of the version string (for example `3.1`) SHALL designate the OAS feature set. _`.patch`_ versions address errors in, or provide clarifications to, this document, not the feature set. Tooling which supports OAS 3.1 SHOULD be compatible with all OAS 3.1.\* versions. The patch version SHOULD NOT be considered by tooling, making no distinction between `3.1.0` and `3.1.1` for example.

Occasionally, non-backwards compatible changes may be made in `minor` versions of the OAS where impact is believed to be low relative to the benefit provided.

### Format

An OpenAPI Document that conforms to the OpenAPI Specification is itself a JSON object, which may be represented either in JSON or YAML format.

For example, if a field has an array value, the JSON array representation will be used:

```json
{
  "field": [1, 2, 3]
}
```

All field names in the specification are **case sensitive**.
This includes all fields that are used as keys in a map, except where explicitly noted that keys are **case insensitive**.

The [schema](#schema) exposes two types of fields: _fixed fields_, which have a declared name, and _patterned fields_, which have a declared pattern for the field name.

Patterned fields MUST have unique names within the containing object.

In order to preserve the ability to round-trip between YAML and JSON formats, YAML version [1.2](https://yaml.org/spec/1.2/spec.html) is RECOMMENDED along with some additional constraints:

* Tags MUST be limited to those allowed by [YAML's JSON schema ruleset](https://yaml.org/spec/1.2/spec.html#id2803231), which defines a subset of the YAML syntax and is unrelated to [[JSON-Schema-2020-12|JSON Schema]].
* Keys used in YAML maps MUST be limited to a scalar string, as defined by the [YAML Failsafe schema ruleset](https://yaml.org/spec/1.2/spec.html#id2802346).

**Note:** While APIs may be described by OpenAPI Descriptions in either YAML or JSON format, the API request and response bodies and other content are not required to be JSON or YAML.

### OpenAPI Description Structure

An OpenAPI Description (OAD) MAY be made up of a single JSON or YAML document or be divided into multiple, connected parts at the discretion of the author. In the latter case, [Reference Object](#reference-object), [Path Item Object](#path-item-object) and [Schema Object](#schema-object) `$ref` fields, as well as the [Link Object](#link-object) `operationRef` field, and the URI form of the [Discriminator Object](#discriminator-object) `mapping` field, are used to identify the referenced elements.

In a multi-document OAD, the document containing the OpenAPI Object where parsing begins is known as that OAD's **entry document**.

It is RECOMMENDED that the entry document of an OAD be named: `openapi.json` or `openapi.yaml`.

#### Parsing Documents

In order to properly handle [Schema Objects](#schema-object), OAS 3.1 inherits the parsing requirements of [JSON Schema Specification Draft 2020-12](https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-00#section-9), with appropriate modifications regarding base URIs as specified in [Relative References In URIs](#relative-references-in-api-description-uris).

This includes a requirement to parse complete documents before deeming a Schema Object reference to be unresolvable, in order to detect keywords that might provide the reference target or impact the determination of the appropriate base URI.

Implementations MAY support complete-document parsing in any of the following ways:

* Detecting OpenAPI or JSON Schema documents using media types
* Detecting OpenAPI documents through the root `openapi` field
* Detecting JSON Schema documents through detecting keywords or otherwise successfully parsing the document in accordance with the JSON Schema specification
* Detecting a document containing a referenceable Object at its root based on the expected type of the reference
* Allowing users to configure the type of documents that might be loaded due to a reference to a non-root Object

Implementations that parse referenced fragments of OpenAPI content without regard for the content of the rest of the containing document will miss keywords that change the meaning and behavior of the reference target.
In particular, failing to take into account keywords that change the base URI introduces security risks by causing references to resolve to unintended URIs, with unpredictable results.
While some implementations support this sort of parsing due to the requirements of past versions of this specification, in version 3.1, the result of parsing fragments in isolation is _undefined_ and likely to contradict the requirements of this specification.

While it is possible to structure certain OpenAPI Descriptions to ensure that they will behave correctly when references are parsed as isolated fragments, depending on this is NOT RECOMMENDED.
This specification does not explicitly enumerate the conditions under which such behavior is safe and provides no guarantee for continued safety in any future versions of the OAS.

A special case of parsing fragments of OAS content would be if such fragments are embedded in another format, referred to as an _embedding format_ with respect to the OAS.
Note that the OAS itself is an embedding format with respect to JSON Schema, which is embedded as Schema Objects.
It is the responsibility of an embedding format to define how to parse embedded content, and OAS implementations that do not document support for an embedding format cannot be expected to parse embedded OAS content correctly.

#### Structural Interoperability

JSON or YAML objects within an OAD are interpreted as specific Objects (such as [Operation Objects](#operation-object), [Response Objects](#response-object), [Reference Objects](#reference-object), etc.) based on their context. Depending on how references are arranged, a given JSON or YAML object can be interpreted in multiple different contexts:

* As the root object of the [entry document](#openapi-description-structure), which is always interpreted as an OpenAPI Object
* As the Object type implied by its parent Object within the document
* As a reference target, with the Object type matching the reference source's context

If the same JSON/YAML object is parsed multiple times and the respective contexts require it to be parsed as _different_ Object types, the resulting behavior is _implementation defined_, and MAY be treated as an error if detected. An example would be referencing an empty Schema Object under `#/components/schemas` where a Path Item Object is expected, as an empty object is valid for both types. For maximum interoperability, it is RECOMMENDED that OpenAPI Description authors avoid such scenarios.

#### Resolving Implicit Connections

Several features of this specification require resolution of non-URI-based connections to some other part of the OpenAPI Description (OAD).

These connections are unambiguously resolved in single-document OADs, but the resolution process in multi-document OADs is _implementation-defined_, within the constraints described in this section.
In some cases, an unambiguous URI-based alternative is available, and OAD authors are RECOMMENDED to always use the alternative:

| Source | Target | Alternative |
| ---- | ---- | ---- |
| [Security Requirement Object](#security-requirement-object) `{name}` | [Security Scheme Object](#security-scheme-object) name under the [Components Object](#components-object) | _n/a_ |
| [Discriminator Object](#discriminator-object) `mapping` _(implicit, or explicit name syntax)_ | [Schema Object](#schema-object) name under the Components Object | `mapping` _(explicit URI syntax)_ |
| [Operation Object](#operation-object) `tags` | [Tag Object](#tag-object) `name` (in the [OpenAPI Object](#openapi-object)'s `tags` array) | _n/a_ |
| [Link Object](#link-object) `operationId` | [Path Item Object](#path-item-object) `operationId` | `operationRef` |

A fifth implicit connection involves appending the templated URL paths of the [Paths Object](#paths-object) to the appropriate [Server Object](#server-object)'s `url` field.
This is unambiguous because only the entry document's Paths Object contributes URLs to the described API.

It is RECOMMENDED to consider all Operation Objects from all parsed documents when resolving any Link Object `operationId`.
This requires parsing all referenced documents prior to determining an `operationId` to be unresolvable.

The implicit connections in the Security Requirement Object and Discriminator Object rely on the _component name_, which is the name of the property holding the component in the appropriately typed sub-object of the Components Object.
For example, the component name of the Schema Object at `#/components/schemas/Foo` is `Foo`.
The implicit connection of `tags` in the Operation Object uses the `name` field of Tag Objects, which (like the Components Object) are found under the root OpenAPI Object.
This means resolving component names and tag names both depend on starting from the correct OpenAPI Object.

For resolving component and tag name connections from a referenced (non-entry) document, it is RECOMMENDED that tools resolve from the entry document, rather than the current document.
This allows Security Scheme Objects and Tag Objects to be defined next to the API's deployment information (the top-level array of Server Objects), and treated as an interface for referenced documents to access.

The interface approach can also work for Discriminator Objects and Schema Objects, but it is also possible to keep the Discriminator Object's behavior within a single document using the relative URI-reference syntax of `mapping`.

There are no URI-based alternatives for the Security Requirement Object or for the Operation Object's `tags` field.
These limitations are expected to be addressed in a future release.

See [Appendix F: Resolving Security Requirements in a Referenced Document](#appendix-f-resolving-security-requirements-in-a-referenced-document) for an example of the possible resolutions, including which one is recommended by this section.
The behavior for Discrimator Object non-URI mappings and for the Operation Object's `tags` field operate on the same principles.

Note that no aspect of implicit connection resolution changes how [URIs are resolved](#relative-references-in-api-description-uris), or restricts their possible targets.

### Data Types

Data types in the OAS are based on the types defined by the [JSON Schema Validation Specification Draft 2020-12](https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-validation-00#section-6.1.1):
"null", "boolean", "object", "array", "number", "string", or "integer".
Models are defined using the [Schema Object](#schema-object), which is a superset of the JSON Schema Specification Draft 2020-12.

JSON Schema keywords and `format` values operate on JSON "instances" which may be one of the six JSON data types, "null", "boolean", "object", "array", "number", or "string", with certain keywords and formats only applying to a specific type. For example, the `pattern` keyword and the `date-time` format only apply to strings, and treat any instance of the other five types as _automatically valid._ This means JSON Schema keywords and formats do **NOT** implicitly require the expected type. Use the `type` keyword to explicitly constrain the type.

Note that the `type` keyword allows `"integer"` as a value for convenience, but keyword and format applicability does not recognize integers as being of a distinct JSON type from other numbers because [[RFC7159|JSON]] itself does not make that distinction. Since there is no distinct JSON integer type, JSON Schema defines integers mathematically. This means that both `1` and `1.0` are [equivalent](https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-00#section-4.2.2), and are both considered to be integers.

#### Data Type Format

As defined by the [JSON Schema Validation specification](https://tools.ietf.org/html/draft-bhutton-json-schema-validation-00#section-7.3), data types can have an optional modifier keyword: `format`. As described in that specification, `format` is treated as a non-validating annotation by default; the ability to validate `format` varies across implementations.

The OpenAPI Initiative also hosts a [Format Registry](https://spec.openapis.org/registry/format/) for formats defined by OAS users and other specifications. Support for any registered format is strictly OPTIONAL, and support for one registered format does not imply support for any others.

Types that are not accompanied by a `format` keyword follow the type definition in the JSON Schema. Tools that do not recognize a specific `format` MAY default back to the `type` alone, as if the `format` is not specified.
For the purpose of [JSON Schema validation](https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-validation-00#section-7.1), each format should specify the set of JSON data types for which it applies. In this registry, these types are shown in the "JSON Data Type" column.

The formats defined by the OAS are:

| `format` | JSON Data Type | Comments |
| ---- | ---- | ---- |
| `int32` | number | signed 32 bits |
| `int64` | number | signed 64 bits (a.k.a long) |
| `float` | number | |
| `double` | number | |
| `password` | string | A hint to obscure the value. |

As noted under [Data Type](#data-types), both `type: number` and `type: integer` are considered to be numbers in the data model.

#### Working with Binary Data

The OAS can describe either _raw_ or _encoded_ binary data.

* **raw binary** is used where unencoded binary data is allowed, such as when sending a binary payload as the entire HTTP message body, or as part of a `multipart/*` payload that allows binary parts
* **encoded binary** is used where binary data is embedded in a text-only format such as `application/json` or `application/x-www-form-urlencoded` (either as a message body or in the URL query string).

In the following table showing how to use Schema Object keywords for binary data, we use `image/png` as an example binary media type. Any binary media type, including `application/octet-stream`, is sufficient to indicate binary content.

| Keyword | Raw | Encoded | Comments |
| ---- | ---- | ---- | ---- |
| `type` | _omit_ | `string` | raw binary is [outside of `type`](https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-00#section-4.2.3) |
| `contentMediaType` | `image/png` | `image/png` | can sometimes be omitted if redundant (see below) |
| `contentEncoding` | _omit_ | `base64`&nbsp;or&nbsp;`base64url` | other encodings are [allowed](https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-validation-00#section-8.3) |

Note that the encoding indicated by `contentEncoding`, which inflates the size of data in order to represent it as 7-bit ASCII text, is unrelated to HTTP's `Content-Encoding` header, which indicates whether and how a message body has been compressed and is applied after all content serialization described in this section has occurred. Since HTTP allows unencoded binary message bodies, there is no standardized HTTP header for indicating base64 or similar encoding of an entire message body.

Using a `contentEncoding` of `base64url` ensures that URL encoding (as required in the query string and in message bodies of type `application/x-www-form-urlencoded`) does not need to further encode any part of the already-encoded binary data.

The `contentMediaType` keyword is redundant if the media type is already set:

* as the key for a [MediaType Object](#media-type-object)
* in the `contentType` field of an [Encoding Object](#encoding-object)

If the [Schema Object](#schema-object) will be processed by a non-OAS-aware JSON Schema implementation, it may be useful to include `contentMediaType` even if it is redundant. However, if `contentMediaType` contradicts a relevant Media Type Object or Encoding Object, then `contentMediaType` SHALL be ignored.

The `maxLength` keyword MAY be used to set an expected upper bound on the length of a streaming payload. The keyword can be applied to either string data, including encoded binary data, or to unencoded binary data. For unencoded binary, the length is the number of octets.

##### Migrating binary descriptions from OAS 3.0

The following table shows how to migrate from OAS 3.0 binary data descriptions, continuing to use `image/png` as the example binary media type:

| OAS < 3.1 | OAS >= 3.1 | Comments |
| ---- | ---- | ---- |
| <code style="white-space:nowrap">type: string</code><br /><code style="white-space:nowrap">format: binary</code> | <code style="white-space:nowrap">contentMediaType: image/png</code> | if redundant, can be omitted, often resulting in an empty [Schema Object](#schema-object) |
| <code style="white-space:nowrap">type: string</code><br /><code style="white-space:nowrap">format: byte</code> | <code style="white-space:nowrap">type: string</code><br /><code style="white-space:nowrap">contentMediaType: image/png</code><br /><code style="white-space:nowrap">contentEncoding: base64</code> | note that `base64url` can be used to avoid re-encoding the base64 string to be URL-safe |

### Rich Text Formatting

Throughout the specification `description` fields are noted as supporting CommonMark markdown formatting.
Where OpenAPI tooling renders rich text it MUST support, at a minimum, markdown syntax as described by [CommonMark 0.27](https://spec.commonmark.org/0.27/). Tooling MAY choose to ignore some CommonMark or extension features to address security concerns.

While the framing of CommonMark 0.27 as a minimum requirement means that tooling MAY choose to implement extensions on top of it, note that any such extensions are by definition implementation-defined and will not be interoperable.
OpenAPI Description authors SHOULD consider how text using such extensions will be rendered by tools that offer only the minimum support.

### Relative References in API Description URIs

URIs used as references within an OpenAPI Description, or to external documentation or other supplementary information such as a license, are resolved as _identifiers_, and described by this specification as **_URIs_**.
As noted under [Parsing Documents](#parsing-documents), this specification inherits JSON Schema Specification Draft 2020-12's requirements for [loading documents](https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-00#section-9) and associating them with their expected URIs, which might not match their current location.
This feature is used both for working in development or test environments without having to change the URIs, and for working within restrictive network configurations or security policies.

Note that some URI fields are named `url` for historical reasons, but the descriptive text for those fields uses the correct "URI" terminology.

Unless specified otherwise, all fields that are URIs MAY be relative references as defined by [RFC3986](https://tools.ietf.org/html/rfc3986#section-4.2).

Relative references in [Schema Objects](#schema-object), including any that appear as `$id` values, use the nearest parent `$id` as a Base URI, as described by [JSON Schema Specification Draft 2020-12](https://tools.ietf.org/html/draft-bhutton-json-schema-00#section-8.2).

Relative URI references in other Objects, and in Schema Objects where no parent schema contains an `$id`, MUST be resolved using the referring document's base URI, which is determined in accordance with [[RFC3986]] [Section 5.1.2 – 5.1.4](https://tools.ietf.org/html/rfc3986#section-5.1.2).
In practice, this is usually the retrieval URI of the document, which MAY be determined based on either its current actual location or a user-supplied expected location.

If a URI contains a fragment identifier, then the fragment should be resolved per the fragment resolution mechanism of the referenced document. If the representation of the referenced document is JSON or YAML, then the fragment identifier SHOULD be interpreted as a JSON-Pointer as per [RFC6901](https://tools.ietf.org/html/rfc6901).

Relative references in CommonMark hyperlinks are resolved in their rendered context, which might differ from the context of the API description.

### Relative References in API URLs

API endpoints are by definition accessed as locations, and are described by this specification as **_URLs_**.

Unless specified otherwise, all fields that are URLs MAY be relative references as defined by [RFC3986](https://tools.ietf.org/html/rfc3986#section-4.2).
Unless specified otherwise, relative references are resolved using the URLs defined in the [Server Object](#server-object) as a Base URL. Note that these themselves MAY be relative to the referring document.

### Schema

This section describes the structure of the OpenAPI Description format.
This text is the only normative description of the format.
A JSON Schema is hosted on [spec.openapis.org](https://spec.openapis.org) for informational purposes.
If the JSON Schema differs from this section, then this section MUST be considered authoritative.

In the following description, if a field is not explicitly **REQUIRED** or described with a MUST or SHALL, it can be considered OPTIONAL.

#### OpenAPI Object

This is the root object of the [OpenAPI Description](#openapi-description).

##### Fixed Fields

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="oas-version"></a>openapi | `string` | **REQUIRED**. This string MUST be the [version number](#versions) of the OpenAPI Specification that the OpenAPI Document uses. The `openapi` field SHOULD be used by tooling to interpret the OpenAPI Document. This is _not_ related to the API [`info.version`](#info-version) string. |
| <a name="oas-info"></a>info | [Info Object](#info-object) | **REQUIRED**. Provides metadata about the API. The metadata MAY be used by tooling as required. |
| <a name="oas-json-schema-dialect"></a> jsonSchemaDialect | `string` | The default value for the `$schema` keyword within [Schema Objects](#schema-object) contained within this OAS document. This MUST be in the form of a URI. |
| <a name="oas-servers"></a>servers | [[Server Object](#server-object)] | An array of Server Objects, which provide connectivity information to a target server. If the `servers` field is not provided, or is an empty array, the default value would be a [Server Object](#server-object) with a [url](#server-url) value of `/`. |
| <a name="oas-paths"></a>paths | [Paths Object](#paths-object) | The available paths and operations for the API. |
| <a name="oas-webhooks"></a>webhooks | Map[`string`, [Path Item Object](#path-item-object)] | The incoming webhooks that MAY be received as part of this API and that the API consumer MAY choose to implement. Closely related to the `callbacks` feature, this section describes requests initiated other than by an API call, for example by an out of band registration. The key name is a unique string to refer to each webhook, while the (optionally referenced) Path Item Object describes a request that may be initiated by the API provider and the expected responses. An [example](https://learn.openapis.org/examples/v3.1/webhook-example.html) is available. |
| <a name="oas-components"></a>components | [Components Object](#components-object) | An element to hold various Objects for the OpenAPI Description. |
| <a name="oas-security"></a>security | [[Security Requirement Object](#security-requirement-object)] | A declaration of which security mechanisms can be used across the API. The list of values includes alternative Security Requirement Objects that can be used. Only one of the Security Requirement Objects need to be satisfied to authorize a request. Individual operations can override this definition. The list can be incomplete, up to being empty or absent. To make security explicitly optional, an empty security requirement (`{}`) can be included in the array. |
| <a name="oas-tags"></a>tags | [[Tag Object](#tag-object)] | A list of tags used by the OpenAPI Description with additional metadata. The order of the tags can be used to reflect on their order by the parsing tools. Not all tags that are used by the [Operation Object](#operation-object) must be declared. The tags that are not declared MAY be organized randomly or based on the tools' logic. Each tag name in the list MUST be unique. |
| <a name="oas-external-docs"></a>externalDocs | [External Documentation Object](#external-documentation-object) | Additional external documentation. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

#### Info Object

The object provides metadata about the API.
The metadata MAY be used by the clients if needed, and MAY be presented in editing or documentation generation tools for convenience.

##### Fixed Fields

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="info-title"></a>title | `string` | **REQUIRED**. The title of the API. |
| <a name="info-summary"></a>summary | `string` | A short summary of the API. |
| <a name="info-description"></a>description | `string` | A description of the API. [CommonMark syntax](https://spec.commonmark.org/) MAY be used for rich text representation. |
| <a name="info-terms-of-service"></a>termsOfService | `string` | A URI for the Terms of Service for the API. This MUST be in the form of a URI. |
| <a name="info-contact"></a>contact | [Contact Object](#contact-object) | The contact information for the exposed API. |
| <a name="info-license"></a>license | [License Object](#license-object) | The license information for the exposed API. |
| <a name="info-version"></a>version | `string` | **REQUIRED**. The version of the OpenAPI Document (which is distinct from the [OpenAPI Specification version](#oas-version) or the version of the API being described or the version of the OpenAPI Description). |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Info Object Example

```json
{
  "title": "Example Pet Store App",
  "summary": "A pet store manager.",
  "description": "This is an example server for a pet store.",
  "termsOfService": "https://example.com/terms/",
  "contact": {
    "name": "API Support",
    "url": "https://www.example.com/support",
    "email": "support@example.com"
  },
  "license": {
    "name": "Apache 2.0",
    "url": "https://www.apache.org/licenses/LICENSE-2.0.html"
  },
  "version": "1.0.1"
}
```

```yaml
title: Example Pet Store App
summary: A pet store manager.
description: This is an example server for a pet store.
termsOfService: https://example.com/terms/
contact:
  name: API Support
  url: https://www.example.com/support
  email: support@example.com
license:
  name: Apache 2.0
  url: https://www.apache.org/licenses/LICENSE-2.0.html
version: 1.0.1
```

#### Contact Object

Contact information for the exposed API.

##### Fixed Fields

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="contact-name"></a>name | `string` | The identifying name of the contact person/organization. |
| <a name="contact-url"></a>url | `string` | The URI for the contact information. This MUST be in the form of a URI. |
| <a name="contact-email"></a>email | `string` | The email address of the contact person/organization. This MUST be in the form of an email address. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Contact Object Example

```json
{
  "name": "API Support",
  "url": "https://www.example.com/support",
  "email": "support@example.com"
}
```

```yaml
name: API Support
url: https://www.example.com/support
email: support@example.com
```

#### License Object

License information for the exposed API.

##### Fixed Fields

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="license-name"></a>name | `string` | **REQUIRED**. The license name used for the API. |
| <a name="license-identifier"></a>identifier | `string` | An [SPDX](https://spdx.org/licenses/) license expression for the API. The `identifier` field is mutually exclusive of the `url` field. |
| <a name="license-url"></a>url | `string` | A URI for the license used for the API. This MUST be in the form of a URI. The `url` field is mutually exclusive of the `identifier` field. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### License Object Example

```json
{
  "name": "Apache 2.0",
  "identifier": "Apache-2.0"
}
```

```yaml
name: Apache 2.0
identifier: Apache-2.0
```

#### Server Object

An object representing a Server.

##### Fixed Fields

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="server-url"></a>url | `string` | **REQUIRED**. A URL to the target host. This URL supports Server Variables and MAY be relative, to indicate that the host location is relative to the location where the document containing the Server Object is being served. Variable substitutions will be made when a variable is named in `{`braces`}`. |
| <a name="server-description"></a>description | `string` | An optional string describing the host designated by the URL. [CommonMark syntax](https://spec.commonmark.org/) MAY be used for rich text representation. |
| <a name="server-variables"></a>variables | Map[`string`, [Server Variable Object](#server-variable-object)] | A map between a variable name and its value. The value is used for substitution in the server's URL template. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Server Object Example

A single server would be described as:

```json
{
  "url": "https://development.gigantic-server.com/v1",
  "description": "Development server"
}
```

```yaml
url: https://development.gigantic-server.com/v1
description: Development server
```

The following shows how multiple servers can be described, for example, at the OpenAPI Object's [`servers`](#oas-servers):

```json
{
  "servers": [
    {
      "url": "https://development.gigantic-server.com/v1",
      "description": "Development server"
    },
    {
      "url": "https://staging.gigantic-server.com/v1",
      "description": "Staging server"
    },
    {
      "url": "https://api.gigantic-server.com/v1",
      "description": "Production server"
    }
  ]
}
```

```yaml
servers:
  - url: https://development.gigantic-server.com/v1
    description: Development server
  - url: https://staging.gigantic-server.com/v1
    description: Staging server
  - url: https://api.gigantic-server.com/v1
    description: Production server
```

The following shows how variables can be used for a server configuration:

```json
{
  "servers": [
    {
      "url": "https://{username}.gigantic-server.com:{port}/{basePath}",
      "description": "The production API server",
      "variables": {
        "username": {
          "default": "demo",
          "description": "A user-specific subdomain. Use `demo` for a free sandbox environment."
        },
        "port": {
          "enum": ["8443", "443"],
          "default": "8443"
        },
        "basePath": {
          "default": "v2"
        }
      }
    }
  ]
}
```

```yaml
servers:
  - url: https://{username}.gigantic-server.com:{port}/{basePath}
    description: The production API server
    variables:
      username:
        # note! no enum here means it is an open value
        default: demo
        description: A user-specific subdomain. Use `demo` for a free sandbox environment.
      port:
        enum:
          - '8443'
          - '443'
        default: '8443'
      basePath:
        # open meaning there is the opportunity to use special base paths as assigned by the provider, default is `v2`
        default: v2
```

#### Server Variable Object

An object representing a Server Variable for server URL template substitution.

The server URL templating is defined by the following [ABNF](https://tools.ietf.org/html/rfc5234) syntax.

```abnf
server-url-template  = 1*( literals / server-variable )
server-variable      = "{" server-variable-name "}"
server-variable-name = 1*( %x00-7A / %x7C / %x7E-10FFFF ) ; every UTF8 character except { and }

literals       = 1*( %x21 / %x23-24 / %x26-3B / %x3D / %x3F-5B
               / %x5D / %x5F / %x61-7A / %x7E / ucschar / iprivate
               / pct-encoded)
                    ; any Unicode character except: CTL, SP,
                    ;  DQUOTE, "%" (aside from pct-encoded),
                    ;  "<", ">", "\", "^", "`", "{", "|", "}"
pct-encoded    =  "%" HEXDIG HEXDIG
ucschar        =  %xA0-D7FF / %xF900-FDCF / %xFDF0-FFEF
               /  %x10000-1FFFD / %x20000-2FFFD / %x30000-3FFFD
               /  %x40000-4FFFD / %x50000-5FFFD / %x60000-6FFFD
               /  %x70000-7FFFD / %x80000-8FFFD / %x90000-9FFFD
               /  %xA0000-AFFFD / %xB0000-BFFFD / %xC0000-CFFFD
               /  %xD0000-DFFFD / %xE1000-EFFFD
iprivate       =  %xE000-F8FF / %xF0000-FFFFD / %x100000-10FFFD
```

Here, `literals`, `pct-encoded`, `ucschar` and `iprivate` definitions are taken from [RFC 6570](https://www.rfc-editor.org/rfc/rfc6570), incorporating the corrections specified in [Errata 6937](https://www.rfc-editor.org/errata/eid6937) for `literals`.

See the [Paths Object](#paths-object) for guidance on constructing full request URLs.

##### Fixed Fields

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="server-variable-enum"></a>enum | [`string`] | An enumeration of string values to be used if the substitution options are from a limited set. The array MUST NOT be empty. |
| <a name="server-variable-default"></a>default | `string` | **REQUIRED**. The default value to use for substitution, which SHALL be sent if an alternate value is _not_ supplied. If the [`enum`](#server-variable-enum) is defined, the value MUST exist in the enum's values. Note that this behavior is different from the [Schema Object](#schema-object)'s `default` keyword, which documents the receiver's behavior rather than inserting the value into the data. |
| <a name="server-variable-description"></a>description | `string` | An optional description for the server variable. [CommonMark syntax](https://spec.commonmark.org/) MAY be used for rich text representation. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

#### Components Object

Holds a set of reusable objects for different aspects of the OAS.
All objects defined within the Components Object will have no effect on the API unless they are explicitly referenced from outside the Components Object.

##### Fixed Fields

| Field Name | Type | Description |
| ---- | :---- | ---- |
| <a name="components-schemas"></a> schemas | Map[`string`, [Schema Object](#schema-object)] | An object to hold reusable [Schema Objects](#schema-object). |
| <a name="components-responses"></a> responses | Map[`string`, [Response Object](#response-object) \| [Reference Object](#reference-object)] | An object to hold reusable [Response Objects](#response-object). |
| <a name="components-parameters"></a> parameters | Map[`string`, [Parameter Object](#parameter-object) \| [Reference Object](#reference-object)] | An object to hold reusable [Parameter Objects](#parameter-object). |
| <a name="components-examples"></a> examples | Map[`string`, [Example Object](#example-object) \| [Reference Object](#reference-object)] | An object to hold reusable [Example Objects](#example-object). |
| <a name="components-request-bodies"></a> requestBodies | Map[`string`, [Request Body Object](#request-body-object) \| [Reference Object](#reference-object)] | An object to hold reusable [Request Body Objects](#request-body-object). |
| <a name="components-headers"></a> headers | Map[`string`, [Header Object](#header-object) \| [Reference Object](#reference-object)] | An object to hold reusable [Header Objects](#header-object). |
| <a name="security-scheme-object"></a> securitySchemes | Map[`string`, [Security Scheme Object](#security-scheme-object) \| [Reference Object](#reference-object)] | An object to hold reusable [Security Scheme Objects](#security-scheme-object). |
| <a name="components-links"></a> links | Map[`string`, [Link Object](#link-object) \| [Reference Object](#reference-object)] | An object to hold reusable [Link Objects](#link-object). |
| <a name="components-callbacks"></a> callbacks | Map[`string`, [Callback Object](#callback-object) \| [Reference Object](#reference-object)] | An object to hold reusable [Callback Objects](#callback-object). |
| <a name="components-path-items"></a> pathItems | Map[`string`, [Path Item Object](#path-item-object)] | An object to hold reusable [Path Item Objects](#path-item-object). |

This object MAY be extended with [Specification Extensions](#specification-extensions).

All the fixed fields declared above are objects that MUST use keys that match the regular expression: `^[a-zA-Z0-9\.\-_]+$`.

Field Name Examples:

```text
User
User_1
User_Name
user-name
my.org.User
```

##### Components Object Example

```json
"components": {
  "schemas": {
    "GeneralError": {
      "type": "object",
      "properties": {
        "code": {
          "type": "integer",
          "format": "int32"
        },
        "message": {
          "type": "string"
        }
      }
    },
    "Category": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "format": "int64"
        },
        "name": {
          "type": "string"
        }
      }
    },
    "Tag": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "format": "int64"
        },
        "name": {
          "type": "string"
        }
      }
    }
  },
  "parameters": {
    "skipParam": {
      "name": "skip",
      "in": "query",
      "description": "number of items to skip",
      "required": true,
      "schema": {
        "type": "integer",
        "format": "int32"
      }
    },
    "limitParam": {
      "name": "limit",
      "in": "query",
      "description": "max records to return",
      "required": true,
      "schema" : {
        "type": "integer",
        "format": "int32"
      }
    }
  },
  "responses": {
    "NotFound": {
      "description": "Entity not found."
    },
    "IllegalInput": {
      "description": "Illegal input for operation."
    },
    "GeneralError": {
      "description": "General Error",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/GeneralError"
          }
        }
      }
    }
  },
  "securitySchemes": {
    "api_key": {
      "type": "apiKey",
      "name": "api-key",
      "in": "header"
    },
    "petstore_auth": {
      "type": "oauth2",
      "flows": {
        "implicit": {
          "authorizationUrl": "https://example.org/api/oauth/dialog",
          "scopes": {
            "write:pets": "modify pets in your account",
            "read:pets": "read your pets"
          }
        }
      }
    }
  }
}
```

```yaml
components:
  schemas:
    GeneralError:
      type: object
      properties:
        code:
          type: integer
          format: int32
        message:
          type: string
    Category:
      type: object
      properties:
        id:
          type: integer
          format: int64
        name:
          type: string
    Tag:
      type: object
      properties:
        id:
          type: integer
          format: int64
        name:
          type: string
  parameters:
    skipParam:
      name: skip
      in: query
      description: number of items to skip
      required: true
      schema:
        type: integer
        format: int32
    limitParam:
      name: limit
      in: query
      description: max records to return
      required: true
      schema:
        type: integer
        format: int32
  responses:
    NotFound:
      description: Entity not found.
    IllegalInput:
      description: Illegal input for operation.
    GeneralError:
      description: General Error
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/GeneralError'
  securitySchemes:
    api_key:
      type: apiKey
      name: api-key
      in: header
    petstore_auth:
      type: oauth2
      flows:
        implicit:
          authorizationUrl: https://example.org/api/oauth/dialog
          scopes:
            write:pets: modify pets in your account
            read:pets: read your pets
```

#### Paths Object

Holds the relative paths to the individual endpoints and their operations.
The path is appended to the URL from the [Server Object](#server-object) in order to construct the full URL. The Paths Object MAY be empty, due to [Access Control List (ACL) constraints](#security-filtering).

##### Patterned Fields

| Field Pattern | Type | Description |
| ---- | :----: | ---- |
| <a name="paths-path"></a>/{path} | [Path Item Object](#path-item-object) | A relative path to an individual endpoint. The field name MUST begin with a forward slash (`/`). The path is **appended** (no relative URL resolution) to the expanded URL from the [Server Object](#server-object)'s `url` field in order to construct the full URL. [Path templating](#path-templating) is allowed. When matching URLs, concrete (non-templated) paths would be matched before their templated counterparts. Templated paths with the same hierarchy but different templated names MUST NOT exist as they are identical. In case of ambiguous matching, it's up to the tooling to decide which one to use. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Path Templating Matching

Assuming the following paths, the concrete definition, `/pets/mine`, will be matched first if used:

```text
  /pets/{petId}
  /pets/mine
```

The following paths are considered identical and invalid:

```text
  /pets/{petId}
  /pets/{name}
```

The following may lead to ambiguous resolution:

```text
  /{entity}/me
  /books/{id}
```

##### Paths Object Example

```json
{
  "/pets": {
    "get": {
      "description": "Returns all pets from the system that the user has access to",
      "responses": {
        "200": {
          "description": "A list of pets.",
          "content": {
            "application/json": {
              "schema": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/pet"
                }
              }
            }
          }
        }
      }
    }
  }
}
```

```yaml
/pets:
  get:
    description: Returns all pets from the system that the user has access to
    responses:
      '200':
        description: A list of pets.
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: '#/components/schemas/pet'
```

#### Path Item Object

Describes the operations available on a single path.
A Path Item MAY be empty, due to [ACL constraints](#security-filtering).
The path itself is still exposed to the documentation viewer but they will not know which operations and parameters are available.

##### Fixed Fields

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="path-item-ref"></a>$ref | `string` | Allows for a referenced definition of this path item. The value MUST be in the form of a URI, and the referenced structure MUST be in the form of a [Path Item Object](#path-item-object). In case a Path Item Object field appears both in the defined object and the referenced object, the behavior is undefined. See the rules for resolving [Relative References](#relative-references-in-api-description-uris). <br><br>_**Note:** The behavior of `$ref` with adjacent properties is likely to change in future versions of this specification to bring it into closer alignment with the behavior of the [Reference Object](#reference-object)._ |
| <a name="path-item-summary"></a>summary | `string` | An optional string summary, intended to apply to all operations in this path. |
| <a name="path-item-description"></a>description | `string` | An optional string description, intended to apply to all operations in this path. [CommonMark syntax](https://spec.commonmark.org/) MAY be used for rich text representation. |
| <a name="path-item-get"></a>get | [Operation Object](#operation-object) | A definition of a GET operation on this path. |
| <a name="path-item-put"></a>put | [Operation Object](#operation-object) | A definition of a PUT operation on this path. |
| <a name="path-item-post"></a>post | [Operation Object](#operation-object) | A definition of a POST operation on this path. |
| <a name="path-item-delete"></a>delete | [Operation Object](#operation-object) | A definition of a DELETE operation on this path. |
| <a name="path-item-options"></a>options | [Operation Object](#operation-object) | A definition of a OPTIONS operation on this path. |
| <a name="path-item-head"></a>head | [Operation Object](#operation-object) | A definition of a HEAD operation on this path. |
| <a name="path-item-patch"></a>patch | [Operation Object](#operation-object) | A definition of a PATCH operation on this path. |
| <a name="path-item-trace"></a>trace | [Operation Object](#operation-object) | A definition of a TRACE operation on this path. |
| <a name="path-item-servers"></a>servers | [[Server Object](#server-object)] | An alternative `servers` array to service all operations in this path. If a `servers` array is specified at the [OpenAPI Object](#oas-servers) level, it will be overridden by this value. |
| <a name="path-item-parameters"></a>parameters | [[Parameter Object](#parameter-object) \| [Reference Object](#reference-object)] | A list of parameters that are applicable for all the operations described under this path. These parameters can be overridden at the operation level, but cannot be removed there. The list MUST NOT include duplicated parameters. A unique parameter is defined by a combination of a [name](#parameter-name) and [location](#parameter-in). The list can use the [Reference Object](#reference-object) to link to parameters that are defined in the [OpenAPI Object's `components.parameters`](#components-parameters). |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Path Item Object Example

```json
{
  "get": {
    "description": "Returns pets based on ID",
    "summary": "Find pets by ID",
    "operationId": "getPetsById",
    "responses": {
      "200": {
        "description": "pet response",
        "content": {
          "*/*": {
            "schema": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/Pet"
              }
            }
          }
        }
      },
      "default": {
        "description": "error payload",
        "content": {
          "text/html": {
            "schema": {
              "$ref": "#/components/schemas/ErrorModel"
            }
          }
        }
      }
    }
  },
  "parameters": [
    {
      "name": "id",
      "in": "path",
      "description": "ID of pet to use",
      "required": true,
      "schema": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "style": "simple"
    }
  ]
}
```

```yaml
get:
  description: Returns pets based on ID
  summary: Find pets by ID
  operationId: getPetsById
  responses:
    '200':
      description: pet response
      content:
        '*/*':
          schema:
            type: array
            items:
              $ref: '#/components/schemas/Pet'
    default:
      description: error payload
      content:
        text/html:
          schema:
            $ref: '#/components/schemas/ErrorModel'
parameters:
  - name: id
    in: path
    description: ID of pet to use
    required: true
    schema:
      type: array
      items:
        type: string
    style: simple
```

#### Operation Object

Describes a single API operation on a path.

##### Fixed Fields

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="operation-tags"></a>tags | [`string`] | A list of tags for API documentation control. Tags can be used for logical grouping of operations by resources or any other qualifier. |
| <a name="operation-summary"></a>summary | `string` | A short summary of what the operation does. |
| <a name="operation-description"></a>description | `string` | A verbose explanation of the operation behavior. [CommonMark syntax](https://spec.commonmark.org/) MAY be used for rich text representation. |
| <a name="operation-external-docs"></a>externalDocs | [External Documentation Object](#external-documentation-object) | Additional external documentation for this operation. |
| <a name="operation-id"></a>operationId | `string` | Unique string used to identify the operation. The id MUST be unique among all operations described in the API. The operationId value is **case-sensitive**. Tools and libraries MAY use the operationId to uniquely identify an operation, therefore, it is RECOMMENDED to follow common programming naming conventions. |
| <a name="operation-parameters"></a>parameters | [[Parameter Object](#parameter-object) \| [Reference Object](#reference-object)] | A list of parameters that are applicable for this operation. If a parameter is already defined at the [Path Item](#path-item-parameters), the new definition will override it but can never remove it. The list MUST NOT include duplicated parameters. A unique parameter is defined by a combination of a [name](#parameter-name) and [location](#parameter-in). The list can use the [Reference Object](#reference-object) to link to parameters that are defined in the [OpenAPI Object's `components.parameters`](#components-parameters). |
| <a name="operation-request-body"></a>requestBody | [Request Body Object](#request-body-object) \| [Reference Object](#reference-object) | The request body applicable for this operation. The `requestBody` is fully supported in HTTP methods where the HTTP 1.1 specification [RFC7231](https://tools.ietf.org/html/rfc7231#section-4.3.1) has explicitly defined semantics for request bodies. In other cases where the HTTP spec is vague (such as [GET](https://tools.ietf.org/html/rfc7231#section-4.3.1), [HEAD](https://tools.ietf.org/html/rfc7231#section-4.3.2) and [DELETE](https://tools.ietf.org/html/rfc7231#section-4.3.5)), `requestBody` is permitted but does not have well-defined semantics and SHOULD be avoided if possible. |
| <a name="operation-responses"></a>responses | [Responses Object](#responses-object) | The list of possible responses as they are returned from executing this operation. |
| <a name="operation-callbacks"></a>callbacks | Map[`string`, [Callback Object](#callback-object) \| [Reference Object](#reference-object)] | A map of possible out-of band callbacks related to the parent operation. The key is a unique identifier for the Callback Object. Each value in the map is a [Callback Object](#callback-object) that describes a request that may be initiated by the API provider and the expected responses. |
| <a name="operation-deprecated"></a>deprecated | `boolean` | Declares this operation to be deprecated. Consumers SHOULD refrain from usage of the declared operation. Default value is `false`. |
| <a name="operation-security"></a>security | [[Security Requirement Object](#security-requirement-object)] | A declaration of which security mechanisms can be used for this operation. The list of values includes alternative Security Requirement Objects that can be used. Only one of the Security Requirement Objects need to be satisfied to authorize a request. To make security optional, an empty security requirement (`{}`) can be included in the array. This definition overrides any declared top-level [`security`](#oas-security). To remove a top-level security declaration, an empty array can be used. |
| <a name="operation-servers"></a>servers | [[Server Object](#server-object)] | An alternative `servers` array to service this operation. If a `servers` array is specified at the [Path Item Object](#path-item-servers) or [OpenAPI Object](#oas-servers) level, it will be overridden by this value. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Operation Object Example

```json
{
  "tags": ["pet"],
  "summary": "Updates a pet in the store with form data",
  "operationId": "updatePetWithForm",
  "parameters": [
    {
      "name": "petId",
      "in": "path",
      "description": "ID of pet that needs to be updated",
      "required": true,
      "schema": {
        "type": "string"
      }
    }
  ],
  "requestBody": {
    "content": {
      "application/x-www-form-urlencoded": {
        "schema": {
          "type": "object",
          "properties": {
            "name": {
              "description": "Updated name of the pet",
              "type": "string"
            },
            "status": {
              "description": "Updated status of the pet",
              "type": "string"
            }
          },
          "required": ["status"]
        }
      }
    }
  },
  "responses": {
    "200": {
      "description": "Pet updated.",
      "content": {
        "application/json": {},
        "application/xml": {}
      }
    },
    "405": {
      "description": "Method Not Allowed",
      "content": {
        "application/json": {},
        "application/xml": {}
      }
    }
  },
  "security": [
    {
      "petstore_auth": ["write:pets", "read:pets"]
    }
  ]
}
```

```yaml
tags:
  - pet
summary: Updates a pet in the store with form data
operationId: updatePetWithForm
parameters:
  - name: petId
    in: path
    description: ID of pet that needs to be updated
    required: true
    schema:
      type: string
requestBody:
  content:
    application/x-www-form-urlencoded:
      schema:
        type: object
        properties:
          name:
            description: Updated name of the pet
            type: string
          status:
            description: Updated status of the pet
            type: string
        required:
          - status
responses:
  '200':
    description: Pet updated.
    content:
      application/json: {}
      application/xml: {}
  '405':
    description: Method Not Allowed
    content:
      application/json: {}
      application/xml: {}
security:
  - petstore_auth:
      - write:pets
      - read:pets
```

#### External Documentation Object

Allows referencing an external resource for extended documentation.

##### Fixed Fields

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="external-doc-description"></a>description | `string` | A description of the target documentation. [CommonMark syntax](https://spec.commonmark.org/) MAY be used for rich text representation. |
| <a name="external-doc-url"></a>url | `string` | **REQUIRED**. The URI for the target documentation. This MUST be in the form of a URI. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### External Documentation Object Example

```json
{
  "description": "Find more info here",
  "url": "https://example.com"
}
```

```yaml
description: Find more info here
url: https://example.com
```

#### Parameter Object

Describes a single operation parameter.

A unique parameter is defined by a combination of a [name](#parameter-name) and [location](#parameter-in).

See [Appendix E](#appendix-e-percent-encoding-and-form-media-types) for a detailed examination of percent-encoding concerns, including interactions with the `application/x-www-form-urlencoded` query string format.

##### Parameter Locations

There are four possible parameter locations specified by the `in` field:

* path - Used together with [Path Templating](#path-templating), where the parameter value is actually part of the operation's URL. This does not include the host or base path of the API. For example, in `/items/{itemId}`, the path parameter is `itemId`.
* query - Parameters that are appended to the URL. For example, in `/items?id=###`, the query parameter is `id`.
* header - Custom headers that are expected as part of the request. Note that [RFC7230](https://tools.ietf.org/html/rfc7230#section-3.2) states header names are case insensitive.
* cookie - Used to pass a specific cookie value to the API.

##### Fixed Fields

The rules for serialization of the parameter are specified in one of two ways.
Parameter Objects MUST include either a `content` field or a `schema` field, but not both.
See [Appendix B](#appendix-b-data-type-conversion) for a discussion of converting values of various types to string representations.

###### Common Fixed Fields

These fields MAY be used with either `content` or `schema`.

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="parameter-name"></a>name | `string` | **REQUIRED**. The name of the parameter. Parameter names are _case sensitive_. <ul><li>If [`in`](#parameter-in) is `"path"`, the `name` field MUST correspond to a template expression occurring within the [path](#paths-path) field in the [Paths Object](#paths-object). See [Path Templating](#path-templating) for further information.<li>If [`in`](#parameter-in) is `"header"` and the `name` field is `"Accept"`, `"Content-Type"` or `"Authorization"`, the parameter definition SHALL be ignored.<li>For all other cases, the `name` corresponds to the parameter name used by the [`in`](#parameter-in) field.</ul> |
| <a name="parameter-in"></a>in | `string` | **REQUIRED**. The location of the parameter. Possible values are `"query"`, `"header"`, `"path"` or `"cookie"`. |
| <a name="parameter-description"></a>description | `string` | A brief description of the parameter. This could contain examples of use. [CommonMark syntax](https://spec.commonmark.org/) MAY be used for rich text representation. |
| <a name="parameter-required"></a>required | `boolean` | Determines whether this parameter is mandatory. If the [parameter location](#parameter-in) is `"path"`, this field is **REQUIRED** and its value MUST be `true`. Otherwise, the field MAY be included and its default value is `false`. |
| <a name="parameter-deprecated"></a> deprecated | `boolean` | Specifies that a parameter is deprecated and SHOULD be transitioned out of usage. Default value is `false`. |
| <a name="parameter-allow-empty-value"></a> allowEmptyValue | `boolean` | If `true`, clients MAY pass a zero-length string value in place of parameters that would otherwise be omitted entirely, which the server SHOULD interpret as the parameter being unused. Default value is `false`. If [`style`](#parameter-style) is used, and if [behavior is _n/a_ (cannot be serialized)](#style-examples), the value of `allowEmptyValue` SHALL be ignored. Interactions between this field and the parameter's [Schema Object](#schema-object) are implementation-defined. This field is valid only for `query` parameters. Use of this field is NOT RECOMMENDED, and it is likely to be removed in a later revision. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

Note that while `"Cookie"` as a `name` is not forbidden if `in` is `"header"`, the effect of defining a cookie parameter that way is undefined; use `in: "cookie"` instead.

###### Fixed Fields for use with `schema`

For simpler scenarios, a [`schema`](#parameter-schema) and [`style`](#parameter-style) can describe the structure and syntax of the parameter.
When `example` or `examples` are provided in conjunction with the `schema` field, the example SHOULD match the specified schema and follow the prescribed serialization strategy for the parameter.
The `example` and `examples` fields are mutually exclusive, and if either is present it SHALL _override_ any `example` in the schema.

Serializing with `schema` is NOT RECOMMENDED for `in: "cookie"` parameters, `in: "header"` parameters that use HTTP header parameters (name=value pairs following a `;`) in their values, or `in: "header"` parameters where values might have non-URL-safe characters; see [Appendix D](#appendix-d-serializing-headers-and-cookies) for details.

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="parameter-style"></a>style | `string` | Describes how the parameter value will be serialized depending on the type of the parameter value. Default values (based on value of `in`): for `"query"` - `"form"`; for `"path"` - `"simple"`; for `"header"` - `"simple"`; for `"cookie"` - `"form"`. |
| <a name="parameter-explode"></a>explode | `boolean` | When this is true, parameter values of type `array` or `object` generate separate parameters for each value of the array or key-value pair of the map. For other types of parameters this field has no effect. When [`style`](#parameter-style) is `"form"`, the default value is `true`. For all other styles, the default value is `false`. Note that despite `false` being the default for `deepObject`, the combination of `false` with `deepObject` is undefined. |
| <a name="parameter-allow-reserved"></a>allowReserved | `boolean` | When this is true, parameter values are serialized using reserved expansion, as defined by [RFC6570](https://datatracker.ietf.org/doc/html/rfc6570#section-3.2.3), which allows [RFC3986's reserved character set](https://datatracker.ietf.org/doc/html/rfc3986#section-2.2), as well as percent-encoded triples, to pass through unchanged, while still percent-encoding all other disallowed characters (including `%` outside of percent-encoded triples). Applications are still responsible for percent-encoding reserved characters that are [not allowed in the query string](https://datatracker.ietf.org/doc/html/rfc3986#section-3.4) (`[`, `]`, `#`), or have a special meaning in `application/x-www-form-urlencoded` (`-`, `&`, `+`); see Appendices [C](#appendix-c-using-rfc6570-based-serialization) and [E](#appendix-e-percent-encoding-and-form-media-types) for details. This field only applies to parameters with an `in` value of `query`. The default value is `false`. |
| <a name="parameter-schema"></a>schema | [Schema Object](#schema-object) | The schema defining the type used for the parameter. |
| <a name="parameter-example"></a>example | Any | Example of the parameter's potential value; see [Working With Examples](#working-with-examples). |
| <a name="parameter-examples"></a>examples | Map[ `string`, [Example Object](#example-object) \| [Reference Object](#reference-object)] | Examples of the parameter's potential value; see [Working With Examples](#working-with-examples). |

See also [Appendix C: Using RFC6570-Based Serialization](#appendix-c-using-rfc6570-based-serialization) for additional guidance.

###### Fixed Fields for use with `content`

For more complex scenarios, the [`content`](#parameter-content) field can define the media type and schema of the parameter, as well as give examples of its use.
Using `content` with a `text/plain` media type is RECOMMENDED for `in: "header"` and `in: "cookie"` parameters where the `schema` strategy is not appropriate.

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="parameter-content"></a>content | Map[`string`, [Media Type Object](#media-type-object)] | A map containing the representations for the parameter. The key is the media type and the value describes it. The map MUST only contain one entry. |

##### Style Values

In order to support common ways of serializing simple parameters, a set of `style` values are defined.

| `style` | [`type`](#data-types) | `in` | Comments |
| ---- | ---- | ---- | ---- |
| matrix | `primitive`, `array`, `object` | `path` | Path-style parameters defined by [RFC6570](https://tools.ietf.org/html/rfc6570#section-3.2.7) |
| label | `primitive`, `array`, `object` | `path` | Label style parameters defined by [RFC6570](https://tools.ietf.org/html/rfc6570#section-3.2.5) |
| simple | `primitive`, `array`, `object` | `path`, `header` | Simple style parameters defined by [RFC6570](https://tools.ietf.org/html/rfc6570#section-3.2.2). This option replaces `collectionFormat` with a `csv` value from OpenAPI 2.0. |
| form | `primitive`, `array`, `object` | `query`, `cookie` | Form style parameters defined by [RFC6570](https://tools.ietf.org/html/rfc6570#section-3.2.8). This option replaces `collectionFormat` with a `csv` (when `explode` is false) or `multi` (when `explode` is true) value from OpenAPI 2.0. |
| spaceDelimited | `array`, `object` | `query` | Space separated array values or object properties and values. This option replaces `collectionFormat` equal to `ssv` from OpenAPI 2.0. |
| pipeDelimited | `array`, `object` | `query` | Pipe separated array values or object properties and values. This option replaces `collectionFormat` equal to `pipes` from OpenAPI 2.0. |
| deepObject | `object` | `query` | Allows objects with scalar properties to be represented using form parameters. The representation of array or object properties is not defined. |

See [Appendix E](#appendix-e-percent-encoding-and-form-media-types) for a discussion of percent-encoding, including when delimiters need to be percent-encoded and options for handling collisions with percent-encoded data.

##### Style Examples

Assume a parameter named `color` has one of the following values:

```js
   string -> "blue"
   array -> ["blue", "black", "brown"]
   object -> { "R": 100, "G": 200, "B": 150 }
```

The following table shows examples, as would be shown with the `example` or `examples` keywords, of the different serializations for each value.

* The value _empty_ denotes the empty string, and is unrelated to the `allowEmptyValue` field
* The behavior of combinations marked _n/a_ is undefined
* The `undefined` column replaces the `empty` column in previous versions of this specification in order to better align with [RFC6570](https://www.rfc-editor.org/rfc/rfc6570.html#section-2.3) terminology, which describes certain values including but not limited to `null` as "undefined" values with special handling; notably, the empty string is _not_ undefined
* For `form` and the non-RFC6570 query string styles `spaceDelimited`, `pipeDelimited`, and `deepObject`, each example is shown prefixed with `?` as if it were the only query parameter; see [Appendix C](#appendix-c-using-rfc6570-based-serialization) for more information on constructing query strings from multiple parameters, and [Appendix D](#appendix-d-serializing-headers-and-cookies) for warnings regarding `form` and cookie parameters
* Note that the `?` prefix is not appropriate for serializing `application/x-www-form-urlencoded` HTTP message bodies, and MUST be stripped or (if constructing the string manually) not added when used in that context; see the [Encoding Object](#encoding-object) for more information
* The examples are percent-encoded as required by RFC6570 and RFC3986; see [Appendix E](#appendix-e-percent-encoding-and-form-media-types) for a thorough discussion of percent-encoding concerns, including why unencoded `|` (`%7C`), `[` (`%5B`), and `]` (`%5D`) seem to work in some environments despite not being compliant.

| [`style`](#style-values) | `explode` | `undefined` | `string` | `array` | `object` |
| ---- | ---- | ---- | ---- | ---- | ---- |
| matrix | false | ;color | ;color=blue | ;color=blue,black,brown | ;color=R,100,G,200,B,150 |
| matrix | true | ;color | ;color=blue | ;color=blue;color=black;color=brown | ;R=100;G=200;B=150 |
| label | false | . | .blue | .blue,black,brown | .R,100,G,200,B,150 |
| label | true | . | .blue | .blue.black.brown | .R=100.G=200.B=150 |
| simple | false | _empty_ | blue | blue,black,brown | R,100,G,200,B,150 |
| simple | true | _empty_ | blue | blue,black,brown | R=100,G=200,B=150 |
| form | false | <span style="white-space: nowrap;">?color=</span> | <span style="white-space: nowrap;">?color=blue</span> | <span style="white-space: nowrap;">?color=blue,black,brown</span> | <span style="white-space: nowrap;">?color=R,100,G,200,B,150</span> |
| form | true | <span style="white-space: nowrap;">?color=</span> | <span style="white-space: nowrap;">?color=blue</span> | <span style="white-space: nowrap;">?color=blue&color=black&color=brown</span> | <span style="white-space: nowrap;">?R=100&G=200&B=150</span> |
| spaceDelimited</span> | false | _n/a_ | _n/a_ | <span style="white-space: nowrap;">?color=blue%20black%20brown</span> | <span style="white-space: nowrap;">?color=R%20100%20G%20200%20B%20150</span> |
| spaceDelimited | true | _n/a_ | _n/a_ | _n/a_ | _n/a_ |
| pipeDelimited | false | _n/a_ | _n/a_ | <span style="white-space: nowrap;">?color=blue%7Cblack%7Cbrown</span> | <span style="white-space: nowrap;">?color=R%7C100%7CG%7C200%7CB%7C150</span> |
| pipeDelimited | true | _n/a_ | _n/a_ | _n/a_ | _n/a_ |
| deepObject | false | _n/a_ | _n/a_ | _n/a_ | _n/a_ |
| deepObject | true | _n/a_ | _n/a_ | _n/a_ | <span style="white-space: nowrap;">?color%5BR%5D=100&color%5BG%5D=200&color%5BB%5D=150</span> |

##### Parameter Object Examples

A header parameter with an array of 64-bit integer numbers:

```json
{
  "name": "token",
  "in": "header",
  "description": "token to be passed as a header",
  "required": true,
  "schema": {
    "type": "array",
    "items": {
      "type": "integer",
      "format": "int64"
    }
  },
  "style": "simple"
}
```

```yaml
name: token
in: header
description: token to be passed as a header
required: true
schema:
  type: array
  items:
    type: integer
    format: int64
style: simple
```

A path parameter of a string value:

```json
{
  "name": "username",
  "in": "path",
  "description": "username to fetch",
  "required": true,
  "schema": {
    "type": "string"
  }
}
```

```yaml
name: username
in: path
description: username to fetch
required: true
schema:
  type: string
```

An optional query parameter of a string value, allowing multiple values by repeating the query parameter:

```json
{
  "name": "id",
  "in": "query",
  "description": "ID of the object to fetch",
  "required": false,
  "schema": {
    "type": "array",
    "items": {
      "type": "string"
    }
  },
  "style": "form",
  "explode": true
}
```

```yaml
name: id
in: query
description: ID of the object to fetch
required: false
schema:
  type: array
  items:
    type: string
style: form
explode: true
```

A free-form query parameter, allowing undefined parameters of a specific type:

```json
{
  "in": "query",
  "name": "freeForm",
  "schema": {
    "type": "object",
    "additionalProperties": {
      "type": "integer"
    }
  },
  "style": "form"
}
```

```yaml
in: query
name: freeForm
schema:
  type: object
  additionalProperties:
    type: integer
style: form
```

A complex parameter using `content` to define serialization:

```json
{
  "in": "query",
  "name": "coordinates",
  "content": {
    "application/json": {
      "schema": {
        "type": "object",
        "required": ["lat", "long"],
        "properties": {
          "lat": {
            "type": "number"
          },
          "long": {
            "type": "number"
          }
        }
      }
    }
  }
}
```

```yaml
in: query
name: coordinates
content:
  application/json:
    schema:
      type: object
      required:
        - lat
        - long
      properties:
        lat:
          type: number
        long:
          type: number
```

#### Request Body Object

Describes a single request body.

##### Fixed Fields

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="request-body-description"></a>description | `string` | A brief description of the request body. This could contain examples of use. [CommonMark syntax](https://spec.commonmark.org/) MAY be used for rich text representation. |
| <a name="request-body-content"></a>content | Map[`string`, [Media Type Object](#media-type-object)] | **REQUIRED**. The content of the request body. The key is a media type or [media type range](https://tools.ietf.org/html/rfc7231#appendix-D) and the value describes it. For requests that match multiple keys, only the most specific key is applicable. e.g. `"text/plain"` overrides `"text/*"` |
| <a name="request-body-required"></a>required | `boolean` | Determines if the request body is required in the request. Defaults to `false`. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Request Body Examples

A request body with a referenced schema definition.

```json
{
  "description": "user to add to the system",
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/User"
      },
      "examples": {
        "user": {
          "summary": "User Example",
          "externalValue": "https://foo.bar/examples/user-example.json"
        }
      }
    },
    "application/xml": {
      "schema": {
        "$ref": "#/components/schemas/User"
      },
      "examples": {
        "user": {
          "summary": "User example in XML",
          "externalValue": "https://foo.bar/examples/user-example.xml"
        }
      }
    },
    "text/plain": {
      "examples": {
        "user": {
          "summary": "User example in Plain text",
          "externalValue": "https://foo.bar/examples/user-example.txt"
        }
      }
    },
    "*/*": {
      "examples": {
        "user": {
          "summary": "User example in other format",
          "externalValue": "https://foo.bar/examples/user-example.whatever"
        }
      }
    }
  }
}
```

```yaml
description: user to add to the system
content:
  application/json:
    schema:
      $ref: '#/components/schemas/User'
    examples:
      user:
        summary: User example
        externalValue: https://foo.bar/examples/user-example.json
  application/xml:
    schema:
      $ref: '#/components/schemas/User'
    examples:
      user:
        summary: User example in XML
        externalValue: https://foo.bar/examples/user-example.xml
  text/plain:
    examples:
      user:
        summary: User example in plain text
        externalValue: https://foo.bar/examples/user-example.txt
  '*/*':
    examples:
      user:
        summary: User example in other format
        externalValue: https://foo.bar/examples/user-example.whatever
```

#### Media Type Object

Each Media Type Object provides schema and examples for the media type identified by its key.

When `example` or `examples` are provided, the example SHOULD match the specified schema and be in the correct format as specified by the media type and its encoding.
The `example` and `examples` fields are mutually exclusive, and if either is present it SHALL _override_ any `example` in the schema.
See [Working With Examples](#working-with-examples) for further guidance regarding the different ways of specifying examples, including non-JSON/YAML values.

##### Fixed Fields

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="media-type-schema"></a>schema | [Schema Object](#schema-object) | The schema defining the content of the request, response, parameter, or header. |
| <a name="media-type-example"></a>example | Any | Example of the media type; see [Working With Examples](#working-with-examples). |
| <a name="media-type-examples"></a>examples | Map[ `string`, [Example Object](#example-object) \| [Reference Object](#reference-object)] | Examples of the media type; see [Working With Examples](#working-with-examples). |
| <a name="media-type-encoding"></a>encoding | Map[`string`, [Encoding Object](#encoding-object)] | A map between a property name and its encoding information. The key, being the property name, MUST exist in the schema as a property. The `encoding` field SHALL only apply to [Request Body Objects](#request-body-object), and only when the media type is `multipart` or `application/x-www-form-urlencoded`. If no Encoding Object is provided for a property, the behavior is determined by the default values documented for the Encoding Object. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Media Type Examples

```json
{
  "application/json": {
    "schema": {
      "$ref": "#/components/schemas/Pet"
    },
    "examples": {
      "cat": {
        "summary": "An example of a cat",
        "value": {
          "name": "Fluffy",
          "petType": "Cat",
          "color": "White",
          "gender": "male",
          "breed": "Persian"
        }
      },
      "dog": {
        "summary": "An example of a dog with a cat's name",
        "value": {
          "name": "Puma",
          "petType": "Dog",
          "color": "Black",
          "gender": "Female",
          "breed": "Mixed"
        }
      },
      "frog": {
        "$ref": "#/components/examples/frog-example"
      }
    }
  }
}
```

```yaml
application/json:
  schema:
    $ref: '#/components/schemas/Pet'
  examples:
    cat:
      summary: An example of a cat
      value:
        name: Fluffy
        petType: Cat
        color: White
        gender: male
        breed: Persian
    dog:
      summary: An example of a dog with a cat's name
      value:
        name: Puma
        petType: Dog
        color: Black
        gender: Female
        breed: Mixed
    frog:
      $ref: '#/components/examples/frog-example'
```

##### Considerations for File Uploads

In contrast to OpenAPI 2.0, `file` input/output content in OAS 3.x is described with the same semantics as any other schema type.

In contrast to OAS 3.0, the `format` keyword has no effect on the content-encoding of the schema in OAS 3.1. Instead, JSON Schema's `contentEncoding` and `contentMediaType` keywords are used. See [Working With Binary Data](#working-with-binary-data) for how to model various scenarios with these keywords, and how to migrate from the previous `format` usage.

Examples:

Content transferred in binary (octet-stream) MAY omit `schema`:

```yaml
# a PNG image as a binary file:
content:
  image/png: {}
```

```yaml
# an arbitrary binary file:
content:
  application/octet-stream: {}
```

```yaml
# arbitrary JSON without constraints beyond being syntactically valid:
content:
  application/json: {}
```

These examples apply to either input payloads of file uploads or response payloads.

A `requestBody` for submitting a file in a `POST` operation may look like the following example:

```yaml
requestBody:
  content:
    application/octet-stream: {}
```

In addition, specific media types MAY be specified:

```yaml
# multiple, specific media types may be specified:
requestBody:
  content:
    # a binary file of type png or jpeg
    image/jpeg: {}
    image/png: {}
```

To upload multiple files, a `multipart` media type MUST be used as shown under [Example: Multipart Form with Multiple Files](#example-multipart-form-with-multiple-files).

##### Support for x-www-form-urlencoded Request Bodies

See [Encoding the `x-www-form-urlencoded` Media Type](#encoding-the-x-www-form-urlencoded-media-type) for guidance and examples, both with and without the `encoding` field.

##### Special Considerations for `multipart` Content

See [Encoding `multipart` Media Types](#encoding-multipart-media-types) for further guidance and examples, both with and without the `encoding` field.

#### Encoding Object

A single encoding definition applied to a single schema property.
See [Appendix B](#appendix-b-data-type-conversion) for a discussion of converting values of various types to string representations.

Properties are correlated with `multipart` parts using the [`name` parameter](https://www.rfc-editor.org/rfc/rfc7578#section-4.2) of `Content-Disposition: form-data`, and with `application/x-www-form-urlencoded` using the query string parameter names.
In both cases, their order is implementation-defined.

See [Appendix E](#appendix-e-percent-encoding-and-form-media-types) for a detailed examination of percent-encoding concerns for form media types.

##### Fixed Fields

###### Common Fixed Fields

These fields MAY be used either with or without the RFC6570-style serialization fields defined in the next section below.

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="encoding-content-type"></a>contentType | `string` | The `Content-Type` for encoding a specific property. The value is a comma-separated list, each element of which is either a specific media type (e.g. `image/png`) or a wildcard media type (e.g. `image/*`). Default value depends on the property type as shown in the table below. |
| <a name="encoding-headers"></a>headers | Map[`string`, [Header Object](#header-object) \| [Reference Object](#reference-object)] | A map allowing additional information to be provided as headers. `Content-Type` is described separately and SHALL be ignored in this section. This field SHALL be ignored if the request body media type is not a `multipart`. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

The default values for `contentType` are as follows, where an _n/a_ in the `contentEncoding` column means that the presence or value of `contentEncoding` is irrelevant:

| `type` | `contentEncoding` | Default `contentType` |
| ---- | ---- | ---- |
| [_absent_](#working-with-binary-data) | _n/a_ | `application/octet-stream` |
| `string` | _present_ | `application/octet-stream` |
| `string` | _absent_ | `text/plain` |
| `number`, `integer`, or `boolean` | _n/a_ | `text/plain` |
| `object` | _n/a_ | `application/json` |
| `array` | _n/a_ | according to the `type` of the `items` schema |

Determining how to handle a `type` value of `null` depends on how `null` values are being serialized.
If `null` values are entirely omitted, then the `contentType` is irrelevant.
See [Appendix B](#appendix-b-data-type-conversion) for a discussion of data type conversion options.

###### Fixed Fields for RFC6570-style Serialization

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="encoding-style"></a>style | `string` | Describes how a specific property value will be serialized depending on its type. See [Parameter Object](#parameter-object) for details on the [`style`](#parameter-style) field. The behavior follows the same values as `query` parameters, including default values. Note that the initial `?` used in query strings is not used in `application/x-www-form-urlencoded` message bodies, and MUST be removed (if using an RFC6570 implementation) or simply not added (if constructing the string manually). This field SHALL be ignored if the request body media type is not `application/x-www-form-urlencoded` or `multipart/form-data`. If a value is explicitly defined, then the value of [`contentType`](#encoding-content-type) (implicit or explicit) SHALL be ignored. |
| <a name="encoding-explode"></a>explode | `boolean` | When this is true, property values of type `array` or `object` generate separate parameters for each value of the array, or key-value-pair of the map. For other types of properties this field has no effect. When [`style`](#encoding-style) is `"form"`, the default value is `true`. For all other styles, the default value is `false`. Note that despite `false` being the default for `deepObject`, the combination of `false` with `deepObject` is undefined. This field SHALL be ignored if the request body media type is not `application/x-www-form-urlencoded` or `multipart/form-data`. If a value is explicitly defined, then the value of [`contentType`](#encoding-content-type) (implicit or explicit) SHALL be ignored. |
| <a name="encoding-allow-reserved"></a>allowReserved | `boolean` | When this is true, parameter values are serialized using reserved expansion, as defined by [RFC6570](https://datatracker.ietf.org/doc/html/rfc6570#section-3.2.3), which allows [RFC3986's reserved character set](https://datatracker.ietf.org/doc/html/rfc3986#section-2.2), as well as percent-encoded triples, to pass through unchanged, while still percent-encoding all other disallowed characters (including `%` outside of percent-encoded triples). Applications are still responsible for percent-encoding reserved characters that are [not allowed in the query string](https://datatracker.ietf.org/doc/html/rfc3986#section-3.4) (`[`, `]`, `#`), or have a special meaning in `application/x-www-form-urlencoded` (`-`, `&`, `+`); see Appendices [C](#appendix-c-using-rfc6570-based-serialization) and [E](#appendix-e-percent-encoding-and-form-media-types) for details. The default value is `false`. This field SHALL be ignored if the request body media type is not `application/x-www-form-urlencoded` or `multipart/form-data`. If a value is explicitly defined, then the value of [`contentType`](#encoding-content-type) (implicit or explicit) SHALL be ignored. |

See also [Appendix C: Using RFC6570 Implementations](#appendix-c-using-rfc6570-based-serialization) for additional guidance, including on difficulties caused by the interaction between RFC6570's percent-encoding rules and the `multipart/form-data` media type.

Note that the presence of at least one of `style`, `explode`, or `allowReserved` with an explicit value is equivalent to using `schema` with `in: "query"` Parameter Objects.
The absence of all three of those fields is the equivalent of using `content`, but with the media type specified in `contentType` rather than through a Media Type Object.

##### Encoding the `x-www-form-urlencoded` Media Type

To submit content using form url encoding via [RFC1866](https://tools.ietf.org/html/rfc1866), use the `application/x-www-form-urlencoded` media type in the [Media Type Object](#media-type-object) under the [Request Body Object](#request-body-object).
This configuration means that the request body MUST be encoded per [RFC1866](https://tools.ietf.org/html/rfc1866) when passed to the server, after any complex objects have been serialized to a string representation.

See [Appendix E](#appendix-e-percent-encoding-and-form-media-types) for a detailed examination of percent-encoding concerns for form media types.

###### Example: URL Encoded Form with JSON Values

When there is no [`encoding`](#media-type-encoding) field, the serialization strategy is based on the Encoding Object's default values:

```yaml
requestBody:
  content:
    application/x-www-form-urlencoded:
      schema:
        type: object
        properties:
          id:
            type: string
            format: uuid
          address:
            # complex types are stringified to support RFC 1866
            type: object
            properties: {}
```

With this example, consider an `id` of `f81d4fae-7dec-11d0-a765-00a0c91e6bf6` and a US-style address (with ZIP+4) as follows:

```json
{
  "streetAddress": "123 Example Dr.",
  "city": "Somewhere",
  "state": "CA",
  "zip": "99999+1234"
}
```

Assuming the most compact representation of the JSON value (with unnecessary whitespace removed), we would expect to see the following request body, where space characters have been replaced with `+` and `+`, `"`, `{`, and `}` have been percent-encoded to `%2B`, `%22`, `%7B`, and `%7D`, respectively:

```uri
id=f81d4fae-7dec-11d0-a765-00a0c91e6bf6&address=%7B%22streetAddress%22:%22123+Example+Dr.%22,%22city%22:%22Somewhere%22,%22state%22:%22CA%22,%22zip%22:%2299999%2B1234%22%7D
```

Note that the `id` keyword is treated as `text/plain` per the [Encoding Object](#encoding-object)'s default behavior, and is serialized as-is.
If it were treated as `application/json`, then the serialized value would be a JSON string including quotation marks, which would be percent-encoded as `%22`.

Here is the `id` parameter (without `address`) serialized as `application/json` instead of `text/plain`, and then encoded per RFC1866:

```uri
id=%22f81d4fae-7dec-11d0-a765-00a0c91e6bf6%22
```

###### Example: URL Encoded Form with Binary Values

Note that `application/x-www-form-urlencoded` is a text format, which requires base64-encoding any binary data:

```YAML
requestBody:
  content:
    application/x-www-form-urlencoded:
      schema:
        type: object
        properties:
          name:
            type: string
          icon:
            # The default with "contentEncoding" is application/octet-stream,
            # so we need to set image media type(s) in the Encoding Object.
            type: string
            contentEncoding: base64url
  encoding:
    icon:
      contentType: image/png, image/jpeg
```

Given a name of `example` and a solid red 2x2-pixel PNG for `icon`, this
would produce a request body of:

```uri
name=example&icon=iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAABGdBTUEAALGPC_xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAAqADAAQAAAABAAAAAgAAAADO0J6QAAAAEElEQVQIHWP8zwACTGCSAQANHQEDqtPptQAAAABJRU5ErkJggg%3D%3D
```

Note that the `=` padding characters at the end need to be percent-encoded, even with the "URL safe" `contentEncoding: base64url`.
Some base64-decoding implementations may be able to use the string without the padding per [RFC4648](https://datatracker.ietf.org/doc/html/rfc4648#section-3.2).
However, this is not guaranteed, so it may be more interoperable to keep the padding and rely on percent-decoding.

##### Encoding `multipart` Media Types

It is common to use `multipart/form-data` as a `Content-Type` when transferring forms as request bodies. In contrast to OpenAPI 2.0, a `schema` is REQUIRED to define the input parameters to the operation when using `multipart` content. This supports complex structures as well as supporting mechanisms for multiple file uploads.

The `form-data` disposition and its `name` parameter are mandatory for `multipart/form-data` ([RFC7578](https://www.rfc-editor.org/rfc/rfc7578.html#section-4.2)).
Array properties are handled by applying the same `name` to multiple parts, as is recommended by [RFC7578](https://www.rfc-editor.org/rfc/rfc7578.html#section-4.3) for supplying multiple values per form field.
See [RFC7578](https://www.rfc-editor.org/rfc/rfc7578.html#section-5) for guidance regarding non-ASCII part names.

Various other `multipart` types, most notable `multipart/mixed` ([RFC2046](https://www.rfc-editor.org/rfc/rfc2046.html#section-5.1.3)) neither require nor forbid specific `Content-Disposition` values, which means care must be taken to ensure that any values used are supported by all relevant software.
It is not currently possible to correlate schema properties with unnamed, ordered parts in media types such as `multipart/mixed`, but implementations MAY choose to support such types when `Content-Disposition: form-data` is used with a `name` parameter.

Note that there are significant restrictions on what headers can be used with `multipart` media types in general ([RFC2046](https://www.rfc-editor.org/rfc/rfc2046.html#section-5.1)) and `multi-part/form-data` in particular ([RFC7578](https://www.rfc-editor.org/rfc/rfc7578.html#section-4.8)).

Note also that `Content-Transfer-Encoding` is deprecated for `multipart/form-data` ([RFC7578](https://www.rfc-editor.org/rfc/rfc7578.html#section-4.7)) where binary data is supported, as it is in HTTP.

+Using `contentEncoding` for a multipart field is equivalent to specifying an [Encoding Object](#encoding-object) with a `headers` field containing `Content-Transfer-Encoding` with a schema that requires the value used in `contentEncoding`.
+If `contentEncoding` is used for a multipart field that has an Encoding Object with a `headers` field containing `Content-Transfer-Encoding` with a schema that disallows the value from `contentEncoding`, the result is undefined for serialization and parsing.

Note that as stated in [Working with Binary Data](#working-with-binary-data), if the Encoding Object's `contentType`, whether set explicitly or implicitly through its default value rules, disagrees with the `contentMediaType` in a Schema Object, the `contentMediaType` SHALL be ignored.
Because of this, and because the Encoding Object's `contentType` defaulting rules do not take the Schema Object's`contentMediaType` into account, the use of `contentMediaType` with an Encoding Object is NOT RECOMMENDED.

See [Appendix E](#appendix-e-percent-encoding-and-form-media-types) for a detailed examination of percent-encoding concerns for form media types.

###### Example: Basic Multipart Form

When the `encoding` field is _not_ used, the encoding is determined by the Encoding Object's defaults:

```yaml
requestBody:
  content:
    multipart/form-data:
      schema:
        type: object
        properties:
          id:
            # default for primitives without a special format is text/plain
            type: string
            format: uuid
          profileImage:
            # default for string with binary format is `application/octet-stream`
            type: string
            format: binary
          addresses:
            # default for arrays is based on the type in the `items`
            # subschema, which is an object, so `application/json`
            type: array
            items:
              $ref: '#/components/schemas/Address'
```

###### Example: Multipart Form with Encoding Objects

Using `encoding`, we can set more specific types for binary data, or non-JSON formats for complex values.
We can also describe headers for each part:

```yaml
requestBody:
  content:
    multipart/form-data:
      schema:
        type: object
        properties:
          id:
            # default is `text/plain`
            type: string
            format: uuid
          addresses:
            # default based on the `items` subschema would be
            # `application/json`, but we want these address objects
            # serialized as `application/xml` instead
            description: addresses in XML format
            type: array
            items:
              $ref: '#/components/schemas/Address'
          profileImage:
            # default is application/octet-stream, but we can declare
            # a more specific image type or types
            type: string
            format: binary
      encoding:
        addresses:
          # require XML Content-Type in utf-8 encoding
          # This is applied to each address part corresponding
          # to each address in he array
          contentType: application/xml; charset=utf-8
        profileImage:
          # only accept png or jpeg
          contentType: image/png, image/jpeg
          headers:
            X-Rate-Limit-Limit:
              description: The number of allowed requests in the current period
              schema:
                type: integer
```

###### Example: Multipart Form with Multiple Files

In accordance with [RFC7578](https://www.rfc-editor.org/rfc/rfc7578.html#section-4.3), multiple files for a single form field are uploaded using the same name (`file` in this example) for each file's part:

```yaml
requestBody:
  content:
    multipart/form-data:
      schema:
        properties:
          # The property name 'file' will be used for all files.
          file:
            type: array
            items: {}
```

As seen in the [Encoding Object's `contentType` field documentation](#encoding-content-type), the empty schema for `items` indicates a media type of `application/octet-stream`.

#### Responses Object

A container for the expected responses of an operation.
The container maps a HTTP response code to the expected response.

The documentation is not necessarily expected to cover all possible HTTP response codes because they may not be known in advance.
However, documentation is expected to cover a successful operation response and any known errors.

The `default` MAY be used as a default Response Object for all HTTP codes
that are not covered individually by the Responses Object.

The Responses Object MUST contain at least one response code, and if only one
response code is provided it SHOULD be the response for a successful operation
call.

##### Fixed Fields

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="responses-default"></a>default | [Response Object](#response-object) \| [Reference Object](#reference-object) | The documentation of responses other than the ones declared for specific HTTP response codes. Use this field to cover undeclared responses. |

##### Patterned Fields

| Field Pattern | Type | Description |
| ---- | :----: | ---- |
| <a name="responses-code"></a>[HTTP Status Code](#http-status-codes) | [Response Object](#response-object) \| [Reference Object](#reference-object) | Any [HTTP status code](#http-status-codes) can be used as the property name, but only one property per code, to describe the expected response for that HTTP status code. This field MUST be enclosed in quotation marks (for example, "200") for compatibility between JSON and YAML. To define a range of response codes, this field MAY contain the uppercase wildcard character `X`. For example, `2XX` represents all response codes between `200` and `299`. Only the following range definitions are allowed: `1XX`, `2XX`, `3XX`, `4XX`, and `5XX`. If a response is defined using an explicit code, the explicit code definition takes precedence over the range definition for that code. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Responses Object Example

A 200 response for a successful operation and a default response for others (implying an error):

```json
{
  "200": {
    "description": "a pet to be returned",
    "content": {
      "application/json": {
        "schema": {
          "$ref": "#/components/schemas/Pet"
        }
      }
    }
  },
  "default": {
    "description": "Unexpected error",
    "content": {
      "application/json": {
        "schema": {
          "$ref": "#/components/schemas/ErrorModel"
        }
      }
    }
  }
}
```

```yaml
'200':
  description: a pet to be returned
  content:
    application/json:
      schema:
        $ref: '#/components/schemas/Pet'
default:
  description: Unexpected error
  content:
    application/json:
      schema:
        $ref: '#/components/schemas/ErrorModel'
```

#### Response Object

Describes a single response from an API operation, including design-time, static
`links` to operations based on the response.

##### Fixed Fields

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="response-description"></a>description | `string` | **REQUIRED**. A description of the response. [CommonMark syntax](https://spec.commonmark.org/) MAY be used for rich text representation. |
| <a name="response-headers"></a>headers | Map[`string`, [Header Object](#header-object) \| [Reference Object](#reference-object)] | Maps a header name to its definition. [RFC7230](https://tools.ietf.org/html/rfc7230#section-3.2) states header names are case insensitive. If a response header is defined with the name `"Content-Type"`, it SHALL be ignored. |
| <a name="response-content"></a>content | Map[`string`, [Media Type Object](#media-type-object)] | A map containing descriptions of potential response payloads. The key is a media type or [media type range](https://tools.ietf.org/html/rfc7231#appendix-D) and the value describes it. For responses that match multiple keys, only the most specific key is applicable. e.g. `"text/plain"` overrides `"text/*"` |
| <a name="response-links"></a>links | Map[`string`, [Link Object](#link-object) \| [Reference Object](#reference-object)] | A map of operations links that can be followed from the response. The key of the map is a short name for the link, following the naming constraints of the names for [Component Objects](#components-object). |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Response Object Examples

Response of an array of a complex type:

```json
{
  "description": "A complex object array response",
  "content": {
    "application/json": {
      "schema": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/VeryComplexType"
        }
      }
    }
  }
}
```

```yaml
description: A complex object array response
content:
  application/json:
    schema:
      type: array
      items:
        $ref: '#/components/schemas/VeryComplexType'
```

Response with a string type:

```json
{
  "description": "A simple string response",
  "content": {
    "text/plain": {
      "schema": {
        "type": "string"
      }
    }
  }
}
```

```yaml
description: A simple string response
content:
  text/plain:
    schema:
      type: string
```

Plain text response with headers:

```json
{
  "description": "A simple string response",
  "content": {
    "text/plain": {
      "schema": {
        "type": "string"
      },
      "example": "whoa!"
    }
  },
  "headers": {
    "X-Rate-Limit-Limit": {
      "description": "The number of allowed requests in the current period",
      "schema": {
        "type": "integer"
      }
    },
    "X-Rate-Limit-Remaining": {
      "description": "The number of remaining requests in the current period",
      "schema": {
        "type": "integer"
      }
    },
    "X-Rate-Limit-Reset": {
      "description": "The number of seconds left in the current period",
      "schema": {
        "type": "integer"
      }
    }
  }
}
```

```yaml
description: A simple string response
content:
  text/plain:
    schema:
      type: string
    example: 'whoa!'
headers:
  X-Rate-Limit-Limit:
    description: The number of allowed requests in the current period
    schema:
      type: integer
  X-Rate-Limit-Remaining:
    description: The number of remaining requests in the current period
    schema:
      type: integer
  X-Rate-Limit-Reset:
    description: The number of seconds left in the current period
    schema:
      type: integer
```

Response with no return value:

```json
{
  "description": "object created"
}
```

```yaml
description: object created
```

#### Callback Object

A map of possible out-of band callbacks related to the parent operation.
Each value in the map is a [Path Item Object](#path-item-object) that describes a set of requests that may be initiated by the API provider and the expected responses.
The key value used to identify the Path Item Object is an expression, evaluated at runtime, that identifies a URL to use for the callback operation.

To describe incoming requests from the API provider independent from another API call, use the [`webhooks`](#oas-webhooks) field.

##### Patterned Fields

| Field Pattern | Type | Description |
| ---- | :----: | ---- |
| <a name="callback-expression"></a>{expression} | [Path Item Object](#path-item-object) | A Path Item Object used to define a callback request and expected responses. A [complete example](https://learn.openapis.org/examples/v3.0/callback-example.html) is available. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Key Expression

The key that identifies the [Path Item Object](#path-item-object) is a [runtime expression](#runtime-expressions) that can be evaluated in the context of a runtime HTTP request/response to identify the URL to be used for the callback request.
A simple example might be `$request.body#/url`.
However, using a [runtime expression](#runtime-expressions) the complete HTTP message can be accessed.
This includes accessing any part of a body that a JSON Pointer [RFC6901](https://tools.ietf.org/html/rfc6901) can reference.

For example, given the following HTTP request:

```http
POST /subscribe/myevent?queryUrl=https://clientdomain.com/stillrunning HTTP/1.1
Host: example.org
Content-Type: application/json
Content-Length: 188

{
  "failedUrl": "https://clientdomain.com/failed",
  "successUrls": [
    "https://clientdomain.com/fast",
    "https://clientdomain.com/medium",
    "https://clientdomain.com/slow"
  ]
}
```

resulting in:

```http
201 Created
Location: https://example.org/subscription/1
```

The following examples show how the various expressions evaluate, assuming the callback operation has a path parameter named `eventType` and a query parameter named `queryUrl`.

| Expression | Value |
| ---- | :---- |
| $url | <https://example.org/subscribe/myevent?queryUrl=https://clientdomain.com/stillrunning> |
| $method | POST |
| $request.path.eventType | myevent |
| $request.query.queryUrl | <https://clientdomain.com/stillrunning> |
| $request.header.content-type | application/json |
| $request.body#/failedUrl | <https://clientdomain.com/failed> |
| $request.body#/successUrls/1 | <https://clientdomain.com/medium> |
| $response.header.Location | <https://example.org/subscription/1> |

##### Callback Object Examples

The following example uses the user provided `queryUrl` query string parameter to define the callback URL. This is similar to a [webhook](#oas-webhooks), but differs in that the callback only occurs because of the initial request that sent the `queryUrl`.

```yaml
myCallback:
  '{$request.query.queryUrl}':
    post:
      requestBody:
        description: Callback payload
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SomePayload'
      responses:
        '200':
          description: callback successfully processed
```

The following example shows a callback where the server is hard-coded, but the query string parameters are populated from the `id` and `email` property in the request body.

```yaml
transactionCallback:
  'http://notificationServer.com?transactionId={$request.body#/id}&email={$request.body#/email}':
    post:
      requestBody:
        description: Callback payload
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SomePayload'
      responses:
        '200':
          description: callback successfully processed
```

#### Example Object

An object grouping an internal or external example value with basic `summary` and `description` metadata.
This object is typically used in fields named `examples` (plural), and is a [referenceable](#reference-object) alternative to older `example` (singular) fields that do not support referencing or metadata.

Examples allow demonstration of the usage of properties, parameters and objects within OpenAPI.

##### Fixed Fields

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="example-summary"></a>summary | `string` | Short description for the example. |
| <a name="example-description"></a>description | `string` | Long description for the example. [CommonMark syntax](https://spec.commonmark.org/) MAY be used for rich text representation. |
| <a name="example-value"></a>value | Any | Embedded literal example. The `value` field and `externalValue` field are mutually exclusive. To represent examples of media types that cannot naturally represented in JSON or YAML, use a string value to contain the example, escaping where necessary. |
| <a name="example-external-value"></a>externalValue | `string` | A URI that identifies the literal example. This provides the capability to reference examples that cannot easily be included in JSON or YAML documents. The `value` field and `externalValue` field are mutually exclusive. See the rules for resolving [Relative References](#relative-references-in-api-description-uris). |

This object MAY be extended with [Specification Extensions](#specification-extensions).

In all cases, the example value SHOULD be compatible with the schema of its associated value.
Tooling implementations MAY choose to validate compatibility automatically, and reject the example value(s) if incompatible.

##### Working with Examples

Example Objects can be used in both [Parameter Objects](#parameter-object) and [Media Type Objects](#media-type-object).
In both Objects, this is done through the `examples` (plural) field.
However, there are several other ways to provide examples: The `example` (singular) field that is mutually exclusive with `examples` in both Objects, and two keywords (the deprecated singular `example` and the current plural `examples`, which takes an array of examples) in the [Schema Object](#schema-object) that appears in the `schema` field of both Objects.
Each of these fields has slightly different considerations.

The Schema Object's fields are used to show example values without regard to how they might be formatted as parameters or within media type representations.
The `examples` array is part of JSON Schema and is the preferred way to include examples in the Schema Object, while `example` is retained purely for compatibility with older versions of the OpenAPI Specification.

The mutually exclusive fields in the Parameter or Media Type Objects are used to show example values which SHOULD both match the schema and be formatted as they would appear as a serialized parameter or within a media type representation.
The exact serialization and encoding is determined by various fields in the Parameter Object, or in the Media Type Object's [Encoding Object](#encoding-object).
Because examples using these fields represent the final serialized form of the data, they SHALL _override_ any `example` in the corresponding Schema Object.

The singular `example` field in the Parameter or Media Type Object is concise and convenient for simple examples, but does not offer any other advantages over using Example Objects under `examples`.

Some examples cannot be represented directly in JSON or YAML.
For all three ways of providing examples, these can be shown as string values with any escaping necessary to make the string valid in the JSON or YAML format of documents that comprise the OpenAPI Description.
With the Example Object, such values can alternatively be handled through the `externalValue` field.

##### Example Object Examples

In a request body:

```yaml
requestBody:
  content:
    'application/json':
      schema:
        $ref: '#/components/schemas/Address'
      examples:
        foo:
          summary: A foo example
          value:
            foo: bar
        bar:
          summary: A bar example
          value:
            bar: baz
    application/xml:
      examples:
        xmlExample:
          summary: This is an example in XML
          externalValue: https://example.org/examples/address-example.xml
    text/plain:
      examples:
        textExample:
          summary: This is a text example
          externalValue: https://foo.bar/examples/address-example.txt
```

In a parameter:

```yaml
parameters:
  - name: zipCode
    in: query
    schema:
      type: string
      format: zip-code
    examples:
      zip-example:
        $ref: '#/components/examples/zip-example'
```

In a response:

```yaml
responses:
  '200':
    description: your car appointment has been booked
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/SuccessResponse'
        examples:
          confirmation-success:
            $ref: '#/components/examples/confirmation-success'
```

Two different uses of JSON strings:

First, a request or response body that is just a JSON string (not an object containing a string):

```json
"application/json": {
  "schema": {
    "type": "string"
  },
  "examples": {
    "jsonBody": {
      "description": "A body of just the JSON string \"json\"",
      "value": "json"
    }
  }
}
```

```yaml
application/json:
  schema:
    type: string
  examples:
    jsonBody:
      description: 'A body of just the JSON string "json"'
      value: json
```

In the above example, we can just show the JSON string (or any JSON value) as-is, rather than stuffing a serialized JSON value into a JSON string, which would have looked like `"\"json\""`.

In contrast, a JSON string encoded inside of a URL-style form body:

```json
"application/x-www-form-urlencoded": {
  "schema": {
    "type": "object",
    "properties": {
      "jsonValue": {
        "type": "string"
      }
    }
  },
  "encoding": {
    "jsonValue": {
      "contentType": "application/json"
    }
  },
  "examples": {
    "jsonFormValue": {
      "description": "The JSON string \"json\" as a form value",
      "value": "jsonValue=%22json%22"
    }
  }
}
```

```yaml
application/x-www-form-urlencoded:
  schema:
    type: object
    properties:
      jsonValue:
        type: string
  encoding:
    jsonValue:
      contentType: application/json
  examples:
    jsonFormValue:
      description: 'The JSON string "json" as a form value'
      value: jsonValue=%22json%22
```

In this example, the JSON string had to be serialized before encoding it into the URL form value, so the example includes the quotation marks that are part of the JSON serialization, which are then URL percent-encoded.

#### Link Object

The Link Object represents a possible design-time link for a response.
The presence of a link does not guarantee the caller's ability to successfully invoke it, rather it provides a known relationship and traversal mechanism between responses and other operations.

Unlike _dynamic_ links (i.e. links provided **in** the response payload), the OAS linking mechanism does not require link information in the runtime response.

For computing links and providing instructions to execute them, a [runtime expression](#runtime-expressions) is used for accessing values in an operation and using them as parameters while invoking the linked operation.

##### Fixed Fields

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="link-operation-ref"></a>operationRef | `string` | A URI reference to an OAS operation. This field is mutually exclusive of the `operationId` field, and MUST point to an [Operation Object](#operation-object). Relative `operationRef` values MAY be used to locate an existing [Operation Object](#operation-object) in the OpenAPI Description. |
| <a name="link-operation-id"></a>operationId | `string` | The name of an _existing_, resolvable OAS operation, as defined with a unique `operationId`. This field is mutually exclusive of the `operationRef` field. |
| <a name="link-parameters"></a>parameters | Map[`string`, Any \| [{expression}](#runtime-expressions)] | A map representing parameters to pass to an operation as specified with `operationId` or identified via `operationRef`. The key is the parameter name to be used (optionally qualified with the parameter location, e.g. `path.id` for an `id` parameter in the path), whereas the value can be a constant or an expression to be evaluated and passed to the linked operation. |
| <a name="link-request-body"></a>requestBody | Any \| [{expression}](#runtime-expressions) | A literal value or [{expression}](#runtime-expressions) to use as a request body when calling the target operation. |
| <a name="link-description"></a>description | `string` | A description of the link. [CommonMark syntax](https://spec.commonmark.org/) MAY be used for rich text representation. |
| <a name="link-server"></a>server | [Server Object](#server-object) | A server object to be used by the target operation. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

A linked operation MUST be identified using either an `operationRef` or `operationId`.
The identified or reference operation MUST be unique, and in the case of an `operationId`, it MUST be resolved within the scope of the OpenAPI Description (OAD).
Because of the potential for name clashes, the `operationRef` syntax is preferred for multi-document OADs.
However, because use of an operation depends on its URL path template in the [Paths Object](#paths-object), operations from any [Path Item Object](#path-item-object) that is referenced multiple times within the OAD cannot be resolved unambiguously.
In such ambiguous cases, the resulting behavior is implementation-defined and MAY result in an error.

Note that it is not possible to provide a constant value to `parameters` that matches the syntax of a runtime expression.
It is possible to have ambiguous parameter names, e.g. `name: "id", in: "path"` and `name: "path.id", in: "query"`; this is NOT RECOMMENDED and the behavior is implementation-defined, however implementations SHOULD prefer the qualified interpretation (`path.id` as a path parameter), as the names can always be qualified to disambiguate them (e.g. using `query.path.id` for the query parameter).

##### Examples

Computing a link from a request operation where the `$request.path.id` is used to pass a request parameter to the linked operation.

```yaml
paths:
  /users/{id}:
    parameters:
      - name: id
        in: path
        required: true
        description: the user identifier, as userId
        schema:
          type: string
    get:
      responses:
        '200':
          description: the user being returned
          content:
            application/json:
              schema:
                type: object
                properties:
                  uuid: # the unique user id
                    type: string
                    format: uuid
          links:
            address:
              # the target link operationId
              operationId: getUserAddress
              parameters:
                # get the `id` field from the request path parameter named `id`
                userid: $request.path.id
  # the path item of the linked operation
  /users/{userid}/address:
    parameters:
      - name: userid
        in: path
        required: true
        description: the user identifier, as userId
        schema:
          type: string
    # linked operation
    get:
      operationId: getUserAddress
      responses:
        '200':
          description: the user's address
```

When a runtime expression fails to evaluate, no parameter value is passed to the target operation.

Values from the response body can be used to drive a linked operation.

```yaml
links:
  address:
    operationId: getUserAddressByUUID
    parameters:
      # get the `uuid` field from the `uuid` field in the response body
      userUuid: $response.body#/uuid
```

Clients follow all links at their discretion.
Neither permissions nor the capability to make a successful call to that link is guaranteed
solely by the existence of a relationship.

##### `operationRef` Examples

As references to `operationId` MAY NOT be possible (the `operationId` is an optional
field in an [Operation Object](#operation-object)), references MAY also be made through a relative `operationRef`:

```yaml
links:
  UserRepositories:
    # returns array of '#/components/schemas/repository'
    operationRef: '#/paths/~12.0~1repositories~1%7Busername%7D/get'
    parameters:
      username: $response.body#/username
```

or a URI `operationRef`:

```yaml
links:
  UserRepositories:
    # returns array of '#/components/schemas/repository'
    operationRef: https://na2.gigantic-server.com/#/paths/~12.0~1repositories~1%7Busername%7D/get
    parameters:
      username: $response.body#/username
```

Note that in the use of `operationRef` the _escaped forward-slash_ is necessary when
using JSON Pointer, and it is necessary to URL-encode `{` and `}` as `%7B` and `%7D`, respectively, when using JSON Pointer as URI fragments.

##### Runtime Expressions

Runtime expressions allow defining values based on information that will only be available within the HTTP message in an actual API call.
This mechanism is used by [Link Objects](#link-object) and [Callback Objects](#callback-object).

The runtime expression is defined by the following [ABNF](https://tools.ietf.org/html/rfc5234) syntax

```abnf
    expression = "$url" / "$method" / "$statusCode" / "$request." source / "$response." source
    source     = header-reference / query-reference / path-reference / body-reference
    header-reference = "header." token
    query-reference  = "query." name
    path-reference   = "path." name
    body-reference   = "body" ["#" json-pointer ]
    json-pointer    = *( "/" reference-token )
    reference-token = *( unescaped / escaped )
    unescaped       = %x00-2E / %x30-7D / %x7F-10FFFF
                    ; %x2F ('/') and %x7E ('~') are excluded from 'unescaped'
    escaped         = "~" ( "0" / "1" )
                    ; representing '~' and '/', respectively
    name = *( CHAR )
    token = 1*tchar
    tchar = "!" / "#" / "$" / "%" / "&" / "'" / "*" / "+" / "-" / "."
          / "^" / "_" / "`" / "|" / "~" / DIGIT / ALPHA
```

Here, `json-pointer` is taken from [RFC6901](https://tools.ietf.org/html/rfc6901), `char` from [RFC7159](https://tools.ietf.org/html/rfc7159#section-7) and `token` from [RFC7230](https://tools.ietf.org/html/rfc7230#section-3.2.6).

The `name` identifier is case-sensitive, whereas `token` is not.

The table below provides examples of runtime expressions and examples of their use in a value:

##### Examples

| Source Location | example expression | notes |
| ---- | :---- | :---- |
| HTTP Method | `$method` | The allowable values for the `$method` will be those for the HTTP operation. |
| Requested media type | `$request.header.accept` | |
| Request parameter | `$request.path.id` | Request parameters MUST be declared in the `parameters` section of the parent operation or they cannot be evaluated. This includes request headers. |
| Request body property | `$request.body#/user/uuid` | In operations which accept payloads, references may be made to portions of the `requestBody` or the entire body. |
| Request URL | `$url` | |
| Response value | `$response.body#/status` | In operations which return payloads, references may be made to portions of the response body or the entire body. |
| Response header | `$response.header.Server` | Single header values only are available |

Runtime expressions preserve the type of the referenced value.
Expressions can be embedded into string values by surrounding the expression with `{}` curly braces.

#### Header Object

Describes a single header for [HTTP responses](#response-headers) and for [individual parts in `multipart` representations](#encoding-headers); see the relevant [Response Object](#response-object) and [Encoding Object](#encoding-object) documentation for restrictions on which headers can be described.

The Header Object follows the structure of the [Parameter Object](#parameter-object), including determining its serialization strategy based on whether `schema` or `content` is present, with the following changes:

1. `name` MUST NOT be specified, it is given in the corresponding `headers` map.
1. `in` MUST NOT be specified, it is implicitly in `header`.
1. All traits that are affected by the location MUST be applicable to a location of `header` (for example, [`style`](#parameter-style)). This means that `allowEmptyValue` and `allowReserved` MUST NOT be used, and `style`, if used, MUST be limited to `"simple"`.

##### Fixed Fields

###### Common Fixed Fields

These fields MAY be used with either `content` or `schema`.

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="header-description"></a>description | `string` | A brief description of the header. This could contain examples of use. [CommonMark syntax](https://spec.commonmark.org/) MAY be used for rich text representation. |
| <a name="header-required"></a>required | `boolean` | Determines whether this header is mandatory. The default value is `false`. |
| <a name="header-deprecated"></a> deprecated | `boolean` | Specifies that the header is deprecated and SHOULD be transitioned out of usage. Default value is `false`. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

###### Fixed Fields for use with `schema`

For simpler scenarios, a [`schema`](#header-schema) and [`style`](#header-style) can describe the structure and syntax of the header.
When `example` or `examples` are provided in conjunction with the `schema` field, the example MUST follow the prescribed serialization strategy for the header.

Serializing with `schema` is NOT RECOMMENDED for headers with parameters (name=value pairs following a `;`) in their values, or where values might have non-URL-safe characters; see [Appendix D](#appendix-d-serializing-headers-and-cookies) for details.

When `example` or `examples` are provided in conjunction with the `schema` field, the example SHOULD match the specified schema and follow the prescribed serialization strategy for the header.
The `example` and `examples` fields are mutually exclusive, and if either is present it SHALL _override_ any `example` in the schema.

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="header-style"></a>style | `string` | Describes how the header value will be serialized. The default (and only legal value for headers) is `"simple"`. |
| <a name="header-explode"></a>explode | `boolean` | When this is true, header values of type `array` or `object` generate a single header whose value is a comma-separated list of the array items or key-value pairs of the map, see [Style Examples](#style-examples). For other data types this field has no effect. The default value is `false`. |
| <a name="header-schema"></a>schema | [Schema Object](#schema-object) \| [Reference Object](#reference-object) | The schema defining the type used for the header. |
| <a name="header-example"></a>example | Any | Example of the header's potential value; see [Working With Examples](#working-with-examples). |
| <a name="header-examples"></a>examples | Map[ `string`, [Example Object](#example-object) \| [Reference Object](#reference-object)] | Examples of the header's potential value; see [Working With Examples](#working-with-examples). |

See also [Appendix C: Using RFC6570-Based Serialization](#appendix-c-using-rfc6570-based-serialization) for additional guidance.

###### Fixed Fields for use with `content`

For more complex scenarios, the [`content`](#header-content) field can define the media type and schema of the header, as well as give examples of its use.
Using `content` with a `text/plain` media type is RECOMMENDED for headers where the `schema` strategy is not appropriate.

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="header-content"></a>content | Map[`string`, [Media Type Object](#media-type-object)] | A map containing the representations for the header. The key is the media type and the value describes it. The map MUST only contain one entry. |

##### Header Object Example

A simple header of type `integer`:

```json
"X-Rate-Limit-Limit": {
  "description": "The number of allowed requests in the current period",
  "schema": {
    "type": "integer"
  }
}
```

```yaml
X-Rate-Limit-Limit:
  description: The number of allowed requests in the current period
  schema:
    type: integer
```

Requiring that a strong `ETag` header (with a value starting with `"` rather than `W/`) is present. Note the use of `content`, because using `schema` and `style` would require the `"` to be percent-encoded as `%22`:

```json
"ETag": {
  "required": true,
  "content": {
    "text/plain": {
      "schema": {
        "type": "string",
        "pattern": "^\""
      }
    }
  }
}
```

```yaml
ETag:
  required: true
  content:
    text/plain:
      schema:
        type: string
        pattern: ^"
```

#### Tag Object

Adds metadata to a single tag that is used by the [Operation Object](#operation-object).
It is not mandatory to have a Tag Object per tag defined in the Operation Object instances.

##### Fixed Fields

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="tag-name"></a>name | `string` | **REQUIRED**. The name of the tag. Use this value in the `tags` array of an Operation. |
| <a name="tag-summary"></a>summary | `string` | A short summary of the tag, used for display purposes. |
| <a name="tag-description"></a>description | `string` | A description for the tag. [CommonMark syntax](https://spec.commonmark.org/) MAY be used for rich text representation. |
| <a name="tag-external-docs"></a>externalDocs | [External Documentation Object](#external-documentation-object) | Additional external documentation for this tag. |
| <a name="tag-parent"></a>parent | `string` | The `name` of a tag that this tag is nested under. The named tag MUST exist in the API description, and circular references between parent and child tags MUST NOT be used. |
| <a name="tag-kind"></a>kind | `string` | A machine-readable string to categorize what sort of tag it is. Any string value can be used; common uses are `nav` for Navigation, `badge` for visible badges, `audience` for APIs used by different groups. A [registry of the most commonly used values](https://spec.openapis.org/registry/tag-kind/) is available. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Tag Object Example

```json
"tags": [
  {
    "name": "account-updates",
    "summary": "Account Updates",
    "description": "Account update operations",
    "kind": "nav"
  },
  {
    "name": "partner",
    "summary": "Partner",
    "description": "Operations available to the partners network",
    "parent": "external",
    "kind": "audience"
  },
  {
    "name": "external",
    "summary": "External",
    "description": "Operations available to external consumers",
    "kind": "audience"
  }
]
```

```yaml
tags:

  - name: account-updates
    summary: Account Updates
    description: Account update operations
    kind: nav

  - name: partner
    summary: Partner
    description: Operations available to the partners network
    parent: external
    kind: audience

  - name: external
    summary: External
    description: Operations available to external consumers
    kind: audience
```

#### Reference Object

A simple object to allow referencing other components in the OpenAPI Description, internally and externally.

The `$ref` string value contains a URI [RFC3986](https://tools.ietf.org/html/rfc3986), which identifies the value being referenced.

See the rules for resolving [Relative References](#relative-references-in-api-description-uris).

##### Fixed Fields

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="reference-ref"></a>$ref | `string` | **REQUIRED**. The reference identifier. This MUST be in the form of a URI. |
| <a name="reference-summary"></a>summary | `string` | A short summary which by default SHOULD override that of the referenced component. If the referenced object-type does not allow a `summary` field, then this field has no effect. |
| <a name="reference-description"></a>description | `string` | A description which by default SHOULD override that of the referenced component. [CommonMark syntax](https://spec.commonmark.org/) MAY be used for rich text representation. If the referenced object-type does not allow a `description` field, then this field has no effect. |

This object cannot be extended with additional properties, and any properties added SHALL be ignored.

Note that this restriction on additional properties is a difference between Reference Objects and [Schema Objects](#schema-object) that contain a `$ref` keyword.

##### Reference Object Example

```json
{
  "$ref": "#/components/schemas/Pet"
}
```

```yaml
$ref: '#/components/schemas/Pet'
```

##### Relative Schema Document Example

```json
{
  "$ref": "Pet.json"
}
```

```yaml
$ref: Pet.yaml
```

##### Relative Documents with Embedded Schema Example

```json
{
  "$ref": "definitions.json#/Pet"
}
```

```yaml
$ref: definitions.yaml#/Pet
```

#### Schema Object

The Schema Object allows the definition of input and output data types.
These types can be objects, but also primitives and arrays. This object is a superset of the [JSON Schema Specification Draft 2020-12](https://tools.ietf.org/html/draft-bhutton-json-schema-00). The empty schema (which allows any instance to validate) MAY be represented by the boolean value `true` and a schema which allows no instance to validate MAY be represented by the boolean value `false`.

For more information about the keywords, see [JSON Schema Core](https://tools.ietf.org/html/draft-bhutton-json-schema-00) and [JSON Schema Validation](https://tools.ietf.org/html/draft-bhutton-json-schema-validation-00).

Unless stated otherwise, the keyword definitions follow those of JSON Schema and do not add any additional semantics; this includes keywords such as `$schema`, `$id`, `$ref`, and `$dynamicRef` being URIs rather than URLs.
Where JSON Schema indicates that behavior is defined by the application (e.g. for annotations), OAS also defers the definition of semantics to the application consuming the OpenAPI document.

##### JSON Schema Keywords

The OpenAPI Schema Object [dialect](https://tools.ietf.org/html/draft-bhutton-json-schema-00#section-4.3.3) is defined as requiring the [OAS base vocabulary](#base-vocabulary), in addition to the vocabularies as specified in the JSON Schema Specification Draft 2020-12 [general purpose meta-schema](https://tools.ietf.org/html/draft-bhutton-json-schema-00#section-8).

The OpenAPI Schema Object dialect for this version of the specification is identified by the URI `https://spec.openapis.org/oas/3.1/dialect/base` (the <a name="dialect-schema-id"></a>"OAS dialect schema id").

The following keywords are taken from the JSON Schema specification but their definitions have been extended by the OAS:

* description - [CommonMark syntax](https://spec.commonmark.org/) MAY be used for rich text representation.
* format - See [Data Type Formats](#data-type-format) for further details. While relying on JSON Schema's defined formats, the OAS offers a few additional predefined formats.

In addition to the JSON Schema keywords comprising the OAS dialect, the Schema Object supports keywords from any other vocabularies, or entirely arbitrary properties.

JSON Schema implementations MAY choose to treat keywords defined by the OpenAPI Specification's base vocabulary as [unknown keywords](https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-00#section-4.3.1), due to its inclusion in the OAS dialect with a [`$vocabulary`](https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-00#section-8.1.2) value of `false`.
<a name="base-vocabulary"></a>The OAS base vocabulary is comprised of the following keywords:

##### Fixed Fields

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="schema-discriminator"></a>discriminator | [Discriminator Object](#discriminator-object) | The discriminator provides a "hint" for which of a set of schemas a payload is expected to satisfy. See [Composition and Inheritance](#composition-and-inheritance-polymorphism) for more details. |
| <a name="schema-xml"></a>xml | [XML Object](#xml-object) | This MAY be used only on property schemas. It has no effect on root schemas. Adds additional metadata to describe the XML representation of this property. |
| <a name="schema-external-docs"></a>externalDocs | [External Documentation Object](#external-documentation-object) | Additional external documentation for this schema. |
| <a name="schema-example"></a>example | Any | A free-form field to include an example of an instance for this schema. To represent examples that cannot be naturally represented in JSON or YAML, a string value can be used to contain the example with escaping where necessary.<br><br>**Deprecated:** The `example` field has been deprecated in favor of the JSON Schema `examples` keyword. Use of `example` is discouraged, and later versions of this specification may remove it. |

This object MAY be extended with [Specification Extensions](#specification-extensions), though as noted, additional properties MAY omit the `x-` prefix within this object.

##### Extended Validation with Annotations

JSON Schema Draft 2020-12 supports [collecting annotations](https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-00#section-7.7.1), including [treating unrecognized keywords as annotations](https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-00#section-6.5).
OAS implementations MAY use such annotations, including [extensions](https://spec.openapis.org/registry/extension/) not recognized as part of a declared JSON Schema vocabulary, as the basis for further validation.
Note that JSON Schema Draft 2020-12 does not require an `x-` prefix for extensions.

###### Non-validating constraint keywords

The [`format` keyword (when using default format-annotation vocabulary)](https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-validation-00#section-7.2.1) and the [`contentMediaType`, `contentEncoding`, and `contentSchema` keywords](https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-validation-00#section-8.2) define constraints on the data, but are treated as annotations instead of being validated directly.
Extended validation is one way that these constraints MAY be enforced.

###### Validating `readOnly` and `writeOnly`

The `readOnly` and `writeOnly` keywords are annotations, as JSON Schema is not aware of how the data it is validating is being used.
Validation of these keywords MAY be done by checking the annotation, the read or write direction, and (if relevant) the current value of the field.
[JSON Schema Validation Draft 2020-12 §9.4](https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-validation-00#section-9.4) defines the expectations of these keywords, including that a resource (described as the "owning authority") MAY either ignore a `readOnly` field or treat it as an error.

Fields that are both required and read-only are an example of when it is beneficial to ignore a `readOnly: true` constraint in a PUT, particularly if the value has not been changed.
This allows correctly requiring the field on a GET and still using the same representation and schema with PUT.
Even when read-only fields are not required, stripping them is burdensome for clients, particularly when the JSON data is complex or deeply nested.

Note that the behavior of `readOnly` in particular differs from that specified by version 3.0 of this specification.

##### Data Modeling Techniques

###### Composition and Inheritance (Polymorphism)

The OpenAPI Specification allows combining and extending model definitions using the `allOf` keyword of JSON Schema, in effect offering model composition.
`allOf` takes an array of object definitions that are validated _independently_ but together compose a single object.

While composition offers model extensibility, it does not imply a hierarchy between the models.

JSON Schema also provides the `anyOf` and `oneOf` keywords, which allow defining multiple schemas where at least one or exactly one of them must be valid, respectively.
As is the case with `allOf`, the schemas are validated _independently_.
These keywords can be used to describe polymorphism, where a single field can accept multiple types of values.

The OpenAPI specification extends the JSON Schema support for polymorphism by adding the [`discriminator`](#schema-discriminator) field whose value is a [Discriminator Object](#discriminator-object).
When used, the Discriminator Object indicates the name of the property that hints which schema of an `anyOf` or `oneOf` is expected to validate the structure of the model.
The discriminating property MAY be defined as required or optional, but when defined as an optional property the Discriminator Object MUST include a `defaultMapping` field that specifies which schema of the `anyOf` or `oneOf`, or which schema that references the current schema in an `allOf`, is expected to validate the structure of the model when the discriminating property is not present.

There are two ways to define the value of a discriminating property for an inheriting instance.

* Use the schema name.
* [Override the schema name](#discriminator-mapping) by overriding the property with a new value. If a new value exists, this takes precedence over the schema name.

###### Generic (Template) Data Structures

Implementations MAY support defining generic or template data structures using JSON Schema's dynamic referencing feature:

* `$dynamicAnchor` identifies a set of possible schemas (including a default placeholder schema) to which a `$dynamicRef` can resolve
* `$dynamicRef` resolves to the first matching `$dynamicAnchor` encountered on its path from the schema entry point to the reference, as described in the JSON Schema specification

An example is included in the "Schema Object Examples" section below, and further information can be found on the Learn OpenAPI site's ["Dynamic References"](https://learn.openapis.org/referencing/dynamic.html) page.

###### Annotated Enumerations

The Schema Object's `enum` keyword does not allow associating descriptions or other information with individual values.

Implementations MAY support recognizing a `oneOf` or `anyOf` where each subschema in the keyword's array consists of a `const` keyword and annotations such as `title` or `description` as an enumerated type with additional information. The exact behavior of this pattern beyond what is required by JSON Schema is implementation-defined.

###### XML Modeling

The [xml](#schema-xml) field allows extra definitions when translating the JSON definition to XML.
The [XML Object](#xml-object) contains additional information about the available options.

##### Specifying Schema Dialects

It is important for tooling to be able to determine which dialect or meta-schema any given resource wishes to be processed with: JSON Schema Core, JSON Schema Validation, OpenAPI Schema dialect, or some custom meta-schema.

The `$schema` keyword MAY be present in any Schema Object that is a [schema resource root](https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-00#section-4.3.5), and if present MUST be used to determine which dialect should be used when processing the schema. This allows use of Schema Objects which comply with other drafts of JSON Schema than the default Draft 2020-12 support. Tooling MUST support the <a href="#dialect-schema-id">OAS dialect schema id</a>, and MAY support additional values of `$schema`.

To allow use of a different default `$schema` value for all Schema Objects contained within an OAS document, a `jsonSchemaDialect` value may be set within the <a href="#openapi-object">OpenAPI Object</a>. If this default is not set, then the OAS dialect schema id MUST be used for these Schema Objects. The value of `$schema` within a resource root Schema Object always overrides any default.

For standalone JSON Schema documents that do not set `$schema`, or for Schema Objects in OpenAPI description documents that are _not_ [complete documents](#openapi-description-structure), the dialect SHOULD be assumed to be the OAS dialect.
However, for maximum interoperability, it is RECOMMENDED that OpenAPI description authors explicitly set the dialect through `$schema` in such documents.

##### Schema Object Examples

###### Primitive Example

```json
{
  "type": "string",
  "format": "email"
}
```

```yaml
type: string
format: email
```

###### Simple Model

```json
{
  "type": "object",
  "required": ["name"],
  "properties": {
    "name": {
      "type": "string"
    },
    "address": {
      "$ref": "#/components/schemas/Address"
    },
    "age": {
      "type": "integer",
      "format": "int32",
      "minimum": 0
    }
  }
}
```

```yaml
type: object
required:
  - name
properties:
  name:
    type: string
  address:
    $ref: '#/components/schemas/Address'
  age:
    type: integer
    format: int32
    minimum: 0
```

###### Model with Map/Dictionary Properties

For a simple string to string mapping:

```json
{
  "type": "object",
  "additionalProperties": {
    "type": "string"
  }
}
```

```yaml
type: object
additionalProperties:
  type: string
```

For a string to model mapping:

```json
{
  "type": "object",
  "additionalProperties": {
    "$ref": "#/components/schemas/ComplexModel"
  }
}
```

```yaml
type: object
additionalProperties:
  $ref: '#/components/schemas/ComplexModel'
```

###### Model with Annotated Enumeration

```json
{
  "oneOf": [
    {
      "const": "RGB",
      "title": "Red, Green, Blue",
      "description": "Specify colors with the red, green, and blue additive color model"
    },
    {
      "const": "CMYK",
      "title": "Cyan, Magenta, Yellow, Black",
      "description": "Specify colors with the cyan, magenta, yellow, and black subtractive color model"
    }
  ]
}
```

```yaml
oneOf:
  - const: RGB
    title: Red, Green, Blue
    description: Specify colors with the red, green, and blue additive color model
  - const: CMYK
    title: Cyan, Magenta, Yellow, Black
    description: Specify colors with the cyan, magenta, yellow, and black subtractive color model
```

###### Model with Example

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "format": "int64"
    },
    "name": {
      "type": "string"
    }
  },
  "required": ["name"],
  "examples": [
    {
      "name": "Puma",
      "id": 1
    }
  ]
}
```

```yaml
type: object
properties:
  id:
    type: integer
    format: int64
  name:
    type: string
required:
  - name
examples:
  - name: Puma
    id: 1
```

###### Models with Composition

```json
{
  "components": {
    "schemas": {
      "ErrorModel": {
        "type": "object",
        "required": ["message", "code"],
        "properties": {
          "message": {
            "type": "string"
          },
          "code": {
            "type": "integer",
            "minimum": 100,
            "maximum": 600
          }
        }
      },
      "ExtendedErrorModel": {
        "allOf": [
          {
            "$ref": "#/components/schemas/ErrorModel"
          },
          {
            "type": "object",
            "required": ["rootCause"],
            "properties": {
              "rootCause": {
                "type": "string"
              }
            }
          }
        ]
      }
    }
  }
}
```

```yaml
components:
  schemas:
    ErrorModel:
      type: object
      required:
        - message
        - code
      properties:
        message:
          type: string
        code:
          type: integer
          minimum: 100
          maximum: 600
    ExtendedErrorModel:
      allOf:
        - $ref: '#/components/schemas/ErrorModel'
        - type: object
          required:
            - rootCause
          properties:
            rootCause:
              type: string
```

###### Models with Polymorphism Support

The following example describes a `Pet` model that can represent either a cat or a dog, as distinguished by the `petType` property. Each type of pet has other properties beyond those of the base `Pet` model. An instance without a `petType` property, or with a `petType` property that does not match either `cat` or `dog`, is invalid.

```yaml
components:
  schemas:
    Pet:
      type: object
      properties:
        name:
          type: string
      required:
        - name
        - petType
      oneOf:
        - $ref: '#/components/schemas/Cat'
        - $ref: '#/components/schemas/Dog'
    Cat:
      description: A pet cat
      type: object
      properties:
        petType:
          const: 'cat'
        huntingSkill:
          type: string
          description: The measured skill for hunting
          enum:
            - clueless
            - lazy
            - adventurous
            - aggressive
      required:
        - huntingSkill
    Dog:
      description: A pet dog
      type: object
      properties:
        petType:
          const: 'dog'
        packSize:
          type: integer
          format: int32
          description: the size of the pack the dog is from
          default: 0
          minimum: 0
      required:
        - packSize
```

###### Models with Polymorphism Support and a Discriminator Object

The following example extends the example of the previous section by adding a [Discriminator Object](#discriminator-object) to the `Pet` schema. Note that the Discriminator Object is only a hint to the consumer of the API and does not change the validation outcome of the schema.

```yaml
components:
  schemas:
    Pet:
      type: object
      discriminator:
        propertyName: petType
        mapping:
          cat: '#/components/schemas/Cat'
          dog: '#/components/schemas/Dog'
      properties:
        name:
          type: string
      required:
        - name
        - petType
      oneOf:
        - $ref: '#/components/schemas/Cat'
        - $ref: '#/components/schemas/Dog'
    Cat:
      description: A pet cat
      type: object
      properties:
        petType:
          const: 'cat'
        huntingSkill:
          type: string
          description: The measured skill for hunting
          enum:
            - clueless
            - lazy
            - adventurous
            - aggressive
      required:
        - huntingSkill
    Dog:
      description: A pet dog
      type: object
      properties:
        petType:
          const: 'dog'
        packSize:
          type: integer
          format: int32
          description: the size of the pack the dog is from
          default: 0
          minimum: 0
      required:
        - petType
        - packSize
```

###### Models with Polymorphism Support using allOf and a Discriminator Object

It is also possible to describe polymorphic models using `allOf`. The following example uses `allOf` with a [Discriminator Object](#discriminator-object) to describe a polymorphic `Pet` model.

```yaml
components:
  schemas:
    Pet:
      type: object
      discriminator:
        propertyName: petType
      properties:
        name:
          type: string
        petType:
          type: string
      required:
        - name
        - petType
    Cat: # "Cat" will be used as the discriminating value
      description: A representation of a cat
      allOf:
        - $ref: '#/components/schemas/Pet'
        - type: object
          properties:
            huntingSkill:
              type: string
              description: The measured skill for hunting
              enum:
                - clueless
                - lazy
                - adventurous
                - aggressive
          required:
            - huntingSkill
    Dog: # "Dog" will be used as the discriminating value
      description: A representation of a dog
      allOf:
        - $ref: '#/components/schemas/Pet'
        - type: object
          properties:
            packSize:
              type: integer
              format: int32
              description: the size of the pack the dog is from
              default: 0
              minimum: 0
          required:
            - packSize
```

###### Generic Data Structure Model

```JSON
{
  "components": {
    "schemas": {
      "genericArrayComponent": {
        "$id": "fully_generic_array",
        "type": "array",
        "items": {
          "$dynamicRef": "#generic-array"
        },
        "$defs": {
          "allowAll": {
            "$dynamicAnchor": "generic-array"
          }
        }
      },
      "numberArray": {
        "$id": "array_of_numbers",
        "$ref": "fully_generic_array",
        "$defs": {
          "numbersOnly": {
            "$dynamicAnchor": "generic-array",
            "type": "number"
          }
        }
      },
      "stringArray": {
        "$id": "array_of_strings",
        "$ref": "fully_generic_array",
        "$defs": {
          "stringsOnly": {
            "$dynamicAnchor": "generic-array",
            "type": "string"
          }
        }
      },
      "objWithTypedArray": {
        "$id": "obj_with_typed_array",
        "type": "object",
        "required": ["dataType", "data"],
        "properties": {
          "dataType": {
            "enum": ["string", "number"]
          }
        },
        "oneOf": [{
          "properties": {
            "dataType": {"const": "string"},
            "data": {"$ref": "array_of_strings"}
          }
        }, {
          "properties": {
            "dataType": {"const": "number"},
            "data": {"$ref": "array_of_numbers"}
          }
        }]
      }
    }
  }
}
```

```YAML
components:
  schemas:
    genericArrayComponent:
      $id: fully_generic_array
      type: array
      items:
        $dynamicRef: '#generic-array'
      $defs:
        allowAll:
          $dynamicAnchor: generic-array
    numberArray:
      $id: array_of_numbers
      $ref: fully_generic_array
      $defs:
        numbersOnly:
          $dynamicAnchor: generic-array
          type: number
    stringArray:
      $id: array_of_strings
      $ref: fully_generic_array
      $defs:
        stringsOnly:
          $dynamicAnchor: generic-array
          type: string
    objWithTypedArray:
      $id: obj_with_typed_array
      type: object
      required:
      - dataType
      - data
      properties:
        dataType:
          enum:
          - string
          - number
      oneOf:
      - properties:
          dataType:
            const: string
          data:
            $ref: array_of_strings
      - properties:
          dataType:
            const: number
          data:
            $ref: array_of_numbers
```

#### Discriminator Object

When request bodies or response payloads may be one of a number of different schemas, these should use the JSON Schema `anyOf` or `oneOf` keywords to describe the possible schemas (see [Composition and Inheritance](#composition-and-inheritance-polymorphism)).

A polymorphic schema MAY include a Discriminator Object, which defines the name of the property that may be used as a hint for which schema of the `anyOf` or `oneOf`, or which schema that references the current schema in an `allOf`, is expected to validate the structure of the model.
This hint can be used to aid in serialization, deserialization, and validation.
The Discriminator Object does this by implicitly or explicitly associating the possible values of a named property with alternative schemas.

Note that `discriminator` MUST NOT change the validation outcome of the schema.

##### Fixed Fields

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="property-name"></a>propertyName | `string` | **REQUIRED**. The name of the discriminating property in the payload that will hold the discriminating value. The discriminating property MAY be defined as required or optional, but when defined as optional the Discriminator Object MUST include a `defaultMapping` field that specifies which schema is expected to validate the structure of the model when the discriminating property is not present. |
| <a name="discriminator-mapping"></a> mapping | Map[`string`, `string`] | An object to hold mappings between payload values and schema names or URI references. |
| <a name="default"></a> defaultMapping | `string` | The schema name or URI reference to a schema that is expected to validate the structure of the model when the discriminating property is not present in the payload. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Conditions for Using the Discriminator Object

The Discriminator Object is legal only when using one of the composite keywords `oneOf`, `anyOf`, `allOf`.

In both the `oneOf` and `anyOf` use cases, where those keywords are adjacent to `discriminator`, all possible schemas MUST be listed explicitly.

To avoid redundancy, the discriminator MAY be added to a parent schema definition, and all schemas building on the parent schema via an `allOf` construct may be used as an alternate schema.

The `allOf` form of `discriminator` is _only_ useful for non-validation use cases; validation with the parent schema with this form of `discriminator` _does not_ perform a search for child schemas or use them in validation in any way.
This is because `discriminator` cannot change the validation outcome, and no standard JSON Schema keyword connects the parent schema to the child schemas.

The behavior of any configuration of `oneOf`, `anyOf`, `allOf` and `discriminator` that is not described above is undefined.

##### Options for Mapping Values to Schemas

The value of the property named in `propertyName` is used as the name of the associated schema under the [Components Object](#components-object), _unless_ a `mapping` is present for that value.
The `mapping` entry maps a specific property value to either a different schema component name, or to a schema identified by a URI.
When using implicit or explicit schema component names, inline `oneOf` or `anyOf` subschemas are not considered.
The behavior of a `mapping` value or `defaultMapping` value that is both a valid schema name and a valid relative URI reference is implementation-defined, but it is RECOMMENDED that it be treated as a schema name.
To ensure that an ambiguous value (e.g. `"foo"`) is treated as a relative URI reference by all implementations, authors MUST prefix it with the `"."` path segment (e.g. `"./foo"`).

Mapping keys MUST be string values, but tooling MAY convert response values to strings for comparison.
However, the exact nature of such conversions are implementation-defined.

##### Optional discriminating property

When the discriminating property is defined as optional, the [Discriminator Object](#discriminator-object) MUST include a `defaultMapping` field that specifies a schema that is expected to validate the structure of the model when the discriminating property is not present in the payload. This allows the schema to still be validated correctly even if the discriminating property is missing.

The primary use case for an optional discriminating property is to allow a schema to be extended with a discriminator without breaking existing clients that do not provide the discriminating property.

Typically the schema specified in the `defaultMapping` field will specify that the discriminating property is not present, e.g.

```yaml
OtherPet:
  type: object
  not:
    required: ['petType']
```

This will prevent the default mapping schema from validating a payload that includes the discriminating property, which would cause a validation of the payload to fail when polymorphism is described using the `oneOf` JSON schema keyword.

##### Examples

For these examples, assume all schemas are in the [entry document](#openapi-description-structure) of the OAD; for handling of `discriminator` in referenced documents see [Resolving Implicit Connections](#resolving-implicit-connections).

In OAS 3.x, a response payload MAY be described to be exactly one of any number of types:

```yaml
MyResponseType:
  oneOf:
    - $ref: '#/components/schemas/Cat'
    - $ref: '#/components/schemas/Dog'
    - $ref: '#/components/schemas/Lizard'
```

which means the payload _MUST_, by validation, match exactly one of the schemas described by `Cat`, `Dog`, or `Lizard`. Deserialization of a `oneOf` can be a costly operation, as it requires determining which schema matches the payload and thus should be used in deserialization. This problem also exists for `anyOf` schemas. A `discriminator` MAY be used as a "hint" to improve the efficiency of selection of the matching schema. The [Discriminator Object](#discriminator-object) cannot change the validation result of the `oneOf`, it can only help make the deserialization more efficient and provide better error messaging. We can specify the exact field that tells us which schema is expected to match the instance:

```yaml
MyResponseType:
  oneOf:
    - $ref: '#/components/schemas/Cat'
    - $ref: '#/components/schemas/Dog'
    - $ref: '#/components/schemas/Lizard'
  discriminator:
    propertyName: petType
```

The expectation now is that a property with name `petType` _MUST_ be present in the response payload, and the value will correspond to the name of a schema defined in the OpenAPI Description. Thus the response payload:

```json
{
  "id": 12345,
  "petType": "Cat"
}
```

will indicate that the `Cat` schema is expected to match this payload.

In scenarios where the value of the discriminating property does not match the schema name or implicit mapping is not possible, an optional `mapping` definition MAY be used:

```yaml
MyResponseType:
  oneOf:
    - $ref: '#/components/schemas/Cat'
    - $ref: '#/components/schemas/Dog'
    - $ref: '#/components/schemas/Lizard'
    - $ref: https://gigantic-server.com/schemas/Monster/schema.json
  discriminator:
    propertyName: petType
    mapping:
      dog: '#/components/schemas/Dog'
      monster: https://gigantic-server.com/schemas/Monster/schema.json
```

Here the discriminating value of `dog` will map to the schema `#/components/schemas/Dog`, rather than the default (implicit) value of `#/components/schemas/dog`. If the discriminating value does not match an implicit or explicit mapping, no schema can be determined and validation SHOULD fail.

When used in conjunction with the `anyOf` construct, the use of the discriminator can avoid ambiguity for serializers/deserializers where multiple schemas may satisfy a single payload.

When the discriminating property is defined as optional, the Discriminator Object MUST include a `defaultMapping` field that specifies a schema of the `anyOf` or `oneOf` is expected to validate the structure of the model when the discriminating property is not present in the payload. This allows the schema to still be validated correctly even if the discriminator property is missing.

For example:

```yaml
MyResponseType:
  oneOf:
    - $ref: '#/components/schemas/Cat'
    - $ref: '#/components/schemas/Dog'
    - $ref: '#/components/schemas/Lizard'
    - $ref: '#/components/schemas/OtherPet'
  discriminator:
    propertyName: petType
    defaultMapping: OtherPet
OtherPet:
  type: object
  not:
    required: ['petType']
```

In this example, if the `petType` property is not present in the payload, the payload should validate against the `OtherPet` schema.

This example shows the `allOf` usage, which avoids needing to reference all child schemas in the parent:

```yaml
components:
  schemas:
    Pet:
      type: object
      required:
        - petType
      properties:
        petType:
          type: string
      discriminator:
        propertyName: petType
        mapping:
          dog: Dog
    Cat:
      allOf:
        - $ref: '#/components/schemas/Pet'
        - type: object
          # all other properties specific to a `Cat`
          properties:
            name:
              type: string
    Dog:
      allOf:
        - $ref: '#/components/schemas/Pet'
        - type: object
          # all other properties specific to a `Dog`
          properties:
            bark:
              type: string
    Lizard:
      allOf:
        - $ref: '#/components/schemas/Pet'
        - type: object
          # all other properties specific to a `Lizard`
          properties:
            lovesRocks:
              type: boolean
```

Validated against the `Pet` schema, a payload like this:

```json
{
  "petType": "Cat",
  "name": "Misty"
}
```

will indicate that the `#/components/schemas/Cat` schema is expected to match. Likewise this payload:

```json
{
  "petType": "dog",
  "bark": "soft"
}
```

will map to `#/components/schemas/Dog` because the `dog` entry in the `mapping` element maps to `Dog` which is the schema name for `#/components/schemas/Dog`.

#### XML Object

A metadata object that allows for more fine-tuned XML model definitions.

When using arrays, XML element names are _not_ inferred (for singular/plural forms) and the `name` field SHOULD be used to add that information.
See examples for expected behavior.

##### Fixed Fields

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="xml-name"></a>name | `string` | Replaces the name of the element/attribute used for the described schema property. When defined within `items`, it will affect the name of the individual XML elements within the list. When defined alongside `type` being `"array"` (outside the `items`), it will affect the wrapping element if and only if `wrapped` is `true`. If `wrapped` is `false`, it will be ignored. |
| <a name="xml-namespace"></a>namespace | `string` | The URI of the namespace definition. Value MUST be in the form of a non-relative URI. |
| <a name="xml-prefix"></a>prefix | `string` | The prefix to be used for the [name](#xml-name). |
| <a name="xml-attribute"></a>attribute | `boolean` | Declares whether the property definition translates to an attribute instead of an element. Default value is `false`. |
| <a name="xml-wrapped"></a>wrapped | `boolean` | MAY be used only for an array definition. Signifies whether the array is wrapped (for example, `<books><book/><book/></books>`) or unwrapped (`<book/><book/>`). Default value is `false`. The definition takes effect only when defined alongside `type` being `"array"` (outside the `items`). |

This object MAY be extended with [Specification Extensions](#specification-extensions).

The `namespace` field is intended to match the syntax of [XML namespaces](https://www.w3.org/TR/xml-names11/), although there are a few caveats:

* Versions 3.1.0, 3.0.3, and earlier of this specification erroneously used the term "absolute URI" instead of "non-relative URI", so authors using namespaces that include a fragment should check tooling support carefully.
* XML allows but discourages relative URI-references, while this specification outright forbids them.
* XML 1.1 allows IRIs ([RFC3987](https://datatracker.ietf.org/doc/html/rfc3987)) as namespaces, and specifies that namespaces are compared without any encoding or decoding, which means that IRIs encoded to meet this specification's URI syntax requirement cannot be compared to IRIs as-is.

##### XML Object Examples

Each of the following examples represent the value of the `properties` keyword in a [Schema Object](#schema-object) that is omitted for brevity.
The JSON and YAML representations of the `properties` value are followed by an example XML representation produced for the single property shown.

###### No XML Element

Basic string property:

```json
{
  "animals": {
    "type": "string"
  }
}
```

```yaml
animals:
  type: string
```

```xml
<animals>...</animals>
```

Basic string array property ([`wrapped`](#xml-wrapped) is `false` by default):

```json
{
  "animals": {
    "type": "array",
    "items": {
      "type": "string"
    }
  }
}
```

```yaml
animals:
  type: array
  items:
    type: string
```

```xml
<animals>...</animals>
<animals>...</animals>
<animals>...</animals>
```

###### XML Name Replacement

```json
{
  "animals": {
    "type": "string",
    "xml": {
      "name": "animal"
    }
  }
}
```

```yaml
animals:
  type: string
  xml:
    name: animal
```

```xml
<animal>...</animal>
```

###### XML Attribute, Prefix and Namespace

In this example, a full model definition is shown.

```json
{
  "Person": {
    "type": "object",
    "properties": {
      "id": {
        "type": "integer",
        "format": "int32",
        "xml": {
          "attribute": true
        }
      },
      "name": {
        "type": "string",
        "xml": {
          "namespace": "https://example.com/schema/sample",
          "prefix": "sample"
        }
      }
    }
  }
}
```

```yaml
Person:
  type: object
  properties:
    id:
      type: integer
      format: int32
      xml:
        attribute: true
    name:
      type: string
      xml:
        namespace: https://example.com/schema/sample
        prefix: sample
```

```xml
<Person id="123">
    <sample:name xmlns:sample="https://example.com/schema/sample">example</sample:name>
</Person>
```

###### XML Arrays

Changing the element names:

```json
{
  "animals": {
    "type": "array",
    "items": {
      "type": "string",
      "xml": {
        "name": "animal"
      }
    }
  }
}
```

```yaml
animals:
  type: array
  items:
    type: string
    xml:
      name: animal
```

```xml
<animal>value</animal>
<animal>value</animal>
```

The external `name` field has no effect on the XML:

```json
{
  "animals": {
    "type": "array",
    "items": {
      "type": "string",
      "xml": {
        "name": "animal"
      }
    },
    "xml": {
      "name": "aliens"
    }
  }
}
```

```yaml
animals:
  type: array
  items:
    type: string
    xml:
      name: animal
  xml:
    name: aliens
```

```xml
<animal>value</animal>
<animal>value</animal>
```

Even when the array is wrapped, if a name is not explicitly defined, the same name will be used both internally and externally:

```json
{
  "animals": {
    "type": "array",
    "items": {
      "type": "string"
    },
    "xml": {
      "wrapped": true
    }
  }
}
```

```yaml
animals:
  type: array
  items:
    type: string
  xml:
    wrapped: true
```

```xml
<animals>
  <animals>value</animals>
  <animals>value</animals>
</animals>
```

To overcome the naming problem in the example above, the following definition can be used:

```json
{
  "animals": {
    "type": "array",
    "items": {
      "type": "string",
      "xml": {
        "name": "animal"
      }
    },
    "xml": {
      "wrapped": true
    }
  }
}
```

```yaml
animals:
  type: array
  items:
    type: string
    xml:
      name: animal
  xml:
    wrapped: true
```

```xml
<animals>
  <animal>value</animal>
  <animal>value</animal>
</animals>
```

Affecting both internal and external names:

```json
{
  "animals": {
    "type": "array",
    "items": {
      "type": "string",
      "xml": {
        "name": "animal"
      }
    },
    "xml": {
      "name": "aliens",
      "wrapped": true
    }
  }
}
```

```yaml
animals:
  type: array
  items:
    type: string
    xml:
      name: animal
  xml:
    name: aliens
    wrapped: true
```

```xml
<aliens>
  <animal>value</animal>
  <animal>value</animal>
</aliens>
```

If we change the external element but not the internal ones:

```json
{
  "animals": {
    "type": "array",
    "items": {
      "type": "string"
    },
    "xml": {
      "name": "aliens",
      "wrapped": true
    }
  }
}
```

```yaml
animals:
  type: array
  items:
    type: string
  xml:
    name: aliens
    wrapped: true
```

```xml
<aliens>
  <aliens>value</aliens>
  <aliens>value</aliens>
</aliens>
```

#### Security Scheme Object

Defines a security scheme that can be used by the operations.

Supported schemes are HTTP authentication, an API key (either as a header, a cookie parameter or as a query parameter), mutual TLS (use of a client certificate), OAuth2's common flows (implicit, password, client credentials and authorization code) as defined in [RFC6749](https://tools.ietf.org/html/rfc6749), OAuth2 device authorization flow as defined in [RFC8628](https://tools.ietf.org/html/rfc8628), and [[OpenID-Connect-Core]].
Please note that as of 2020, the implicit flow is about to be deprecated by [OAuth 2.0 Security Best Current Practice](https://tools.ietf.org/html/draft-ietf-oauth-security-topics). Recommended for most use cases is Authorization Code Grant flow with PKCE.

##### Fixed Fields

| Field Name | Type | Applies To | Description |
| ---- | :----: | ---- | ---- |
| <a name="security-scheme-type"></a>type | `string` | Any | **REQUIRED**. The type of the security scheme. Valid values are `"apiKey"`, `"http"`, `"mutualTLS"`, `"oauth2"`, `"openIdConnect"`. |
| <a name="security-scheme-description"></a>description | `string` | Any | A description for security scheme. [CommonMark syntax](https://spec.commonmark.org/) MAY be used for rich text representation. |
| <a name="security-scheme-name"></a>name | `string` | `apiKey` | **REQUIRED**. The name of the header, query or cookie parameter to be used. |
| <a name="security-scheme-in"></a>in | `string` | `apiKey` | **REQUIRED**. The location of the API key. Valid values are `"query"`, `"header"`, or `"cookie"`. |
| <a name="security-scheme-scheme"></a>scheme | `string` | `http` | **REQUIRED**. The name of the HTTP Authentication scheme to be used in the [Authorization header as defined in RFC7235](https://tools.ietf.org/html/rfc7235#section-5.1). The values used SHOULD be registered in the [IANA Authentication Scheme registry](https://www.iana.org/assignments/http-authschemes/http-authschemes.xhtml). The value is case-insensitive, as defined in [RFC7235](https://datatracker.ietf.org/doc/html/rfc7235#section-2.1). |
| <a name="security-scheme-bearer-format"></a>bearerFormat | `string` | `http` (`"bearer"`) | A hint to the client to identify how the bearer token is formatted. Bearer tokens are usually generated by an authorization server, so this information is primarily for documentation purposes. |
| <a name="security-scheme-flows"></a>flows | [OAuth Flows Object](#oauth-flows-object) | `oauth2` | **REQUIRED**. An object containing configuration information for the flow types supported. |
| <a name="security-scheme-open-id-connect-url"></a>openIdConnectUrl | `string` | `openIdConnect` | **REQUIRED**. [Well-known URL](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig) to discover the [[OpenID-Connect-Discovery]] [provider metadata](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata). |
| <a name="security-scheme-oauth2-metadata-url"></a>oauth2MetadataUrl | `string` | `oauth2` | URL to the oauth2 authorization server metadata [RFC8414](https://datatracker.ietf.org/doc/html/rfc8414). TLS is required. |
| <a name="security-scheme-deprecated"></a>deprecated | `boolean` | Any | Declares this security scheme to be deprecated. Consumers SHOULD refrain from usage of the declared scheme. Default value is `false`. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Security Scheme Object Examples

###### Basic Authentication Example

```json
{
  "type": "http",
  "scheme": "basic"
}
```

```yaml
type: http
scheme: basic
```

###### API Key Example

```json
{
  "type": "apiKey",
  "name": "api-key",
  "in": "header"
}
```

```yaml
type: apiKey
name: api-key
in: header
```

###### JWT Bearer Example

```json
{
  "type": "http",
  "scheme": "bearer",
  "bearerFormat": "JWT"
}
```

```yaml
type: http
scheme: bearer
bearerFormat: JWT
```

###### MutualTLS Example

```json
{
  "type": "mutualTLS",
  "description": "Cert must be signed by example.com CA"
}
```

```yaml
type: mutualTLS
description: Cert must be signed by example.com CA
```

###### Implicit OAuth2 Example

```json
{
  "type": "oauth2",
  "flows": {
    "implicit": {
      "authorizationUrl": "https://example.com/api/oauth/dialog",
      "scopes": {
        "write:pets": "modify pets in your account",
        "read:pets": "read your pets"
      }
    }
  }
}
```

```yaml
type: oauth2
flows:
  implicit:
    authorizationUrl: https://example.com/api/oauth/dialog
    scopes:
      write:pets: modify pets in your account
      read:pets: read your pets
```

#### OAuth Flows Object

Allows configuration of the supported OAuth Flows.

##### Fixed Fields

| Field Name | Type | Description |
| ---- | :----: | ---- |
| <a name="oauth-flows-implicit"></a>implicit | [OAuth Flow Object](#oauth-flow-object) | Configuration for the OAuth Implicit flow |
| <a name="oauth-flows-password"></a>password | [OAuth Flow Object](#oauth-flow-object) | Configuration for the OAuth Resource Owner Password flow |
| <a name="oauth-flows-client-credentials"></a>clientCredentials | [OAuth Flow Object](#oauth-flow-object) | Configuration for the OAuth Client Credentials flow. Previously called `application` in OpenAPI 2.0. |
| <a name="oauth-flows-authorization-code"></a>authorizationCode | [OAuth Flow Object](#oauth-flow-object) | Configuration for the OAuth Authorization Code flow. Previously called `accessCode` in OpenAPI 2.0. |
| <a name="oauth-flows-device-authorization"></s>deviceAuthorization| [OAuth Flow Object](#oauth-flow-object) | Configuration for the OAuth Device Authorization flow. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

#### OAuth Flow Object

Configuration details for a supported OAuth Flow

##### Fixed Fields

| Field Name | Type | Applies To | Description |
| ---- | :----: | ---- | ---- |
| <a name="oauth-flow-authorization-url"></a>authorizationUrl | `string` | `oauth2` (`"implicit"`, `"authorizationCode"`) | **REQUIRED**. The authorization URL to be used for this flow. This MUST be in the form of a URL. The OAuth2 standard requires the use of TLS. |
| <a name="oauth-flow-device-authorization-url"></s>deviceAuthorizationUrl | `string` | `oauth2` (`"deviceAuthorization"`) | **REQUIRED**. The device authorization URL to be used for this flow. This MUST be in the form of a URL. The OAuth2 standard requires the use of TLS. |
| <a name="oauth-flow-token-url"></a>tokenUrl | `string` | `oauth2` (`"password"`, `"clientCredentials"`, `"authorizationCode"`, `"deviceAuthorization"`) | **REQUIRED**. The token URL to be used for this flow. This MUST be in the form of a URL. The OAuth2 standard requires the use of TLS. |
| <a name="oauth-flow-refresh-url"></a>refreshUrl | `string` | `oauth2` | The URL to be used for obtaining refresh tokens. This MUST be in the form of a URL. The OAuth2 standard requires the use of TLS. |
| <a name="oauth-flow-scopes"></a>scopes | Map[`string`, `string`] | `oauth2` | **REQUIRED**. The available scopes for the OAuth2 security scheme. A map between the scope name and a short description for it. The map MAY be empty. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### OAuth Flow Object Example

```JSON
{
  "type": "oauth2",
  "flows": {
    "implicit": {
      "authorizationUrl": "https://example.com/api/oauth/dialog",
      "scopes": {
        "write:pets": "modify pets in your account",
        "read:pets": "read your pets"
      }
    },
    "authorizationCode": {
      "authorizationUrl": "https://example.com/api/oauth/dialog",
      "tokenUrl": "https://example.com/api/oauth/token",
      "scopes": {
        "write:pets": "modify pets in your account",
        "read:pets": "read your pets"
      }
    }
  }
}
```

```yaml
type: oauth2
flows:
  implicit:
    authorizationUrl: https://example.com/api/oauth/dialog
    scopes:
      write:pets: modify pets in your account
      read:pets: read your pets
  authorizationCode:
    authorizationUrl: https://example.com/api/oauth/dialog
    tokenUrl: https://example.com/api/oauth/token
    scopes:
      write:pets: modify pets in your account
      read:pets: read your pets
```

#### Security Requirement Object

Lists the required security schemes to execute this operation.
The name used for each property MUST correspond to a security scheme declared in the [Security Schemes](#security-scheme-object) under the [Components Object](#components-object).

A Security Requirement Object MAY refer to multiple security schemes in which case all schemes MUST be satisfied for a request to be authorized.
This enables support for scenarios where multiple query parameters or HTTP headers are required to convey security information.

When the `security` field is defined on the [OpenAPI Object](#openapi-object) or [Operation Object](#operation-object) and contains multiple Security Requirement Objects, only one of the entries in the list needs to be satisfied to authorize the request.
This enables support for scenarios where the API allows multiple, independent security schemes.

An empty Security Requirement Object (`{}`) indicates anonymous access is supported.

##### Patterned Fields

| Field Pattern | Type | Description |
| ---- | :----: | ---- |
| <a name="security-requirements-name"></a>{name} | [`string`] | Each name MUST correspond to a security scheme which is declared in the [Security Schemes](#security-scheme-object) under the [Components Object](#components-object). If the security scheme is of type `"oauth2"` or `"openIdConnect"`, then the value is a list of scope names required for the execution, and the list MAY be empty if authorization does not require a specified scope. For other security scheme types, the array MAY contain a list of role names which are required for the execution, but are not otherwise defined or exchanged in-band. |

##### Security Requirement Object Examples

See also [Appendix F: Resolving Security Requirements in a Referenced Document](#appendix-f-resolving-security-requirements-in-a-referenced-document) for an example using Security Requirement Objects in multi-document OpenAPI Descriptions.

###### Non-OAuth2 Security Requirement

```json
{
  "api_key": []
}
```

```yaml
api_key: []
```

###### OAuth2 Security Requirement

```json
{
  "petstore_auth": ["write:pets", "read:pets"]
}
```

```yaml
petstore_auth:
  - write:pets
  - read:pets
```

###### Optional OAuth2 Security

Optional OAuth2 security as would be defined in an <a href="#openapi-object">OpenAPI Object</a> or an <a href="#operation-object">Operation Object</a>:

```json
{
  "security": [
    {},
    {
      "petstore_auth": ["write:pets", "read:pets"]
    }
  ]
}
```

```yaml
security:
  - {}
  - petstore_auth:
      - write:pets
      - read:pets
```

### Specification Extensions

While the OpenAPI Specification tries to accommodate most use cases, additional data can be added to extend the specification at certain points.

The extensions properties are implemented as patterned fields that are always prefixed by `x-`.

| Field Pattern | Type | Description |
| ---- | :--: | ---- |
| <a name="extension-properties"></a>^x- | Any | Allows extensions to the OpenAPI Schema. The field name MUST begin with `x-`, for example, `x-internal-id`. Field names beginning `x-oai-` and `x-oas-` are reserved for uses defined by the [OpenAPI Initiative](https://www.openapis.org/). The value can be any valid JSON value (`null`, a primitive, an array, or an object.) |

The OpenAPI Initiative maintains several [[OpenAPI-Registry|extension registries]], including registries for [individual extension keywords](https://spec.openapis.org/registry/extension/) and [extension keyword namespaces](https://spec.openapis.org/registry/namespace/).

Extensions are one of the best ways to prove the viability of proposed additions to the specification.
It is therefore RECOMMENDED that implementations be designed for extensibility to support community experimentation.

Support for any one extension is OPTIONAL, and support for one extension does not imply support for others.

### Security Filtering

Some objects in the OpenAPI Specification MAY be declared and remain empty, or be completely removed, even though they are inherently the core of the API documentation.

The reasoning is to allow an additional layer of access control over the documentation.
While not part of the specification itself, certain libraries MAY choose to allow access to parts of the documentation based on some form of authentication/authorization.

Two examples of this:

1. The [Paths Object](#paths-object) MAY be present but empty. It may be counterintuitive, but this may tell the viewer that they got to the right place, but can't access any documentation. They would still have access to at least the [Info Object](#info-object) which may contain additional information regarding authentication.
2. The [Path Item Object](#path-item-object) MAY be empty. In this case, the viewer will be aware that the path exists, but will not be able to see any of its operations or parameters. This is different from hiding the path itself from the [Paths Object](#paths-object), because the user will be aware of its existence. This allows the documentation provider to finely control what the viewer can see.

## Security Considerations

### OpenAPI Description Formats

OpenAPI Descriptions use a combination of JSON, YAML, and JSON Schema, and therefore share their security considerations:

* [JSON](https://www.iana.org/assignments/media-types/application/json)
* [YAML](https://www.iana.org/assignments/media-types/application/yaml)
* [JSON Schema Core](https://tools.ietf.org/html/draft-bhutton-json-schema-00#section-13)
* [JSON Schema Validation](https://tools.ietf.org/html/draft-bhutton-json-schema-validation-00#section-10)

### Tooling and Usage Scenarios

In addition, OpenAPI Descriptions are processed by a wide variety of tooling for numerous different purposes, such as client code generation, documentation generation, server side routing, and API testing. OpenAPI Description authors must consider the risks of the scenarios where the OpenAPI Description may be used.

### Security Schemes

An OpenAPI Description describes the security schemes used to protect the resources it defines. The security schemes available offer varying degrees of protection. Factors such as the sensitivity of the data and the potential impact of a security breach should guide the selection of security schemes for the API resources. Some security schemes, such as basic auth and OAuth Implicit flow, are supported for compatibility with existing APIs. However, their inclusion in OpenAPI does not constitute an endorsement of their use, particularly for highly sensitive data or operations.

### Handling External Resources

OpenAPI Descriptions may contain references to external resources that may be dereferenced automatically by consuming tools. External resources may be hosted on different domains that may be untrusted.

### Handling Reference Cycles

References in an OpenAPI Description may cause a cycle. Tooling must detect and handle cycles to prevent resource exhaustion.

### Markdown and HTML Sanitization

Certain fields allow the use of Markdown which can contain HTML including script. It is the responsibility of tooling to appropriately sanitize the Markdown.

## Appendix A: Revision History

| Version | Date | Notes |
| ---- | ---- | ---- |
| 3.2.0 | TBD | Release of the OpenAPI Specification 3.2.0 |
| 3.1.1 | 2024-10-24 | Patch release of the OpenAPI Specification 3.1.1 |
| 3.1.0 | 2021-02-15 | Release of the OpenAPI Specification 3.1.0 |
| 3.1.0-rc1 | 2020-10-08 | rc1 of the 3.1 specification |
| 3.1.0-rc0 | 2020-06-18 | rc0 of the 3.1 specification |
| 3.0.4 | 2024-10-24 | Patch release of the OpenAPI Specification 3.0.4 |
| 3.0.3 | 2020-02-20 | Patch release of the OpenAPI Specification 3.0.3 |
| 3.0.2 | 2018-10-08 | Patch release of the OpenAPI Specification 3.0.2 |
| 3.0.1 | 2017-12-06 | Patch release of the OpenAPI Specification 3.0.1 |
| 3.0.0 | 2017-07-26 | Release of the OpenAPI Specification 3.0.0 |
| 3.0.0-rc2 | 2017-06-16 | rc2 of the 3.0 specification |
| 3.0.0-rc1 | 2017-04-27 | rc1 of the 3.0 specification |
| 3.0.0-rc0 | 2017-02-28 | Implementer's Draft of the 3.0 specification |
| 2.0 | 2015-12-31 | Donation of Swagger 2.0 to the OpenAPI Initiative |
| 2.0 | 2014-09-08 | Release of Swagger 2.0 |
| 1.2 | 2014-03-14 | Initial release of the formal document. |
| 1.1 | 2012-08-22 | Release of Swagger 1.1 |
| 1.0 | 2011-08-10 | First release of the Swagger Specification |

## Appendix B: Data Type Conversion

Serializing typed data to plain text, which can occur in `text/plain` message bodies or `multipart` parts, as well as in the `application/x-www-form-urlencoded` format in either URL query strings or message bodies, involves significant implementation- or application-defined behavior.

[Schema Objects](#schema-object) validate data based on the [JSON Schema data model](https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-00#section-4.2.1), which only recognizes four primitive data types: strings (which are [only broadly interoperable as UTF-8](https://datatracker.ietf.org/doc/html/rfc7159#section-8.1)), numbers, booleans, and `null`.
Notably, integers are not a distinct type from other numbers, with `type: "integer"` being a convenience defined mathematically, rather than based on the presence or absence of a decimal point in any string representation.

The [Parameter Object](#parameter-object), [Header Object](#header-object), and [Encoding Object](#encoding-object) offer features to control how to arrange values from array or object types.
They can also be used to control how strings are further encoded to avoid reserved or illegal characters.
However, there is no general-purpose specification for converting schema-validated non-UTF-8 primitive data types (or entire arrays or objects) to strings.

Two cases do offer standards-based guidance:

* [RFC3987](https://datatracker.ietf.org/doc/html/rfc3987#section-3.1) provides guidance for converting non-Unicode strings to UTF-8, particularly in the context of URIs (and by extension, the form media types which use the same encoding rules)
* [RFC6570](https://www.rfc-editor.org/rfc/rfc6570#section-2.3) specifies which values, including but not limited to `null`, are considered _undefined_ and therefore treated specially in the expansion process when serializing based on that specification

Implementations of RFC6570 often have their own conventions for converting non-string values, but these are implementation-specific and not defined by the RFC itself.
This is one reason for the OpenAPI Specification to leave these conversions as implementation-defined: It allows using RFC6570 implementations regardless of how they choose to perform the conversions.

To control the serialization of numbers, booleans, and `null` (or other values RFC6570 deems to be undefined) more precisely, schemas can be defined as `type: "string"` and constrained using `pattern`, `enum`, `format`, and other keywords to communicate how applications must pre-convert their data prior to schema validation.
The resulting strings would not require any further type conversion.

The `format` keyword can assist in serialization.
Some formats (such as `date-time`) are unambiguous, while others (such as [`decimal`](https://spec.openapis.org/registry/format/decimal.html) in the [Format Registry](https://spec.openapis.org/registry/format/)) are less clear.
However, care must be taken with `format` to ensure that the specific formats are supported by all relevant tools as unrecognized formats are ignored.

Requiring input as pre-formatted, schema-validated strings also improves round-trip interoperability as not all programming languages and environments support the same data types.

## Appendix C: Using RFC6570-Based Serialization

Serialization is defined in terms of [RFC6570](https://www.rfc-editor.org/rfc/rfc6570) URI Templates in three scenarios:

| Object | Condition |
| ---- | ---- |
| [Parameter Object](#parameter-object) | When `schema` is present |
| [Header Object](#header-object) | When `schema` is present |
| [Encoding Object](#encoding-object) | When encoding for `application/x-www-form-urlencoded` and any of `style`, `explode`, or `allowReserved` are used |

Implementations of this specification MAY use an implementation of RFC6570 to perform variable expansion, however, some caveats apply.

Note that when using `style: "form"` RFC6570 expansion to produce an `application/x-www-form-urlencoded` HTTP message body, it is necessary to remove the `?` prefix that is produced to satisfy the URI query string syntax.

When using `style` and similar keywords to produce a `multipart/form-data` body, the query string names are placed in the `name` parameter of the `Content-Disposition` part header, and the values are placed in the corresponding part body; the `?`, `=`, and `&` characters are not used.
Note that while [RFC7578](https://datatracker.ietf.org/doc/html/rfc7578) allows using [[RFC3986]] percent-encoding in "file names", it does not otherwise address the use of percent-encoding within the format.
RFC7578 discusses character set and encoding issues for `multipart/form-data` in detail, and it is RECOMMENDED that OpenAPI Description authors read this guidance carefully before deciding to use RFC6570-based serialization with this media type.

Note also that not all RFC6570 implementations support all four levels of operators, all of which are needed to fully support the OpenAPI Specification's usage.
Using an implementation with a lower level of support will require additional manual construction of URI Templates to work around the limitations.

### Equivalences Between Fields and RFC6570 Operators

Certain field values translate to RFC6570 [operators](https://datatracker.ietf.org/doc/html/rfc6570#section-2.2) (or lack thereof):

| field | value | equivalent |
| ---- | ---- | ---- |
| style | `"simple"` | _n/a_ |
| style | `"matrix"` | `;` prefix operator |
| style | `"label"` | `.` prefix operator |
| style | `"form"` | `?` prefix operator |
| allowReserved | `false` | _n/a_ |
| allowReserved | `true` | `+` prefix operator |
| explode | `false` | _n/a_ |
| explode | `true` | `*` modifier suffix |

Multiple `style: "form"` parameters are equivalent to a single RFC6570 [variable list](https://www.rfc-editor.org/rfc/rfc6570#section-2.2) using the `?` prefix operator:

```YAML
parameters:
- name: foo
  in: query
  schema:
    type: object
  explode: true
- name: bar
  in: query
  schema:
    type: string
```

This example is equivalent to RFC6570's `{?foo*,bar}`, and **NOT** `{?foo*}{&bar}`. The latter is problematic because if `foo` is not defined, the result will be an invalid URI.
The `&` prefix operator has no equivalent in the Parameter Object.

Note that RFC6570 does not specify behavior for compound values beyond the single level addressed by `explode`. The result of using objects or arrays where no behavior is clearly specified for them is implementation-defined.

### Delimiters in Parameter Values

Delimiters used by RFC6570 expansion, such as the `,` used to join arrays or object values with `style: "simple"`, are all automatically percent-encoded as long as `allowReserved` is `false`.
Note that since RFC6570 does not define a way to parse variables based on a URI Template, users must take care to first split values by delimiter before percent-decoding values that might contain the delimiter character.

When `allowReserved` is `true`, both percent-encoding (prior to joining values with a delimiter) and percent-decoding (after splitting on the delimiter) must be done manually at the correct time.

See [Appendix E](#appendix-e-percent-encoding-and-form-media-types) for additional guidance on handling delimiters for `style` values with no RFC6570 equivalent that already need to be percent-encoded when used as delimiters.

### Non-RFC6570 Field Values and Combinations

Configurations with no direct [RFC6570](https://datatracker.ietf.org/doc/html/rfc6570) equivalent SHOULD also be handled according to RFC6570.
Implementations MAY create a properly delimited URI Template with variables for individual names and values using RFC6570 regular or reserved expansion (based on `allowReserved`).

This includes:

* the styles `pipeDelimited`, `spaceDelimited`, and `deepObject`, which have no equivalents at all
* the combination of the style `form` with `allowReserved: true`, which is not allowed because only one prefix operator can be used at a time
* any parameter name that is not a legal RFC6570 variable name

The Parameter Object's `name` field has a much more permissive syntax than RFC6570 [variable name syntax](https://www.rfc-editor.org/rfc/rfc6570#section-2.3).
A parameter name that includes characters outside of the allowed RFC6570 variable character set MUST be percent-encoded before it can be used in a URI Template.

### Examples

Let's say we want to use the following data in a form query string, where `formulas` is exploded, and `words` is not:

```YAML
formulas:
  a: x+y
  b: x/y
  c: x^y
words:
- math
- is
- fun
```

#### RFC6570-Equivalent Expansion

This array of Parameter Objects uses regular `style: "form"` expansion, fully supported by [RFC6570](https://datatracker.ietf.org/doc/html/rfc6570):

```YAML
parameters:
- name: formulas
  in: query
  schema:
    type: object
    additionalProperties:
      type: string
  explode: true
- name: words
  in: query
  schema:
    type: array
    items:
      type: string
```

This translates to the following URI Template:

```uritemplate
{?formulas*,words}
```

when expanded with the data given earlier, we get:

```uri
?a=x%2By&b=x%2Fy&c=x%5Ey&words=math,is,fun
```

#### Expansion with Non-RFC6570-Supported Options

But now let's say that (for some reason), we really want that `/` in the `b` formula to show up as-is in the query string, and we want our words to be space-separated like in a written phrase.
To do that, we'll add `allowReserved: true` to `formulas`, and change to `style: "spaceDelimited"` for `words`:

```YAML
parameters:
- name: formulas
  in: query
  schema:
    type: object
    additionalProperties:
      type: string
  explode: true
  allowReserved: true
- name: words
  in: query
  style: spaceDelimited
  explode: false
  schema:
    type: array
    items:
      type: string
```

We can't combine the `?` and `+` RFC6570 [prefixes](https://datatracker.ietf.org/doc/html/rfc6570#section-2.4.1), and there's no way with RFC6570 to replace the `,` separator with a space character.
So we need to restructure the data to fit a manually constructed URI Template that passes all of the pieces through the right sort of expansion.

Here is one such template, using a made-up convention of `words.0` for the first entry in the words value, `words.1` for the second, and `words.2` for the third:

```uritemplate
?a={+a}&b={+b}&c={+c}&words={words.0} {words.1} {words.2}
```

RFC6570 [mentions](https://www.rfc-editor.org/rfc/rfc6570.html#section-2.4.2) the use of `.` "to indicate name hierarchy in substructures," but does not define any specific naming convention or behavior for it.
Since the `.` usage is not automatic, we'll need to construct an appropriate input structure for this new template.

We'll also need to pre-process the values for `formulas` because while `/` and most other reserved characters are allowed in the query string by RFC3986, `[`, `]`, and `#` [are not](https://datatracker.ietf.org/doc/html/rfc3986#appendix-A), and `&`, `=`, and `+` all have [special behavior](https://www.rfc-editor.org/rfc/rfc1866#section-8.2.1) in the `application/x-www-form-urlencoded` format, which is what we are using in the query string.

Setting `allowReserved: true` does _not_ make reserved characters that are not allowed in URIs allowed, it just allows them to be _passed through expansion unchanged._
Therefore, any tooling still needs to percent-encode those characters because reserved expansion will not do it, but it _will_ leave the percent-encoded triples unchanged.
See also [Appendix E](#appendix-e-percent-encoding-and-form-media-types) for further guidance on percent-encoding and form media types, including guidance on handling the delimiter characters for `spaceDelimited`, `pipeDelimited`, and `deepObject` in parameter names and values.

So here is our data structure that arranges the names and values to suit the template above, where values for `formulas` have `[]#&=+` pre-percent encoded (although only `+` appears in this example):

```YAML
a: x%2By
b: x/y
c: x^y
words.0: math
words.1: is
words.2: fun
```

Expanding our manually assembled template with our restructured data yields the following query string:

```uri
?a=x%2By&b=x/y&c=x%5Ey&words=math%20is%20fun
```

The `/` and the pre-percent-encoded `%2B` have been left alone, but the disallowed `^` character (inside a value) and space characters (in the template but outside of the expanded variables) were percent-encoded.

#### Undefined Values and Manual URI Template Construction

Care must be taken when manually constructing templates to handle the values that RFC6570 [considers to be _undefined_](https://datatracker.ietf.org/doc/html/rfc6570#section-2.3) correctly:

```YAML
formulas: {}
words:
- hello
- world
```

Using this data with our original RFC6570-friendly URI Template, `{?formulas*,words}`, produces the following:

```uri
?words=hello,world
```

This means that the manually constructed URI Template and restructured data need to leave out the `formulas` object entirely so that the `words` parameter is the first and only parameter in the query string.

Restructured data:

```YAML
words.0: hello
words.1: world
```

Manually constructed URI Template:

```uritemplate
?words={words.0} {words.1}
```

Result:

```uri
?words=hello%20world
```

#### Illegal Variable Names as Parameter Names

In this example, the heart emoji is not legal in URI Template names (or URIs):

```YAML
parameters:
- name: ❤️
  in: query
  schema:
    type: string
```

We can't just pass `❤️: "love!"` to an RFC6570 implementation.
Instead, we have to pre-percent-encode the name (which is a six-octet UTF-8 sequence) in both the data and the URI Template:

```YAML
"%E2%9D%A4%EF%B8%8F": love!
```

```uritemplate
{?%E2%9D%A4%EF%B8%8F}
```

This will expand to the result:

```uri
?%E2%9D%A4%EF%B8%8F=love%21
```

## Appendix D: Serializing Headers and Cookies

[RFC6570](https://www.rfc-editor.org/rfc/rfc6570)'s percent-encoding behavior is not always appropriate for `in: "header"` and `in: "cookie"` parameters.
In many cases, it is more appropriate to use `content` with a media type such as `text/plain` and require the application to assemble the correct string.

For both [RFC6265](https://www.rfc-editor.org/rfc/rfc6265) cookies and HTTP headers using the [RFC8941](https://www.rfc-editor.org/rfc/rfc8941) structured fields syntax, non-ASCII content is handled using base64 encoding (`contentEncoding: "base64"`).
Note that the standard base64-encoding alphabet includes non-URL-safe characters that are percent-encoded by RFC6570 expansion; serializing values through both encodings is NOT RECOMMENDED.
While `contentEncoding` also supports the `base64url` encoding, which is URL-safe, the header and cookie RFCs do not mention this encoding.

Most HTTP headers predate the structured field syntax, and a comprehensive assessment of their syntax and encoding rules is well beyond the scope of this specification.
While [RFC8187](https://www.rfc-editor.org/rfc/rfc8187) recommends percent-encoding HTTP (header or trailer) field parameters, these parameters appear after a `;` character.
With `style: "simple"`, that delimiter would itself be percent-encoded, violating the general HTTP field syntax.

Using `style: "form"` with `in: "cookie"` is ambiguous for a single value, and incorrect for multiple values.
This is true whether the multiple values are the result of using `explode: true` or not.

This style is specified to be equivalent to RFC6570 form expansion which includes the `?` character (see [Appendix C](#appendix-c-using-rfc6570-based-serialization) for more details), which is not part of the cookie syntax.
However, examples of this style in past versions of this specification have not included the `?` prefix, suggesting that the comparison is not exact.
Because implementations that rely on an RFC6570 implementation and those that perform custom serialization based on the style example will produce different results, it is implementation-defined as to which of the two results is correct.

For multiple values, `style: "form"` is always incorrect as name=value pairs in cookies are delimited by `;` (a semicolon followed by a space character) rather than `&`.

## Appendix E: Percent-Encoding and Form Media Types

_**NOTE:** In this section, the `application/x-www-form-urlencoded` and `multipart/form-data` media types are abbreviated as `form-urlencoded` and `form-data`, respectively, for readability._

Percent-encoding is used in URIs and media types that derive their syntax from URIs.
This process is concerned with three sets of characters, the names of which vary among specifications but are defined as follows for the purposes of this section:

* _unreserved_ characters do not need to be percent-encoded; while it is safe to percent-encode them, doing so produces a URI that is [not normalized](https://datatracker.ietf.org/doc/html/rfc3986#section-6.2.2.2)
* _reserved_ characters either have special behavior in the URI syntax (such as delimiting components) or are reserved for other specifications that need to define special behavior (e.g. `form-urlencoded` defines special behavior for `=`, `&`, and `+`)
* _unsafe_ characters are known to cause problems when parsing URIs in certain environments

Unless otherwise specified, this section uses RFC3986's definition of [reserved](https://datatracker.ietf.org/doc/html/rfc3986#section-2.2) and [unreserved](https://datatracker.ietf.org/doc/html/rfc3986#section-2.3), and defines the unsafe set as all characters not included in either of those sets.

### Percent-Encoding and `form-urlencoded`

Each URI component (such as the query string) considers some of the reserved characters to be unsafe, either because they serve as delimiters between the components (e.g. `#`), or (in the case of `[` and `]`) were historically considered globally unsafe but were later given reserved status for limited purposes.

Reserved characters with no special meaning defined within a component can be left un-percent encoded.
However, other specifications can define special meanings, requiring percent-encoding for those characters outside of the additional special meanings.

The `form-urlencoded` media type defines special meanings for `=` and `&` as delimiters, and `+` as the replacement for the space character (instead of its percent-encoded form of `%20`).
This means that while these three characters are reserved-but-allowed in query strings by RFC3986, they must be percent-encoded in `form-urlencoded` query strings except when used for their `form-urlencoded` purposes; see [Appendix C](#appendix-c-using-rfc6570-based-serialization) for an example of handling `+` in form values.

### Percent-Encoding and `form-data`

[RFC7578](https://datatracker.ietf.org/doc/html/rfc7578#section-2) suggests RFC3986-based percent-encoding as a mechanism to keep text-based per-part header data such as file names within the ASCII character set.
This suggestion was not part of older (pre-2015) specifications for `form-data`, so care must be taken to ensure interoperability.

The `form-data` media type allows arbitrary text or binary data in its parts, so percent-encoding is not needed and is likely to cause interoperability problems unless the `Content-Type` of the part is defined to require it.

### Generating and Validating URIs and `form-urlencoded` Strings

URI percent encoding and the `form-urlencoded` media type have complex specification histories spanning multiple revisions and, in some cases, conflicting claims of ownership by different standards bodies.
Unfortunately, these specifications each define slightly different percent-encoding rules, which need to be taken into account if the URIs or `form-urlencoded` message bodies will be subject to strict validation.
(Note that many URI parsers do not perform validation by default.)

This specification normatively cites the following relevant standards:

| Specification | Date | OAS Usage | Percent-Encoding | Notes |
| ---- | ---- | ---- | ---- | ---- |
| [RFC3986](https://www.rfc-editor.org/rfc/rfc3986) | 01/2005 | URI/URL syntax | [[RFC3986]] | obsoletes [[RFC1738]], [[RFC2396]] |
| [RFC6570](https://www.rfc-editor.org/rfc/rfc6570) | 03/2012 | style-based serialization | [[RFC3986]] | does not use `+` for <code>form&#8209;urlencoded</code> |
| [RFC1866](https://datatracker.ietf.org/doc/html/rfc1866#section-8.2.1) | 11/1995 | content-based serialization | [[RFC1738]] | obsoleted by [[HTML401]] [Section 17.13.4.1](https://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.1), [[URL]] [Section 5](https://url.spec.whatwg.org/#urlencoded-serializing) |

Style-based serialization is used in the [Parameter Object](#parameter-object) when `schema` is present, and in the [Encoding Object](#encoding-object) when at least one of `style`, `explode`, or `allowReserved` is present.
See [Appendix C](#appendix-c-using-rfc6570-based-serialization) for more details of RFC6570's two different approaches to percent-encoding, including an example involving `+`.

Content-based serialization is defined by the [Media Type Object](#media-type-object), and used with the [Parameter Object](#parameter-object) when the `content` field is present, and with the [Encoding Object](#encoding-object) based on the `contentType` field when the fields `style`, `explode`, and `allowReserved` are absent.
Each part is encoded based on the media type (e.g. `text/plain` or `application/json`), and must then be percent-encoded for use in a `form-urlencoded` string.

Note that content-based serialization for `form-data` does not expect or require percent-encoding in the data, only in per-part header values.

#### Interoperability with Historical Specifications

In most cases, generating query strings in strict compliance with [[RFC3986]] is sufficient to pass validation (including JSON Schema's `format: "uri"` and `format: "uri-reference"`), but some `form-urlencoded` implementations still expect the slightly more restrictive [[RFC1738]] rules to be used.

Since all RFC1738-compliant URIs are compliant with RFC3986, applications needing to ensure historical interoperability SHOULD use RFC1738's rules.

#### Interoperability with Web Browser Environments

WHATWG is a [web browser-oriented](https://whatwg.org/faq#what-is-the-whatwg-working-on) standards group that has defined a "URL Living Standard" for parsing and serializing URLs in a browser context, including parsing and serializing `form-urlencoded` data.
WHATWG's percent-encoding rules for query strings are different depending on whether the query string is [being treated as `form-urlencoded`](https://url.spec.whatwg.org/#application-x-www-form-urlencoded-percent-encode-set) (where it requires more percent-encoding than [[RFC1738]]) or [as part of the generic syntax](https://url.spec.whatwg.org/#query-percent-encode-set), where it allows characters that [[RFC3986]] forbids.

Implementations needing maximum compatibility with web browsers SHOULD use WHATWG's `form-urlencoded` percent-encoding rules.
However, they SHOULD NOT rely on WHATWG's less stringent generic query string rules, as the resulting URLs would fail RFC3986 validation, including JSON Schema's `format: uri` and `format: uri-reference`.

### Decoding URIs and `form-urlencoded` Strings

The percent-decoding algorithm does not care which characters were or were not percent-decoded, which means that URIs percent-encoded according to any specification will be decoded correctly.

Similarly, all `form-urlencoded` decoding algorithms simply add `+`-for-space handling to the percent-decoding algorithm, and will work regardless of the encoding specification used.

However, care must be taken to use `form-urlencoded` decoding if `+` represents a space, and to use regular percent-decoding if `+` represents itself as a literal value.

### Percent-Encoding and Illegal or Reserved Delimiters

The `[`, `]`, `|`, and space characters, which are used as delimiters for the `deepObject`, `pipeDelimited`, and `spaceDelimited` styles, respectively, all MUST be percent-encoded to comply with [[RFC3986]].
This requires users to pre-encode the character(s) in some other way in parameter names and values to distinguish them from the delimiter usage when using one of these styles.

The space character is always illegal and encoded in some way by all implementations of all versions of the relevant standards.
While one could use the `form-urlencoded` convention of `+` to distinguish spaces in parameter names and values from `spaceDelimited` delimiters encoded as `%20`, the specifications define the decoding as a single pass, making it impossible to distinguish the different usages in the decoded result.

Some environments use `[`, `]`, and possibly `|` unencoded in query strings without apparent difficulties, and WHATWG's generic query string rules do not require percent-encoding them.
Code that relies on leaving these delimiters unencoded, while using regular percent-encoding for them within names and values, is not guaranteed to be interoperable across all implementations.

For maximum interoperability, it is RECOMMENDED to either define and document an additional escape convention while percent-encoding the delimiters for these styles, or to avoid these styles entirely.
The exact method of additional encoding/escaping is left to the API designer, and is expected to be performed before serialization and encoding described in this specification, and reversed after this specification's encoding and serialization steps are reversed.
This keeps it outside of the processes governed by this specification.

## Appendix F: Resolving Security Requirements in a Referenced Document

This appendix shows how to retrieve an HTTP-accessible multi-document OpenAPI Description (OAD) and resolve a [Security Requirement Object](#security-requirement-object) in the referenced (non-entry) document. See [Resolving Implicit Connections](#resolving-implicit-connections) for more information.

First, the [entry document](#openapi-description-structure) is where parsing begins. It defines the `MySecurity` security scheme to be JWT-based, and it defines a Path Item as a reference to a component in another document:

```HTTP
GET /api/description/openapi HTTP/1.1
Host: www.example.com
Accept: application/openapi+json
```

```json
"components": {
  "securitySchemes": {
    "MySecurity": {
      "type": "http",
      "scheme": "bearer",
      "bearerFormat": "JWT"
    }
  }
},
"paths": {
  "/foo": {
    "$ref": "other#/components/pathItems/Foo"
  }
}
```

```HTTP
GET /api/description/openapi HTTP/1.1
Host: www.example.com
Accept: application/openapi+yaml
```

```yaml
components:
  securitySchemes:
    MySecurity:
      type: http
      scheme: bearer
      bearerFormat: JWT
paths:
  /foo:
    $ref: 'other#/components/pathItems/Foo'
```

This entry document references another document, `other`, without using a file extension. This gives the client the flexibility to choose an acceptable format on a resource-by-resource basis, assuming both representations are available:

```HTTP
GET /api/description/other HTTP/1.1
Host: www.example.com
Accept: application/openapi+json
```

```json
"components": {
  "securitySchemes": {
    "MySecurity": {
      "type": "http",
      "scheme": "basic"
    }
  },
  "pathItems": {
    "Foo": {
      "get": {
        "security": [
          "MySecurity": []
        ]
      }
    }
  }
}
```

```HTTP
GET /api/description/other HTTP/1.1
Host: www.example.com
Accept: application/openapi+yaml
```

```yaml
components:
  securitySchemes:
    MySecurity:
      type: http
      scheme: basic
  pathItems:
    Foo:
      get:
        security:
          - MySecurity: []
```

In the `other` document, the referenced path item has a Security Requirement for a Security Scheme, `MySecurity`. The same Security Scheme exists in the original entry document. As outlined in [Resolving Implicit Connections](#resolving-implicit-connections), `MySecurity` is resolved with an [implementation-defined behavior](#undefined-and-implementation-defined-behavior). However, documented in that section, it is RECOMMENDED that tools resolve component names from the [entry document](#openapi-description-structure). As with all implementation-defined behavior, it is important to check tool documentation to determine which behavior is supported.
