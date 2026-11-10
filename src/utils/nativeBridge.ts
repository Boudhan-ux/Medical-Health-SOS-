import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { MedicationItem } from '../types/health';

const REMINDER_CHANNEL_ID = 'medical-compass-reminders';

function stringToBase64(str: string): string {
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch {
    return btoa(unescape(encodeURIComponent(str)));
  }
}

export async function ensureNotificationChannel(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.createChannel({
      id: REMINDER_CHANNEL_ID,
      name: 'Medical Compass Erinnerungen',
      description: 'Tabletten-, Trink- und Termin-Erinnerungen von Medical Compass',
      importance: 5,
      visibility: 1,
      vibration: true,
      lights: true,
    });
  } catch {
    // Channel creation only needed on Android 8+
  }
}

export async function checkNotificationPermissionStatus(): Promise<'granted' | 'denied' | 'prompt'> {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.checkPermissions();
      if (status.display === 'granted') return 'granted';
      if (status.display === 'denied') return 'denied';
      return 'prompt';
    } catch {
      return 'prompt';
    }
  }
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
  }
  return 'prompt';
}

export async function requestAllAppPermissions(): Promise<{
  notificationsGranted: boolean;
  storageGranted: boolean;
  message: string;
}> {
  let notificationsGranted = false;
  let storageGranted = true;

  if (Capacitor.isNativePlatform()) {
    try {
      await ensureNotificationChannel();
      const notifPerm = await LocalNotifications.requestPermissions();
      notificationsGranted = notifPerm.display === 'granted';
    } catch {
      notificationsGranted = false;
    }

    try {
      const fsPerm = await Filesystem.requestPermissions();
      storageGranted = fsPerm.publicStorage === 'granted';
    } catch {
      storageGranted = true;
    }

    return {
      notificationsGranted,
      storageGranted,
      message: notificationsGranted
        ? 'Alle App-Berechtigungen (Benachrichtigungen & Dateispeicher) sind aktiv.'
        : 'Dateispeicher ist bereit. Bitte erlaube Benachrichtigungen in den Android-App-Einstellungen für Medical Compass.',
    };
  }

  // Web / PWA fallback
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const perm = await Notification.requestPermission();
      notificationsGranted = perm === 'granted';
    } catch {
      notificationsGranted = false;
    }
  } else {
    notificationsGranted = true;
  }

  return {
    notificationsGranted,
    storageGranted: true,
    message: notificationsGranted
      ? 'Benachrichtigungen und Datei-Downloads sind erfolgreich aktiviert.'
      : 'In-App-Erinnerungen und Datei-Downloads sind aktiv.',
  };
}

export function playReminderAlertSoundAndVibrate(isUrgent = false): void {
  // 1. Haptic vibration on mobile / Android
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(
        isUrgent ? [400, 120, 400, 120, 600] : [250, 120, 250, 120, 350]
      );
    }
  } catch {
    // Ignore if vibration API is blocked
  }

  // 2. Web Audio API pleasant medical reminder chime (works offline without audio files)
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const notes = isUrgent ? [880, 659.25, 880, 659.25] : [587.33, 880, 1174.66];
    const stepSec = isUrgent ? 0.18 : 0.16;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isUrgent ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * stepSec);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * stepSec);
      gain.gain.exponentialRampToValueAtTime(
        isUrgent ? 0.28 : 0.2,
        ctx.currentTime + idx * stepSec + 0.03
      );
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + (idx + 1) * stepSec
      );

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * stepSec);
      osc.stop(ctx.currentTime + (idx + 1) * stepSec + 0.02);
    });

    setTimeout(() => {
      void ctx.close().catch(() => {});
    }, 1500);
  } catch {
    // Ignore audio context autoplay restrictions if no user gesture yet
  }
}

export async function scheduleSnoozeNotification(
  medicationName: string,
  dosage: string,
  postponedToHm: string,
  delayMinutes = 30
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await ensureNotificationChannel();
    const check = await LocalNotifications.checkPermissions();
    if (check.display !== 'granted') return;

    const snoozeId = Math.floor((Date.now() % 70000) + 90000);
    await LocalNotifications.schedule({
      notifications: [
        {
          id: snoozeId,
          title: `Snooze-Erinnerung (${postponedToHm} Uhr)`,
          body: `Erinnerung nach ${delayMinutes} Min.: Bitte ${medicationName} (${dosage}) jetzt einnehmen.`,
          channelId: REMINDER_CHANNEL_ID,
          schedule: {
            at: new Date(Date.now() + delayMinutes * 60 * 1000),
            allowWhileIdle: true,
          },
        },
      ],
    });
  } catch {
    // Fallback handled by in-app interval check
  }
}

