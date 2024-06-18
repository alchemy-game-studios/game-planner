import fs from "fs";
import { buildSchema  } from "graphql";
import path from "path"

const __dirname = import.meta.dirname;
const schemaPath = path.join(__dirname, 'schema.graphql');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

export default function() {
    return buildSchema(schemaContent);
}