import * as vscode from 'vscode';
import { i18n } from './i18n';
import { getChinaDate, getWorkingDaysInMonth, getElapsedWorkHours, getElapsedWorkHoursWithSchedule, getProgressBar, getLayerProgressPercent, getRealmInfo } from './helpers';

const config = vscode.workspace.getConfiguration('salary');
type Language = 'zh' | 'en';
const language = config.get<Language>('language', 'en');
const t = i18n[language] ?? i18n.en;


let statusBarItem: vscode.StatusBarItem;
let interval: NodeJS.Timeout;

function getSalaryConfig() {
  const config = vscode.workspace.getConfiguration('salary');
  const language = config.get<Language>('language', 'en');
  const realmNames = config.get<string[]>(`realmNames.${language}`, []);
  return {
    monthlySalary: config.get<number>('monthly', 10000),
    entryDate: new Date(config.get<string>('entryDate', '2023-01-01')),
    realmNames,
    language,
    refreshInterval: config.get<number>('refreshInterval', 1000),
  };
}

export function activate(context: vscode.ExtensionContext) {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  applyConfig();
  
  vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration('salary')) {
      applyConfig();
    }
  });

  function applyConfig() {
    const { monthlySalary, entryDate, realmNames, language, refreshInterval } = getSalaryConfig();
    const t = i18n[language] ?? i18n.en;

    if (interval) {clearInterval(interval);}

    function updateEarnings() {
      const now = getChinaDate();
      const day = now.getDay(); // 0 = Sunday, 6 = Saturday

      if (day === 0 || day === 6) {
        statusBarItem.text = t.restDay;
        return;
      }

      const config = vscode.workspace.getConfiguration('salary');
      const workStart = config.get<string>('workStart', '08:30');
      const workEnd = config.get<string>('workEnd', '17:30');
      const lunchStart = config.get<string>('lunchStart', '12:00');
      const lunchEnd = config.get<string>('lunchEnd', '13:30');

      const elapsedHours = getElapsedWorkHoursWithSchedule(now, workStart, workEnd, lunchStart, lunchEnd);

      // calculate total working hours per day from schedule
      const start = new Date(now); const [sh, sm] = workStart.split(':').map(s=>parseInt(s,10)); start.setHours(sh, sm, 0, 0);
      const end = new Date(now); const [eh, em] = workEnd.split(':').map(s=>parseInt(s,10)); end.setHours(eh, em, 0, 0);
      const ls = new Date(now); const [lsh, lsm] = lunchStart.split(':').map(s=>parseInt(s,10)); ls.setHours(lsh, lsm,0,0);
      const le = new Date(now); const [leh, lem] = lunchEnd.split(':').map(s=>parseInt(s,10)); le.setHours(leh, lem,0,0);

      const totalWorkMs = Math.max(0, end.getTime() - start.getTime() - Math.max(0, le.getTime() - ls.getTime()));
      const totalWorkHours = totalWorkMs / (1000 * 60 * 60) || 8;

      const dailySalary = monthlySalary / getWorkingDaysInMonth(now);
      const hourlyRate = dailySalary / totalWorkHours;
      const earnedToday = hourlyRate * elapsedHours;

  const progressPercent = Math.min(earnedToday / dailySalary, 1);
  const cappedEarnedToday = Math.min(earnedToday, dailySalary);
      const progressBar = getProgressBar(progressPercent);

      const { currentRealm, layerInRealm } = getRealmInfo(now, entryDate, realmNames);
      const layerProgressPercent = getLayerProgressPercent(now);
      const layerProgressBar = getProgressBar(layerProgressPercent);

      statusBarItem.text = `${cappedEarnedToday.toFixed(2)} ${progressBar} ${(progressPercent * 100).toFixed(2)}% | ${currentRealm} ${layerInRealm + 1} ${t.layer} [${layerProgressBar} ${(layerProgressPercent * 100).toFixed(2)}%]`;

      if (progressPercent >= 1) {
        statusBarItem.text += ` — ${t.maxEarnings}`;
      }
    }

    updateEarnings();
    interval = setInterval(updateEarnings, refreshInterval);
  }
}

export function deactivate() {
  if (interval) {clearInterval(interval);}
  if (statusBarItem) {statusBarItem.dispose();}
}

// helpers functions are imported from ./helpers to keep vscode-free logic testable in Node
