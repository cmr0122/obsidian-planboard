import { App, normalizePath } from 'obsidian';
import type { TodoItemData, SchedulePluginSettings } from '../types';
import type { Priority } from '../types';
import { generateId } from '../utils/id-utils';
import { getPeriodKey, getPeriodKeysBetween, strToDate } from '../utils/date-utils';

export const SCHEDULE_EVENT_TODOS_CHANGED = 'schedule:todos-changed';

export class TodoService {
	private app: App;
	private settings: () => SchedulePluginSettings;

	constructor(app: App, settings: () => SchedulePluginSettings) {
		this.app = app;
		this.settings = settings;
	}

	/**
	 * 触发数据变更事件（用于同步主标签页和侧边栏）
	 */
	private notifyChanged(): void {
		(this.app.workspace as any).trigger(SCHEDULE_EVENT_TODOS_CHANGED);
	}

	/**
	 * 获取时间段对应的笔记文件路径
	 */
	getNotePath(periodKey: string): string {
		const { basePath } = this.settings();
		return normalizePath(`${basePath}/${periodKey}.md`);
	}

	/**
	 * 构建 Markdown 笔记内容（可读格式）
	 */
	private buildNoteContent(periodKey: string, todos: TodoItemData[]): string {
		const lines: string[] = [
			'---',
			'type: schedule',
			`period: ${periodKey}`,
			'generated: true',
			'---',
			'',
		];

		if (todos.length === 0) {
			lines.push('_暂无待办_', '');
			return lines.join('\n');
		}

		const byDate = new Map<string, TodoItemData[]>();
		for (const t of todos) {
			if (!byDate.has(t.date)) byDate.set(t.date, []);
			byDate.get(t.date)!.push(t);
		}

		const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
		const sortedDates = Array.from(byDate.keys()).sort();

		for (const date of sortedDates) {
			lines.push(`## ${date}`, '');
			const items = byDate.get(date)!
				.sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2));

