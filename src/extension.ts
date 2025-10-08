import * as vscode from 'vscode';
import { i18n } from './i18n';
import { getChinaDate, getWorkingDaysInMonth, getElapsedWorkHours, getProgressBar, getLayerProgressPercent, getRealmInfo } from './helpers';

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

      const elapsedHours = getElapsedWorkHours(now);
      const dailySalary = monthlySalary / getWorkingDaysInMonth(now);
      const hourlyRate = dailySalary / 8;
      const earnedToday = hourlyRate * elapsedHours;

      const progressPercent = Math.min(earnedToday / dailySalary, 1);
      const progressBar = getProgressBar(progressPercent);

      const { currentRealm, layerInRealm } = getRealmInfo(now, entryDate, realmNames);
      const layerProgressPercent = getLayerProgressPercent(now);
      const layerProgressBar = getProgressBar(layerProgressPercent);

      statusBarItem.text = `${earnedToday.toFixed(2)} ${progressBar} ${(progressPercent * 100).toFixed(2)}% | ${currentRealm} ${layerInRealm + 1} ${t.layer} [${layerProgressBar} ${(layerProgressPercent * 100).toFixed(2)}%]`;
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
