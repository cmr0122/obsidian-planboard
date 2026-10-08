import type { Priority } from './types';

export const PRIORITY_CONFIG: Record<Priority, {
	label: string;
	color: string;
	colorBg: string;
	colorBorder: string;
}> = {
	high: {
		label: '高',
		color: '#e74c3c',
		colorBg: '#fde8e8',
		colorBorder: '#f5b7b1',
	},
	medium: {
		label: '中',
		color: '#e67e22',
		colorBg: '#fef5e7',
		colorBorder: '#f8c471',
	},
	low: {
		label: '低',
		color: '#3498db',
		colorBg: '#ebf5fb',
		colorBorder: '#a9d0f5',
	},
};

export const PRIORITY_ORDER: Priority[] = ['high', 'medium', 'low'];

export const DAY_HEADERS = ['日', '一', '二', '三', '四', '五', '六'];

export const MONTH_NAMES = [
	'1月', '2月', '3月', '4月', '5月', '6月',
	'7月', '8月', '9月', '10月', '11月', '12月',
];

export const STORAGE_GRANULARITY_LABELS: Record<string, string> = {
	month: '按月',
	week: '按周',
	year: '按年',
};

export const COMPLETED_DISPLAY_LABELS: Record<string, string> = {
	strikethrough: '划掉保留',
	'hidden-toggle': '隐藏（可切换）',
};

/** 右键菜单文本 */
export const CONTEXT_MENU_LABELS = {
	copy: '复制',
	paste: '粘贴',
	moveNextDay: '移到下一天',
	moveNextWeek: '移到下一周',
};
