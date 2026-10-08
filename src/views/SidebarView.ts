import { ItemView, WorkspaceLeaf } from 'obsidian';
import { VIEW_TYPE_SCHEDULE_SIDEBAR } from '../types';
import type { TodoItemData, CompletedDisplay } from '../types';
import { TodoService, SCHEDULE_EVENT_TODOS_CHANGED } from '../services/TodoService';
import { TodoItemComponent } from '../components/TodoItem';
import { dateToStr, getDaysInMonth, getFirstDayOfMonth, formatDate } from '../utils/date-utils';
import { DAY_HEADERS } from '../constants';
import { getDayHolidayInfo } from '../utils/holiday-utils';

export class SidebarView extends ItemView {
	private todoService: TodoService;
	private getSettings: () => {
		completedDisplay: CompletedDisplay;
		weekStartsOn: 0 | 1;
	};

	private currentYear: number;
	private currentMonth: number;
	private selectedDate: string;
	private dateSummary: Map<string, number> = new Map();
	private selectedDayTasks: TodoItemData[] = [];
	private showAll = true;

	private calendarGridEl!: HTMLElement;
	private taskListTitleEl!: HTMLElement;
	private taskListEl!: HTMLElement;
	private headerTitleEl!: HTMLElement;

	constructor(
		leaf: WorkspaceLeaf,
		todoService: TodoService,
		getSettings: () => {
			completedDisplay: CompletedDisplay;
			weekStartsOn: 0 | 1;
		}
	) {
		super(leaf);
		this.todoService = todoService;
		this.getSettings = getSettings;
		const now = new Date();
		this.currentYear = now.getFullYear();
		this.currentMonth = now.getMonth();
		this.selectedDate = dateToStr(now);
		this.showAll = this.getSettings().completedDisplay === 'strikethrough';
	}

	getViewType(): string { return VIEW_TYPE_SCHEDULE_SIDEBAR; }
	getDisplayText(): string { return 'Planboard'; }
	getIcon(): string { return 'calendar'; }

	async onOpen(): Promise<void> {
		this.registerEvent(
			(this.app.workspace as any).on(SCHEDULE_EVENT_TODOS_CHANGED, () => this.refreshData())
		);
		this.renderView();
		await this.refreshData();
	}

	async onClose(): Promise<void> {}

	private renderView(): void {
		const container = this.containerEl;
		container.empty();
		container.addClass('schedule-sidebar-container');

		const nav = container.createDiv({ cls: 'schedule-sidebar-nav' });
		const prevBtn = nav.createEl('button', { cls: 'schedule-s-nav-btn', text: '◀' });
		prevBtn.addEventListener('click', () => this.navigateMonth(-1));

		this.headerTitleEl = nav.createSpan({
			cls: 'schedule-s-header-title',
			text: `${this.currentYear}年${this.currentMonth + 1}月`,
		});

		const nextBtn = nav.createEl('button', { cls: 'schedule-s-nav-btn', text: '▶' });
		nextBtn.addEventListener('click', () => this.navigateMonth(1));

		const todayBtn = nav.createEl('button', { cls: 'schedule-s-today-btn', text: '今' });
		todayBtn.addEventListener('click', () => this.goToToday());

		const weekRow = container.createDiv({ cls: 'schedule-s-week-row' });
		this.buildDayHeaders().forEach(day => {
			weekRow.createSpan({ cls: 'schedule-s-week-header', text: day });
		});

		this.calendarGridEl = container.createDiv({ cls: 'schedule-s-grid' });
		container.createDiv({ cls: 'schedule-s-divider' });
		this.taskListTitleEl = container.createDiv({ cls: 'schedule-s-task-title' });
		this.taskListEl = container.createDiv({ cls: 'schedule-s-task-list' });
	}

	private async refreshData(): Promise<void> {
		this.dateSummary = await this.todoService.loadDateSummary(this.currentYear, this.currentMonth);
		this.renderCalendarGrid();
		await this.refreshSelectedDayTasks();
	}

	private async refreshSelectedDayTasks(): Promise<void> {
		const allTodos = await this.todoService.loadTodosForMonth(this.currentYear, this.currentMonth);
		this.selectedDayTasks = allTodos.filter(t => t.date === this.selectedDate);

		const d = new Date(
			parseInt(this.selectedDate.substring(0, 4)),
			parseInt(this.selectedDate.substring(5, 7)) - 1,
			parseInt(this.selectedDate.substring(8, 10))
		);
		const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
		const { festival } = getDayHolidayInfo(this.selectedDate);
		this.taskListTitleEl.textContent =
			`${parseInt(this.selectedDate.substring(5, 7))}月${parseInt(this.selectedDate.substring(8, 10))}日 ${weekDays[d.getDay()]}${festival ? ` 🎉${festival}` : ''}`;

		this.renderTaskList();
	}

