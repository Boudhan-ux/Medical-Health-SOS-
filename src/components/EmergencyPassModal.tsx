import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Edit3,
  HeartPulse,
  PhoneCall,
  Pill,
  ShieldAlert,
  Stethoscope,
  User,
  X,
} from 'lucide-react';
import { MedicationItem, UserHealthProfile } from '../types/health';

interface EmergencyPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserHealthProfile;
  medications: MedicationItem[];
  onUpdateProfile?: (patch: Partial<UserHealthProfile>) => void;
  readOnly?: boolean;
}

const BLOOD_GROUPS = ['Unbekannt', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'];

export const EmergencyPassModal: React.FC<EmergencyPassModalProps> = ({
  isOpen,
  onClose,
  profile,
  medications,
  onUpdateProfile,
  readOnly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [bloodGroup, setBloodGroup] = useState(profile.bloodGroup || '');
  const [allergies, setAllergies] = useState(profile.allergies || '');
  const [chronicConditions, setChronicConditions] = useState(profile.chronicConditions || '');
  const [emergencyContactName, setEmergencyContactName] = useState(
    profile.emergencyContactName || ''
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    profile.emergencyContactPhone || ''
  );
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBloodGroup(profile.bloodGroup || '');
      setAllergies(profile.allergies || '');
      setChronicConditions(profile.chronicConditions || '');
      setEmergencyContactName(profile.emergencyContactName || '');
      setEmergencyContactPhone(profile.emergencyContactPhone || '');
      setSavedNotice(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const displayName =
    profile.fullName?.trim() ||
    `${profile.firstName || ''} ${profile.lastName || ''}`.trim() ||
    'Nicht hinterlegt';

  const displayDoctor =
    profile.familyDoctor?.trim() || profile.primaryDoctorName?.trim() || 'Nicht hinterlegt';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateProfile) return;
    onUpdateProfile({
      bloodGroup: bloodGroup.trim(),
      allergies: allergies.trim(),
      chronicConditions: chronicConditions.trim(),
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
    });
    setIsEditing(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white border-2 border-rose-700 shadow-2xl overflow-hidden my-auto">
        {/* Red Emergency Header */}
        <div className="bg-rose-700 text-white px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-white" />
            </span>
            <div>
              <h2 className="text-base font-extrabold tracking-tight leading-tight">
                SOS · Medizinischer Notfallpass
              </h2>
              <p className="text-[11px] text-rose-100">
                Wichtige Gesundheitsdaten für Rettungsdienst, Ärzte & Angehörige
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Notfallpass schließen"
            className="w-8 h-8 rounded-lg bg-rose-800 hover:bg-rose-900 text-white flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3.5 max-h-[80vh] overflow-y-auto text-slate-900">
          {/* Quick Emergency Call Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href="tel:112"
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-sm transition-colors"
            >
              <PhoneCall className="w-4 h-4 shrink-0" />
              <span>112 Notruf wählen</span>
            </a>
            <a
              href="tel:116117"
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <Stethoscope className="w-4 h-4 shrink-0" />
              <span>116 117 Ärztl. Bereitschaft</span>
            </a>
          </div>

          {/* Emergency Contact Call Button if configured */}
          {profile.emergencyContactPhone && (
            <a
              href={`tel:${profile.emergencyContactPhone.replace(/\s+/g, '')}`}
              className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>
                  Notfallkontakt anrufen:{' '}
                  <strong>{profile.emergencyContactName || 'Angehörige/r'}</strong>
                </span>
              </div>
              <span className="font-mono text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded">
                {profile.emergencyContactPhone}
              </span>
            </a>
          )}

          {savedNotice && (
            <div className="rounded-xl bg-emerald-100 border border-emerald-700 px-3 py-2 text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>Notfallpass-Angaben wurden lokal gespeichert.</span>
            </div>
          )}

          {!isEditing || readOnly ? (
            <>
              {/* Person & Blood Group Card */}
              <div className="rounded-xl border border-rose-300 bg-rose-50/70 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-950">
                    <User className="w-4 h-4 text-rose-700 shrink-0" />
                    <span>Patienten-Stammdaten</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg bg-rose-700 text-white text-xs font-extrabold">
                    Blutgruppe: {profile.bloodGroup || 'Unbekannt'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-white rounded-lg p-2 border border-rose-200">
                    <span className="text-[10px] font-semibold text-slate-500 block">Name</span>
                    <span className="font-bold text-slate-900">{displayName}</span>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-rose-200">
                    <span className="text-[10px] font-semibold text-slate-500 block">
                      Geburtsdatum
                    </span>
                    <span className="font-bold text-slate-900">
                      {profile.birthDate || 'Nicht hinterlegt'}
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-rose-200">
                    <span className="text-[10px] font-semibold text-slate-500 block">
                      Krankenkasse & Vers.-Nr.
                    </span>
                    <span className="font-bold text-slate-900">
                      {profile.healthInsurance
                        ? `${profile.healthInsurance}${
                            profile.insuranceNumber ? ` (${profile.insuranceNumber})` : ''
                          }`
                        : 'Nicht hinterlegt'}
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-rose-200">
                    <span className="text-[10px] font-semibold text-slate-500 block">
                      Behandelnder Hausarzt
                    </span>
                    <span className="font-bold text-slate-900">{displayDoctor}</span>
                  </div>
                </div>
              </div>

              {/* Allergies & Chronic Conditions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-amber-400 bg-amber-50/80 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Allergien & Unverträglichkeiten</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 whitespace-pre-line">
                    {profile.allergies?.trim() || 'Keine bekannt / Nicht hinterlegt'}
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-700/60 bg-emerald-50/70 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 mb-1">
                    <HeartPulse className="w-4 h-4 text-emerald-800 shrink-0" />
                    <span>Vorerkrankungen / Diagnosen</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 whitespace-pre-line">
                    {profile.chronicConditions?.trim() || 'Keine hinterlegt'}
                  </p>
                </div>
              </div>

              {/* Active Medications */}
              <div className="rounded-xl border border-slate-300 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Pill className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>Aktuelle Dauermedikation ({medications.length})</span>
                  </div>
                </div>
                {medications.length === 0 ? (
                  <p className="text-xs text-slate-600">
                    Aktuell sind keine Medikamente im Einnahmeplan eingetragen.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {medications.map((med) => (
                      <li
                        key={med.id}
                        className="text-xs bg-white rounded-lg px-2.5 py-1.5 border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <span className="font-bold text-slate-900">
                          {med.name} ({med.dosage})
                        </span>
                        <span className="text-[11px] font-semibold text-teal-800">
                          {med.times.join(', ')} Uhr
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Edit Button when unlocked */}
              {!readOnly && onUpdateProfile && (
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Notfalldaten bearbeiten</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Schließen
                  </button>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Blutgruppe
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {BLOOD_GROUPS.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setBloodGroup(bg === 'Unbekannt' ? '' : bg)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                        (bloodGroup || 'Unbekannt') === bg
                          ? 'bg-rose-700 text-white border-rose-800'
                          : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Allergien & Medikamenten-Unverträglichkeiten
                </label>
                <textarea
                  rows={2}
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="z. B. Penicillin, Kontrastmittel, Wespenstiche, Nüsse..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Wichtige Vorerkrankungen / Implantate / Hinweise
                </label>
                <textarea
                  rows={2}
                  value={chronicConditions}
                  onChange={(e) => setChronicConditions(e.target.value)}
                  placeholder="z. B. Bluthochdruck, Diabetes Typ 2, Herzschrittmacher, Blutverdünner..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Notfallkontakt (Name & Beziehung)
                  </label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="z. B. Maria (Ehefrau)"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Notfallkontakt Telefonnummer
                  </label>
                  <input
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="z. B. +49 170 1234567"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold cursor-pointer"
                >
                  Notfallpass speichern
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
