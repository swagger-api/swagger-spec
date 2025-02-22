## Style Guide

Contributions to this repository should follow the style guide as described in this section.

### Markdown

Markdown files in this project should follow the style enforced by the [markdownlint tool](https://www.npmjs.com/package/markdownlint),
as configured by the `.markdownlint.yaml` file in the root of the project.
The `markdownlint` tool can also fix formatting, which can save time with tables in particular.

The following additional rules should be followed but currently are not enforced by tooling:

1. The first mention of a normative reference or an OAS-defined Object in a (sub)*section is a link, additional mentions are not.
2. OAS-defined Objects such as Schema Objects are written in this style, and are not monospaced.
3. Use "example" instead of "sample" - this spec is not about statistics.
4. Use "OpenAPI Object" instead of "root".
5. Fixed fields are monospaced.
6. Field values are monospaced in JSON notation: `true`, `false`, `null`, `"header"` (with double-quotes around string values).
7. A combination of fixed field name with example value uses JS notation: `in: "header"`, combining rules 5 and 6.
8. An exception to 5-7 is colloquial use, for example "values of type `array` or `object`" - "type" is not monospaced, so the monospaced values aren't enclosed in double quotes.
9. Use [Oxford commas](https://en.wikipedia.org/wiki/Serial_comma), avoid [Shatner commas](https://www.latimes.com/archives/blogs/jacket-copy/story/2011-06-30/goodbye-oxford-comma-hello-shatner-comma).
10. Use `<span id="thing"></span>` for link anchors. The `<a name="thing"></a>` format has been deprecated.
11. Headings use [title case](https://en.wikipedia.org/wiki/Title_case) and are followed by a blank line.

Plus some suggestions, rather than rules:

* Use one sentence per line in paragraphs and bullet points, to make diffs and edits easier to compare and understand.
  A blank line is needed to cause a paragraph break in Markdown.
* In examples, use realistic values rather than foo/bar.

### Use of "keyword", "field", "property", and "attribute"

* JSON Schema keywords -> "keyword"
* OpenAPI fixed fields -> "field"
* property of a "plain" JSON object that is not an OpenAPI-defined Foo Object -> "property"
* "attribute" is only used in the XML context and means "XML attribute"


