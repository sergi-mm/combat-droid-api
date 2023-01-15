# Combat droid YVH API

## Description

Combat droid YVH communication API. Developed with NestJS framework + Typescript. Accepts POST requests on `/radar` with vision data to detect de best target to attack.

Sample payload:
```json
{
  "protocols": [
    "avoid-mech"
  ],
  "scan": [
    {
      "coordinates": {
        "x": 0,
        "y": 40
      },
      "enemies": {
        "type": "soldier",
        "number": 10
      }
    }
  ]
}
```

OpenAPI documentation with SwaggerUI can be found on `/api`.

## Installation

You will need **NodeJS** (v12+ or latest LTS) and **npm** to run this service. Once checked, run:

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# End2End tests
$ npm run test:e2e

# Batch tests
$ ./test/tests.sh
