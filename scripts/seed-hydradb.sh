#!/usr/bin/env bash
set -euo pipefail

# Script to bootstrap the deterministic demo dataset into HydraDB OSS for ace
echo "==> Seeding authoritative customer memory dataset into HydraDB OSS..."

HYDRADB_URL="${HYDRADB_URL:-http://localhost:8443}"
HYDRADB_GRAPH_ID="${HYDRADB_GRAPH_ID:-default}"
HYDRADB_NAMESPACE="${HYDRADB_NAMESPACE:-default}"

# Read auth token if available
AUTH_TOKEN=""
if [ -n "${HYDRADB_API_KEY:-}" ]; then
  AUTH_TOKEN="${HYDRADB_API_KEY}"
elif [ -f hydradb-data/auth-token ]; then
  AUTH_TOKEN="$(cat hydradb-data/auth-token | tr -d '\r\n ')"
elif [ -f .hydradb/auth-token ]; then
  AUTH_TOKEN="$(cat .hydradb/auth-token | tr -d '\r\n ')"
fi

HEADERS=(-H "Content-Type: application/json" -H "Accept: application/json" -H "X-Graph-Namespace: ${HYDRADB_NAMESPACE}")
if [ -n "$AUTH_TOKEN" ]; then
  HEADERS+=(-H "Authorization: Bearer ${AUTH_TOKEN}")
fi

ENDPOINT="${HYDRADB_URL}/v1/graphs/${HYDRADB_GRAPH_ID}/query"

execute_cypher() {
  local query="$1"
  local payload
  payload=$(jq -n --arg q "$query" '{cell_id: "cell-0", query: $q, timeout_ms: 30000}')
  
  curl -s -X POST "$ENDPOINT" "${HEADERS[@]}" -d "$payload" > /dev/null
}

echo "--> Ingesting Customer Organizations (Account nodes)..."
execute_cypher "
MERGE (n:Account {id: 'acc_apex'})
SET n.type = 'Account',
    n.label = 'Apex Global Logistics',
    n.tier = 'hot',
    n.properties = '{\"domain\":\"apexlogistics.com\",\"industry\":\"Supply Chain & Logistics\",\"tier\":\"Enterprise\",\"dealValue\":480000,\"status\":\"In Negotiation\",\"lastContact\":\"Today, 10:30 AM\",\"nextAction\":\"Send updated 3-year pricing proposal\",\"nextActionDate\":\"Tomorrow at 9:00 AM\",\"assignedRep\":\"Alex Morgan\",\"notes\":\"Decision committee is reviewing multi-year pricing terms. Champion is aligned on technical scope.\"}',
    n.tags = ['Enterprise', 'SupplyChain', 'ActiveNegotiation'],
    n.validFrom = '2026-08-01T00:00:00Z',
    n.updatedAt = '2026-08-19T10:30:00Z'
"

execute_cypher "
MERGE (n:Account {id: 'acc_vanguard'})
SET n.type = 'Account',
    n.label = 'Vanguard Fintech Group',
    n.tier = 'hot',
    n.properties = '{\"domain\":\"vanguardfintech.io\",\"industry\":\"Financial Services\",\"tier\":\"Strategic Enterprise\",\"dealValue\":420000,\"status\":\"Proposal Sent\",\"lastContact\":\"Yesterday, 3:15 PM\",\"nextAction\":\"Deliver multi-region branch consolidation architecture\",\"nextActionDate\":\"Thursday at 2:00 PM\",\"assignedRep\":\"Taylor Reed\",\"notes\":\"Expanding from pilot to 4 European and UK subsidiaries. Demands enterprise SSO and dedicated tenant isolation.\"}',
    n.tags = ['Enterprise', 'Fintech', 'Expansion'],
    n.validFrom = '2026-08-01T00:00:00Z',
    n.updatedAt = '2026-08-19T15:15:00Z'
"

