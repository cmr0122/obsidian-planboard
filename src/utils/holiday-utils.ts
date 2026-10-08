/**
 * 2026年中国法定节假日
 * 注: 农历节日日期为近似值，政府正式安排以官方通知为准
 */
export const FESTIVALS_2026: Record<string, string> = {
	'2026-01-01': '元旦',
	'2026-02-17': '除夕',
	'2026-02-18': '春节',
	'2026-02-19': '初二',
	'2026-02-20': '初三',
	'2026-04-05': '清明节',
	'2026-05-01': '劳动节',
	'2026-06-19': '端午节',
	'2026-09-27': '中秋节',
	'2026-10-01': '国庆节',
	'2026-10-02': '国庆假',
	'2026-10-03': '国庆假',
};

/**
 * 获取日期的节日/周末信息
 */
export function getDayHolidayInfo(dateStr: string): {
	festival: string | null;
	isWeekend: boolean;
} {
	const date = new Date(dateStr + 'T12:00:00');
	const dayOfWeek = date.getDay();
	const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
	const festival = FESTIVALS_2026[dateStr] || null;
	return { festival, isWeekend };
}
