# API Design

Postman collection with sample response click [here](./task-management.postman_collection.json)

Swagger(a.k.a OpenAPI specification) click [here](./openapi-spec.yaml) -- you can copy/import this file to [online editor](https://editor-next.swagger.io/) to interact

## Response

General response body structure(in json)

```json
{
  "error": "string | null",
  "data": {},
  "pagination": {
    "total": 1,
    "pageCount": 1,
    "page": 1,
    "pageSize": 1
  }
}
```

- `error` - the error message(if any)
- `data` - the model returned
- `pagination` - (optional) only applicable to endpoint support paginated result.
  - `pagination.total` - total records in db
  - `pagination.pageCount` - total number of pages
  - `pagination.page` - current page
  - `pagination.pageSize` - number of records per page

## Query

for query endpoints, we partially adapt [`strapi`](https://docs.strapi.io/dev-docs/api/rest/filters-locale-publication#filtering) style for filtering, sorting and pagination. All text-base parameters support `case-incensitive` inclusive(contains) search.

### Filtering

example 1: simple filter

```bash
/v1/tasks?filters[title]=hello
```

example 2: multiple filters

```bash
/v1/tasks?filters[title]=hello&filters[status]=OPEN
```

example 3: date range filter

```bash
/v1/tasks?filters[createAtStart]=2024-08-01&filters[createdAtEnd]=2024-09-01
```

### Sorting

\*default no sort

example 1: simple sort

```bash
/v1/tasks?sort[0]=createdAt:asc
```

example 2: multiple sort

```bash
/v1/tasks?sort[0]=createdAt:asc&sort[1]=id:desc
```

### Pagination

default: page = 1, pageSize = 10

example 1: simple sort

```bash
/v1/tasks?pagination[page]=1&pagination[pageSize]=10
```

## HTTP Status

- `200 OK` - success
- `201 Created` - success insertion (e.g. POST endpoint)
- `204 No Content` - success deletion (e.g. DELETE endpoint)
- `400 Bad Request` - invalid input
- `404 Not Found` - resource not found

<br>
<hr>

# REST API Endpoints

## Tasks

> GET /v1/tasks/:id

Get task by specific id

<hr>

> GET /v1/tasks

Query tasks

<hr>

> POST /v1/tasks

Create new task

<hr>

> PATCH /v1/tasks/:id

Update an existing task

<hr>

> PUT /v1/tasks/:id

Update(Replace) an existing task. The different with PATCH endpoint is that all dto's properties are required.

<hr>

> DELETE /v1/tasks/:id

Delete a task

<hr>

## Comments

> GET /v1/comments/:id

Get comment by specific id

<hr>

> GET /v1/comments

Query comments - e.g. query comments associate to a task

<hr>

> POST /v1/comments

Create new comment

<hr>

> PATCH /v1/comments/:id

Update an existing comment.

<hr>

> PUT /v1/comments/:id

Update(Replace) an existing comment. The different with PATCH endpoint is that all dto's properties are required.

<hr>

> DELETE /v1/comments/:id

Delete a comment

<hr>
