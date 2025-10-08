export function getChinaDate(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const chinaOffset = 8 * 60 * 60000; // UTC+8
  return new Date(utc + chinaOffset);
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
  const startTime = new Date(now);
  startTime.setHours(8, 30, 0, 0);

  const lunchStart = new Date(now);
  lunchStart.setHours(12, 0, 0, 0);

  const lunchEnd = new Date(now);
  lunchEnd.setHours(13, 30, 0, 0);

  if (now < startTime) {return 0;}

  let elapsedMs = now.getTime() - startTime.getTime();

  if (now > lunchEnd) {
    elapsedMs -= (lunchEnd.getTime() - lunchStart.getTime());
  } else if (now > lunchStart) {
    elapsedMs -= (now.getTime() - lunchStart.getTime());
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