execute_cypher "
MERGE (n:Account {id: 'acc_nexus'})
SET n.type = 'Account',
    n.label = 'Nexus Health Systems',
    n.tier = 'warm',
    n.properties = '{\"domain\":\"nexushealth.org\",\"industry\":\"Healthcare & Life Sciences\",\"tier\":\"Enterprise\",\"dealValue\":290000,\"status\":\"In Negotiation\",\"lastContact\":\"2 days ago\",\"nextAction\":\"Submit SOC 2 Type II and HIPAA BAA compliance pack\",\"nextActionDate\":\"Friday at 11:00 AM\",\"assignedRep\":\"Jordan Hayes\",\"notes\":\"Compliance review gating pilot. Completed security sync with Chief Compliance Officer.\"}',
    n.tags = ['Enterprise', 'Healthcare', 'ComplianceGated'],
    n.validFrom = '2026-08-01T00:00:00Z',
    n.updatedAt = '2026-08-18T11:00:00Z'
"

execute_cypher "
MERGE (n:Account {id: 'acc_hyperion'})
SET n.type = 'Account',
    n.label = 'Hyperion Energy Labs',
    n.tier = 'warm',
    n.properties = '{\"domain\":\"hyperionenergy.io\",\"industry\":\"Energy & CleanTech\",\"tier\":\"Growth\",\"dealValue\":195000,\"status\":\"Active\",\"lastContact\":\"3 days ago\",\"nextAction\":\"Review onboarding milestones for 45-day rollout\",\"nextActionDate\":\"Next Monday at 10:00 AM\",\"assignedRep\":\"Samira Patel\",\"notes\":\"Prioritizes deployment timeline guarantees and dedicated onboarding SLA over feature breadth.\"}',
    n.tags = ['Growth', 'Energy', 'HighVelocity'],
    n.validFrom = '2026-08-01T00:00:00Z',
    n.updatedAt = '2026-08-17T09:15:00Z'
"

execute_cypher "
MERGE (n:Account {id: 'acc_summit'})
SET n.type = 'Account',
    n.label = 'Summit Media Networks',
    n.tier = 'warm',
    n.properties = '{\"domain\":\"summitmedia.com\",\"industry\":\"Media & Entertainment\",\"tier\":\"Enterprise\",\"dealValue\":310000,\"status\":\"Follow-up Needed\",\"lastContact\":\"4 days ago\",\"nextAction\":\"Finalize annual advance billing terms\",\"nextActionDate\":\"Wednesday at 4:00 PM\",\"assignedRep\":\"Alex Morgan\",\"notes\":\"Finance approval confirmed. Prefers single annual advance payment in exchange for 3-year rate lock.\"}',
    n.tags = ['Enterprise', 'Media', 'AnnualBilling'],
    n.validFrom = '2026-08-01T00:00:00Z',
    n.updatedAt = '2026-08-16T16:30:00Z'
"

execute_cypher "
MERGE (n:Account {id: 'acc_beacon'})
SET n.type = 'Account',
    n.label = 'Beacon Retail Group',
    n.tier = 'warm',
    n.properties = '{\"domain\":\"beaconretail.com\",\"industry\":\"Retail & E-commerce\",\"tier\":\"Mid-Market\",\"dealValue\":145000,\"status\":\"Active\",\"lastContact\":\"1 week ago\",\"nextAction\":\"Demonstrate omnichannel customer memory sync\",\"nextActionDate\":\"Friday at 3:00 PM\",\"assignedRep\":\"Taylor Reed\",\"notes\":\"Evaluating customer context unification across 80 retail storefronts.\"}',
    n.tags = ['MidMarket', 'Retail', 'Evaluation'],
    n.validFrom = '2026-08-01T00:00:00Z',
    n.updatedAt = '2026-08-12T14:00:00Z'
"

echo "--> Ingesting Customer Stakeholders (Contact nodes)..."
execute_cypher "
MERGE (n:Contact {id: 'contact_sarah_chen'})
SET n.type = 'Contact',
    n.label = 'Sarah Chen',
    n.tier = 'hot',
    n.properties = '{\"role\":\"VP of Supply Chain\",\"company\":\"Apex Global Logistics\",\"email\":\"sarah.chen@apexlogistics.com\",\"phone\":\"+1 (415) 890-2341\",\"sentiment\":\"Constructive / Cautious on Deployment\",\"influenceScore\":0.92,\"champion\":true}',
    n.tags = ['Champion', 'SupplyChain', 'Executive'],
    n.validFrom = '2026-08-01T00:00:00Z'
