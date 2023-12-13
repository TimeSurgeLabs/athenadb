<h1 align="center">🦉AthenaDB⚡️</h1>
<h3 align="center">Serverless, distributed Vector Database as an API written with Cloudflare Workers AI, D1, and Vectorize.</h3>

AthenaDB is a simple, serverless, distributed vector database that can be used as an API. It is written with [Cloudflare Workers AI](https://ai.cloudflare.com), [D1](https://developers.cloudflare.com/d1/), [Vectorize](https://developers.cloudflare.com/vectorize/).

## Features

* Simple API endpoints for inserting, querying, retrieving, and deleting vector text data.
* Embedding generation without storing the text in the database.
* Distributed database with data replication across multiple data centers.

## Getting Started

* Downloads and install [Wrangler](https://developers.cloudflare.com/workers/cli-wrangler/install-update).
* Log in to Wrangler with `wrangler login`.
* Run the following commands:

```bash
git clone https://github.com/TimeSurgeLabs/athenadb.git
cd athenadb
npm run create-vector
npm run create-db
```

Copy the output Database ID and paste it in `wrangler.toml` under `database_id` . Then, run the following two commands:

```bash
npm run init-db
npm run deploy
```

You should get an output with your API URL. You can now use the API endpoints.

## API Endpoints

### `POST /:namespace/insert`

Inserts text data into the database. Text is converted into embeddings using Cloudflare AI and stored along with a unique identifier.
* **Request Body**:
  + `input`: A single string (max 1024 characters).
  + `inputs`: An array of strings (each max 1024 characters).

### `POST /:namespace/query`

Queries the database for similar text embeddings. Specify `?limit=number` in the URL to specify the number of results to return. The default is 5, the maximum is 20.
* **Request Body**:
  + `input`: A single string for querying. (max 1024 characters)
  + `inputs`: An array of strings for batch querying. (each max 1024 characters)

### `GET /:namespace/:uuid`

Retrieves a specific entry from the database using its unique identifier (UUID). Add query parameters `?vector=true` to retrieve the vector along with the entry. Add query parameters `?db_id=true` to retrieve the SQL table ID along with the entry.

### `GET /:namespace?limit=10&offset=0`

Retrieves all entries from the given namespace. Limit can be set to a maximum of 100 entries. Add query parameters `?vector=true` to retrieve the vectors along with the entries. Add query parameters `?db_id=true` to retrieve the SQL table ID along with the entries.

### `DELETE /:namespace/:uuid`

Deletes a specific entry from the database using its unique identifier (UUID).

### `POST /embeddings`

Generates embeddings for given text without storing it in the database.
* **Request Body**:
  + `text`: A string whose embedding is to be generated.

### `GET /test`

A test endpoint that returns 'Hello world!' as a response.

## Usage Examples

### Inserting Text

```typescript
fetch('https://athenadb.yourusername.workers.dev/your-namespace/insert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ input: 'Your text here' })
})
```

### Querying the Database

```typescript
fetch('https://athenadb.yourusername.workers.dev/your-namespace/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ input: 'Query text' })
})
```

### Retrieving an Entry

```typescript
fetch('https://athenadb.yourusername.workers.dev/your-namespace/your-uuid', {
  method: 'GET'
})
```

### Deleting an Entry

```typescript
fetch('https://athenadb.yourusername.workers.dev/your-namespace/your-uuid', {
  method: 'DELETE'
})
```

### Generating Embeddings

```typescript
fetch('https://athenadb.yourusername.workers.dev/embeddings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Your text here' })
})
```
