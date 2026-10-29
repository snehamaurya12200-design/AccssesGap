import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AssistanceType,
  ContactPreference,
  RequestStatus,
  AssistanceRequest,
} from '../../types';
import {
  HeartHandshake,
  Calendar,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock3,
  UserCheck,
  Building2,
  Trash2,
  Plus,
  ShieldAlert,
  Send,
  HelpCircle,
} from 'lucide-react';

const ASSISTANCE_OPTIONS: Array<{ type: AssistanceType; description: string }> = [
  {
    type: 'Wheelchair Navigation',
    description: 'Assistance navigating ramps, elevators, and street-level curb cuts.',
  },
  {
    type: 'Visual Guide / Escort',
    description: 'Trained sighted guide for persons with low vision or blindness.',
  },
  {
    type: 'Sign Language & Communication',
    description: 'Basic sign language or written transcription support at service counters.',
  },
  {
    type: 'Heavy Door / Mobility Assistance',
    description: 'Assistance opening heavy unautomated doors, carrying bags, or queue waiting.',
  },
  {
    type: 'Form Filling & Counter Escort',
    description: 'Support reading civic documents, filing paper forms, and notary escort.',
  },
  {
    type: 'Sensory Friendly Visit Accompaniment',
    description: 'Quiet-route navigation and sensory pause accompaniment for neurodivergent citizens.',
  },
];

