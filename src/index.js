/**
 * A body for running GraphQL-LD queries
 */

const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const Converter = require("graphql-to-sparql").Converter;
const toSparql = require("sparqlalgebrajs").toSparql;

const prefices = {
  curr1: "http://ilearn.ilabt.imec.be/vocab/curr1/",
  curr2: "http://ilearn.ilabt.imec.be/vocab/curr2/",
  elem: "http://ilearn.ilabt.imec.be/vocab/elem/",
  ilearn: "http://semweb.mmlab.be/ns/ilearn#",
  lom: "http://semweb.mmlab.be/ns/lom#",
  ondniv: "http://ilearn.ilabt.imec.be/vocab/ondniv/",
  onddoel: "http://ilearn.ilabt.imec.be/vocab/onddoel/",
  owl: "http://www.w3.org/2002/07/owl#",
  skos: "http://www.w3.org/2004/02/skos/core#",
  tref1: "http://ilearn.ilabt.imec.be/vocab/tref1/",
  tref2: "http://ilearn.ilabt.imec.be/vocab/tref2/",
  vak1: "http://ilearn.ilabt.imec.be/vocab/vak1/",
};

const queryDir = path.resolve(__dirname, "../graphql-ld-queries");
const contextsDir = path.resolve(__dirname, "../contexts");
const outputDir = path.resolve(__dirname, "../output");

const commonContext = Object.assign({}, JSON.parse(fs.readFileSync(path.resolve(contextsDir, "common-context.json"), "utf8")));

async function queryToSparql(query, context) {
  const algebra = await new Converter().graphqlToSparqlAlgebra(query, context);
  console.log("=== SPARQL query:");
  console.log(toSparql(algebra));
}

async function fetchResult(query, params) {
  // below, choose between local and remote api testing; final value should always be remote testing!
  const res = await fetch("https://ilearn.ilabt.imec.be/skos-api/v1/graphqlld?" + new URLSearchParams({
    //const res = await fetch("http://localhost:3000/skos-api/v1/graphqlld?" + new URLSearchParams({
    query,
    parameters: JSON.stringify(params),
  }));
  const json = await res.json();
  console.log(`=== Result graph length:\n${json["@graph"].length}`);
  return json;
}

async function runQuery(queryName, titleSuffix, params) {
  const queryFile = `${queryName}.gql`;
  const title = `${queryName}${titleSuffix}`;
  const outputFile = path.resolve(outputDir, `${title}.json`);

  console.log(`===== ${title}`);
  const query = fs.readFileSync(path.resolve(queryDir, queryFile), "utf8");
  console.log("==== Graphql-ld query");
  console.log(query);
  const context = Object.assign(commonContext, params);
  console.log("=== Parameters:");
  console.log(JSON.stringify(params, null, 2));
  await queryToSparql(query, context);
  const result = await fetchResult(query, params);
  console.log(`=== Writing output to ${outputFile}`);
  fs.writeFileSync(outputFile, JSON.stringify(result, null, "  "), "utf8");
}