"

execute_cypher "
MERGE (n:Contact {id: 'contact_elena_rostova'})
SET n.type = 'Contact',
    n.label = 'Elena Rostova',
    n.tier = 'hot',
    n.properties = '{\"role\":\"Head of Infrastructure\",\"company\":\"Vanguard Fintech Group\",\"email\":\"e.rostova@vanguardfintech.io\",\"phone\":\"+44 20 7946 0912\",\"sentiment\":\"High Champion / Expansion Advocate\",\"influenceScore\":0.95,\"champion\":true}',
    n.tags = ['Champion', 'Infrastructure', 'Fintech'],
    n.validFrom = '2026-08-01T00:00:00Z'
"

execute_cypher "
MERGE (n:Contact {id: 'contact_marcus_vance'})
SET n.type = 'Contact',
    n.label = 'Marcus Vance',
    n.tier = 'warm',
    n.properties = '{\"role\":\"Chief Compliance Officer\",\"company\":\"Nexus Health Systems\",\"email\":\"m.vance@nexushealth.org\",\"phone\":\"+1 (617) 555-0198\",\"sentiment\":\"Rigorous Compliance Gating\",\"influenceScore\":0.96,\"economicBuyer\":true}',
    n.tags = ['SecurityGate', 'Compliance', 'Healthcare'],
    n.validFrom = '2026-08-01T00:00:00Z'
"

execute_cypher "
MERGE (n:Contact {id: 'contact_julian_sterling'})
SET n.type = 'Contact',
    n.label = 'Julian Sterling',
    n.tier = 'warm',
    n.properties = '{\"role\":\"Operations Director\",\"company\":\"Hyperion Energy Labs\",\"email\":\"j.sterling@hyperionenergy.io\",\"phone\":\"+1 (512) 555-0843\",\"sentiment\":\"Fast Deployment Priority\",\"influenceScore\":0.88,\"champion\":true}',
    n.tags = ['Champion', 'Operations', 'Energy'],
    n.validFrom = '2026-08-01T00:00:00Z'
"

execute_cypher "
MERGE (n:Contact {id: 'contact_david_kim'})
SET n.type = 'Contact',
    n.label = 'David Kim',
    n.tier = 'warm',
    n.properties = '{\"role\":\"VP Finance\",\"company\":\"Summit Media Networks\",\"email\":\"d.kim@summitmedia.com\",\"phone\":\"+1 (212) 555-0144\",\"sentiment\":\"Annual Upfront Advocate\",\"influenceScore\":0.94,\"budgetOwner\":true}',
    n.tags = ['BudgetOwner', 'Finance', 'Media'],
    n.validFrom = '2026-08-01T00:00:00Z'
"

execute_cypher "
MERGE (n:Contact {id: 'contact_rachel_adams'})
SET n.type = 'Contact',
    n.label = 'Rachel Adams',
    n.tier = 'warm',
    n.properties = '{\"role\":\"VP Customer Experience\",\"company\":\"Beacon Retail Group\",\"email\":\"rachel.a@beaconretail.com\",\"phone\":\"+1 (312) 555-0182\",\"sentiment\":\"Evaluating Omnichannel Context\",\"influenceScore\":0.85}',
    n.tags = ['Evaluator', 'Retail'],
    n.validFrom = '2026-08-01T00:00:00Z'
"

echo "--> Ingesting Customer Interactions & Conversations..."
execute_cypher "
MERGE (n:InteractionEpisode {id: 'conv_apex_01'})
SET n.type = 'InteractionEpisode',
    n.label = 'Architecture & Legacy Freight Integration Review',
    n.tier = 'hot',
    n.properties = '{\"channel\":\"Video Call\",\"timestamp\":\"Today, 10:30 AM\",\"participants\":[\"Sarah Chen\",\"Alex Morgan\"],\"customerName\":\"Sarah Chen\",\"company\":\"Apex Global Logistics\",\"summary\":\"Sarah raised concerns regarding deployment complexity and synchronization latency with legacy AS400 freight tracker. Requested dedicated onboarding engineer and milestone-based sign-off on the 3-year agreement ($340k ARR).\"}',
    n.tags = ['Conversation', 'TechnicalReview', 'ObjectionIdentified'],
    n.validFrom = '2026-08-19T10:30:00Z'
