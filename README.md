## Description

A task management API where users can create, update, delete, and fetch tasks.
Additionally, users should be able to comment on tasks. Implement features requiring
knowledge of Redis for caching and rate limiting, Prisma for database interactions, and
Node.js for core functionalities. Build with Prisma + Nest.js

Database design over [here](./docs/database.md)

API design over [here](./docs/api-design.md)

## Installation

```bash
$ pnpm install
```

## (optional) Setup Redis & MySQL locally

You may skip this step if you already have Redis and MySQL installed locally.

```bash
# setup mysql
docker compose up -d db

# setup redis
docker compose up -d redis
```

Next, you will need migrate up the database.

```bash
pnpm run migrate
```

A `tms_db` database should be created upon success migration.

You will also need to seed users before you can run the app

```bash
pnpm run seed
```

5 users should be created after seed successfully.

## Setup environment

You will need to create a .env file in project root. There is a `sample.env` file can be found in project root for reference.

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod

# run in docker
# pre-requisite: create a .local-docker.env locally
# may refer sample-local-docker.env
docker compose build api-server
docker compose up -d api-server
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```