export async function sendNativeOrWebNotification(
  title: string,
  body: string,
  playSound = true
): Promise<boolean> {
  if (playSound) {
    playReminderAlertSoundAndVibrate(false);
  }

  if (Capacitor.isNativePlatform()) {
    try {
      await ensureNotificationChannel();
      const check = await LocalNotifications.checkPermissions();
      if (check.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions();
        if (req.display !== 'granted') return false;
      }
      const notifId = Math.floor((Date.now() % 800000) + 1000);
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notifId,
            title,
            body,
            channelId: REMINDER_CHANNEL_ID,
            schedule: { at: new Date(Date.now() + 400), allowWhileIdle: true },
          },
        ],
      });
      return true;
    } catch {
      return false;
    }
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        await Notification.requestPermission();
      }
      if (Notification.permission === 'granted') {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg && 'showNotification' in reg) {
            await reg.showNotification(title, {
              body,
              icon: '/pwa-192x192.png',
              badge: '/pwa-192x192.png',
            });
            return true;
          }
        }
        new Notification(title, { body, icon: '/pwa-192x192.png' });
        return true;
      }
    } catch {
      // Fallback handled by in-app toast
    }
  }
  return false;
}

export async function syncDailyReminderNotifications(
  medications: MedicationItem[],
  waterReminderTimes: string[],
  enabled: boolean
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const pending = await LocalNotifications.getPending();
    const existingIds = pending.notifications
      .filter((n) => n.id >= 10000 && n.id < 90000)
      .map((n) => ({ id: n.id }));
    if (existingIds.length > 0) {
      await LocalNotifications.cancel({ notifications: existingIds });
    }

    if (!enabled) return;

    await ensureNotificationChannel();
    const check = await LocalNotifications.checkPermissions();
    if (check.display !== 'granted') return;

    const notificationsToSchedule: Array<{
      id: number;
      title: string;
      body: string;
      channelId: string;
      schedule: { on: { hour: number; minute: number }; allowWhileIdle: boolean };
    }> = [];

    let nextId = 10000;

    // Schedule daily medication reminders
    for (const med of medications) {
      for (const timeStr of med.times) {
        const [h, m] = timeStr.split(':').map(Number);
        if (!isNaN(h) && !isNaN(m)) {
          notificationsToSchedule.push({
            id: nextId++,
            title: `Medikamenten-Erinnerung (${timeStr} Uhr)`,
            body: `${med.name} (${med.dosage}) einnehmen · ${med.instructions || 'Bitte mit Wasser einnehmen'}`,
            channelId: REMINDER_CHANNEL_ID,
            schedule: {
              on: { hour: h, minute: m },
              allowWhileIdle: true,
            },
          });
        }
      }
    }

    // Schedule daily hydration reminders
    for (const timeStr of waterReminderTimes) {
      const [h, m] = timeStr.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        notificationsToSchedule.push({
          id: nextId++,
          title: `Trink-Erinnerung (${timeStr} Uhr)`,
          body: 'Zeit für ein Glas Wasser! Halte dein tägliches Trinkziel in Medical Compass ein.',
          channelId: REMINDER_CHANNEL_ID,
          schedule: {
            on: { hour: h, minute: m },
            allowWhileIdle: true,
          },
        });
      }
    }

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({
        notifications: notificationsToSchedule,
      });
    }
  } catch {
    // Ignore errors on non-native environments
  }
}

export async function saveOrShareFile(options: {
  filename: string;
  content: string;
  mimeType: string;
}): Promise<{ success: boolean; message: string }> {
  const { filename, content, mimeType } = options;

  // 1. Native Android / iOS (Capacitor APK)
  if (Capacitor.isNativePlatform()) {
    try {
      try {
        await Filesystem.requestPermissions();
      } catch {
        // Ignore if not required on Android 11+
      }

      const base64Data = stringToBase64(content);

      // Save to Documents directory if allowed, and always to Cache for sharing
      try {
        await Filesystem.writeFile({
          path: filename,
          data: base64Data,
          directory: Directory.Documents,
        });
      } catch {
        // Documents write optional on some scoped storage versions
      }

      const cacheFile = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Cache,
      });

      await Share.share({
        title: filename,
        text: `Medical Compass Export: ${filename}`,
        url: cacheFile.uri,
        dialogTitle: 'Datei speichern, öffnen oder teilen',
      });

      return {
        success: true,
        message: `Datei "${filename}" wurde erstellt und zum Speichern/Teilen geöffnet.`,
      };
    } catch {
      // Fall through to Web Share / Blob fallback
    }
  }

  // 2. Standard Web Browser / Mobile Browser Download
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    }, 1500);

    return {
      success: true,
      message: `Datei "${filename}" wurde heruntergeladen.`,
    };
  } catch {
    return {
      success: false,
      message: 'Datei konnte nicht gespeichert werden.',
    };
  }
}
