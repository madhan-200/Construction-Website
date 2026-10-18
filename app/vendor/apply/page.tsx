'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context/AppContext';
import { store } from '@/lib/db/store';
import { formatDate } from '@/lib/utils/format';
import { 
  Building2, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  Send
} from 'lucide-react';

export default function VendorApplyPage() {
  const { locale, dict } = useApp();
  const [applications, setApplications] = useState(() => store.getVendorApplications());
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Form Fields
  const [legalBusinessName, setLegalBusinessName] = useState('Chennai Civil Works & Aggregates LLP');
  const [tradeName, setTradeName] = useState('CCW Materials & Machinery');
  const [registrationNumber, setRegistrationNumber] = useState('33AABCC9988D1Z4');
  const [taxId, setTaxId] = useState('AABCC9988D');
  const [applicantName, setApplicantName] = useState('Sundaramurthy P.');
  const [businessEmail, setBusinessEmail] = useState('supply@ccwmaterials.in');
  const [businessPhone, setBusinessPhone] = useState('+91 94441 55667');
  const [businessAddress, setBusinessAddress] = useState('Plot 45, Ambattur Industrial Estate, Chennai 600058');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Cement & Concrete', 'Structural Steel & TMT Bars']);

  const categories = store.getCategories();

  const handleCategoryToggle = (name: string) => {
    if (selectedCategories.includes(name)) {
      setSelectedCategories(selectedCategories.filter(c => c !== name));
    } else {
      setSelectedCategories([...selectedCategories, name]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.submitVendorApplication({
      applicantUserId: 'user-vendor-applicant-active',
      applicantName,
      legalBusinessName,
      tradeName,
      businessEmail,
      businessPhone,
      registrationNumber,
      taxId,
      countryCode: 'IN',
      operatingCategories: selectedCategories,
      businessAddress,
    });

    setApplications(store.getVendorApplications());
    setSubmittedSuccess(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Title */}
      <div className="border-b border-industrial-800 pb-4">
        <div className="text-xs font-mono font-bold text-safety-orange uppercase tracking-wider mb-1">
          {locale === 'ta' ? 'விற்பனையாளர் அனுமதி' : 'Third-Party Marketplace Onboarding'}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          {dict.vendor.applicationTitle}
        </h1>
        <p className="text-xs sm:text-sm text-industrial-400 mt-1 max-w-2xl leading-relaxed">
          {dict.vendor.applicationSubtitle} PRD §6.3 requires manual admin verification before product listings can be created or published.
        </p>
      </div>

      {submittedSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-600 rounded-lg p-6 space-y-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <div>
              <div className="font-bold text-white text-base">
                Vendor Application Submitted for Verification
              </div>
              <div className="text-xs text-emerald-200 mt-0.5">
                Our compliance and procurement desk will audit your statutory GSTIN and dealership authorization within 2 business days.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Application Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 bg-industrial-900 border border-industrial-800 rounded-lg p-6 space-y-6">
          <div className="font-bold text-white text-sm border-b border-industrial-800 pb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-safety-orange" />
            <span>1. Registered Entity & Statutory Tax Identifiers</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-mono text-industrial-400 mb-1">{dict.vendor.legalName}</label>
              <input
                type="text"
                required
                value={legalBusinessName}
                onChange={(e) => setLegalBusinessName(e.target.value)}
                className="w-full bg-industrial-950 border border-industrial-700 rounded px-3 py-2 text-white focus:outline-none focus:border-safety-orange"
              />
            </div>

            <div>
              <label className="block font-mono text-industrial-400 mb-1">{dict.vendor.tradeName}</label>
              <input
                type="text"
                required
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                className="w-full bg-industrial-950 border border-industrial-700 rounded px-3 py-2 text-white focus:outline-none focus:border-safety-orange"
              />
            </div>

            <div>
              <label className="block font-mono text-industrial-400 mb-1">{dict.vendor.taxId}</label>
              <input
                type="text"
                required
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="w-full bg-industrial-950 border border-industrial-700 rounded px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-safety-orange"
              />
            </div>

            <div>
              <label className="block font-mono text-industrial-400 mb-1">Company PAN / Tax Ref</label>
              <input
                type="text"
                required
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full bg-industrial-950 border border-industrial-700 rounded px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-safety-orange"
              />
            </div>

            <div>
              <label className="block font-mono text-industrial-400 mb-1">Authorized Representative</label>
              <input
                type="text"
                required
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full bg-industrial-950 border border-industrial-700 rounded px-3 py-2 text-white focus:outline-none focus:border-safety-orange"
              />
            </div>

            <div>
              <label className="block font-mono text-industrial-400 mb-1">{dict.vendor.companyEmail}</label>
              <input
                type="email"
                required
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                className="w-full bg-industrial-950 border border-industrial-700 rounded px-3 py-2 text-white focus:outline-none focus:border-safety-orange"
              />
            </div>

            <div>
              <label className="block font-mono text-industrial-400 mb-1">{dict.vendor.phone}</label>
              <input
                type="tel"
                required
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                className="w-full bg-industrial-950 border border-industrial-700 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-safety-orange"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-mono text-industrial-400 mb-1">{dict.vendor.address}</label>
              <textarea
                rows={2}
                required
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                className="w-full bg-industrial-950 border border-industrial-700 rounded px-3 py-2 text-white focus:outline-none focus:border-safety-orange"
              />
            </div>
          </div>

          {/* Categories Selector */}
          <div className="space-y-2 pt-2 border-t border-industrial-800">
            <label className="block font-mono text-xs text-industrial-300 font-bold">
              {dict.vendor.categories}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {categories.map((c) => {
                const checked = selectedCategories.includes(c.nameEn);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleCategoryToggle(c.nameEn)}
                    className={`p-2.5 rounded border text-left flex items-center justify-between transition ${
                      checked 
                        ? 'border-safety-orange bg-safety-orange/10 text-white font-semibold' 
                        : 'border-industrial-800 bg-industrial-950 text-industrial-400 hover:text-white'
                    }`}
                  >
                    <span>{c.nameEn}</span>
                    {checked && <ShieldCheck className="w-3.5 h-3.5 text-safety-orange" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-safety-orange hover:bg-safety-orange-hover text-white font-bold py-3.5 px-6 rounded text-xs transition flex items-center justify-center gap-2 shadow"
            >
              <Send className="w-4 h-4" />
              <span>{dict.vendor.submitApplication}</span>
            </button>
          </div>
        </form>

        {/* Right: Existing Applications & Policy Box */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-5 space-y-3">
            <div className="text-xs font-mono font-bold text-safety-orange uppercase">
              Compliance Requirements
            </div>
            <ul className="space-y-2 text-xs text-industrial-300">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Valid corporate GSTIN / Commercial Tax proof.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Authorized dealership or manufacturer certificate.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Commitment to platform-managed dispatch standards.</span>
              </li>
            </ul>
          </div>

          {/* Applications list */}
          <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-5 space-y-4">
            <div className="font-bold text-white text-sm border-b border-industrial-800 pb-2">
              Registered Applications
            </div>

            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="bg-industrial-950 border border-industrial-800 rounded p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{app.tradeName}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                      app.status === 'approved' 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : app.status === 'rejected'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="text-industrial-400 font-mono text-[11px]">
                    GSTIN: {app.registrationNumber} &bull; {formatDate(app.submittedAt, locale)}
                  </div>
                  {app.status === 'approved' && (
                    <div className="pt-2">
                      <Link
                        href="/admin"
                        className="text-safety-orange font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Manage in Portal</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