export const AssistModule: React.FC = () => {
  const {
    buildings,
    selectedBuildingId,
    setSelectedBuildingId,
    requests,
    submitAssistanceRequest,
    updateRequestStatus,
    deleteRequest,
  } = useApp();

  // Form State
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [contactPreference, setContactPreference] = useState<ContactPreference>('Phone call');
  const [buildingId, setBuildingId] = useState(selectedBuildingId || buildings[0]?.id || '');
  const [assistanceType, setAssistanceType] = useState<AssistanceType>('Wheelchair Navigation');

  useEffect(() => {
    if (selectedBuildingId) {
      setBuildingId(selectedBuildingId);
    }
  }, [selectedBuildingId]);
  const [requestedDate, setRequestedDate] = useState(() => {
    // Default to tomorrow's date
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [requestedTime, setRequestedTime] = useState('10:00 AM');
  const [specialRequirements, setSpecialRequirements] = useState('');

  // UI state
  const [statusFilter, setStatusFilter] = useState<'All' | RequestStatus>('All');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [volunteerAssignModalFor, setVolunteerAssignModalFor] = useState<string | null>(null);
  const [customVolunteerName, setCustomVolunteerName] = useState('Sarah Jenkins (Civic Corps)');

  const selectedBuilding = buildings.find((b) => b.id === buildingId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!citizenName.trim()) {
      alert('Please enter your full name.');
      return;
    }

    if (!citizenPhone.trim() && !citizenEmail.trim()) {
      alert('Please provide at least a phone number or email address for confirmation.');
      return;
    }

    if (!buildingId) {
      alert('Please select a government building or service centre.');
      return;
    }

    setIsSubmitting(true);

    const targetBldg = buildings.find((b) => b.id === buildingId);

    const newId = submitAssistanceRequest({
      citizenName: citizenName.trim(),
      citizenPhone: citizenPhone.trim() || 'Not provided',
      citizenEmail: citizenEmail.trim() || 'Not provided',
      contactPreference,
      buildingId,
      buildingName: targetBldg ? targetBldg.name : 'Public Service Centre',
      buildingAddress: targetBldg ? targetBldg.address : '',
      assistanceType,
      requestedDate,
      requestedTime,
      specialRequirements: specialRequirements.trim() || 'Standard public assistance requested.',
    });

    setIsSubmitting(false);
    setSuccessMessage(`Assistance Request #${newId} logged successfully! Review status below.`);

    // Reset form fields
    setCitizenName('');
    setCitizenPhone('');
    setCitizenEmail('');
    setSpecialRequirements('');

    setTimeout(() => {
      setSuccessMessage(null);
    }, 6000);
  };

  const filteredRequests = requests.filter((req) => {
    if (statusFilter === 'All') return true;
    return req.status === statusFilter;
  });

  const handleAcceptRequest = (requestId: string) => {
    updateRequestStatus(requestId, 'Accepted', customVolunteerName);
    setVolunteerAssignModalFor(null);
  };

  const handleCompleteRequest = (requestId: string) => {
    updateRequestStatus(requestId, 'Completed');
  };

  const handleCancelRequest = (requestId: string) => {
    if (window.confirm('Are you sure you want to cancel this assistance request?')) {
      updateRequestStatus(requestId, 'Cancelled');
    }
  };

  return (
    <div className="space-y-8">
      {/* Prototype Civic Disclaimer Banner */}
      <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-950 text-xs flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-900 text-sm">
            AccessGap Volunteer Prototype Notice
          </div>
          <p className="leading-relaxed text-amber-800">
            This module coordinates demonstration assistance requests between citizens with disabilities and civic volunteers. Please note that this is a civic demonstration prototype and does not yet trigger real-time dispatch of municipal emergency or certified medical personnel. All requests below are active simulation entries.
          </p>
        </div>
      </div>

      {/* Main 2-Column Split: Booking Form on Left, Requests Management on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Request Assistance (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <HeartHandshake className="w-5 h-5 text-teal-800" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                I Need Help — Request Volunteer Accompaniment
              </h2>
              <p className="text-xs text-slate-500">
                Book a community volunteer to assist your visit to a public service centre.
              </p>
            </div>
          </div>

          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Target Building Selector */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Public Building or Service Centre <span className="text-rose-600">*</span>
              </label>
              <select
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.statusTier} · {b.currentScore !== null ? `${b.currentScore}/100` : 'Unscored'})
                  </option>
                ))}
              </select>
              {selectedBuilding && (
                <div className="mt-1 text-[11px] text-slate-500">
                  {selectedBuilding.address}
                </div>
              )}
            </div>

            {/* Assistance Required */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Type of Assistance Required <span className="text-rose-600">*</span>
              </label>
              <select
                value={assistanceType}
                onChange={(e) => setAssistanceType(e.target.value as AssistanceType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
              >
                {ASSISTANCE_OPTIONS.map((opt) => (
                  <option key={opt.type} value={opt.type}>
                    {opt.type}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-500 italic">
                {ASSISTANCE_OPTIONS.find((o) => o.type === assistanceType)?.description}
              </p>
            </div>

            {/* Date & Time Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Preferred Date <span className="text-rose-600">*</span>
                </label>
                <input
                  type="date"
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Preferred Time <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10:30 AM"
                  value={requestedTime}
                  onChange={(e) => setRequestedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Citizen Contact Details */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Citizen Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Arthur Pendelton"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.org"
                    value={citizenEmail}
                    onChange={(e) => setCitizenEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Preferred Contact Method
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Phone call', 'SMS', 'WhatsApp', 'Email'] as ContactPreference[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setContactPreference(m)}
                      className={`py-1.5 px-2 rounded-md font-medium text-[11px] border text-center transition-colors ${
                        contactPreference === m
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Specific Assistance Notes or Mobility Equipment
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Electric wheelchair user, traveling by paratransit bus, need escort to 2nd floor notary desk..."
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-xs font-bold text-white bg-teal-800 rounded-lg hover:bg-teal-900 transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Assistance Request</span>
            </button>
          </form>
        </div>

        {/* Right Section: Requests Management & Queue (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Citizen Assistance Requests ({requests.length})
              </h2>
              <p className="text-xs text-slate-500">
                Track submitted visits, assign volunteers, and confirm completion.
              </p>
            </div>

            {/* Status Filter tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              {(['All', 'Pending', 'Accepted', 'Completed'] as const).map((s) => {
                const count = s === 'All' ? requests.length : requests.filter((r) => r.status === s).length;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                      statusFilter === s
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {s} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-xl space-y-2">
              <Clock3 className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No requests in this status</p>
              <p className="text-xs text-slate-500">
                Submit a new request from the form to test volunteer coordination.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((req) => {
                const isPending = req.status === 'Pending';
                const isAccepted = req.status === 'Accepted';
                const isCompleted = req.status === 'Completed';

                return (
                  <div
                    key={req.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 text-xs"
                  >
                    {/* Header: Citizen name + Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            {req.citizenName}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-500 font-mono text-[11px]">{req.id}</span>
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          Prefers contact via <strong>{req.contactPreference}</strong> ({req.citizenPhone || req.citizenEmail})
                        </div>
                      </div>

                      {/* Status badge */}
                      <span
                        className={`inline-block px-2.5 py-1 rounded font-semibold text-[11px] uppercase tracking-wider ${
                          isPending
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : isAccepted
                            ? 'bg-sky-100 text-sky-900 border border-sky-200'
                            : isCompleted
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    {/* Service & Building details */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                        <Building2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                        <span>{req.buildingName}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-slate-600 text-[11px]">
                        <span className="font-medium text-teal-800">{req.assistanceType}</span>
                        <span className="text-slate-400">·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{req.requestedDate} at {req.requestedTime}</span>
                        </span>
                      </div>
                      {req.specialRequirements && (
                        <p className="text-slate-600 pt-1 border-t border-slate-200/60 leading-relaxed">
                          <span className="font-medium text-slate-800">Special Notes:</span>{' '}
                          {req.specialRequirements}
                        </p>
                      )}
                    </div>

                    {/* Assigned Volunteer tag if accepted */}
                    {req.assignedVolunteer && (
                      <div className="flex items-center gap-1.5 text-sky-900 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200 text-[11px]">
                        <UserCheck className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                        <span>
                          Assigned Volunteer: <strong>{req.assignedVolunteer}</strong>
                        </span>
                      </div>
                    )}

                    {/* Action transition buttons */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => setVolunteerAssignModalFor(req.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-teal-800 rounded-lg hover:bg-teal-900 transition-colors shadow-xs"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Accept Request</span>
                          </button>
                        )}

                        {isAccepted && (
                          <button
                            type="button"
                            onClick={() => handleCompleteRequest(req.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Completed</span>
                          </button>
                        )}

                        {!isCompleted && req.status !== 'Cancelled' && (
                          <button
                            type="button"
                            onClick={() => handleCancelRequest(req.id)}
                            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-700 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteRequest(req.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Delete request entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Volunteer Assignment Modal */}
      {volunteerAssignModalFor && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b">
              <UserCheck className="w-5 h-5 text-teal-800" />
              <h3 className="text-base font-bold text-slate-900">Confirm Volunteer Assignment</h3>
            </div>

            <p className="text-slate-600">
              Assign a civic volunteer to accompany this citizen on their scheduled visit.
            </p>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Volunteer Name / Organization
              </label>
              <input
                type="text"
                value={customVolunteerName}
                onChange={(e) => setCustomVolunteerName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setVolunteerAssignModalFor(null)}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAcceptRequest(volunteerAssignModalFor)}
                className="px-4 py-1.5 rounded-lg font-semibold text-white bg-teal-800 hover:bg-teal-900"
              >
                Confirm & Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
