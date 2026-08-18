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

const INITIAL_CONSUMERS: Consumer[] = [
  {
    id: 'c1',
    name: 'Sarah Chen',
    company: 'Apex Global Logistics',
    email: 'sarah.chen@apexlogistics.com',
    phone: '+1 (415) 890-2341',
    status: 'In Negotiation',
    dealValue: 480000,
    lastContact: 'Today, 10:30 AM',
    nextAction: 'Send updated 3-year pricing proposal',
    nextActionDate: 'Tomorrow at 9:00 AM',
    industry: 'Supply Chain & Logistics',
    leadSource: 'Executive Inbound',
    assignedRep: 'Alex Morgan',
    notes: 'Decision committee is reviewing multi-year pricing terms. Champion is aligned on technical scope.',
  },
  {
    id: 'c2',
    name: 'Marcus Vance',
    company: 'Nexus Health Systems',
    email: 'm.vance@nexushealth.org',
    phone: '+1 (312) 555-0198',
    status: 'Proposal Sent',
    dealValue: 320000,
    lastContact: 'Yesterday, 3:15 PM',
    nextAction: 'Follow up on compliance security review',
    nextActionDate: 'Thursday at 2:00 PM',
    industry: 'Healthcare Services',
    leadSource: 'Q2 Summit',
    assignedRep: 'Alex Morgan',
    notes: 'Sent enterprise security addendum. VP of Operations confirmed interest.',
  },
  {
    id: 'c3',
    name: 'Elena Rostova',
    company: 'Vanguard Fintech Group',
    email: 'elena.rostova@vanguardfintech.io',
    phone: '+1 (212) 777-4321',
    status: 'Active',
    dealValue: 650000,
    lastContact: '2 days ago',
    nextAction: 'Schedule technical solutioning walkthrough',
    nextActionDate: 'Friday at 11:00 AM',
    industry: 'Financial Technology',
    leadSource: 'Partner Referral',
    assignedRep: 'Alex Morgan',
    notes: 'Looking to consolidate 3 regional branches under a single platform license.',
  },
  {
    id: 'c4',
    name: 'David Kim',
    company: 'Summit Media Networks',
    email: 'david.kim@summitmedia.com',
    phone: '+1 (650) 444-9912',
    status: 'Follow-up Needed',
    dealValue: 195000,
    lastContact: '3 days ago',
    nextAction: 'Call to confirm budget sign-off timeline',
    nextActionDate: 'Today at 4:30 PM',
    industry: 'Media & Entertainment',
    leadSource: 'Website Demo Request',
    assignedRep: 'Alex Morgan',
    notes: 'Budget approved in principle; waiting on finance director signature.',
  },
  {
    id: 'c5',
    name: 'Rachel Adams',
    company: 'Beacon Retail Partners',
    email: 'radams@beaconretail.com',
    phone: '+1 (512) 333-8876',
    status: 'Closed Won',
    dealValue: 240000,
    lastContact: 'May 16, 2026',
    nextAction: 'Onboarding kickoff meeting with implementation team',
    nextActionDate: 'Next Monday at 10:00 AM',
    industry: 'Retail & Commerce',
    leadSource: 'Outreach Sequence',
    assignedRep: 'Alex Morgan',
    notes: '2-year contract executed. First invoice scheduled.',
  },
  {
    id: 'c6',
    name: 'Julian Sterling',
    company: 'Hyperion Energy Labs',
    email: 'j.sterling@hyperionenergy.net',
    phone: '+1 (713) 902-1144',
    status: 'In Negotiation',
    dealValue: 510000,
    lastContact: '4 hours ago',
    nextAction: 'Finalize SLA & dedicated support terms',
    nextActionDate: 'Wednesday at 1:30 PM',
    industry: 'Clean Energy & Utilities',
    leadSource: 'Industry Conference',
    assignedRep: 'Alex Morgan',
    notes: 'Requested custom SLA terms; trade for annual advance payment agreed.',
  },
];

