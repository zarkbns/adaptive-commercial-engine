import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  PlusSignIcon,
  UserIcon,
  Building01Icon,
  Mail01Icon,
  CallIcon,
  Dollar01Icon,
  Briefcase01Icon,
} from '@hugeicons/core-free-icons';
import { Consumer, consumerStore } from '../services/consumerService';

interface AddConsumerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsumerAdded: (consumer: Consumer) => void;
}

export const AddConsumerModal: React.FC<AddConsumerModalProps> = ({
  isOpen,
  onClose,
  onConsumerAdded,
}) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<Consumer['status']>('In Negotiation');
  const [dealValue, setDealValue] = useState('250000');
  const [industry, setIndustry] = useState('Enterprise Services');
  const [nextAction, setNextAction] = useState('Send pricing proposal');
  const [nextActionDate, setNextActionDate] = useState('Tomorrow at 10:00 AM');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newConsumer = await consumerStore.addConsumer({
        name: name.trim(),
        company: company.trim(),
        email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        phone: phone.trim() || '+1 (555) 019-2831',
        status,
        dealValue: Number(dealValue) || 250000,
        lastContact: 'Just now',
        nextAction: nextAction.trim() || 'Follow up with pricing',
        nextActionDate: nextActionDate.trim() || 'Tomorrow at 10:00 AM',
        industry: industry.trim(),
        notes: notes.trim(),
      });

      onConsumerAdded(newConsumer);
      onClose();
    } catch (err) {
      console.error('Failed to add customer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-800/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f7f4ee] dark:bg-zinc-800 text-[#966035] dark:text-amber-300 border border-[#e6ded3] dark:border-zinc-700 flex items-center justify-center">
              <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Add Customer to Memory</h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Record a customer organization and key contact in HydraDB.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Consumer Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Contact Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Chen"
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-[#966035]"
              />
            </div>

            {/* Company */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Organization / Company *</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Apex Global Logistics"
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-[#966035]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah.chen@apex.com"
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-[#966035]"
              />
            </div>

            {/* Industry */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Industry</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Supply Chain & Logistics"
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-[#966035]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Deal Value */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Target Value ($ ARR)</label>
              <input
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                placeholder="250000"
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-[#966035]"
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Consumer['status'])}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-[#966035]"
              >
                <option value="Active">Active Engagement</option>
                <option value="In Negotiation">In Negotiation</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Follow-up Needed">Follow-up Needed</option>
                <option value="Closed Won">Closed Won</option>
              </select>
            </div>
          </div>

          {/* Notes & Context */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Customer Context & Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key requirements, conversation notes, timeline constraints..."
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-[#966035]"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-full bg-[#966035] hover:bg-[#83532c] text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
            >
              <HugeiconsIcon icon={PlusSignIcon} className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Saving to HydraDB...' : 'Save to HydraDB'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