	private renderTaskList(): void {
		this.taskListEl.empty();

		let visibleTasks = this.selectedDayTasks;
		if (!this.showAll) {
			visibleTasks = visibleTasks.filter(t => !t.completed);
		}

		if (visibleTasks.length === 0) {
			this.taskListEl.createSpan({ cls: 'schedule-s-empty', text: '✓ 暂无待办' });
			return;
		}

		visibleTasks.forEach(todo => {
			const comp = new TodoItemComponent({
				todo,
				completedDisplay: this.getSettings().completedDisplay,
				showCompleted: this.showAll,
				onToggle: async (id) => {
					await this.todoService.toggleTodo(id);
					await this.refreshData();
				},
				onClick: () => {},
				onContextMenu: () => {},
			});
			this.taskListEl.appendChild(comp.getElement());
		});
	}

	private renderCalendarGrid(): void {
		this.calendarGridEl.empty();

		const daysInMonth = getDaysInMonth(this.currentYear, this.currentMonth);
		const firstDay = getFirstDayOfMonth(this.currentYear, this.currentMonth);
		const weekStartsOn = this.getSettings().weekStartsOn;

		let startOffset = firstDay - weekStartsOn;
		if (startOffset < 0) startOffset += 7;

		const totalCells = startOffset + daysInMonth;
		const totalRows = Math.ceil(totalCells / 7);
		const prevMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
		const prevYear = this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear;
		const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

		let dayCounter = 1;
		let nextMonthDay = 1;
		const todayStr = dateToStr(new Date());

		for (let row = 0; row < totalRows && row < 6; row++) {
			const rowEl = this.calendarGridEl.createDiv({ cls: 'schedule-s-row' });

			for (let col = 0; col < 7; col++) {
				const cellIndex = row * 7 + col;

				let cellDate: Date, isOtherMonth = false, dayNum: number;

				if (cellIndex < startOffset) {
					dayNum = daysInPrevMonth - startOffset + cellIndex + 1;
					cellDate = new Date(prevYear, prevMonth, dayNum);
					isOtherMonth = true;
				} else if (cellIndex < startOffset + daysInMonth) {
					dayNum = dayCounter;
					cellDate = new Date(this.currentYear, this.currentMonth, dayCounter);
					dayCounter++;
				} else {
					dayNum = nextMonthDay;
					const nextM = this.currentMonth === 11 ? 0 : this.currentMonth + 1;
					const nextY = this.currentMonth === 11 ? this.currentYear + 1 : this.currentYear;
					cellDate = new Date(nextY, nextM, nextMonthDay);
					nextMonthDay++;
					isOtherMonth = true;
				}

				const dateStr = formatDate(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
				const isToday = dateStr === todayStr;
				const isSelected = dateStr === this.selectedDate;
				const hasTasks = (this.dateSummary.get(dateStr) ?? 0) > 0;
				const { festival, isWeekend } = getDayHolidayInfo(dateStr);

				const cell = rowEl.createDiv({
					cls: `schedule-s-cell ${isOtherMonth ? 'is-other' : ''} ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''} ${isWeekend ? 'is-weekend' : ''} ${festival ? 'is-festival' : ''}`,
				});

				cell.createSpan({ cls: 'schedule-s-day-num', text: String(dayNum) });

				if (hasTasks) {
					cell.createSpan({ cls: 'schedule-s-dot' });
				}

				if (festival) {
					cell.setAttr('aria-label', festival);
					cell.createSpan({ cls: 'schedule-s-festival-name', text: festival.length <= 2 ? festival : '' });
				}

				cell.addEventListener('click', () => {
					this.selectedDate = dateStr;
					this.renderCalendarGrid();
					this.refreshSelectedDayTasks();
				});
			}
		}
	}

	private buildDayHeaders(): string[] {
		const headers: string[] = [];
		const ws = this.getSettings().weekStartsOn;
		for (let i = 0; i < 7; i++) headers.push(DAY_HEADERS[(ws + i) % 7]);
		return headers;
	}

	private navigateMonth(delta: number): void {
		this.currentMonth += delta;
		if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
		else if (this.currentMonth < 0) { this.currentMonth = 11; this.currentYear--; }
		this.headerTitleEl.textContent = `${this.currentYear}年${this.currentMonth + 1}月`;
		this.refreshData();
	}

	private goToToday(): void {
		const now = new Date();
		this.currentYear = now.getFullYear();
		this.currentMonth = now.getMonth();
		this.selectedDate = dateToStr(now);
		this.headerTitleEl.textContent = `${this.currentYear}年${this.currentMonth + 1}月`;
		this.refreshData();
	}
}