const INITIAL_LEADS: Lead[] = [
  {
    id: 'l1',
    name: 'Thomas Wright',
    company: 'BlueWave Digital',
    email: 'twright@bluewavedigital.com',
    phone: '+1 (206) 555-8812',
    score: 94,
    status: 'Demo Scheduled',
    source: 'Website Demo Request',
    interest: 'Enterprise Platform Plan (50+ seats)',
    createdAt: 'Yesterday',
  },
  {
    id: 'l2',
    name: 'Sophia Martinez',
    company: 'Cadence BioTech',
    email: 's.martinez@cadencebio.com',
    phone: '+1 (617) 444-2299',
    score: 88,
    status: 'Qualified',
    source: 'Executive Inbound',
    interest: 'Dedicated Cloud Deployment',
    createdAt: '2 days ago',
  },
  {
    id: 'l3',
    name: 'Oliver Thorne',
    company: 'Apex Horizon Capital',
    email: 'oliver@apexhorizon.com',
    phone: '+1 (212) 888-3411',
    score: 82,
    status: 'Contacted',
    source: 'LinkedIn Sequence',
    interest: 'Growth Tier Expansion',
    createdAt: '3 days ago',
  },
  {
    id: 'l4',
    name: 'Claire Benoit',
    company: 'Lumiere Retail Labs',
    email: 'c.benoit@lumierelabs.fr',
    phone: '+33 1 42 68 55 00',
    score: 76,
    status: 'New',
    source: 'Webinar Attendee',
    interest: 'Sales Workspace Migration',
    createdAt: 'May 17, 2026',
  },
];

