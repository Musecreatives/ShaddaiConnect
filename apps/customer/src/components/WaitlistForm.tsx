'use client';

import { useState } from 'react';
import { ApiError, joinWaitlist } from '@/lib/api';

/** Field styling shared by every step — dark-page-aware (this form only ever renders on the
 * dark `/waitlist` page today), fixing the earlier bug where unstyled inputs picked up the
 * browser's own dark-mode UA styling and rendered near-invisible text on a near-black background. */
const inputClass =
  'w-full rounded-btn border-[1.5px] border-white/15 bg-white/5 px-4 py-3 text-[15px] text-white placeholder-white/35 outline-none transition-colors focus:border-brand-blue';
const selectClass = `${inputClass} appearance-none`;
const labelClass = 'mb-1.5 block text-sm font-medium text-white/80';

type Answers = {
  name: string;
  phone: string;
  email: string;
  description: string;
  workplace: string;
  area: string;
  hostelName: string;
  houseNumber: string;
  landmark: string;
  walkingDistance: string;
  mainUse: string[];
  hoursDaily: string;
  devices: string;
  networks: string[];
  challenges: string[];
  monthlySubscriptionRange: string;
  hourlyInterest: string;
  voucherTypes: string[];
  isBusinessInquiry: boolean;
  businessDeviceCount: string;
  bandwidthPreference: string;
  referralCount: string;
  wouldRefer: string;
  readyImmediately: string;
  wantsUpdates: boolean;
  notes: string;
};

const INITIAL: Answers = {
  name: '',
  phone: '',
  email: '',
  description: '',
  workplace: '',
  area: '',
  hostelName: '',
  houseNumber: '',
  landmark: '',
  walkingDistance: '',
  mainUse: [],
  hoursDaily: '',
  devices: '',
  networks: [],
  challenges: [],
  monthlySubscriptionRange: '',
  hourlyInterest: '',
  voucherTypes: [],
  isBusinessInquiry: false,
  businessDeviceCount: '',
  bandwidthPreference: '',
  referralCount: '',
  wouldRefer: '',
  readyImmediately: '',
  wantsUpdates: true,
  notes: '',
};

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2.5 rounded-btn border-[1.5px] border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white/85">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 rounded border-white/30 accent-brand-blue"
      />
      {label}
    </label>
  );
}

const STEPS = ['About you', 'Where you are', 'Internet usage', 'Pricing', 'Almost done'];

