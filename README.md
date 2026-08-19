# ace — Adaptive Commercial Engine

**ace** is an enterprise B2B commercial intelligence and decision engine that provides revenue and commercial teams with continuous, adaptive context about accounts, deals, stakeholders, pricing constraints, buying signals, objections, competitors, and commercial history.

Rather than treating each interaction or query as an isolated prompt, **ace** creates and queries a persistent commercial knowledge graph in **HydraDB OSS**. That rich relational context is dynamically retrieved and supplied to **Gemini reasoning agents**, enabling commercial decisions and recommendations to adapt to real-world account history and deal dynamics.

---

## The Commercial Problem ace Solves

Modern commercial and revenue operations suffer from fragmented deal context across silos. Account executives, sales leadership, solutions engineering, and deal desks struggle with questions such as:

- **What is happening with this account?** Real-time awareness of blockers, recent interactions, and relationship health.
- **Who influences the deal and who controls the budget?** Stakeholder mapping identifying champions, economic buyers, pricing decision-makers, and detractors.
- **What objections or blockers exist?** Live tracking of technical hurdles, compliance requirements, or unresolved commercial pushbacks.
- **What pricing constraints apply?** Floor margins, concession rules, competitor discounting pressure, and contract terms.
- **What has changed since the previous interaction?** Delta detection across conversations, emails, and notes.
- **Which commercial action should happen next?** Context-grounded give-get negotiation strategies, discount exchanges, and next steps.
- **What should Sales, Support, or Engineering know before acting?** Cross-functional commercial context alignment.
- **How should the recommendation change based on new customer context?** Continuous adaptation as commercial events unfold.

---

## The Core Adaptive Loop

```text
  Commercial Event / Interaction Context
                    │
                    ▼
          HydraDB Ingestion
    (OpenCypher Graph Mutations)
                    │
                    ▼
        Persistent Context Graph
       (Authoritative HydraDB OSS)
                    │
                    ▼
        HydraDB Context Retrieval
 (Live OpenCypher Subgraph Extraction)
                    │
                    ▼
          ACE Reasoning Layer
       (Gemini Multi-Turn Model)
                    │
                    ▼
    Commercial Decision / Recommendation
                    │
                    ▼
 Stored Back into HydraDB Context Graph
```

1. **Commercial Event / Context**: Transcripts, meeting notes, concession requests, or pricing signals enter the system.
2. **HydraDB Ingestion**: Data is structured into ontology nodes and relationships, persisted directly to HydraDB OSS via OpenCypher mutations.
3. **Persistent Graph / Context**: HydraDB OSS durably stores the accounts, stakeholders, and constraints in its storage substrate.
4. **Retrieval from HydraDB**: When an inquiry or decision prompt occurs, relevant entity subgraphs and relationship trails are queried from HydraDB.
5. **ACE Reasoning**: Gemini receives the retrieved HydraDB context as grounding to generate actionable commercial recommendations.
6. **Adaptive Storage**: Resulting decisions, concession terms, and updated constraints are written back into HydraDB to inform all future actions.

---

## System Architecture

```text
                           ace User Interface
                     (React + Tailwind + Hugeicons)
                                   │
                                   ▼
                            ace API Server
                        (Express + TypeScript)
                                   │
               ┌───────────────────┴───────────────────┐
               │                                       │
               ▼                                       ▼
        Authentication                           Reasoning Layer
      (Firebase Auth)                       (Gemini API / @google/genai)
                                                       │
                                                       ▲ (Grounding Context)
                                                       │
                                            HydraDBEngine Substrate
                                         (Authoritative Client Layer)
                                                       │
                                                       ▼ OpenCypher HTTP
                                            ┌─────────────────────┐
                                            │     HydraDB OSS     │
                                            │ (Graph Database)    │
                                            └──────────┬──────────┘
                                                       │
                                                       ▼
                                            Persistent Storage
                                              ./hydradb-data/
```

### Component Roles

- **HydraDB OSS (Authoritative Primary Database)**: 
  HydraDB is the primary persistent graph substrate for all commercial intelligence, account histories, buying signals, and relationship graphs. It is not an optional cache or decorative visualizer.
- **Gemini (Reasoning Engine)**: 
  Gemini serves strictly as the reasoning and intelligence layer. It reasons over grounded context retrieved from HydraDB to generate deal strategies, concession trade-offs, and commercial actions. Gemini is never used as the storage layer.
- **Firebase (Authentication)**: 
  Firebase is responsible solely for user authentication and session management. Commercial data is never stored in Firebase.

---

## The ACE Commercial Ontology

ace models the B2B revenue landscape using a purpose-built commercial graph schema:

### Graph Node Entities

