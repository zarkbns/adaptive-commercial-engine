# ace — Adaptive Commercial Engine

ace is an AI-powered commercial decision engine designed to help revenue teams reason about active deals, negotiate concessions, protect margins, and coordinate commercial strategy using persistent graph context.

Rather than treating the AI as a standalone chatbot, ace combines an agentic commercial workflow with a persistent graph substrate powered by HydraDB OSS.

## What ace Does

ace helps commercial teams answer questions such as:

- What should we ask for in exchange for a discount?
- How can we protect gross margin while responding to pricing pressure?
- What relationships and account context should influence a deal?
- How should we structure a give-get strategy?
- What should the next commercial action be?

The system supports conversational commercial analysis and structured deal optimization.

## Architecture

```text
                         ace
                          │
            ┌─────────────┴─────────────┐
            │                           │
       Commercial UI              Agent / API Layer
            │                           │
            └─────────────┬─────────────┘
                          │
                   HydraDBEngine
                          │
                   OpenCypher HTTP
                          │
         POST /v1/graphs/:graph_id/query
                          │
                          ▼
                 ┌─────────────────┐
                 │   HydraDB OSS   │
                 │                 │
                 │  Authoritative  │
                 │ Graph Database   │
                 └────────┬────────┘
                          │
                          ▼
                 Persistent Storage
                   ./hydradb-data/
```

### HydraDB is the source of truth

HydraDB OSS is the authoritative graph database for ace.

ace does **not** use an in-memory graph as a substitute for HydraDB.

The `HydraDBEngine` maintains local JavaScript Maps as a client-side cache/projection for application performance, but these structures are not the authoritative database.

The authoritative flow is:

```text
Application
    ↓
HydraDBEngine
    ↓
OpenCypher mutation
    ↓
HydraDB OSS
    ↓
successful persistence
    ↓
ace cache / commit projection
```

A failed HydraDB mutation does not become a successful ace commit.

## Fault Isolation

ace explicitly distinguishes between different graph states.

### HydraDB available + matching records

Live graph records are returned from HydraDB.

### HydraDB available + zero records

The graph query legitimately returns an empty result.

### HydraDB unavailable

ace does not silently substitute stale cached graph data.

Graph-dependent requests enter an explicit degraded state and communicate that live graph context cannot currently be verified.

## Commercial Intelligence

ace provides an intent-gated commercial workflow capable of handling:

- Commercial negotiation questions
- Give-get strategy generation
- Discount and margin reasoning
- Account and relationship context
- Autonomous deal analysis
- Structured deal-room workflows

When a customer requests a significant discount, ace can reason about exchanging the concession for commercial value such as multi-year commitments, upfront or annual billing, customer advocacy, and other mutually valuable commitments.

## HydraDB OSS Integration

ace communicates with HydraDB OSS through its OpenCypher HTTP API:

```text
POST /v1/graphs/:graph_id/query
```

The local Docker Compose deployment exposes:

| Service | Port | Purpose |
|---|---:|---|
| ace | `3000` | Application/API |
| HydraDB | `8443` | OpenCypher query API |
| HydraDB | `9090` | Readiness/admin interface |
| HydraDB | `7687` | Bolt |

HydraDB data is persisted through:

```text
./hydradb-data/
├── store/
├── cache/
└── auth-token
```

The directory is intentionally excluded from source control.

## Local Development

### Prerequisites

- Docker
- Docker Compose
- Node.js / npm

### 1. Initialize HydraDB

```bash
bash scripts/init-hydradb.sh
```

This prepares the local HydraDB storage directories and authentication token. The generated authentication token is local-only and must never be committed.

### 2. Start the stack

```bash
docker compose up --build
```

### 3. Check ace health

```bash
curl -i http://localhost:3000/healthz
```

### 4. Check HydraDB readiness

```bash
curl -i http://localhost:9090/readyz
```

A ready HydraDB instance should return:

```text
ok
```

## Verify the HydraDB Graph

```bash
curl -X POST   http://localhost:8443/v1/graphs/default/query   -H "Authorization: Bearer $HYDRADB_API_KEY"   -H "X-Graph-Namespace: default"   -H "Content-Type: application/json"   -d '{
    "cell_id": "cell-0",
    "query": "RETURN 1 AS ok"
  }'
```

Expected result:

```json
{
  "columns": ["ok"],
  "data": [[1]]
}
```

## Verify Persistent Graph Storage

Create a graph record:

```bash
curl -X POST   http://localhost:8443/v1/graphs/default/query   -H "Authorization: Bearer $HYDRADB_API_KEY"   -H "X-Graph-Namespace: default"   -H "Content-Type: application/json"   -d '{
    "cell_id": "cell-0",
    "query": "MERGE (n:Account {id: \"ace-demo-account\", name: \"Demo Account\"}) RETURN n"
  }'
```

Restart HydraDB:

```bash
docker compose restart hydradb
```

Then query the same record:

```bash
curl -X POST   http://localhost:8443/v1/graphs/default/query   -H "Authorization: Bearer $HYDRADB_API_KEY"   -H "X-Graph-Namespace: default"   -H "Content-Type: application/json"   -d '{
    "cell_id": "cell-0",
    "query": "MATCH (n:Account {id: "\ace-demo-account\"}) RETURN n"
  }'
```

The record should remain available after the container restart, demonstrating persistence through the HydraDB storage volume.

## Environment Variables

ace uses environment variables for runtime configuration and secrets.

Typical configuration includes:

```text
GEMINI_API_KEY
HYDRADB_URL
HYDRADB_ADMIN_URL
HYDRADB_GRAPH_ID
HYDRADB_NAMESPACE
HYDRADB_API_KEY
```

See `.env.example` for the configuration template.

Never commit `.env`, Gemini API keys, HydraDB authentication tokens, `hydradb-data/`, or other live credentials.

## API Surface

```text
GET  /healthz
GET  /readyz
GET  /api/health

POST /api/ace/copilot
POST /api/ace/analyze-deal

POST /v1/graphs/:graph_id/query
```

The graph query route is backed by the HydraDB OSS integration rather than an in-memory replacement.

## Development Checks

```bash
npm run lint
npm run build
```

Both should complete successfully before submitting changes.

## Project Structure

```text
.
├── src/
│   ├── services/
│   │   ├── hydradb/
│   │   │   └── engine.ts
│   │   └── ace/
│   │       └── agentOrchestrator.ts
│   └── components/
├── server.ts
├── docker-compose.yml
├── scripts/
│   └── init-hydradb.sh
├── .env.example
└── LICENSE
```

## Open Source

ace is open-source software released under the **Apache License 2.0**.

See [`LICENSE`](LICENSE) for the complete license text.

ace's license applies to this project. Third-party dependencies and HydraDB OSS remain subject to their respective licenses.

## Hackathon Architecture

The project is intentionally designed around a real HydraDB OSS deployment rather than a simulated graph implementation.

The core architecture is:

```text
ace
  ↓
HydraDBEngine
  ↓
HydraDB OSS
  ↓
Persistent Graph Storage
```

HydraDB is a required graph substrate for authoritative graph operations. When it is unavailable, ace reports the degraded state instead of silently pretending that cached state is current.

## License

Copyright © 2026 Zarkeus Nwankwo

Licensed under the Apache License, Version 2.0.

See [`LICENSE`](LICENSE) for the full license text.
