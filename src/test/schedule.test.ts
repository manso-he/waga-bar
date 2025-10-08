import * as assert from 'assert';
import { isValidTimeString, validateSchedule, getElapsedWorkHoursWithSchedule } from '../helpers';

function run() {
  try {
    // isValidTimeString
    assert.strictEqual(isValidTimeString('08:30'), true);
    assert.strictEqual(isValidTimeString('23:59'), true);
    assert.strictEqual(isValidTimeString('24:00'), false);
    assert.strictEqual(isValidTimeString('8:30'), false);

    // validateSchedule - invalid times fallback
    const v1 = validateSchedule('bad', 'also-bad', 'x', 'y');
    assert.strictEqual(v1.workStart, '08:30');

    // validateSchedule - lunch outside work -> should be zero lunch
    const v2 = validateSchedule('09:00', '17:00', '18:00', '19:00');
    assert.strictEqual(v2.lunchStart, v2.workStart);

    // getElapsedWorkHoursWithSchedule - before work
    const day = new Date(2025, 0, 2); // Jan 2 2025
    const before = new Date(day); before.setHours(8, 0, 0, 0);
    assert.strictEqual(getElapsedWorkHoursWithSchedule(before, '09:00', '17:00', '12:00', '13:00'), 0);

    // at mid morning
    const mid = new Date(day); mid.setHours(10, 0, 0, 0);
    const h = getElapsedWorkHoursWithSchedule(mid, '09:00', '17:00', '12:00', '13:00');
    assert.ok(h > 0.9 && h < 1.1);

    // after lunch
    const aft = new Date(day); aft.setHours(14, 0, 0, 0);
    const h2 = getElapsedWorkHoursWithSchedule(aft, '09:00', '17:00', '12:00', '13:00');
    // morning 3h + after lunch 1h = 4
    assert.ok(Math.abs(h2 - 4) < 1e-6, `expected 4, got ${h2}`);

    console.log('SCHEDULE TESTS PASSED');
    process.exit(0);
  } catch (err) {
    console.error('SCHEDULE TESTS FAILED');
    console.error(err);
    process.exit(1);
  }
}

if (require.main === module) { run(); }