| Entity | Description |
|---|---|
| `Account` | The client enterprise (e.g., Apex Global, Vanguard Fintech, Nexus Health). |
| `Contact` | Key stakeholders, champions, economic buyers, or influencers within an account. |
| `Deal` | Active commercial opportunity, contract stage, target ARR, and close timeline. |
| `BuyingSignal` | Concrete purchase indicators (expansion need, security mandate, executive sponsor interest). |
| `PricingConstraint` | Commercial boundaries such as target discount caps, margin floors, and payment terms. |
| `ConcessionRule` | Structured give-get frameworks (e.g., discount traded for multi-year term or case study). |
| `MarketCondition` | Macro factors, industry trends, and compliance standards influencing deal cycles. |
| `AgentDecision` | Recorded decisions, strategies, and reasoning outputs generated by ace. |
| `InteractionEpisode` | Individual conversation, meeting, email sync, or commercial touchpoint. |
| `Competitor` | Competing solutions in the account and their positioning/pricing tactics. |

### Graph Relationships

| Relationship | Source Node | Target Node | Purpose |
|---|---|---|---|
| `PART_OF_ACCOUNT` | `Contact` / `Deal` | `Account` | Maps organizational membership and deal ownership. |
| `CHAMPIONS` | `Contact` | `Deal` | Identifies internal advocates driving purchase momentum. |
| `DECIDES_PRICING` | `Contact` | `Deal` | Designates economic buyers with financial sign-off authority. |
| `BUDGET_OWNER` | `Contact` | `Account` | Pinpoints executive budget holders. |
| `INFLUENCES` | `Contact` | `Deal` | Maps technical or commercial stakeholder influence. |
| `HAS_OBJECTION` | `Contact` / `Account` | `MarketCondition` | Tracks blockers (compliance, deployment complexity, pricing). |
| `PRICING_LINKED_TO` | `Deal` | `PricingConstraint` | Ties opportunities to active discounting and margin rules. |
| `CONCESSION_TIED_TO` | `ConcessionRule` | `PricingConstraint` | Enforces give-get exchange requirements. |
| `COMPETES_WITH` | `Account` | `Competitor` | Flags competitor presence and displacement risks. |
| `TRIGGERED_BY` | `AgentDecision` | `InteractionEpisode` | Maintains causality trail from interactions to decisions. |

---

## Local Development & Setup

### Prerequisites

- **Docker** and **Docker Compose**
- **Node.js** (v20+) and **npm**
- **Gemini API Key**

### 1. Initialize HydraDB Storage & Auth Token

Run the initialization script to set up persistent storage directories and generate the local authentication token:

```bash
bash scripts/init-hydradb.sh
```

This creates:
- `hydradb-data/store` (Persistent graph data store)
- `hydradb-data/cache` (Persistent cache directory)
- `hydradb-data/auth-token` (Secure local authorization token, ignored by git)
- Local `.env` configured with `HYDRADB_API_KEY`

### 2. Configure Environment Variables

Create or update `.env` using `.env.example`:

```bash
cp .env.example .env
```

Ensure the following variables are defined:

```env
GEMINI_API_KEY=your_gemini_api_key
HYDRADB_URL=http://hydradb:8443
HYDRADB_ADMIN_URL=http://hydradb:9090
HYDRADB_GRAPH_ID=default
HYDRADB_NAMESPACE=default
HYDRADB_API_KEY=your_generated_hydradb_token
```

### 3. Start Services with Docker Compose

Start the full stack (ACE Application + HydraDB OSS container):

```bash
docker compose up --build -d
```

Check container status:

```bash
docker compose ps
```

### 4. Verify HydraDB Connectivity & Health

Check the HydraDB readiness endpoint:

```bash
curl -i http://localhost:9090/readyz
```
*Expected response: HTTP 200 OK (`ok`)*

Check ACE application health:

```bash
curl -i http://localhost:3000/healthz
```
*Expected response: HTTP 200 OK with system status JSON*

Execute a test OpenCypher query against HydraDB OSS:

```bash
curl -X POST http://localhost:8443/v1/graphs/default/query \
  -H "Authorization: Bearer $HYDRADB_API_KEY" \
  -H "X-Graph-Namespace: default" \
  -H "Content-Type: application/json" \
  -d '{
    "cell_id": "cell-0",
    "query": "RETURN 1 AS status"
  }'
```

*Expected response:*
```json
{
  "columns": ["status"],
  "data": [[1]]
}
```

---

## API Surface

| Endpoint | Method | Purpose |
|---|---|---|
| `/healthz` | `GET` | Container readiness and system health probe. |
| `/readyz` | `GET` | HydraDB proxy readiness check. |
| `/api/health` | `GET` | Full system diagnostic status including HydraDB connectivity. |
| `/api/ace/copilot` | `POST` | Agentic copilot combining HydraDB graph retrieval with Gemini reasoning. |
| `/api/ace/analyze-deal` | `POST` | Structured commercial deal analysis and give-get concession evaluation. |
| `/v1/graphs/:graph_id/query` | `POST` | Direct OpenCypher query proxy to authoritative HydraDB OSS instance. |

---

## Development Checks

To verify code quality and production builds:

```bash
# Type check and lint
npm run lint

# Production build compilation
npm run build
```

---

## License

ace is open-source software licensed under the **Apache License, Version 2.0**. See [`LICENSE`](LICENSE) for details.