"

execute_cypher "
MERGE (n:InteractionEpisode {id: 'conv_vanguard_01'})
SET n.type = 'InteractionEpisode',
    n.label = 'Multi-Region Branch Consolidation Sync',
    n.tier = 'hot',
    n.properties = '{\"channel\":\"Executive Meeting\",\"timestamp\":\"Yesterday, 3:15 PM\",\"participants\":[\"Elena Rostova\",\"Taylor Reed\"],\"customerName\":\"Elena Rostova\",\"company\":\"Vanguard Fintech Group\",\"summary\":\"Elena confirmed growing demand to expand platform usage across 4 regional European and UK banking subsidiaries. Explicitly requires enterprise SSO, granular RBAC, and dedicated tenant isolation.\" }',
    n.tags = ['Conversation', 'ExpansionSync', 'Requirements'],
    n.validFrom = '2026-08-18T15:15:00Z'
"

execute_cypher "
MERGE (n:InteractionEpisode {id: 'conv_nexus_01'})
SET n.type = 'InteractionEpisode',
    n.label = 'Security & Healthcare Compliance Audit',
    n.tier = 'warm',
    n.properties = '{\"channel\":\"Video Call\",\"timestamp\":\"2 days ago\",\"participants\":[\"Marcus Vance\",\"Jordan Hayes\"],\"customerName\":\"Marcus Vance\",\"company\":\"Nexus Health Systems\",\"summary\":\"Marcus completed compliance review. Confirmed that SOC 2 Type II audit report, HIPAA BAA, and EU-US Data Privacy Framework addendum are mandatory before pilot rollout.\"}',
    n.tags = ['Conversation', 'SecurityAudit', 'ComplianceRequirement'],
    n.validFrom = '2026-08-17T11:00:00Z'
"

execute_cypher "
MERGE (n:InteractionEpisode {id: 'conv_hyperion_01'})
SET n.type = 'InteractionEpisode',
    n.label = 'Implementation Timeline & SLA Review',
    n.tier = 'warm',
    n.properties = '{\"channel\":\"Email Exchange\",\"timestamp\":\"3 days ago\",\"participants\":[\"Julian Sterling\",\"Samira Patel\"],\"customerName\":\"Julian Sterling\",\"company\":\"Hyperion Energy Labs\",\"summary\":\"Julian emphasized that implementation speed within 45 days and dedicated onboarding support matter more to them than additional software features.\"}',
    n.tags = ['Conversation', 'TimelineSLA', 'PrioritySignal'],
    n.validFrom = '2026-08-16T09:15:00Z'
"

execute_cypher "
MERGE (n:InteractionEpisode {id: 'conv_summit_01'})
SET n.type = 'InteractionEpisode',
    n.label = 'Commercial Terms & Payment Sync',
    n.tier = 'warm',
    n.properties = '{\"channel\":\"Stakeholder Sync\",\"timestamp\":\"4 days ago\",\"participants\":[\"David Kim\",\"Alex Morgan\"],\"customerName\":\"David Kim\",\"company\":\"Summit Media Networks\",\"summary\":\"David confirmed finance approval. Stated strong customer willingness to commit to annual advance invoicing in exchange for a 3-year rate lock.\"}',
    n.tags = ['Conversation', 'PaymentTerms', 'PreferenceSignal'],
    n.validFrom = '2026-08-15T16:30:00Z'
"

echo "--> Ingesting Requirements, Preferences, and Emerging Patterns..."
execute_cypher "
MERGE (n:PricingConstraint {id: 'req_apex_onboarding'})
SET n.type = 'PricingConstraint',
    n.label = 'Dedicated Onboarding Engineer & Milestone Sign-Off',
    n.tier = 'hot',
    n.properties = '{\"category\":\"Requirement\",\"customer\":\"Apex Global Logistics\",\"priority\":\"High\",\"details\":\"Customer requires dedicated solutions engineer assigned for 60-day migration to mitigate freight tracker downtime.\"}',
    n.tags = ['Requirement', 'OnboardingSLA'],
    n.validFrom = '2026-08-19T00:00:00Z'
