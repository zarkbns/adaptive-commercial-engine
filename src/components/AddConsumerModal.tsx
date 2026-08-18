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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim()) return;

    const newConsumer = consumerStore.addConsumer({
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
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f7f4ee] text-[#966035] border border-[#e6ded3] flex items-center justify-center">
              <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Add New Consumer</h2>
              <p className="text-[11px] text-zinc-500">Record a new buyer account and deal opportunity.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-zinc-200 text-zinc-400 hover:text-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Consumer Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-700">Contact / Consumer Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Chen"
                className="w-full px-3 py-2 text-xs bg-zinc-50 rounded-xl border border-zinc-200 focus:outline-none focus:bg-white focus:border-[#966035]"
              />
            </div>

            {/* Company */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-700">Company Name *</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Apex Global Logistics"
                className="w-full px-3 py-2 text-xs bg-zinc-50 rounded-xl border border-zinc-200 focus:outline-none focus:bg-white focus:border-[#966035]"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@company.com"
                className="w-full px-3 py-2 text-xs bg-zinc-50 rounded-xl border border-zinc-200 focus:outline-none focus:bg-white focus:border-[#966035]"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-700">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (415) 890-2341"
                className="w-full px-3 py-2 text-xs bg-zinc-50 rounded-xl border border-zinc-200 focus:outline-none focus:bg-white focus:border-[#966035]"
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-700">Deal Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 rounded-xl border border-zinc-200 focus:outline-none focus:bg-white focus:border-[#966035]"
              >
                <option value="Active">Active</option>
                <option value="In Negotiation">In Negotiation</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Follow-up Needed">Follow-up Needed</option>
                <option value="Closed Won">Closed Won</option>
              </select>
            </div>

            {/* Deal Value */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-700">Expected Deal Value ($)</label>
              <input
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                placeholder="250000"
                className="w-full px-3 py-2 text-xs bg-zinc-50 rounded-xl border border-zinc-200 focus:outline-none focus:bg-white focus:border-[#966035]"
              />
            </div>

            {/* Next Action */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] font-bold text-zinc-700">Next Action</label>
              <input
                type="text"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="e.g. Send revised multi-year pricing quote"
                className="w-full px-3 py-2 text-xs bg-zinc-50 rounded-xl border border-zinc-200 focus:outline-none focus:bg-white focus:border-[#966035]"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#966035] hover:bg-[#83532c] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Add Consumer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
