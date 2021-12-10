# MyWay Queries

## Introduction

Some specific GraphQL-LD queries for integration in the iLearn MyWay application.

These queries are tested examples that can be issued at the `skos-api` service's GraphQL-LD endpoint.

See also [this guidance in Dutch](MYWAY_QUERIES.md).

## Structure

- The common context (also known implicitly by the skos API): `./context/common-context.json`
- The queries: `./graphql-ld-queries`
- The code to run the queries: `./src` (a node v14 or higher app: yarn install; yarn start)
- Output of above code: `./output`

## Queries

### basic.gql
A basic informative query. Lists all basic information on anything.

### collections.gql
Lists all known collections.

### collection-hierarchy.gql
For a given collection, retrieve its hierarchy (top down overview of concepts in the collection).

### concept-hierarchy.gql
For a given concept and a given collection, retrieve all concepts lower in the hierarchy and member of the given collection.

### collection-members.gql
For a given collection, retrieve all member concepts.

### collection-members-and-narrower.gql
For a given collection, retrieve all member concepts + their narrower concepts (in any collection).

### concept-related.gql
For a given concept, retrieve related concepts (vakken, trefwoorden and onderwijsdoelen are all related concepts).

*Note that this query does not have a "concept-and-narrower-related" alternative, because that query result is too big to manage.*

### concept-related1.gql
Same as `concept-related.gql`, but in addition, only related concepts member of a given collection are returned.

Example: return only the vakken.

### concept-related2.gql
Same as `concept-related1.gql`, but in addition, only concepts also related to a second concept are returned.

Example: return only the onderwijsdoelen related to a bouwsteen and the applicable sleutelcompetentie. 

### concept-related-broader-transitive-narrower-transitive.gql
For a given concept, retrieve related, broaderTransitive and narrowerTransitiveconcepts.

### onderwijsniveau-to-curriculum-collection.gql
For a given onderwijsniveau, retrieve curriculum collections.
These collections might be connected to the concept, its broader (transitive) concepts or its narrower (transitive) concepts.

### onderwijsniveau-to-onderwijsdoelen.gql
For a given onderwijsniveau, retrieve related onderwijsdoelen.
These onderwijsdoelen might be related to the onderwijsniveau, its broader (transitive) onderwijsniveaus or its narrower (transitive) onderwijsniveaus.

## Advised sequences

- top-down: onderwijsniveau-to-curriculum-collection.gql --> collection-members-and-narrower.gql --> concept-related[x].gql
- bottom-up: concept-related-broader-transitive-narrower-transitive.gql