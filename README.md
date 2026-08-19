# ace

> **Your business already knows its customers. That knowledge is just scattered across thousands of emails, conversations, documents, and interactions. ace turns that scattered information into a persistent, connected memory and reasons over it for you.**

## What is ace?

ace is a **Customer Intelligence Agent**.

Businesses already have years of customer knowledge spread across emails, meetings, documents, conversations, notes, and other interactions. ace turns that scattered information into persistent, connected customer memory using **HydraDB OSS**, then reasons over that memory to help teams understand their customers and make better decisions.

ace helps teams understand:

- what has been learned about a customer
- what customers have said, requested, or cared about
- how relationships and requirements have changed
- patterns appearing across customer interactions
- relevant commercial context
- what context matters for the next decision or conversation

ace is not intended to replace the systems where customer interactions originate. Its purpose is to turn those interactions into usable, persistent intelligence.

## How it works

```text
Customer interactions
        |
        v
Emails · Meetings · Documents · Conversations · Notes
        |
        v
       ace
        |
        | extract · connect · persist · reason
        v
   HydraDB OSS
        |
        | persistent customer graph
        v
 Connected Customer Memory
        |
        v
 ace reasoning & intelligence
        |
        v
 Better customer decisions
```

HydraDB is the authoritative customer-memory layer. ace queries the graph when it needs customer context and uses that context to ground its reasoning.

If the graph is unavailable, ace does not silently fabricate customer information or pretend that stale data is authoritative.

## Core principles

### Persistent memory

Customer knowledge survives application restarts because it is stored in HydraDB rather than browser `localStorage` or temporary application state.

### Connected context

Customer information is represented as connected entities and relationships rather than isolated notes. This allows ace to reason across people, organizations, interactions, requirements, and commercial context.

### Grounded reasoning

When ace answers a customer-context question, relevant information is retrieved from the customer graph and supplied to the reasoning layer.

### Explicit degradation

If HydraDB is unavailable, ace reports that live customer context cannot be verified rather than pretending unavailable information is known.

### Customer intelligence, not business management

ace focuses on understanding customers and helping teams reason about them. It is not positioned as a general-purpose business-management or CRM replacement.

## Architecture

```text
+------------------------------------------+
|                  ace                     |
|                                          |
|  Customer Intelligence Agent             |
|  UI · Copilot · Customer Context        |
+-------------------+----------------------+
                    |
                    | OpenCypher
                    v
+------------------------------------------+
|              HydraDB OSS                 |
|                                          |
|  Authoritative persistent customer       |
|  knowledge graph                         |
+-------------------+----------------------+
                    |
                    v
             Persistent storage
```

The main HydraDB query endpoint used by ace is:

```text
POST /v1/graphs/:graph_id/query
```

HydraDB readiness is exposed through:

```text
GET /readyz
```

## Local development

### Requirements

- Node.js
- npm
- Docker
- Docker Compose
- A Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/zarkbns/adaptive-commercial-engine.git
cd adaptive-commercial-engine
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Set the required Gemini credential:

```env
GEMINI_API_KEY=your_gemini_api_key
```

HydraDB is configured by the Docker Compose setup for local development.

### 3. Initialize HydraDB

```bash
bash scripts/init-hydradb.sh
```

### 4. Start the stack

```bash
docker compose up -d --build
```

Check the services:

```bash
docker compose ps
```

Check HydraDB readiness:

```bash
curl http://localhost:9090/readyz
```

### 5. Open ace

The application normally runs at:

```text
http://localhost:3000
```

## Customer memory

ace's intelligence is designed to come from persistent graph data.

The application provides customer-memory APIs for information such as:

- customer accounts
- stakeholders
- interactions
- requirements
- commercial context
- connected customer relationships

The graph grows from the information available to the application. A fresh installation can initialize its HydraDB environment using the included scripts.

## Development verification

Run:

```bash
npm run lint
npm run build
```

For a local end-to-end environment:

```bash
docker compose up -d --build
docker compose ps
curl http://localhost:9090/readyz
```

The application should fail explicitly when HydraDB cannot provide authoritative customer context instead of silently replacing it with fake customer data.

## Security

Secrets should be provided through environment variables or the hosting platform's secret manager.

Do not commit:

- `.env`
- Gemini API keys
- HydraDB authentication tokens
- local HydraDB storage
- other live credentials

The repository includes `.env.example` as a safe configuration template.

## Open source

ace is released under the **Apache License 2.0**. See [`LICENSE`](./LICENSE).

## Project status

ace is an actively developed project focused on persistent customer memory, connected customer intelligence, and grounded reasoning over accumulated business context.

The architecture prioritizes:

1. HydraDB as the authoritative customer-memory substrate.
2. Persistent graph-backed customer context.
3. Reasoning grounded in retrieved customer information.
4. Separation between live graph state and client-side projections.
5. Explicit degraded behavior when the authoritative graph is unavailable.

## Contributing

Contributions are welcome.

For changes that affect customer-memory behavior or HydraDB integration, verify both the application build and the local Docker/HydraDB flow before submitting a pull request.

## License

Apache License 2.0. See [`LICENSE`](./LICENSE).
