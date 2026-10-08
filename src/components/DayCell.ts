import { TodoItemComponent } from './TodoItem';
import type { TodoItemData, CompletedDisplay, PriorityColors } from '../types';
import { PRIORITY_ORDER } from '../constants';
import { isToday, isInMonth, formatDate } from '../utils/date-utils';
import { getDayHolidayInfo } from '../utils/holiday-utils';
import { hasCopiedTask } from '../utils/todo-clipboard';

export class DayCellComponent {
	private el: HTMLElement;
	private date: Date;
	private year: number;
	private month: number;
	private todos: TodoItemData[];
	private completedDisplay: CompletedDisplay;
	private showCompleted: boolean;
	private isSelected: boolean;
	private onToggle: (id: string) => void;
	private onTodoClick: (todo: TodoItemData) => void;
	private onTodoContextMenu: (todo: TodoItemData, event: MouseEvent) => void;
	private onDateClick: (date: string) => void;
	private onDateRightClick: (date: string, event: MouseEvent) => void;
	private priorityColors?: PriorityColors;
	private showBadge: boolean;

	constructor(config: {
		date: Date;
		year: number;
		month: number;
		todos: TodoItemData[];
		completedDisplay: CompletedDisplay;
		showCompleted: boolean;
		isSelected: boolean;
		onToggle: (id: string) => void;
		onTodoClick: (todo: TodoItemData) => void;
		onTodoContextMenu: (todo: TodoItemData, event: MouseEvent) => void;
		onDateClick: (date: string) => void;
		onDateRightClick: (date: string, event: MouseEvent) => void;
		priorityColors?: PriorityColors;
		showBadge?: boolean;
	}) {
		this.date = config.date;
		this.year = config.year;
		this.month = config.month;
		this.todos = config.todos;
		this.completedDisplay = config.completedDisplay;
		this.showCompleted = config.showCompleted;
		this.isSelected = config.isSelected;
		this.onToggle = config.onToggle;
		this.onTodoClick = config.onTodoClick;
		this.onTodoContextMenu = config.onTodoContextMenu;
		this.onDateClick = config.onDateClick;
		this.onDateRightClick = config.onDateRightClick;
		this.priorityColors = config.priorityColors;
		this.showBadge = config.showBadge !== false;
		this.el = this.render();
	}

	getElement(): HTMLElement {
		return this.el;
	}

	private sortByPriority(todos: TodoItemData[]): TodoItemData[] {
		return [...todos].sort((a, b) => {
			return PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority);
		});
	}

	private render(): HTMLElement {
		const dayNum = this.date.getDate();
		const dateStr = formatDate(this.date.getFullYear(), this.date.getMonth(), dayNum);
		const today = isToday(this.date);
		const inMonth = isInMonth(this.date, this.year, this.month);
		const { festival, isWeekend } = getDayHolidayInfo(dateStr);

		let visibleTodos = this.todos.filter(t => t.date === dateStr);
		const actualCount = visibleTodos.length;
		if (!this.showCompleted) {
			visibleTodos = visibleTodos.filter(t => !t.completed);
		}
		visibleTodos = this.sortByPriority(visibleTodos);

		const cell = createDiv({
			cls: `schedule-day-cell ${today ? 'is-today' : ''} ${!inMonth ? 'is-other-month' : ''} ${this.isSelected ? 'is-selected' : ''} ${isWeekend ? 'is-weekend' : ''} ${festival ? 'is-festival' : ''}`,
		});

		// 日期头部
		const header = cell.createDiv({ cls: 'schedule-day-header' });
		header.createSpan({ cls: 'schedule-day-number', text: String(dayNum) });
		if (festival) header.createSpan({ cls: 'schedule-day-festival', text: festival });
		if (actualCount > 0 && this.showBadge) {
			header.createSpan({ cls: 'schedule-day-badge', text: String(actualCount) });
		}

		// 待办列表
		const list = cell.createDiv({ cls: 'schedule-todo-list' });
		visibleTodos.slice(0, 5).forEach(todo => {
			const comp = new TodoItemComponent({
				todo,
				completedDisplay: this.completedDisplay,
				showCompleted: this.showCompleted,
				onToggle: this.onToggle,
				onClick: this.onTodoClick,
				onContextMenu: this.onTodoContextMenu,
				priorityColors: this.priorityColors,
			});
			list.appendChild(comp.getElement());
		});

		const remaining = actualCount - visibleTodos.length;
		if (remaining > 0) {
			list.createDiv({ cls: 'schedule-todo-more', text: `还有 ${remaining} 项...` });
		}

		// 左键点击空白/日期区域 → 添加待办
		cell.addEventListener('click', (e) => {
			if ((e.target as HTMLElement).closest('.schedule-todo-item')) return;
			this.onDateClick(dateStr);
		});

		// 右键点击空白/日期区域 → 粘贴菜单
		cell.addEventListener('contextmenu', (e) => {
			if ((e.target as HTMLElement).closest('.schedule-todo-item')) return;
			if (hasCopiedTask()) {
				e.preventDefault();
				this.onDateRightClick(dateStr, e);
			}
		});

		return cell;
	}
}
