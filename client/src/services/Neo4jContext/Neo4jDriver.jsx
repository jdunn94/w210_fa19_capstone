import { v1 as neo4j } from "neo4j-driver";

import React from "react";
import Neo4jContext from "./Neo4jContext";

const Neo4jDriver = props => {
  const driver = neo4j.driver(
    // dev
    //"bolt://34.70.225.97",

    // pro
    "bolt://mcai2.dataerrant.com",
    //"bolt://localhost:7687",
    neo4j.auth.basic("guest", "guest"),
    {
      encrypted: true
    }
  );

  return (
    <Neo4jContext.Provider value={driver}>
      {props.children}
    </Neo4jContext.Provider>
  );
};

export default Neo4jDriver;
