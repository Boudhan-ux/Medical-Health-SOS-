import {
  BloodPressureEntry,
  BloodSugarEntry,
  DailyHydrationActivity,
  DoctorAppointment,
  DoctorQuestion,
  MedicationIntakeLog,
  MedicationItem,
  PainEntry,
  PreventiveCheckItem,
  UserHealthProfile,
  WeightBodyEntry,
} from '../types/health';

export const INITIAL_USER_PROFILE: UserHealthProfile = {
  fullName: '',
  lastName: '',
  firstName: '',
  birthDate: '',
  birthYear: 0,
  age: 0,
  email: '',
  healthInsurance: '',
  insuranceNumber: '',
  familyDoctor: '',
  primaryDoctorName: '',
  avatarUrl: '',
  language: 'de',
  heightCm: 175,
  targetWeightKg: 75.0,
  glucoseUnit: 'mg/dl',
  glucoseTargetFastingMin: 70,
  glucoseTargetFastingMax: 100,
  glucoseTargetPostMealMax: 140,
  bpTargetSystolicMax: 135,
  bpTargetDiastolicMax: 85,
  dailyWaterGoalMl: 2250,
  waterReminderTimes: ['08:30', '11:30', '14:30', '17:30', '20:00'],
  dailyStepsGoal: 8000,
  dailyActiveMinutesGoal: 35,
  notificationsEnabled: true,
  soundEnabled: true,
  bloodGroup: '',
  allergies: '',
  chronicConditions: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
};

// Fresh installations start with completely empty measurement and medication lists
export const INITIAL_BP_ENTRIES: BloodPressureEntry[] = [];

export const INITIAL_SUGAR_ENTRIES: BloodSugarEntry[] = [];

export const INITIAL_WEIGHT_ENTRIES: WeightBodyEntry[] = [];

export const INITIAL_MEDICATIONS: MedicationItem[] = [];

export const INITIAL_MED_LOGS: MedicationIntakeLog[] = [];

export const INITIAL_HYDRATION_ACTIVITY: Record<string, DailyHydrationActivity> = {};

export const INITIAL_APPOINTMENTS: DoctorAppointment[] = [];

export const INITIAL_PREVENTIVE_CHECKS: PreventiveCheckItem[] = [];

export const INITIAL_DOCTOR_QUESTIONS: DoctorQuestion[] = [];

export const INITIAL_PAIN_ENTRIES: PainEntry[] = [];

// Factory sample IDs from earlier versions so users can remove old demo values with 1 click
export const LEGACY_SAMPLE_IDS = new Set([
  'bp-1',
  'bp-2',
  'bp-3',
  'bp-4',
  'bp-5',
  'bp-6',
  'bp-7',
  'bp-8',
  'bp-9',
  'bp-10',
  'bp-11',
  'bp-12',
  'bs-1',
  'bs-2',
  'bs-3',
  'bs-4',
  'bs-5',
  'bs-6',
  'bs-7',
  'bs-8',
  'w-1',
  'w-2',
  'w-3',
  'w-4',
  'w-5',
  'w-6',
  'med-1',
  'med-2',
  'med-3',
  'ml-1',
  'ml-2',
  'ml-3',
  'ml-4',
  'ml-5',
  'apt-1',
  'apt-2',
  'apt-3',
  'prev-1',
  'prev-2',
  'prev-3',
  'prev-4',
  'prev-5',
  'dq-1',
  'dq-2',
  'dq-3',
  'pain-1',
  'pain-2',
  'pain-3',
  'pain-4',
  'pain-5',
  'pain-6',
  'pain-7',
]);
