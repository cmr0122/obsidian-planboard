export type Priority = 'high' | 'medium' | 'low';
export type StorageGranularity = 'month' | 'week' | 'year';
export type CompletedDisplay = 'strikethrough' | 'hidden-toggle';
export type ViewMode = 'month' | 'week';

export interface TodoItemData {
	id: string;
	title: string;
	date: string; // "YYYY-MM-DD"
	priority: Priority;
	completed: boolean;
	createdAt: string; // ISO datetime
	updatedAt: string; // ISO datetime
}

export interface ScheduleNoteData {
	version: number;
	todos: TodoItemData[];
}

export interface PriorityColors {
	high: string;
	medium: string;
	low: string;
}

export interface SchedulePluginSettings {
	storageGranularity: StorageGranularity;
	basePath: string;
	completedDisplay: CompletedDisplay;
	weekStartsOn: 0 | 1;
	priorityColors: PriorityColors;
	backgroundImage: string;
	backgroundOpacity: number;
	showWeekendHighlight: boolean;
	showFestivalHighlight: boolean;
	showTaskCountBadge: boolean;
}

export const DEFAULT_PRIORITY_COLORS: PriorityColors = {
	high: '#e74c3c',
	medium: '#e67e22',
	low: '#3498db',
};

export const DEFAULT_SETTINGS: SchedulePluginSettings = {
	storageGranularity: 'month',
	basePath: '日程',
	completedDisplay: 'strikethrough',
	weekStartsOn: 1,
	priorityColors: { ...DEFAULT_PRIORITY_COLORS },
	backgroundImage: '',
	backgroundOpacity: 0.15,
	showWeekendHighlight: true,
	showFestivalHighlight: true,
	showTaskCountBadge: true,
};

export const VIEW_TYPE_SCHEDULE_MAIN = 'schedule-calendar-main';
export const VIEW_TYPE_SCHEDULE_SIDEBAR = 'schedule-calendar-sidebar';
