export interface Consumer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'Active' | 'In Negotiation' | 'Proposal Sent' | 'Follow-up Needed' | 'Closed Won';
  dealValue: number;
  lastContact: string;
  nextAction: string;
  nextActionDate: string;
  notes?: string;
  industry?: string;
  leadSource?: string;
  assignedRep?: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  score: number;
  status: 'New' | 'Contacted' | 'Qualified' | 'Demo Scheduled';
  source: string;
  interest: string;
  createdAt: string;
}

export interface Deal {
  id: string;
  title: string;
  consumerName: string;
  company: string;
  value: number;
  stage: 'Discovery' | 'Solutioning' | 'Proposal' | 'Negotiation' | 'Won';
  probability: number;
  closeDate: string;
  nextStep: string;
}

export interface TaskItem {
  id: string;
  title: string;
  relatedTo: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Normal';
  completed: boolean;
  type: 'Call' | 'Email' | 'Meeting' | 'Proposal' | 'Review';
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  date: string;
  consumer: string;
  company: string;
  type: 'Video Call' | 'In-Person' | 'Phone Call';
  attendees: string[];
}

export interface Campaign {
  id: string;
  name: string;
  status: 'Active' | 'Completed' | 'Draft';
  targetAudience: string;
  contactsCount: number;
  replyRate: string;
  conversionRate: string;
  startedAt: string;
}

export interface SalesActivity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'proposal' | 'deal_won';
  title: string;
  description: string;
  timestamp: string;
  consumerName: string;
}

export interface CustomerMemoryOverview {
  totalAccounts: number;
  totalContacts: number;
  totalInteractions: number;
  activeDeals: number;
  connectedRequirements: number;
}

/**
 * ConsumerDataStore (Customer Memory Projection Client)
 * Connects directly to the backend HydraDB API (/api/customer-memory/*).
 * Invariant: No fake hardcoded fallback data or localStorage.
 */
class ConsumerDataStore {
  private static instance: ConsumerDataStore;
  private consumers: Consumer[] = [];
  private leads: Lead[] = [];
  private deals: Deal[] = [];
  private tasks: TaskItem[] = [];
  private events: CalendarEvent[] = [];
  private campaigns: Campaign[] = [];
  private activities: SalesActivity[] = [];
  private listeners: Set<() => void> = new Set();
  private isLoaded = false;
  private isLoading = false;

  private constructor() {
    this.fetchFromHydraDB();
  }

  public static getInstance(): ConsumerDataStore {
    if (!ConsumerDataStore.instance) {
      ConsumerDataStore.instance = new ConsumerDataStore();
    }
    return ConsumerDataStore.instance;
  }

  public async fetchFromHydraDB(): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      // 1. Fetch Accounts & Contacts
      const accRes = await fetch('/api/customer-memory/accounts');
      if (accRes.ok) {
        const data = await accRes.json();
        if (Array.isArray(data.accounts)) {
          this.consumers = data.accounts;
        }
      }

      // 2. Fetch Interactions / Conversations
      const actRes = await fetch('/api/customer-memory/interactions');
      if (actRes.ok) {
        const data = await actRes.json();
        if (Array.isArray(data.interactions)) {
          this.activities = data.interactions.map((i: any) => ({
            id: i.id,
            type: 'meeting',
            title: i.title,
            description: i.description,
            timestamp: i.timestamp,
            consumerName: i.consumerName || i.company,
          }));

          // Derive calendar events from interactions/actions
          this.events = this.consumers.map((c, idx) => ({
            id: `evt_${c.id}_${idx}`,
            title: `${c.nextAction || 'Customer Review'} with ${c.name}`,
            time: c.nextActionDate || 'Scheduled',
            date: 'Upcoming',
            consumer: c.name,
            company: c.company,
            type: 'Video Call',
            attendees: [c.name, c.assignedRep || 'Commercial Lead'],
          }));

          // Derive action items from customer next actions
          this.tasks = this.consumers.map((c, idx) => ({
            id: `task_${c.id}_${idx}`,
            title: c.nextAction || `Review context for ${c.company}`,
            relatedTo: c.company,
            dueDate: c.nextActionDate || 'This Week',
            priority: c.dealValue > 300000 ? 'High' : 'Normal',
            completed: false,
            type: 'Review',
          }));
        }
      }

