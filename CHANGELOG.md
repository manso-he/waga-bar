# Change Log

All notable changes to the "waga-bar" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.


## [Unreleased]

# Changelog

## [0.0.3] - 2025-10-08

### Added
- 支持通过设置配置工作时间：`salary.workStart`、`salary.workEnd`、`salary.lunchStart`、`salary.lunchEnd`（格式 HH:mm），可以自定义上班/下班与午休时间。
- 增加时间格式校验 `isValidTimeString` 与 `validateSchedule`，对非法或不合理的设置做容错回退（默认值或将午休视为无休息）。
- 新增 `getElapsedWorkHoursWithSchedule`，支持按配置的时间表计算已工作小时数，同时保留向后兼容的 `getElapsedWorkHours`。
- 添加单元测试 `src/test/schedule.test.ts` 覆盖时间格式校验与关键边界点（上班前、午前、午后）行为。

### Changed
- 根据配置的工作时间动态计算每日工时，从而基于实际工作时长计算小时工资（不再固化为 8 小时）。
- 更新 `package.json`：增加配置项和将 `test:unit` 脚本扩展为先编译测试再运行全部单元测试。

### Notes
- 非法的时间字符串会被回退到默认值（08:30/17:30/12:00-13:30）；如 lunch 不在工作时间内，则午休会被视为无午休（避免负数或不合理时长）。
- 建议在设置中使用 24 小时制的 `HH:mm` 格式以获得正确行为。

---

Previous history