const INITIAL_DEALS: Deal[] = [
  {
    id: 'd1',
    title: 'Apex Global - 3-Year Enterprise Platform',
    consumerName: 'Sarah Chen',
    company: 'Apex Global Logistics',
    value: 480000,
    stage: 'Negotiation',
    probability: 85,
    closeDate: 'May 31, 2026',
    nextStep: 'Send revised concession proposal with annual upfront billing',
  },
  {
    id: 'd2',
    title: 'Nexus Health - Clinical Operations Expansion',
    consumerName: 'Marcus Vance',
    company: 'Nexus Health Systems',
    value: 320000,
    stage: 'Proposal',
    probability: 70,
    closeDate: 'June 15, 2026',
    nextStep: 'Present compliance review summary to executive committee',
  },
  {
    id: 'd3',
    title: 'Vanguard Fintech - Core Consolidation Deal',
    consumerName: 'Elena Rostova',
    company: 'Vanguard Fintech Group',
    value: 650000,
    stage: 'Solutioning',
    probability: 60,
    closeDate: 'June 30, 2026',
    nextStep: 'Conduct architecture & migration workshop',
  },
  {
    id: 'd4',
    title: 'Hyperion Energy - Dedicated Enterprise Suite',
    consumerName: 'Julian Sterling',
    company: 'Hyperion Energy Labs',
    value: 510000,
    stage: 'Negotiation',
    probability: 80,
    closeDate: 'June 10, 2026',
    nextStep: 'Final contract review with legal team',
  },
  {
    id: 'd5',
    title: 'Summit Media - Team Growth License',
    consumerName: 'David Kim',
    company: 'Summit Media Networks',
    value: 195000,
    stage: 'Discovery',
    probability: 45,
    closeDate: 'July 15, 2026',
    nextStep: 'Schedule stakeholder discovery call',
  },
];

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't1',
    title: 'Send updated 3-year proposal to Sarah Chen',
    relatedTo: 'Apex Global Logistics',
    dueDate: 'Today, 2:00 PM',
    priority: 'High',
    completed: false,
    type: 'Proposal',
  },
  {
    id: 't2',
    title: 'Follow up on compliance security addendum',
    relatedTo: 'Nexus Health Systems',
    dueDate: 'Today, 4:30 PM',
    priority: 'High',
    completed: false,
    type: 'Email',
  },
  {
    id: 't3',
    title: 'Prepare solutioning slides for Vanguard Fintech',
    relatedTo: 'Vanguard Fintech Group',
    dueDate: 'Tomorrow, 10:00 AM',
    priority: 'Medium',
    completed: false,
    type: 'Meeting',
  },
  {
    id: 't4',
    title: 'Log discovery notes from Summit Media call',
    relatedTo: 'Summit Media Networks',
    dueDate: 'Tomorrow, 1:00 PM',
    priority: 'Normal',
    completed: true,
    type: 'Review',
  },
  {
    id: 't5',
    title: 'Schedule onboarding kickoff with Rachel Adams',
    relatedTo: 'Beacon Retail Partners',
    dueDate: 'Friday, 11:30 AM',
    priority: 'Medium',
    completed: false,
    type: 'Call',
  },
];

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Commercial Terms Review Call',
    time: '10:00 AM - 10:45 AM',
    date: 'Today',
    consumer: 'Sarah Chen',
    company: 'Apex Global Logistics',
    type: 'Video Call',
    attendees: ['Sarah Chen', 'Alex Morgan', 'David Miller (CFO)'],
  },
  {
    id: 'e2',
    title: 'Security & SLA Alignment Sync',
    time: '2:30 PM - 3:15 PM',
    date: 'Today',
    consumer: 'Julian Sterling',
    company: 'Hyperion Energy Labs',
    type: 'Video Call',
    attendees: ['Julian Sterling', 'Alex Morgan'],
  },
  {
    id: 'e3',
    title: 'Quarterly Executive Review',
    time: '11:00 AM - 12:00 PM',
    date: 'Tomorrow',
    consumer: 'Elena Rostova',
    company: 'Vanguard Fintech Group',
    type: 'Video Call',
    attendees: ['Elena Rostova', 'Alex Morgan', 'Regional Directors'],
  },
  {
    id: 'e4',
    title: 'Contract Signing & Next Steps',
    time: '3:00 PM - 3:30 PM',
    date: 'Thursday',
    consumer: 'Marcus Vance',
    company: 'Nexus Health Systems',
    type: 'Phone Call',
    attendees: ['Marcus Vance', 'Alex Morgan'],
  },
];

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'cmp1',
    name: 'Enterprise Mid-Market Q3 Expansion',
    status: 'Active',
    targetAudience: 'VPs of Sales & RevOps Leaders',
    contactsCount: 142,
    replyRate: '34.2%',
    conversionRate: '12.8%',
    startedAt: 'May 1, 2026',
  },
  {
    id: 'cmp2',
    name: 'Healthcare & Pharma Strategic Accounts',
    status: 'Active',
    targetAudience: 'Chief Medical Officers & Operations Heads',
    contactsCount: 88,
    replyRate: '28.5%',
    conversionRate: '9.4%',
    startedAt: 'May 8, 2026',
  },
  {
    id: 'cmp3',
    name: 'Fintech Leadership Executive Sequence',
    status: 'Completed',
    targetAudience: 'Fintech Founders & Heads of Product',
    contactsCount: 210,
    replyRate: '41.0%',
    conversionRate: '16.5%',
    startedAt: 'April 15, 2026',
  },
];

const INITIAL_ACTIVITIES: SalesActivity[] = [
  {
    id: 'act1',
    type: 'proposal',
    title: 'Sent Updated Proposal',
    description: 'Sent revised 3-year term pricing sheet ($480k ARR)',
    timestamp: '25m ago',
    consumerName: 'Sarah Chen (Apex Global)',
  },
  {
    id: 'act2',
    type: 'call',
    title: 'Completed Strategy Call',
    description: 'Discussed compliance review timeline and procurement gating',
    timestamp: '2h ago',
    consumerName: 'Marcus Vance (Nexus Health)',
  },
  {
    id: 'act3',
    type: 'deal_won',
    title: 'Deal Signed & Closed Won',
    description: 'Beacon Retail signed 2-year partnership contract ($240k ARR)',
    timestamp: 'Yesterday',
    consumerName: 'Rachel Adams (Beacon Retail)',
  },
  {
    id: 'act4',
    type: 'email',
    title: 'Received Contract Feedback',
    description: 'Julian requested custom support SLA for multi-site deployment',
    timestamp: 'Yesterday',
    consumerName: 'Julian Sterling (Hyperion Energy)',
  },
];