"

execute_cypher "
MERGE (n:PricingConstraint {id: 'req_vanguard_sso'})
SET n.type = 'PricingConstraint',
    n.label = 'Enterprise SSO & Multi-Tenant RBAC',
    n.tier = 'hot',
    n.properties = '{\"category\":\"Requirement\",\"customer\":\"Vanguard Fintech Group\",\"priority\":\"Critical\",\"details\":\"Granular access control across 4 UK and European banking subsidiaries.\"}',
    n.tags = ['Requirement', 'Security', 'SSO'],
    n.validFrom = '2026-08-18T00:00:00Z'
"

execute_cypher "
MERGE (n:PricingConstraint {id: 'req_nexus_compliance'})
SET n.type = 'PricingConstraint',
    n.label = 'SOC 2 Type II & HIPAA BAA Certification',
    n.tier = 'warm',
    n.properties = '{\"category\":\"Requirement\",\"customer\":\"Nexus Health Systems\",\"priority\":\"Mandatory\",\"details\":\"Healthcare compliance documentation required before pilot launch.\"}',
    n.tags = ['Requirement', 'Compliance', 'Healthcare'],
    n.validFrom = '2026-08-17T00:00:00Z'
"

execute_cypher "
MERGE (n:ConcessionRule {id: 'rule_annual_advance'})
SET n.type = 'ConcessionRule',
    n.label = 'Annual Advance Invoicing for Multi-Year Rate Lock',
    n.tier = 'hot',
    n.properties = '{\"trade\":\"Trade 10-15% multi-year discount in exchange for annual upfront cash payment\",\"minMargin\":78.0}',
    n.tags = ['ConcessionRule', 'GiveGet', 'CommercialPolicy'],
    n.validFrom = '2026-08-01T00:00:00Z'
"

execute_cypher "
MERGE (n:BuyingSignal {id: 'signal_speed_priority'})
SET n.type = 'BuyingSignal',
    n.label = 'Market Pattern: Implementation Speed Outweighs Features',
    n.tier = 'hot',
    n.properties = '{\"confidence\":0.94,\"stat\":\"68% of recent conversations cite implementation speed and dedicated onboarding assistance over extra software features.\",\"trendGrowth\":\"+40% this month\"}',
    n.tags = ['EmergingPattern', 'MarketIntel'],
    n.validFrom = '2026-08-01T00:00:00Z'
"

execute_cypher "
MERGE (n:BuyingSignal {id: 'signal_consolidation_shift'})
SET n.type = 'BuyingSignal',
    n.label = 'Market Pattern: Multi-Region Enterprise Branch Consolidation',
    n.tier = 'hot',
    n.properties = '{\"confidence\":0.91,\"stat\":\"Vanguard Fintech and 2 other accounts are actively shifting from single-team pilots toward enterprise consolidation.\",\"shiftMagnitude\":\"79%\"}',
    n.tags = ['EmergingPattern', 'Consolidation'],
    n.validFrom = '2026-08-01T00:00:00Z'
"

echo "--> Ingesting Commercial Agreements (Deal nodes)..."
execute_cypher "
MERGE (n:Deal {id: 'deal_apex_3yr'})
SET n.type = 'Deal',
    n.label = 'Apex Global Enterprise Agreement',
    n.tier = 'hot',
    n.properties = '{\"title\":\"Apex Global Logistics 3-Year Deployment\",\"company\":\"Apex Global Logistics\",\"consumerName\":\"Sarah Chen\",\"value\":480000,\"targetArr\":340000,\"stage\":\"Negotiation\",\"probability\":85,\"closeDate\":\"Next Month\",\"nextStep\":\"Deliver updated 3-year pricing schedule with dedicated onboarding SLA\"}',
    n.tags = ['EnterpriseDeal', 'Negotiation'],
    n.validFrom = '2026-08-01T00:00:00Z'
"

