/**
 * A.C.E Account Intelligence & Prospector Engine
 * Synthesizes Account Dossiers and Next Best Actions from HydraDB Context
 */

import { AccountIntelligence } from './types';
import { HydraDBEngine } from '../hydradb/engine';

export function getAccountIntelligenceList(): AccountIntelligence[] {
  const hydra = HydraDBEngine.getInstance();
  const snapshot = hydra.getGraphSnapshot();

  const accountNodes = snapshot.nodes.filter((n) => n.type === 'Account');

  return accountNodes.map((acc) => {
    // Find connected contacts, deals, and signals
    const relatedEdges = snapshot.edges.filter(
      (e) => e.sourceId === acc.id || e.targetId === acc.id
    );

    const connectedNodeIds = new Set<string>();
    relatedEdges.forEach((e) => {
      connectedNodeIds.add(e.sourceId);
      connectedNodeIds.add(e.targetId);
    });

    const relatedNodes = snapshot.nodes.filter((n) => connectedNodeIds.has(n.id) && n.id !== acc.id);

    const champions = relatedNodes
      .filter((n) => n.type === 'Contact' && n.properties.role?.includes('Champion'))
      .map((n) => ({
        name: n.label,
        title: n.properties.role || 'Champion',
        sentiment: n.properties.sentiment || 'Positive',
      }));

    const economicBuyers = relatedNodes
      .filter((n) => n.type === 'Contact' && (n.properties.role?.includes('Economic') || n.properties.role?.includes('Buyer') || n.properties.influenceScore > 0.95))
      .map((n) => ({
        name: n.label,
        title: n.properties.role || 'Economic Buyer',
        budgetSigned: !!n.properties.budgetSignedOff,
      }));

    const blockers = relatedNodes
      .filter((n) => n.type === 'Contact' && (n.properties.role?.includes('Blocker') || n.properties.role?.includes('Security') || n.properties.sentiment?.includes('Cautious')))
      .map((n) => ({
        name: n.label,
        title: n.properties.role || 'Security Stakeholder',
        concern: n.properties.painPoints?.[0] || 'Compliance & Security Verification',
      }));

    const signals = relatedNodes
      .filter((n) => n.type === 'BuyingSignal')
      .map((n) => ({
        title: n.label,
        confidence: n.properties.confidence || 0.9,
        date: 'Recent',
      }));

    let nextAction: {
      action: string;
      urgency: 'HIGH' | 'MEDIUM' | 'LOW';
      suggestedChannel: 'Email' | 'Executive Call' | 'Live Demo' | 'Contract Addendum';
      rationale: string;
    } = {
      action: `Schedule Commercial Alignment Review for ${acc.label}`,
      urgency: (acc.properties.dealHealthScore || 80) > 85 ? 'HIGH' : 'MEDIUM',
      suggestedChannel: 'Executive Call',
      rationale: `Active stakeholder interest in ${acc.properties.industry || 'enterprise'} commercial deployment.`,
    };

    return {
      id: acc.id,
      name: acc.label,
      domain: acc.properties.domain || 'enterprise.com',
      industry: acc.properties.industry || 'Enterprise Technology',
      tier: acc.tags?.find((t) => t.includes('Tier')) || 'Enterprise',
      intentScore: acc.properties.dealHealthScore || acc.properties.intentScore || 86,
      buyingStage: acc.properties.dealStage || acc.properties.currentStage || 'Negotiation',
      activeArr: acc.properties.targetArr ? Math.round(acc.properties.targetArr * 0.85) : 240000,
      potentialArr: acc.properties.targetArr || 400000,
      dealVelocityDays: acc.properties.dealVelocityDays || 14,
      healthScore: acc.properties.dealHealthScore || 88,
      champions,
      economicBuyers,
      blockers,
      signals: signals.length > 0 ? signals : [{ title: 'Active evaluation of commercial memory engines', confidence: 0.89, date: '3d ago' }],
      nextBestAction: nextAction,
    };
  });
}
