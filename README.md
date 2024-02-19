<h1 align="center">🦉AthenaDB⚡️</h1>
<h3 align="center">Serverless, distributed Vector Database as an API written with Cloudflare Workers, Workers AI, D1, and Vectorize.</h3>

AthenaDB is a simple, serverless, distributed vector database that can be used as an API. It is written with [Cloudflare Workers AI](https://ai.cloudflare.com), [D1](https://developers.cloudflare.com/d1/), [Vectorize](https://developers.cloudflare.com/vectorize/).

## Features

- **Simple API Endpoints**: AthenaDB provides straightforward endpoints for various database operations, making it accessible for developers of all skill levels.
- **Distributed Nature**: With data replication across multiple data centers, AthenaDB ensures high availability and resilience.
- **Built-In Data Replication**: Due to Cloudflare Workers’ underlying architecture, data is replicated across data centers automatically.
- **Scalability**: AthenaDB is designed to handle large amounts of vector text data, making it suitable for projects with high data volumes.
- **Serverless Architecture**: With AthenaDB being serverless, you don't have to worry about managing infrastructure, allowing for more focus on development.

## Getting Started

* Downloads and install [Wrangler](https://developers.cloudflare.com/workers/cli-wrangler/install-update).
* Log in to Wrangler with `wrangler login`. AthenaDB **requires** a $5/month Workers subscription to function.
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

Deletes a specific entry from the database using its unique identifier (UUID). **Warning**: This action is irreversible.

### `DELETE /:namespace`

Deletes all entries from the given namespace. **Warning**: This action is irreversible.

### `POST /embeddings`

Generates embeddings for given text without storing it in the database.
* **Request Body**:
  + `text`: A string whose embedding is to be generated.

### `GET /`

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

## Clients

* [Python client](https://gist.github.com/chand1012/f85a87073e709c51a8a75c69151de907)
