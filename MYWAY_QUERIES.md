# MyWay Queries

In `./graphql-ld-queries` zitten allerlei queries die kunnen gebruikt worden in MyWay.

Deze queries kunnen op de gebruikelijke manier aan het GraphQL-LD endpoint van de skosAPI worden gegeven (https://ilearn.ilabt.imec.be/skos-api/v1/graphqlld),
samen met de parameters, zoals intussen bekend.

De queries zijn momenteel zo compleet mogelijk wat betreft output velden en kunnen dus (deels) gestript worden, afhankelijke van de noden.

Verder bevat de folder ook voorbeeldcode in JavaScript (onder `./src`). Dit is (louter ter informatie) ons testprogrammaatje waarmee we de queries zelf allemaal hebben getest.

De output van onze testrun is overigens ook te vinden (onder `./output`). Op die manier is te zien welke output elke query kan opleveren, zonder deze zelf uit te voeren.

Een laatste folder (`./contexts`) bevat de JSON-LD context die gebruikt wordt (deze wordt overigens in het GraphQL-LD endpoint van de skosAPI impliciet verondersteld).

## Algemeen
We hebben 2 types van data: collecties en concepten. Zo is `onderwijsniveaus` een collectie, en `basis - lager - 6e leerjaar` een concept.

Alle bestaande collecties kunnen worden opgevraagd met de query `collections.gql`.

Eens een collectie gekozen uit de output van vorige, geeft de query `collection-hierarchy.gql` met parameter ID = de ID van die collectie, de hiërarchie van die collectie weer.
Deze bevat dan een top-down boomstructuur die de concepten in die collectie omschrijft.

Van elk concept kan de hiërarchie (neerwaarts en binnen een bepaalde collectie) opgevraagd worden met de query `concept-hierarchy.gql`
met parameter CONCEPT = de ID van het concept en parameter COLLECTION = de ID van de collectie.

Verdere queries voeren uit wat hun naam (en in line commentaren) suggereren. Hieronder enkele relevante use cases.

## Nota bene
We gebruiken hier overal de benaming `onderwijsniveau` waar eigenlijk `onderwijsstructuur` een betere naam zou zijn.
We laten het zo omwille van historische redenen.

## Enkele use cases

### Overzicht van de onderwijsniveaus
Voer uit:

query `collection-hierarchy.gql`

- parameters
  - ID: http://ilearn.ilabt.imec.be/vocab/elem/ondniv
- output
  - voorbeeld: `collection-hierarchy-on-ondniv.json`

### Overzicht van een bepaald onderwijsniveau
Voer uit:

query `concept-hierarchy.gql`

- parameters
  - CONCEPT: ID van een bepaald onderwijsniveau
  - COLLECTION: http://ilearn.ilabt.imec.be/vocab/elem/ondniv
- output
  - voorbeeld: `concept-hierarchy-on-ondniv-lager.json`

### Van onderwijsniveau naar curriculum concepts en hun related concepts
Voer eerst uit:

query `onderwijsniveau-to-curriculum-collection.gql`

- parameters
  - ID: een gegeven onderwijsniveau concept (eerder gevonden in overzicht onderwijsniveaus)
- output
  - voorbeeld: `onderwijsniveau-to-curriculum-collection-on-sec-gr1-astroom.json`
  - geeft de collecties weer verbonden (related) aan het onderwijsniveau, rechtstreeks of via elk hoger (broaderTransitive) of via elk lager (narrowerTransitive) onderwijsniveau in de onderwijsniveau hiërarchie.
  - `related` is telkens een array, want het kan gaan over meer dan één collectie.

Voer vervolgens uit voor elke collectie in de output van hierboven:

query `collection-members-and-narrower.gql`

- parameters
  - ID: ID van de collectie
- output
  - voorbeeld: `collection-members-and-narrower-on-sleutelcompetenties.json`
  - geeft de concepten in de gegeven collectie weer (bijvoorbeeld de sleutelcompetenties) en voor elk concept de hiërarchisch lager gelegen concepten (bijvoorbeeld de bouwstenen).

Voer vervolgens een of meerdere queries uit voor elk concept in de output van hierboven:

query `concept-related.gql`: algemene query om related concepts te vinden (zie lager voor mogelijke verfijningen)

- parameters
  - ID: ID van het concept
- output
  - voorbeeld: `concept-related-on-curr1-s-literatuur.json`
  - geeft alle concepten weer verbonden (related) aan het concept. Dit kunnen onder andere zijn:
    - vakken (te herkennen omdat ze `memberOf http://ilearn.ilabt.imec.be/vocab/elem/vakken` zijn)
    - trefwoorden (te herkennen omdat ze `memberOf http://ilearn.ilabt.imec.be/vocab/elem/trefwoorden` zijn)
    - onderwijsdoelen (te herkennen omdat ze `memberOf http://ilearn.ilabt.imec.be/vocab/elem/onddoel` zijn)

query `concept-related1.gql`: meer verfijnde query om related concepts uit een bepaalde collectie te vinden

- Uitermate geschikt voor het opvragen van vakken en trefwoorden.

- parameters
  - ID: ID van het concept
  - COLLECTION: ID van de collectie waartoe het related concept moet behoren
- output
  - voorbeeld: `concept-related1-on-curr1-s-geld-en-consumptie-and-coll-vakken.json`
  - geeft alle *vakken* weer verbonden (related) aan het concept

query `concept-related2.gql`: meer verfijnde query om concepts uit een bepaalde collectie te vinden, die related zijn aan twee gegeven concepts

- Uitermate geschikt voor het opvragen van onderwijsdoelen die related zijn aan een bouwsteen en aan de van toepassing zijnde sleutelcompetentie.

- parameters
  - ID1: ID van het concept
  - ID2: ID van het concept
  - COLLECTION: ID van de collectie waartoe het related concept moet behoren
- output
  - voorbeeld: `concept-related2-on-curr1-s-geld-en-consumptie-and-curr1-c-duurzaamheid-and-coll-onddoel.json.json`
  - geeft alle *onderwijsdoelen* weer verbonden (related) aan beide concepts (hier een bouwsteen en een sleutelcompetentie). Met ander woorden: de onderwijsdoelen die van toepassing zijn voor deze bouwsteen in de context van deze sleutelcompetentie.

## Van onderwijsniveau naar onderwijsdoelen

Dit is nuttig om bijvoorbeeld uit de vorige query-resultaten enkel die onderwijsdoelen te behouden die van toepassing
zijn op een bedoeld onderwijsniveau.
Hiertoe neme men de doorsnede van de onderwijsdoelen uit de vorige query en deze van de query hier, uitgevoerd voor dat bedoeld onderwijsniveau.

Voer uit:

query `onderwijsniveau-to-onderwijsdoelen.gql`

- parameters
  - ID: het bedoelde onderwijsniveau concept
- output
  - voorbeeld: `onderwijsniveau-to-onderwijsdoelen-on-sec-gr1-astroom.json`
  - geeft de onderwijsdoelen weer verbonden (related) aan het onderwijsniveau, rechtstreeks of via elk hoger (broaderTransitive) of via elk lager (narrowerTransitive) onderwijsniveau in de onderwijsniveau hiërarchie.

## Bottom-up, vertrekkende van een bepaald concept

Dit is nuttig om bijvoorbeeld vertrekkende van een gegeven combinatie van concepten (bijvoorbeeld één bouwsteen, één sleutelcompetentie, één onderwijsdoel en één onderwijsniveau),
op zoek te gaan naar alle gemeenschappelijk geconnecteerde andere concepten en de collecties waartoe ze behoren. 

Voer uit:

query `concept-related-broader-transitive-narrower-transitive.gql`

- parameters
  - ID: het bedoelde concept
- output
  - voorbeelden:
    - `concept-related-broader-transitive-narrower-transitive-on-curr1-s-geld-en-consumptie.json`
    - `concept-related-broader-transitive-narrower-transitive-on-curr1-c-economisch-financiele-competenties.json`
    - `concept-related-broader-transitive-narrower-transitive-on-onddoel-sec-gr1-astroom-duurzaamheid-11.1.json`
    - `concept-related-broader-transitive-narrower-transitive-on-ondniv-sec-gr1-astroom.json`
  - geeft skos:related concepts, skos:broaderTransitive concepts en skos:narrowerTransitive concepts.
    
Eventueel kan de output omgevormd worden tot een eenvoudig object, voor de "related-for-search" functionaliteit in MyWay
  - voorbeeldcode hiervoor: functie `collectRelatedForSearch` in source file `index.js`.
  - voorbeeld output:  
    - `concept-related-broader-transitive-narrower-transitive-on-curr1-s-geld-en-consumptie-related-for-search.json`
    - `concept-related-broader-transitive-narrower-transitive-on-curr1-c-economisch-financiele-competenties-related-for-search.json`
    - `concept-related-broader-transitive-narrower-transitive-on-onddoel-sec-gr1-astroom-duurzaamheid-11.1-related-for-search.json`
    - `concept-related-broader-transitive-narrower-transitive-on-ondniv-sec-gr1-astroom-related-for-search.json`

## Verwijder de "Nummer / Code" prefix uit de definitie van een onderwijsdoel

Op vraag van het MyWay team begint de skos:definition met de toegekende "Nummer /code" waarde uit de AHOVOKS input.
Deze waarde is in een vrij formaat en vandaar moeilijk terug uit te filteren.
Om dit mogelijk te maken werd ze ter informatie toegevoegd aan de data in de eigenschap skos:hiddenLabel.

Voer uit:

query `basic-including-hidden-label.gql`

- parameters
  - ID: het bedoelde onderwijsdoel concept
- output
  - voorbeeld:
    - `basic-including-hidden-label-on-sec-11.1-1934316131.json`
  - geeft basis informatie, waaronder skos:definition, maar ook skos:hiddenLabel.

Om een definitie te maken zonder de "Nummer / Code" prefix, verwijder het resulterend skos:hiddenLabel + volgende whitespace uit de resulterende skos:definition