class ConsumerDataStore {
  private static instance: ConsumerDataStore | null = null;
  private consumers: Consumer[] = INITIAL_CONSUMERS;
  private leads: Lead[] = INITIAL_LEADS;
  private deals: Deal[] = INITIAL_DEALS;
  private tasks: TaskItem[] = INITIAL_TASKS;
  private events: CalendarEvent[] = INITIAL_EVENTS;
  private campaigns: Campaign[] = INITIAL_CAMPAIGNS;
  private activities: SalesActivity[] = INITIAL_ACTIVITIES;
  private listeners: (() => void)[] = [];

  private constructor() {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const savedConsumers = localStorage.getItem('ace_consumers');
        if (savedConsumers) this.consumers = JSON.parse(savedConsumers);
        const savedTasks = localStorage.getItem('ace_tasks');
        if (savedTasks) this.tasks = JSON.parse(savedTasks);
        const savedDeals = localStorage.getItem('ace_deals');
        if (savedDeals) this.deals = JSON.parse(savedDeals);
      } catch {
        // Fallback to initial
      }
    }
  }

  public static getInstance(): ConsumerDataStore {
    if (!ConsumerDataStore.instance) {
      ConsumerDataStore.instance = new ConsumerDataStore();
    }
    return ConsumerDataStore.instance;
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ace_consumers', JSON.stringify(this.consumers));
        localStorage.setItem('ace_tasks', JSON.stringify(this.tasks));
        localStorage.setItem('ace_deals', JSON.stringify(this.deals));
      } catch {
        // ignore
      }
    }
    this.listeners.forEach((l) => l());
  }

  public getConsumers(): Consumer[] {
    return [...this.consumers];
  }

  public getConsumer(id: string): Consumer | undefined {
    return this.consumers.find((c) => c.id === id);
  }

  public addConsumer(consumer: Omit<Consumer, 'id'>): Consumer {
    const newConsumer: Consumer = {
      ...consumer,
      id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    };
    this.consumers = [newConsumer, ...this.consumers];
    this.addActivity({
      type: 'call',
      title: 'Added New Consumer',
      description: `Created consumer record for ${newConsumer.name} (${newConsumer.company})`,
      timestamp: 'Just now',
      consumerName: newConsumer.name,
    });
    this.notify();
    return newConsumer;
  }

  public updateConsumer(id: string, updates: Partial<Consumer>) {
    this.consumers = this.consumers.map((c) => (c.id === id ? { ...c, ...updates } : c));
    this.notify();
  }

  public getLeads(): Lead[] {
    return [...this.leads];
  }

  public convertLeadToConsumer(leadId: string): Consumer | undefined {
    const lead = this.leads.find((l) => l.id === leadId);
    if (!lead) return undefined;
    this.leads = this.leads.filter((l) => l.id !== leadId);
    const newConsumer = this.addConsumer({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      status: 'Active',
      dealValue: 250000,
      lastContact: 'Just now',
      nextAction: 'Schedule qualification call',
      nextActionDate: 'Tomorrow at 10:00 AM',
      leadSource: lead.source,
      notes: `Converted from lead (${lead.interest})`,
    });
    return newConsumer;
  }

  public getDeals(): Deal[] {
    return [...this.deals];
  }

  public addDeal(deal: Omit<Deal, 'id'>): Deal {
    const newDeal: Deal = {
      ...deal,
      id: `d_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    };
    this.deals = [newDeal, ...this.deals];
    this.notify();
    return newDeal;
  }

  public getTasks(): TaskItem[] {
    return [...this.tasks];
  }

  public addTask(task: Omit<TaskItem, 'id' | 'completed'>): TaskItem {
    const newTask: TaskItem = {
      ...task,
      id: `t_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      completed: false,
    };
    this.tasks = [newTask, ...this.tasks];
    this.notify();
    return newTask;
  }

  public toggleTask(id: string) {
    this.tasks = this.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    this.notify();
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

  public addActivity(activity: Omit<SalesActivity, 'id'>) {
    const newAct: SalesActivity = {
      ...activity,
      id: `act_${Date.now()}`,
    };
    this.activities = [newAct, ...this.activities.slice(0, 19)];
    this.notify();
  }
}

export const consumerStore = ConsumerDataStore.getInstance();
