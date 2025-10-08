export function getChinaDate(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const chinaOffset = 8 * 60 * 60000; // UTC+8
  return new Date(utc + chinaOffset);
}

function parseTimeString(now: Date, timeStr: string): Date {
  const [hh, mm] = timeStr.split(':').map(s => parseInt(s, 10));
  const d = new Date(now);
  d.setHours(isNaN(hh) ? 0 : hh, isNaN(mm) ? 0 : mm, 0, 0);
  return d;
}

export function isValidTimeString(timeStr: string): boolean {
  if (typeof timeStr !== 'string') return false;
  const m = timeStr.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  return m !== null;
}

export function validateSchedule(workStart: string, workEnd: string, lunchStart: string, lunchEnd: string) {
  const defaults = {
    workStart: '08:30',
    workEnd: '17:30',
    lunchStart: '12:00',
    lunchEnd: '13:30'
  };

  let ws = isValidTimeString(workStart) ? workStart : defaults.workStart;
  let we = isValidTimeString(workEnd) ? workEnd : defaults.workEnd;
  let ls = isValidTimeString(lunchStart) ? lunchStart : defaults.lunchStart;
  let le = isValidTimeString(lunchEnd) ? lunchEnd : defaults.lunchEnd;

  // quick sanity checks: ensure end > start; if not, fallback to defaults
  const now = new Date();
  const startT = parseTimeString(now, ws);
  const endT = parseTimeString(now, we);
  if (endT.getTime() <= startT.getTime()) {
    ws = defaults.workStart; we = defaults.workEnd; ls = defaults.lunchStart; le = defaults.lunchEnd;
  }

  // ensure lunch sits within work hours; if not, treat lunch as zero duration (set ls == le == start)
  const lsT = parseTimeString(now, ls);
  const leT = parseTimeString(now, le);
  if (leT.getTime() <= lsT.getTime() || lsT.getTime() < startT.getTime() || leT.getTime() > endT.getTime()) {
    ls = ws; le = ws; // zero lunch
  }

  return { workStart: ws, workEnd: we, lunchStart: ls, lunchEnd: le };
}

export function getWorkingDaysInMonth(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let workingDays = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const dayOfWeek = d.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {workingDays++;}
  }
  return workingDays;
}

export function getElapsedWorkHours(now: Date): number {
  // default working times if not provided via parameters
  return getElapsedWorkHoursWithSchedule(now, '08:30', '17:30', '12:00', '13:30');
}

export function getElapsedWorkHoursWithSchedule(now: Date, workStart: string, workEnd: string, lunchStart: string, lunchEnd: string): number {
  const startTime = parseTimeString(now, workStart);
  const endTime = parseTimeString(now, workEnd);

  const ls = parseTimeString(now, lunchStart);
  const le = parseTimeString(now, lunchEnd);

  if (now < startTime) { return 0; }
  if (now >= endTime) { // cap at full work day
    // total working hours in the day = (end - start) - lunch
    const totalMs = endTime.getTime() - startTime.getTime() - Math.max(0, le.getTime() - ls.getTime());
    return Math.max(0, totalMs / (1000 * 60 * 60));
  }

  let elapsedMs = now.getTime() - startTime.getTime();

  // subtract lunch overlap
  if (now > le) {
    elapsedMs -= Math.max(0, le.getTime() - ls.getTime());
  } else if (now > ls) {
    elapsedMs -= Math.max(0, now.getTime() - ls.getTime());
  }

  return Math.max(0, elapsedMs / (1000 * 60 * 60));
}

export function getProgressBar(percent: number, length: number = 10): string {
  const filledLength = Math.round(percent * length);
  const emptyLength = length - filledLength;
  return '█'.repeat(filledLength) + '░'.repeat(emptyLength);
}

export function getLayerProgressPercent(now: Date): number {
  const totalWorkingDays = getWorkingDaysInMonth(now);
  let completedWorkingDays = 0;

  for (let day = 1; day <= now.getDate(); day++) {
    const d = new Date(now.getFullYear(), now.getMonth(), day);
    const dayOfWeek = d.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && d <= now) {
      completedWorkingDays++;
    }
  }

  return totalWorkingDays === 0 ? 0 : completedWorkingDays / totalWorkingDays;
}

export function getRealmInfo(now: Date, entryDate: Date, realmNames: string[]): { currentRealm: string, layerInRealm: number } {
  const monthsWorked = (now.getFullYear() - entryDate.getFullYear()) * 12 + (now.getMonth() - entryDate.getMonth());
  const currentLayer = monthsWorked;
  const currentRealmIndex = Math.floor(currentLayer / 10);
  const currentRealm = realmNames[currentRealmIndex] || `Stage${currentRealmIndex + 1}`;
  const layerInRealm = currentLayer % 10;
  return { currentRealm, layerInRealm };
}