			for (const t of items) {
				const check = t.completed ? 'x' : ' ';
				lines.push(`- [${check}] ${t.title} <!-- ${t.id} ${t.priority} ${t.createdAt} ${t.updatedAt} -->`);
			}
			lines.push('');
		}

		return lines.join('\n') + '\n';
	}

	/**
	 * 从 Markdown 内容中解析待办数据
	 */
	private parseTodosFromContent(content: string): TodoItemData[] {
		const todos: TodoItemData[] = [];
		const lines = content.split('\n');
		let currentDate = '';
		let inCodeBlock = false;

		for (const rawLine of lines) {
			const line = rawLine.trimEnd();
			if (line.startsWith('```')) { inCodeBlock = !inCodeBlock; continue; }
			if (inCodeBlock) continue;
			if (line.startsWith('---') && currentDate === '') continue;

			const dateMatch = line.match(/^## (\d{4}-\d{2}-\d{2})/);
			if (dateMatch) { currentDate = dateMatch[1]; continue; }

			const taskMatch = line.match(/^- \[([ x])\] (.+?)\s*<!--\s*(.+?)\s*-->$/);
			if (taskMatch && currentDate) {
				const completed = taskMatch[1] === 'x';
				const title = taskMatch[2].trim();
				const metaStr = taskMatch[3].trim();
				const parts = metaStr.split(/\s+/);
				const id = parts[0] || generateId();
				const priority: Priority = ['high', 'medium', 'low'].includes(parts[1])
					? (parts[1] as Priority) : 'medium';
				const createdAt = parts[2] || new Date().toISOString();
				const updatedAt = parts[3] || createdAt;
				todos.push({ id, title, date: currentDate, priority, completed, createdAt, updatedAt });
			}
		}

		// 兼容旧版 JSON 格式
		if (todos.length === 0) {
			const jsonMatch = content.match(/```json\n([\s\S]*?)```/);
			if (jsonMatch) {
				try {
					const data = JSON.parse(jsonMatch[1]);
					if (data?.todos?.length) return data.todos;
				} catch { /* ignore */ }
			}
		}

		return todos;
	}

	private async ensureDirectory(path: string): Promise<void> {
		const dir = path.substring(0, path.lastIndexOf('/'));
		if (!dir) return;
		const exists = await this.app.vault.adapter.exists(dir);
		if (!exists) await this.app.vault.adapter.mkdir(dir);
	}

	async loadTodosByPeriod(periodKey: string): Promise<TodoItemData[]> {
		const path = this.getNotePath(periodKey);
		try {
			const exists = await this.app.vault.adapter.exists(path);
			if (!exists) return [];
			const content = await this.app.vault.adapter.read(path);
			return this.parseTodosFromContent(content);
		} catch (err) {
			console.warn(`读取日程笔记失败 (${path}):`, err);
			return [];
		}
	}

	async saveTodosByPeriod(periodKey: string, todos: TodoItemData[]): Promise<void> {
		const path = this.getNotePath(periodKey);
		const content = this.buildNoteContent(periodKey, todos);
		await this.ensureDirectory(path);
		try {
			await this.app.vault.adapter.write(path, content);
		} catch (err) {
			console.error(`保存日程笔记失败 (${path}):`, err);
		}
	}

	getPeriodKeyForDate(dateStr: string): string {
		const { storageGranularity } = this.settings();
		return getPeriodKey(strToDate(dateStr), storageGranularity);
	}

	async loadTodosForDateRange(startDate: string, endDate: string): Promise<TodoItemData[]> {
		const { storageGranularity } = this.settings();
		const periodKeys = getPeriodKeysBetween(strToDate(startDate), strToDate(endDate), storageGranularity);
		const allTodos: TodoItemData[] = [];
		for (const key of periodKeys) {
			const todos = await this.loadTodosByPeriod(key);
			allTodos.push(...todos);
		}
		return allTodos.filter(t => t.date >= startDate && t.date <= endDate);
	}

	async loadTodosForMonth(year: number, month: number): Promise<TodoItemData[]> {
		const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
		return this.loadTodosForDateRange(startDate, endDate);
	}

	async addTodo(data: { title: string; date: string; priority: Priority }): Promise<TodoItemData> {
		const now = new Date().toISOString();
		const todo: TodoItemData = {
			id: generateId(), title: data.title.trim(), date: data.date,
			priority: data.priority, completed: false, createdAt: now, updatedAt: now,
		};
		const periodKey = this.getPeriodKeyForDate(data.date);
		const todos = await this.loadTodosByPeriod(periodKey);
		todos.push(todo);
		await this.saveTodosByPeriod(periodKey, todos);
		this.notifyChanged();
		return todo;
	}

	private async findTodoById(id: string): Promise<{ todos: TodoItemData[]; idx: number; periodKey: string } | null> {
		const now = new Date();
		for (let offset = -6; offset <= 6; offset++) {
			const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
			const key = getPeriodKey(d, this.settings().storageGranularity);
			const todos = await this.loadTodosByPeriod(key);
			const idx = todos.findIndex(t => t.id === id);
			if (idx !== -1) return { todos, idx, periodKey: key };
		}
		return null;
	}

	async toggleTodo(id: string): Promise<TodoItemData | null> {
		const found = await this.findTodoById(id);
		if (!found) return null;
		found.todos[found.idx].completed = !found.todos[found.idx].completed;
		found.todos[found.idx].updatedAt = new Date().toISOString();
		await this.saveTodosByPeriod(found.periodKey, found.todos);
		this.notifyChanged();
		return found.todos[found.idx];
	}

	async updateTodo(id: string, changes: { title?: string; date?: string; priority?: Priority }): Promise<TodoItemData | null> {
		const found = await this.findTodoById(id);
		if (!found) return null;
		const oldDate = found.todos[found.idx].date;
		Object.assign(found.todos[found.idx], changes, { updatedAt: new Date().toISOString() });
		if (changes.date && changes.date !== oldDate) {
			const [moved] = found.todos.splice(found.idx, 1);
			await this.saveTodosByPeriod(found.periodKey, found.todos);
			const newKey = this.getPeriodKeyForDate(changes.date);
			const newTodos = await this.loadTodosByPeriod(newKey);
			newTodos.push(moved);
			await this.saveTodosByPeriod(newKey, newTodos);
			this.notifyChanged();
			return moved;
		}
		await this.saveTodosByPeriod(found.periodKey, found.todos);
		this.notifyChanged();
		return found.todos[found.idx];
	}

	async deleteTodo(id: string): Promise<boolean> {
		const found = await this.findTodoById(id);
		if (!found) return false;
		found.todos.splice(found.idx, 1);
		await this.saveTodosByPeriod(found.periodKey, found.todos);
		this.notifyChanged();
		return true;
	}

	async loadDateSummary(year: number, month: number): Promise<Map<string, number>> {
		const todos = await this.loadTodosForMonth(year, month);
		const summary = new Map<string, number>();
		for (const t of todos) summary.set(t.date, (summary.get(t.date) || 0) + 1);
		return summary;
	}
}
