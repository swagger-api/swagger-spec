import { readdirSync, readFileSync } from "node:fs";
import YAML from "yaml";
import { validate, setMetaSchemaOutputFormat } from "@hyperjump/json-schema/openapi-3-1";
import { BASIC } from "@hyperjump/json-schema/experimental";
import { describe, test, expect } from "vitest";

import contentTypeParser from "content-type";
import { addMediaTypePlugin } from "@hyperjump/browser";
import { buildSchemaDocument } from "@hyperjump/json-schema/experimental";

addMediaTypePlugin("application/schema+yaml", {
    parse: async (response) => {
      const contentType = contentTypeParser.parse(response.headers.get("content-type") ?? "");
      const contextDialectId = contentType.parameters.schema ?? contentType.parameters.profile;
  
      const foo = YAML.parse(await response.text());
      return buildSchemaDocument(foo, response.url, contextDialectId);
    },
    fileMatcher: (path) => path.endsWith(".yaml")
  });

const parseYamlFromFile = (filePath) => {
  const schemaYaml = readFileSync(filePath, "utf8");
  return YAML.parse(schemaYaml, { prettyErrors: true });
};

setMetaSchemaOutputFormat(BASIC);

const validateOpenApi = await validate("./src/schemas/validation/schema.yaml");
const fixtures = './tests/schema';

describe("v3.1", () => {
  describe("Pass", () => {
    readdirSync(`${fixtures}/pass`, { withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.yaml$/.test(entry.name))
      .forEach((entry) => {
        test(entry.name, () => {
          const instance = parseYamlFromFile(`${fixtures}/pass/${entry.name}`);
          const output = validateOpenApi(instance, BASIC);
          expect(output.valid).to.equal(true);
        });
      });
  });

  describe("Fail", () => {
    readdirSync(`${fixtures}/fail`, { withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.yaml$/.test(entry.name))
      .forEach((entry) => {
        test(entry.name, () => {
          const instance = parseYamlFromFile(`${fixtures}/fail/${entry.name}`);
          const output = validateOpenApi(instance, BASIC);
          expect(output.valid).to.equal(false);
        });
      });
  });
});
