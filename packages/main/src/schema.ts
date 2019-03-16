import * as fs from "fs"
import { makeExecutableSchema } from "graphql-tools"
import * as path from "path"
import { resolvers } from "./resolvers"

const typeDefs = fs.readFileSync(
  path.join(__dirname, "..", "schema", "schema.graphql"),
  "utf8"
)

// TODO: We cast `resolvers` as `any` to work around type definition
// incompatibility between graphql-codegen and graphql-tools. See
// https://github.com/prisma/graphqlgen/issues/15
export default makeExecutableSchema({ typeDefs, resolvers: resolvers as any })
