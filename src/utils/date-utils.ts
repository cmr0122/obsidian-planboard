/**
 * 获取某个月的天数
 */
export function getDaysInMonth(year: number, month: number): number {
	return new Date(year, month + 1, 0).getDate();
}

/**
 * 获取某个月第一天是星期几
 * 返回: 0=Sunday, 1=Monday, ..., 6=Saturday
 */
export function getFirstDayOfMonth(year: number, month: number): number {
	return new Date(year, month, 1).getDay();
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(year: number, month: number, day: number): string {
	const m = String(month + 1).padStart(2, '0');
	const d = String(day).padStart(2, '0');
	return `${year}-${m}-${d}`;
}

/**
 * 从 Date 对象格式化为 YYYY-MM-DD
 */
export function dateToStr(date: Date): string {
	return formatDate(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * 从 YYYY-MM-DD 解析为 Date 对象 (本地时区)
 */
export function strToDate(dateStr: string): Date {
	const [y, m, d] = dateStr.split('-').map(Number);
	return new Date(y, m - 1, d);
}

/**
 * 获取年月键: "YYYY-MM"
 */
export function getYearMonthKey(year: number, month: number): string {
	return `${year}-${String(month + 1).padStart(2, '0')}`;
}

/**
 * 获取 ISO 周编号
 */
export function getISOWeek(date: Date): { year: number; week: number } {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	const dayNum = d.getUTCDay() || 7;
	d.setUTCDate(d.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
	return { year: d.getUTCFullYear(), week: weekNo };
}

/**
 * 获取周键: "YYYY-WNN"
 */
export function getWeekKey(date: Date): string {
	const { year, week } = getISOWeek(date);
	return `${year}-W${String(week).padStart(2, '0')}`;
}

/**
 * 获取年月键 (用于按月存储)
 */
export function getMonthKey(date: Date): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * 获取年键 (用于按年存储)
 */
export function getYearKey(date: Date): string {
	return String(date.getFullYear());
}

/**
 * 根据粒度获取时间段键
 */
export function getPeriodKey(date: Date, granularity: 'month' | 'week' | 'year'): string {
	switch (granularity) {
		case 'month': return getMonthKey(date);
		case 'week': return getWeekKey(date);
		case 'year': return getYearKey(date);
	}
}

/**
 * 获取指定日期所在周的日期范围
 * weekStartsOn: 0=Sunday, 1=Monday
 */
export function getWeekDates(date: Date, weekStartsOn: 0 | 1): Date[] {
	const d = new Date(date);
	const day = d.getDay();
	const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
	d.setDate(d.getDate() - diff);
	const dates: Date[] = [];
	for (let i = 0; i < 7; i++) {
		const clone = new Date(d);
		clone.setDate(d.getDate() + i);
		dates.push(clone);
	}
	return dates;
}

/**
 * 判断两个日期是否同一天
 */
export function isSameDay(a: Date, b: Date): boolean {
	return a.getFullYear() === b.getFullYear()
		&& a.getMonth() === b.getMonth()
		&& a.getDate() === b.getDate();
}

/**
 * 判断日期是否是今天
 */
export function isToday(date: Date): boolean {
	return isSameDay(date, new Date());
}

/**
 * 判断日期是否在指定月份中
 */
export function isInMonth(date: Date, year: number, month: number): boolean {
	return date.getFullYear() === year && date.getMonth() === month;
}

/**
 * 获取两个日期之间的所有时间段键（不重复）
 * 用于周跨月/跨年时加载多个时间段的数据
 */
export function getPeriodKeysBetween(
	startDate: Date,
	endDate: Date,
	granularity: 'month' | 'week' | 'year'
): string[] {
	const keys = new Set<string>();
	const d = new Date(startDate);
	while (d <= endDate) {
		keys.add(getPeriodKey(d, granularity));
		d.setDate(d.getDate() + 1);
	}
	return Array.from(keys);
}

/**
 * 格式化显示日期: "6月3日 周三"
 */
export function formatDisplayDate(date: Date): string {
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
	const weekDay = weekDays[date.getDay()];
	return `${month}月${day}日 ${weekDay}`;
}