execute_cypher "
MERGE (n:Deal {id: 'deal_vanguard_global'})
SET n.type = 'Deal',
    n.label = 'Vanguard Multi-Region Consolidation',
    n.tier = 'hot',
    n.properties = '{\"title\":\"Vanguard Multi-Region Consolidation\",\"company\":\"Vanguard Fintech Group\",\"consumerName\":\"Elena Rostova\",\"value\":420000,\"targetArr\":420000,\"stage\":\"Proposal\",\"probability\":75,\"closeDate\":\"Q4 2026\",\"nextStep\":\"Review regional branch tenant isolation specs\"}',
    n.tags = ['EnterpriseDeal', 'Expansion'],
    n.validFrom = '2026-08-01T00:00:00Z'
"

execute_cypher "
MERGE (n:Deal {id: 'deal_nexus_health'})
SET n.type = 'Deal',
    n.label = 'Nexus Clinical Security Deployment',
    n.tier = 'warm',
    n.properties = '{\"title\":\"Nexus Clinical Security Deployment\",\"company\":\"Nexus Health Systems\",\"consumerName\":\"Marcus Vance\",\"value\":290000,\"targetArr\":290000,\"stage\":\"Solutioning\",\"probability\":60,\"closeDate\":\"Q4 2026\",\"nextStep\":\"Provide SOC 2 Type II audit documentation\"}',
    n.tags = ['EnterpriseDeal', 'ComplianceGated'],
    n.validFrom = '2026-08-01T00:00:00Z'
"

echo "--> Ingesting Graph Relationships & Connections..."
# Link Contacts to Accounts
execute_cypher "MATCH (c:Contact {id: 'contact_sarah_chen'}), (a:Account {id: 'acc_apex'}) MERGE (c)-[r:RELATION {id: 'rel_c_apex'}]->(a) SET r.relationship = 'PART_OF_ACCOUNT', r.weight = 1.0"
execute_cypher "MATCH (c:Contact {id: 'contact_elena_rostova'}), (a:Account {id: 'acc_vanguard'}) MERGE (c)-[r:RELATION {id: 'rel_c_vanguard'}]->(a) SET r.relationship = 'PART_OF_ACCOUNT', r.weight = 1.0"
execute_cypher "MATCH (c:Contact {id: 'contact_marcus_vance'}), (a:Account {id: 'acc_nexus'}) MERGE (c)-[r:RELATION {id: 'rel_c_nexus'}]->(a) SET r.relationship = 'PART_OF_ACCOUNT', r.weight = 1.0"
execute_cypher "MATCH (c:Contact {id: 'contact_julian_sterling'}), (a:Account {id: 'acc_hyperion'}) MERGE (c)-[r:RELATION {id: 'rel_c_hyperion'}]->(a) SET r.relationship = 'PART_OF_ACCOUNT', r.weight = 1.0"
execute_cypher "MATCH (c:Contact {id: 'contact_david_kim'}), (a:Account {id: 'acc_summit'}) MERGE (c)-[r:RELATION {id: 'rel_c_summit'}]->(a) SET r.relationship = 'PART_OF_ACCOUNT', r.weight = 1.0"
execute_cypher "MATCH (c:Contact {id: 'contact_rachel_adams'}), (a:Account {id: 'acc_beacon'}) MERGE (c)-[r:RELATION {id: 'rel_c_beacon'}]->(a) SET r.relationship = 'PART_OF_ACCOUNT', r.weight = 1.0"

# Link Champions & Decisions
execute_cypher "MATCH (c:Contact {id: 'contact_sarah_chen'}), (d:Deal {id: 'deal_apex_3yr'}) MERGE (c)-[r:RELATION {id: 'rel_sarah_champ'}]->(d) SET r.relationship = 'CHAMPIONS', r.weight = 0.95"
execute_cypher "MATCH (c:Contact {id: 'contact_elena_rostova'}), (d:Deal {id: 'deal_vanguard_global'}) MERGE (c)-[r:RELATION {id: 'rel_elena_champ'}]->(d) SET r.relationship = 'CHAMPIONS', r.weight = 0.98"
execute_cypher "MATCH (c:Contact {id: 'contact_david_kim'}), (a:Account {id: 'acc_summit'}) MERGE (c)-[r:RELATION {id: 'rel_david_budget'}]->(a) SET r.relationship = 'BUDGET_OWNER', r.weight = 0.94"
execute_cypher "MATCH (c:Contact {id: 'contact_marcus_vance'}), (d:Deal {id: 'deal_nexus_health'}) MERGE (c)-[r:RELATION {id: 'rel_marcus_decides'}]->(d) SET r.relationship = 'DECIDES_PRICING', r.weight = 0.96"

