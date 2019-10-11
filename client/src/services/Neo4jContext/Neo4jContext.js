import { createContext } from "react";
import { v1 as neo4j } from "neo4j-driver";

const Neo4jContext = createContext(null);

export default Neo4jContext;
