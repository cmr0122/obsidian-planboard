import { DayCellComponent } from './DayCell';
import type { TodoItemData, CompletedDisplay, PriorityColors } from '../types';
import { getDaysInMonth, getFirstDayOfMonth, formatDate } from '../utils/date-utils';
import { DAY_HEADERS } from '../constants';

export class CalendarGridComponent {
	private el: HTMLElement;
	private year: number;
	private month: number;
	private weekStartsOn: 0 | 1;
	private todos: TodoItemData[];
	private completedDisplay: CompletedDisplay;
	private showCompleted: boolean;
	private selectedDate: string;
	private onToggle: (id: string) => void;
	private onTodoClick: (todo: TodoItemData) => void;
	private onTodoContextMenu: (todo: TodoItemData, event: MouseEvent) => void;
	private onDateClick: (date: string) => void;
	private onDateRightClick: (date: string, event: MouseEvent) => void;
	private priorityColors?: PriorityColors;
	private showBadge: boolean;

	constructor(config: {
		year: number;
		month: number;
		weekStartsOn: 0 | 1;
		todos: TodoItemData[];
		completedDisplay: CompletedDisplay;
		showCompleted: boolean;
		selectedDate: string;
		onToggle: (id: string) => void;
		onTodoClick: (todo: TodoItemData) => void;
		onTodoContextMenu: (todo: TodoItemData, event: MouseEvent) => void;
		onDateClick: (date: string) => void;
		onDateRightClick: (date: string, event: MouseEvent) => void;
		priorityColors?: PriorityColors;
		showBadge?: boolean;
	}) {
		this.year = config.year;
		this.month = config.month;
		this.weekStartsOn = config.weekStartsOn;
		this.todos = config.todos;
		this.completedDisplay = config.completedDisplay;
		this.showCompleted = config.showCompleted;
		this.selectedDate = config.selectedDate;
		this.onToggle = config.onToggle;
		this.onTodoClick = config.onTodoClick;
		this.onTodoContextMenu = config.onTodoContextMenu;
		this.onDateClick = config.onDateClick;
		this.onDateRightClick = config.onDateRightClick;
		this.priorityColors = config.priorityColors;
		this.showBadge = config.showBadge !== false;
		this.el = this.render();
	}

	getElement(): HTMLElement { return this.el; }

	refresh(): void {
		const newEl = this.render();
		this.el.replaceWith(newEl);
		this.el = newEl;
	}

	private render(): HTMLElement {
		const container = createDiv({ cls: 'schedule-calendar-grid' });

		// 星期头行
		const headerRow = container.createDiv({ cls: 'schedule-grid-row schedule-grid-header' });
		this.buildDayHeaders().forEach(day => {
			headerRow.createDiv({ cls: 'schedule-grid-cell schedule-header-cell', text: day });
		});

		const daysInMonth = getDaysInMonth(this.year, this.month);
		const firstDay = getFirstDayOfMonth(this.year, this.month);
		let startOffset = firstDay - this.weekStartsOn;
		if (startOffset < 0) startOffset += 7;

		const prevMonth = this.month === 0 ? 11 : this.month - 1;
		const prevYear = this.month === 0 ? this.year - 1 : this.year;
		const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
		const totalCells = startOffset + daysInMonth;
		const totalRows = Math.ceil(totalCells / 7);

		let dayCounter = 1, nextMonthDay = 1;

		for (let row = 0; row < totalRows; row++) {
			const rowEl = container.createDiv({ cls: 'schedule-grid-row' });
			for (let col = 0; col < 7; col++) {
				const idx = row * 7 + col;
				let cellDate: Date;
				if (idx < startOffset) {
					cellDate = new Date(prevYear, prevMonth, daysInPrevMonth - startOffset + idx + 1);
				} else if (idx < startOffset + daysInMonth) {
					cellDate = new Date(this.year, this.month, dayCounter++);
				} else {
					const nm = this.month === 11 ? 0 : this.month + 1;
					const ny = this.month === 11 ? this.year + 1 : this.year;
					cellDate = new Date(ny, nm, nextMonthDay++);
				}

				const ds = formatDate(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
				const cell = new DayCellComponent({
					date: cellDate, year: this.year, month: this.month,
					todos: this.todos,
					completedDisplay: this.completedDisplay,
					showCompleted: this.showCompleted,
					isSelected: this.selectedDate === ds,
					onToggle: this.onToggle,
					onTodoClick: this.onTodoClick,
					onTodoContextMenu: this.onTodoContextMenu,
					onDateClick: this.onDateClick,
					onDateRightClick: this.onDateRightClick,
					priorityColors: this.priorityColors,
					showBadge: this.showBadge,
				});
				rowEl.appendChild(cell.getElement());
			}
		}
		return container;
	}

	private buildDayHeaders(): string[] {
		const h: string[] = [];
		for (let i = 0; i < 7; i++) h.push(DAY_HEADERS[(this.weekStartsOn + i) % 7]);
		return h;
	}
}