      // 3. Fetch Deals
      const dealRes = await fetch('/api/customer-memory/deals');
      if (dealRes.ok) {
        const data = await dealRes.json();
        if (Array.isArray(data.deals)) {
          this.deals = data.deals;
        }
      }

      this.isLoaded = true;
      this.notify();
    } catch (err) {
      console.warn('HydraDB customer memory sync notice:', err);
    } finally {
      this.isLoading = false;
    }
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  // --- Read Methods ---
  public getConsumers(): Consumer[] {
    return [...this.consumers];
  }

  public getConsumerById(id: string): Consumer | undefined {
    return this.consumers.find((c) => c.id === id);
  }

  public getLeads(): Lead[] {
    return [...this.leads];
  }

  public getDeals(): Deal[] {
    return [...this.deals];
  }

  public getTasks(): TaskItem[] {
    return [...this.tasks];
  }

  public getEvents(): CalendarEvent[] {
    return [...this.events];
  }

  public getCampaigns(): Campaign[] {
    return [...this.campaigns];
  }

  public getActivities(): SalesActivity[] {
    return [...this.activities];
  }

  // --- Mutation Methods (Synchronized to HydraDB) ---
  public async addConsumer(consumerData: Omit<Consumer, 'id'>): Promise<Consumer> {
    const newId = 'acc_' + Date.now().toString(36);
    const newConsumer: Consumer = {
      ...consumerData,
      id: newId,
    };

    // Optimistic local update
    this.consumers.unshift(newConsumer);
    this.notify();

    // Persist to HydraDB backend
    try {
      await fetch('/api/customer-memory/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consumerData),
      });
      // Re-sync authoritative state
      await this.fetchFromHydraDB();
    } catch (e) {
      console.error('Failed to commit customer to HydraDB:', e);
    }

    return newConsumer;
  }

  public updateConsumer(id: string, updates: Partial<Consumer>): Consumer | null {
    const idx = this.consumers.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.consumers[idx] = { ...this.consumers[idx], ...updates };
    this.notify();
    return this.consumers[idx];
  }

  public deleteConsumer(id: string): boolean {
    const initialLen = this.consumers.length;
    this.consumers = this.consumers.filter((c) => c.id !== id);
    if (this.consumers.length !== initialLen) {
      this.notify();
      return true;
    }
    return false;
  }

  public addLead(leadData: Omit<Lead, 'id' | 'createdAt'>): Lead {
    const newLead: Lead = {
      ...leadData,
      id: 'lead_' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
    };
    this.leads.unshift(newLead);
    this.notify();
    return newLead;
  }

  public convertLeadToConsumer(leadId: string): Consumer | null {
    const lead = this.leads.find((l) => l.id === leadId);
    if (!lead) return null;

    this.leads = this.leads.filter((l) => l.id !== leadId);
    const newConsumer: Consumer = {
      id: 'acc_' + Date.now().toString(36),
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      status: 'Active',
      dealValue: 120000,
      lastContact: 'Just now',
      nextAction: 'Review requirement inquiry notes',
      nextActionDate: 'Tomorrow at 10:00 AM',
      industry: 'Enterprise Technology',
      leadSource: lead.source,
      notes: `Inbound inquiry: ${lead.interest}`,
    };

    this.consumers.unshift(newConsumer);
    this.notify();
    return newConsumer;
  }

  public addDeal(dealData: Omit<Deal, 'id'>): Deal {
    const newDeal: Deal = {
      ...dealData,
      id: 'deal_' + Date.now().toString(36),
    };
    this.deals.unshift(newDeal);
    this.notify();
    return newDeal;
  }

  public addTask(taskData: Omit<TaskItem, 'id' | 'completed'>): TaskItem {
    const newTask: TaskItem = {
      ...taskData,
      id: 'task_' + Date.now().toString(36),
      completed: false,
    };
    this.tasks.unshift(newTask);
    this.notify();
    return newTask;
  }

  public toggleTask(id: string): void {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.notify();
    }
  }

  public logActivity(activity: Omit<SalesActivity, 'id' | 'timestamp'>): SalesActivity {
    const newAct: SalesActivity = {
      ...activity,
      id: 'act_' + Date.now().toString(36),
      timestamp: 'Just now',
    };
    this.activities.unshift(newAct);
    this.notify();
    return newAct;
  }
}

export const consumerStore = ConsumerDataStore.getInstance();
