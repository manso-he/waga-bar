import * as assert from 'assert';
import { getProgressBar, getWorkingDaysInMonth, getElapsedWorkHours, getLayerProgressPercent, getRealmInfo } from '../helpers';

function approxEqual(a: number, b: number, eps = 1e-2) {
  return Math.abs(a - b) < eps;
}

function run() {
  try {
    // getProgressBar
    assert.strictEqual(getProgressBar(0, 10), '░░░░░░░░░░');
    assert.strictEqual(getProgressBar(1, 10), '██████████');

    // getWorkingDaysInMonth (Feb 2024 has 29 days and 21 working days)
    const feb2024 = new Date(2024, 1, 1);
    assert.strictEqual(getWorkingDaysInMonth(feb2024), 21);

    // getElapsedWorkHours
    const before = new Date(2025, 0, 1, 7, 0, 0);
    assert.strictEqual(getElapsedWorkHours(before), 0);

    const morning = new Date(2025, 0, 2, 10, 30, 0);
    const h = getElapsedWorkHours(morning);
    assert.ok(h > 1.9 && h < 2.1, `expected ~2, got ${h}`);

    const afterLunch = new Date(2025, 0, 2, 14, 30, 0);
    const h2 = getElapsedWorkHours(afterLunch);
    assert.ok(approxEqual(h2, 4.5, 1e-2), `expected ~4.5, got ${h2}`);

    // getLayerProgressPercent and getRealmInfo
    const now = new Date(2025, 9, 8);
    const entry = new Date(2024, 9, 1);
    const realmNames = ['RealmA', 'RealmB'];
    const layerPercent = getLayerProgressPercent(now);
    assert.ok(layerPercent >= 0 && layerPercent <= 1);

    const realm = getRealmInfo(now, entry, realmNames);
    // monthsWorked = 12 -> currentLayer = 12 -> currentRealmIndex = 1, layerInRealm = 2
    assert.strictEqual(realm.currentRealm, 'RealmB');
    assert.strictEqual(realm.layerInRealm, 2);

    console.log('ALL UNIT TESTS PASSED');
    process.exit(0);
  } catch (err) {
    console.error('UNIT TESTS FAILED');
    console.error(err);
    process.exit(1);
  }
}

if (require.main === module) {run();}
