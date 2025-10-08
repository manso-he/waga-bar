import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../helpers';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

		test('getProgressBar fills correctly', () => {
			assert.strictEqual(myExtension.getProgressBar(0, 10), '░░░░░░░░░░');
			assert.strictEqual(myExtension.getProgressBar(1, 10), '██████████');
			assert.strictEqual(myExtension.getProgressBar(0.5, 10).length, 10);
		});

		test('getWorkingDaysInMonth counts weekdays', () => {
			// Feb 2024 has 29 days and 21 working days
			const feb2024 = new Date(2024, 1, 1);
			assert.strictEqual(myExtension.getWorkingDaysInMonth(feb2024), 21);
		});

		test('getElapsedWorkHours before start', () => {
			const date = new Date(2025, 0, 1, 7, 0, 0); // Jan 1 2025 07:00
			assert.strictEqual(myExtension.getElapsedWorkHours(date), 0);
		});

		test('getElapsedWorkHours during morning', () => {
			const date = new Date(2025, 0, 2, 10, 30, 0); // 10:30 -> 2 hours
			const hours = myExtension.getElapsedWorkHours(date);
			assert.ok(hours > 1.9 && hours < 2.1);
		});

		test('getElapsedWorkHours across lunch', () => {
			const date = new Date(2025, 0, 2, 14, 30, 0); // after lunch, should subtract 1.5h
			const hours = myExtension.getElapsedWorkHours(date);
			// from 8:30 to 14:30 = 6h, minus 1.5h lunch = 4.5h
			assert.ok(Math.abs(hours - 4.5) < 0.01);
		});

		test('getLayerProgressPercent and getRealmInfo', () => {
			const now = new Date(2025, 9, 8); // Oct 8 2025
			const entry = new Date(2024, 9, 1); // Oct 1 2024 -> 12 months worked
			const realmNames = ['RealmA', 'RealmB'];
			const layerPercent = myExtension.getLayerProgressPercent(now);
			assert.ok(layerPercent >= 0 && layerPercent <= 1);

			const realm = myExtension.getRealmInfo(now, entry, realmNames);
			// 12 months worked -> currentLayer = 12 -> realm index = 1, layerInRealm = 2
			assert.strictEqual(realm.currentRealm, 'RealmB');
			assert.strictEqual(realm.layerInRealm, 2);
		});
});