(async function main() {

  // show me all connections
  await runQuery("collections", "", {});

  // show me the hierarchy in the onderwijsniveau collection
  await runQuery("collection-hierarchy", "-on-ondniv",
    {
      ID: `${prefices.elem}ondniv`
    });

  // show me the hierarchy in the onderwijsniveau collection below a specific concept
  await runQuery("concept-hierarchy", "-on-ondniv-lager",
    {
      CONCEPT: `${prefices.ondniv}basis-lager`,
      COLLECTION: `${prefices.elem}ondniv`
    });

  // show me the members of collection x
  await runQuery("collection-members", "-on-sleutelcompetenties",
    {
      ID: `${prefices.elem}sleutelcompetenties`
    });
  await runQuery("collection-members", "-on-leergebieden",
    {
      ID: `${prefices.elem}leergebieden`
    });

  // show me the members of collection x and their narrower concepts (in any collection)
  await runQuery("collection-members-and-narrower", "-on-sleutelcompetenties",
    {
      ID: `${prefices.elem}sleutelcompetenties`
    });
  await runQuery("collection-members-and-narrower", "-on-leergebieden",
    {
      ID: `${prefices.elem}leergebieden`
    });

  // show me the concepts related to concept x (related concepts include vakken and onderwijsdoelen)
  await runQuery("concept-related", "-on-curr1-s-literatuur",
    {
      ID: `${prefices.curr1}s-literatuur`
    });
  await runQuery("concept-related", "-on-curr2-s-fr-lezen",
    {
      ID: `${prefices.curr2}s-fr-lezen`
    });

  // show me the concepts related to concept x, who are member of collection y
  await runQuery("concept-related1", "-on-curr1-s-geld-en-consumptie-and-coll-vakken",
    {
      ID: `${prefices.curr1}s-geld-en-consumptie`,
      COLLECTION: `${prefices.elem}vakken`
    });

  // show me the concepts related to concept x, who are member of collection y (just for comparison of the output with the next query)
  await runQuery("concept-related1", "-on-curr1-s-geld-en-consumptie-and-coll-onddoel",
    {
      ID: `${prefices.curr1}s-geld-en-consumptie`,
      COLLECTION: `${prefices.elem}onddoel`
    });

  // show me the concepts related to concepts x1 and x2, who are member of collection y
  await runQuery("concept-related2", "-on-curr1-s-geld-en-consumptie-and-curr1-c-duurzaamheid-and-coll-onddoel",
    {
      ID1: `${prefices.curr1}s-geld-en-consumptie`,
      ID2: `${prefices.curr1}c-duurzaamheid`,
      COLLECTION: `${prefices.elem}onddoel`
    });

  // show me the collections in the curricula, connected to onderwijsniveau x, its broader concepts or its narrower concepts
  await runQuery("onderwijsniveau-to-curriculum-collection", "-on-sec",
    {
      ID: `${prefices.ondniv}sec`
    });
  await runQuery("onderwijsniveau-to-curriculum-collection", "-on-sec-gr1",
    {
      ID: `${prefices.ondniv}sec-gr1`
    });
  await runQuery("onderwijsniveau-to-curriculum-collection", "-on-sec-gr1-astroom",
    {
      ID: `${prefices.ondniv}sec-gr1-astroom`
    });
  await runQuery("onderwijsniveau-to-curriculum-collection", "-on-basis",
    {
      ID: `${prefices.ondniv}basis`
    });
  await runQuery("onderwijsniveau-to-curriculum-collection", "-on-basis-lager",
    {
      ID: `${prefices.ondniv}basis-lager`
    });
  await runQuery("onderwijsniveau-to-curriculum-collection", "-on-basis-lager-lj5",
    {
      ID: `${prefices.ondniv}basis-lager-lj5`
    });

  // show me the onderwijsdoelen, connected to onderwijsniveau x, its broader concepts or its narrower concepts
  await runQuery("onderwijsniveau-to-onderwijsdoelen", "-on-sec",
    {
      ID: `${prefices.ondniv}sec`
    });

  await runQuery("onderwijsniveau-to-onderwijsdoelen", "-on-sec-gr1",
    {
      ID: `${prefices.ondniv}sec-gr1`
    });

  await runQuery("onderwijsniveau-to-onderwijsdoelen", "-on-sec-gr1-astroom",
    {
      ID: `${prefices.ondniv}sec-gr1-astroom`
    });

  await runQuery("onderwijsniveau-to-onderwijsdoelen", "-on-basis",
    {
      ID: `${prefices.ondniv}basis`
    });

  await runQuery("onderwijsniveau-to-onderwijsdoelen", "-on-basis-lager",
    {
      ID: `${prefices.ondniv}basis-lager`
    });

  await runQuery("onderwijsniveau-to-onderwijsdoelen", "-on-basis-lager-lj5",
    {
      ID: `${prefices.ondniv}basis-lager-lj5`
    });

})();