export function WaitlistForm() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>(INITIAL);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof Answers>(key: K, value: Answers[K]) {
    setA((prev) => ({ ...prev, [key]: value }));
  }

  const canContinueStep0 = Boolean(a.email.trim() || a.phone.trim());

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    const locationNote = [a.area, a.hostelName, a.landmark].filter(Boolean).join(', ') || undefined;
    try {
      await joinWaitlist({
        name: a.name.trim() || undefined,
        email: a.email.trim() || undefined,
        phone: a.phone.trim() || undefined,
        locationNote,
        survey: {
          description: a.description || undefined,
          workplace: a.workplace || undefined,
          area: a.area || undefined,
          hostelName: a.hostelName || undefined,
          houseNumber: a.houseNumber || undefined,
          landmark: a.landmark || undefined,
          walkingDistance: a.walkingDistance || undefined,
          mainUse: a.mainUse.length ? a.mainUse : undefined,
          hoursDaily: a.hoursDaily || undefined,
          devices: a.devices || undefined,
          networks: a.networks.length ? a.networks : undefined,
          challenges: a.challenges.length ? a.challenges : undefined,
          monthlySubscriptionRange: a.monthlySubscriptionRange || undefined,
          hourlyInterest: a.hourlyInterest || undefined,
          voucherTypes: a.voucherTypes.length ? a.voucherTypes : undefined,
          isBusinessInquiry: a.isBusinessInquiry,
          businessDeviceCount: a.businessDeviceCount || undefined,
          bandwidthPreference: a.bandwidthPreference || undefined,
          referralCount: a.referralCount || undefined,
          wouldRefer: a.wouldRefer || undefined,
          readyImmediately: a.readyImmediately || undefined,
          wantsUpdates: a.wantsUpdates,
          notes: a.notes || undefined,
        },
      });
      setJoined(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Something went wrong joining the waitlist. Try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  if (joined) {
    return (
      <div className="animate-fade-slide-in rounded-card border-[1.5px] border-success/30 bg-success-tint px-4 py-3.5 text-sm text-ink">
        You&apos;re on the list — we&apos;ll email you the moment we launch in your area.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <div className="flex items-center gap-1.5">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              i <= step ? 'bg-brand-blue' : 'bg-white/15'
            }`}
          />
        ))}
      </div>
      <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.09em] text-brand-blue-light">
        Step {step + 1} of {STEPS.length} — {STEPS[step]}
      </div>

      <div key={step} className="animate-fade-slide-in flex flex-col gap-3">
        {step === 0 && (
          <>
            <div>
              <label className={labelClass}>Full name</label>
              <input
                className={inputClass}
                value={a.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className={labelClass}>WhatsApp phone number</label>
              <input
                className={inputClass}
                type="tel"
                value={a.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="e.g. 08012345678"
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                className={inputClass}
                type="email"
                value={a.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className={labelClass}>Which best describes you?</label>
              <select
                className={selectClass}
                value={a.description}
                onChange={(e) => set('description', e.target.value)}
              >
                <option value="" className="text-ink">Select one</option>
                {['University Student', 'NYSC Member', 'Resident', 'Working Professional', 'Business Owner / Shop Operator', 'School / Institution Admin', 'Other'].map(
                  (opt) => (
                    <option key={opt} value={opt} className="text-ink">
                      {opt}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <label className={labelClass}>Institution, business name, or workplace (optional)</label>
              <input
                className={inputClass}
                value={a.workplace}
                onChange={(e) => set('workplace', e.target.value)}
                placeholder='e.g. "UNIBEN", "Mama Blessing Provisions"'
              />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <label className={labelClass}>Which area do you currently stay or operate in?</label>
              <select className={selectClass} value={a.area} onChange={(e) => set('area', e.target.value)}>
                <option value="" className="text-ink">Select one</option>
                {['RCF Area', 'Universal Tower Hostel Area', 'Deeper Life Student Fellowship Area', 'Friend Zone Area', 'Robinson Avenue', 'Atalanta Georgia Hostel', 'Other'].map(
                  (opt) => (
                    <option key={opt} value={opt} className="text-ink">
                      {opt}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <label className={labelClass}>Hostel / lodge / shop / school name (optional)</label>
              <input
                className={inputClass}
                value={a.hostelName}
                onChange={(e) => set('hostelName', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>House / lodge / shop number (optional)</label>
              <input
                className={inputClass}
                value={a.houseNumber}
                onChange={(e) => set('houseNumber', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Closest landmark (optional)</label>
              <input
                className={inputClass}
                value={a.landmark}
                onChange={(e) => set('landmark', e.target.value)}
                placeholder="e.g. RCF, Deeper Life, Friendzone, Universal Tower"
              />
            </div>
            <div>
              <label className={labelClass}>Walking distance to RCF or Deeper Life</label>
              <select
                className={selectClass}
                value={a.walkingDistance}
                onChange={(e) => set('walkingDistance', e.target.value)}
              >
                <option value="" className="text-ink">Select one</option>
                {['Less than 2 minutes', '2-5 minutes', '5-10 minutes', 'More than 10 minutes'].map((opt) => (
                  <option key={opt} value={opt} className="text-ink">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className={labelClass}>What do you mainly use the internet for?</label>
              <div className="grid grid-cols-2 gap-2">
                {['Online Classes', 'Assignments', 'Research', 'Programming/Coding', 'Remote Work', 'Business', 'Streaming', 'Gaming', 'Social Media', 'Video Calls', 'Crypto/Trading', 'Other'].map(
                  (opt) => (
                    <Checkbox
                      key={opt}
                      label={opt}
                      checked={a.mainUse.includes(opt)}
                      onChange={() => set('mainUse', toggle(a.mainUse, opt))}
                    />
                  ),
                )}
              </div>
            </div>
            <div>
              <label className={labelClass}>How many hours do you use the internet daily?</label>
              <select className={selectClass} value={a.hoursDaily} onChange={(e) => set('hoursDaily', e.target.value)}>
                <option value="" className="text-ink">Select one</option>
                {['Less than 2 Hours', '2-5 Hours', '5-8 Hours', 'More than 8 Hours'].map((opt) => (
                  <option key={opt} value={opt} className="text-ink">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>How many devices would connect?</label>
              <select className={selectClass} value={a.devices} onChange={(e) => set('devices', e.target.value)}>
                <option value="" className="text-ink">Select one</option>
                {['1 Device', '2 Devices', '3 Devices', '4 Devices', '5-10 Devices (small business/school)', '10+ Devices (business/school)'].map(
                  (opt) => (
                    <option key={opt} value={opt} className="text-ink">
                      {opt}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <label className={labelClass}>Which network(s) do you currently use?</label>
              <div className="grid grid-cols-2 gap-2">
                {['MTN', 'Airtel', 'Glo', '9mobile', 'Other'].map((opt) => (
                  <Checkbox
                    key={opt}
                    label={opt}
                    checked={a.networks.includes(opt)}
                    onChange={() => set('networks', toggle(a.networks, opt))}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>What challenges do you face?</label>
              <div className="grid grid-cols-2 gap-2">
                {['Slow Internet', 'Expensive Data', 'Poor Coverage', 'Frequent Disconnections', 'Limited Data', 'High Ping', 'Network Congestion', 'Other'].map(
                  (opt) => (
                    <Checkbox
                      key={opt}
                      label={opt}
                      checked={a.challenges.includes(opt)}
                      onChange={() => set('challenges', toggle(a.challenges, opt))}
                    />
                  ),
                )}
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <label className={labelClass}>
                Which weekly/monthly subscription would you consider? (1 device, unlimited)
              </label>
              <select
                className={selectClass}
                value={a.monthlySubscriptionRange}
                onChange={(e) => set('monthlySubscriptionRange', e.target.value)}
              >
                <option value="" className="text-ink">Select one</option>
                {['₦6,500', '₦7,500', '₦9,500', '₦12,500', "I'd only do pay-as-you-go vouchers"].map((opt) => (
                  <option key={opt} value={opt} className="text-ink">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Would you be interested in hourly/short-term vouchers?</label>
              <select
                className={selectClass}
                value={a.hourlyInterest}
                onChange={(e) => set('hourlyInterest', e.target.value)}
              >
                <option value="" className="text-ink">Select one</option>
                {['Yes', 'Maybe', 'No'].map((opt) => (
                  <option key={opt} value={opt} className="text-ink">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            {a.hourlyInterest && a.hourlyInterest !== 'No' && (
              <div>
                <label className={labelClass}>Which voucher(s) would you likely buy?</label>
                <div className="grid grid-cols-2 gap-2">
                  {['3 Hours', '6 Hours', '12 Hours', '24 Hours (Day Pass)', 'Weekend Pass', 'Weekly Pass', 'Monthly'].map(
                    (opt) => (
                      <Checkbox
                        key={opt}
                        label={opt}
                        checked={a.voucherTypes.includes(opt)}
                        onChange={() => set('voucherTypes', toggle(a.voucherTypes, opt))}
                      />
                    ),
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {step === 4 && (
          <>
            <div>
              <label className={labelClass}>
                Inquiring on behalf of a business, school, or office? (not just personal use)
              </label>
              <div className="flex gap-2">
                {[
                  { label: 'Yes', value: true },
                  { label: 'No', value: false },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => set('isBusinessInquiry', opt.value)}
                    className={`flex-1 rounded-btn border-[1.5px] py-2.5 text-sm font-semibold transition-colors ${
                      a.isBusinessInquiry === opt.value
                        ? 'border-brand-blue bg-brand-blue-light/15 text-white'
                        : 'border-white/15 text-white/70'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {a.isBusinessInquiry && (
              <div>
                <label className={labelClass}>Approximately how many devices/users would connect at once?</label>
                <input
                  className={inputClass}
                  value={a.businessDeviceCount}
                  onChange={(e) => set('businessDeviceCount', e.target.value)}
                  placeholder='e.g. "10 students", "6 staff computers + POS"'
                />
              </div>
            )}
            <div>
              <label className={labelClass}>Which sounds more useful to you?</label>
              <select
                className={selectClass}
                value={a.bandwidthPreference}
                onChange={(e) => set('bandwidthPreference', e.target.value)}
              >
                <option value="" className="text-ink">Select one</option>
                {['A shared bandwidth plan (cheaper, pooled with other users)', 'A dedicated/priority line (pricier, reserved for us)', 'Not sure yet', 'Not applicable'].map(
                  (opt) => (
                    <option key={opt} value={opt} className="text-ink">
                      {opt}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <label className={labelClass}>How many people in your hostel/compound may also subscribe?</label>
              <select
                className={selectClass}
                value={a.referralCount}
                onChange={(e) => set('referralCount', e.target.value)}
              >
                <option value="" className="text-ink">Select one</option>
                {['Just Me', '2-5 People', '6-10 People', 'More than 10 People'].map((opt) => (
                  <option key={opt} value={opt} className="text-ink">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>
                If selected among the first 15-20 users, ready to subscribe immediately?
              </label>
              <select
                className={selectClass}
                value={a.readyImmediately}
                onChange={(e) => set('readyImmediately', e.target.value)}
              >
                <option value="" className="text-ink">Select one</option>
                {['Yes', 'Within One Week', 'Within One Month', 'Not Sure'].map((opt) => (
                  <option key={opt} value={opt} className="text-ink">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Anything else you want us to know? (optional)</label>
              <textarea
                className={inputClass}
                rows={3}
                value={a.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="rounded-btn border-[1.5px] border-white/15 px-5 py-3 text-[15px] font-bold text-white/80 transition-colors hover:border-white/30"
          >
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            disabled={step === 0 && !canContinueStep0}
            onClick={() => setStep((s) => s + 1)}
            className="flex-1 rounded-btn bg-brand-blue py-3 text-[15px] font-bold text-white transition-colors hover:bg-brand-blue-deep disabled:opacity-35"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 rounded-btn bg-brand-blue py-3 text-[15px] font-bold text-white transition-colors hover:bg-brand-blue-deep disabled:opacity-35"
          >
            {loading ? 'Joining…' : 'Join the waitlist'}
          </button>
        )}
      </div>
      {error && (
        <p className="rounded-card border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