# Link Interactions to Accounts
execute_cypher "MATCH (i:InteractionEpisode {id: 'conv_apex_01'}), (a:Account {id: 'acc_apex'}) MERGE (i)-[r:RELATION {id: 'rel_i_apex'}]->(a) SET r.relationship = 'TRIGGERED_BY', r.weight = 1.0"
execute_cypher "MATCH (i:InteractionEpisode {id: 'conv_vanguard_01'}), (a:Account {id: 'acc_vanguard'}) MERGE (i)-[r:RELATION {id: 'rel_i_vanguard'}]->(a) SET r.relationship = 'TRIGGERED_BY', r.weight = 1.0"
execute_cypher "MATCH (i:InteractionEpisode {id: 'conv_nexus_01'}), (a:Account {id: 'acc_nexus'}) MERGE (i)-[r:RELATION {id: 'rel_i_nexus'}]->(a) SET r.relationship = 'TRIGGERED_BY', r.weight = 1.0"
execute_cypher "MATCH (i:InteractionEpisode {id: 'conv_hyperion_01'}), (a:Account {id: 'acc_hyperion'}) MERGE (i)-[r:RELATION {id: 'rel_i_hyperion'}]->(a) SET r.relationship = 'TRIGGERED_BY', r.weight = 1.0"
execute_cypher "MATCH (i:InteractionEpisode {id: 'conv_summit_01'}), (a:Account {id: 'acc_summit'}) MERGE (i)-[r:RELATION {id: 'rel_i_summit'}]->(a) SET r.relationship = 'TRIGGERED_BY', r.weight = 1.0"

# Link Deals to Accounts
execute_cypher "MATCH (d:Deal {id: 'deal_apex_3yr'}), (a:Account {id: 'acc_apex'}) MERGE (d)-[r:RELATION {id: 'rel_deal_apex_acc'}]->(a) SET r.relationship = 'PART_OF_ACCOUNT', r.weight = 1.0"
execute_cypher "MATCH (d:Deal {id: 'deal_vanguard_global'}), (a:Account {id: 'acc_vanguard'}) MERGE (d)-[r:RELATION {id: 'rel_deal_van_acc'}]->(a) SET r.relationship = 'PART_OF_ACCOUNT', r.weight = 1.0"
execute_cypher "MATCH (d:Deal {id: 'deal_nexus_health'}), (a:Account {id: 'acc_nexus'}) MERGE (d)-[r:RELATION {id: 'rel_deal_nex_acc'}]->(a) SET r.relationship = 'PART_OF_ACCOUNT', r.weight = 1.0"

# Link Constraints & Concession Rules
execute_cypher "MATCH (d:Deal {id: 'deal_apex_3yr'}), (c:PricingConstraint {id: 'req_apex_onboarding'}) MERGE (d)-[r:RELATION {id: 'rel_d_apex_req'}]->(c) SET r.relationship = 'PRICING_LINKED_TO', r.weight = 1.0"
execute_cypher "MATCH (d:Deal {id: 'deal_vanguard_global'}), (c:PricingConstraint {id: 'req_vanguard_sso'}) MERGE (d)-[r:RELATION {id: 'rel_d_van_req'}]->(c) SET r.relationship = 'PRICING_LINKED_TO', r.weight = 1.0"
execute_cypher "MATCH (r:ConcessionRule {id: 'rule_annual_advance'}), (c:PricingConstraint {id: 'req_apex_onboarding'}) MERGE (r)-[rel:RELATION {id: 'rel_rule_apex'}]->(c) SET rel.relationship = 'CONCESSION_TIED_TO', rel.weight = 1.0"

echo "==> Deterministic customer memory dataset seeded into HydraDB OSS successfully."
