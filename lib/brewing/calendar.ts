/**
 * Piwowar (Brewcraft) — Brew Day Calendar & Milestone Generator (RFC 5545 iCalendar)
 * Exports standard .ics schedule for Apple Calendar, Google Calendar, etc. (Z-048).
 */

import { Batch } from '../types/domain';

export interface CalendarEvent {
  summary: string;
  description: string;
  startDate: Date;
  durationMinutes: number;
}

function formatDateToIcs(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Builds array of standard brewing milestone events starting from a base brew date.
 */
export function generateBrewMilestoneEvents(batch: Batch): CalendarEvent[] {
  const brewDate = new Date(batch.brew_date);
  if (isNaN(brewDate.getTime())) return [];

  const addDays = (days: number, hour: number = 10) => {
    const d = new Date(brewDate);
    d.setDate(d.getDate() + days);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  const name = batch.name || `Warka #${batch.batch_number}`;

  return [
    {
      summary: `🍺 Dzień Warzenia: ${name}`,
      description: `Warzenie warki #${batch.batch_number} w aplikacji Piwowar (Brewcraft). Zacieranie, gotowanie i zadanie drożdży.`,
      startDate: addDays(0, 9),
      durationMinutes: 300 // 5 hours
    },
    {
      summary: `📊 Pomiar Fermentacji Burzliwej: ${name}`,
      description: `Odczyt gęstości (Tilt/areometr) po 72h burzliwej. Sprawdzenie spadku ekstraktu warki #${batch.batch_number}.`,
      startDate: addDays(3, 18),
      durationMinutes: 15
    },
    {
      summary: `🌿 Chmielenie na zimno (Dry-hop): ${name}`,
      description: `Wrzucenie chmielu na zimno do fermentora dla warki #${batch.batch_number}.`,
      startDate: addDays(7, 18),
      durationMinutes: 30
    },
    {
      summary: `❄️ Cold Crash: ${name}`,
      description: `Schłodzenie fermentora do 2-4°C w celu sklarowania piwa przed rozlewem warki #${batch.batch_number}.`,
      startDate: addDays(12, 19),
      durationMinutes: 15
    },
    {
      summary: `🍾 Butelkowanie / Rozlew: ${name}`,
      description: `Rozlew warki #${batch.batch_number} do butelek lub kega z kalkulatorem refermentacji Piwowara.`,
      startDate: addDays(14, 10),
      durationMinutes: 120
    },
    {
      summary: `🍻 Pierwsza Degustacja: ${name}`,
      description: `Ocena nagazowania i profilu sensorycznego warki #${batch.batch_number} (arkusz BJCP 50 pkt).`,
      startDate: addDays(28, 19),
      durationMinutes: 60
    }
  ];
}

/**
 * Generates an RFC 5545 compliant .ics iCalendar file string.
 */
export function generateBrewCalendarIcs(batch: Batch): string {
  const events = generateBrewMilestoneEvents(batch);
  if (events.length === 0) return '';

  const now = formatDateToIcs(new Date());

  const vEvents = events.map((ev, i) => {
    const uid = `piwowar-batch-${batch.id}-${i}-${ev.startDate.getTime()}@apps4craft.com`;
    const dtStart = formatDateToIcs(ev.startDate);
    const endDate = new Date(ev.startDate.getTime() + ev.durationMinutes * 60 * 1000);
    const dtEnd = formatDateToIcs(endDate);

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${ev.summary}`,
      `DESCRIPTION:${ev.description}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT'
    ].join('\r\n');
  }).join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Apps4Craft//Piwowar Brewcraft//PL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    vEvents,
    'END:VCALENDAR'
  ].join('\r\n');
}
