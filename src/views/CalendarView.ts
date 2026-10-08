import { ItemView, WorkspaceLeaf, Menu, Modal, App } from 'obsidian';
import { VIEW_TYPE_SCHEDULE_MAIN } from '../types';
import type { TodoItemData, ViewMode, CompletedDisplay, PriorityColors } from '../types';
import { ViewSwitcherComponent } from '../components/ViewSwitcher';
import { CalendarGridComponent } from '../components/CalendarGrid';
import { WeekViewComponent } from './WeekView';
import { AddTodoModal } from '../modals/AddTodoModal';
import { EditTodoModal } from '../modals/EditTodoModal';
import { TodoService, SCHEDULE_EVENT_TODOS_CHANGED } from '../services/TodoService';
import { dateToStr, getWeekDates } from '../utils/date-utils';
import { copyTask, pasteTask } from '../utils/todo-clipboard';
import { CONTEXT_MENU_LABELS } from '../constants';

export class CalendarView extends ItemView {
	private todoService: TodoService;
	private getSettings: () => {
		completedDisplay: CompletedDisplay;
		weekStartsOn: 0 | 1;
		priorityColors: PriorityColors;
		backgroundImage: string;
		backgroundOpacity: number;
		showFestivalHighlight: boolean;
		showWeekendHighlight: boolean;
		showTaskCountBadge: boolean;
	};

	private currentYear: number;
	private currentMonth: number;
	private viewMode: ViewMode = 'month';
	private selectedDate: string;
	private todos: TodoItemData[] = [];
	private showAll = true;

	private gridComp: CalendarGridComponent | null = null;
	private weekComp: WeekViewComponent | null = null;
	private scheduleContentEl: HTMLElement | null = null;

	constructor(
		leaf: WorkspaceLeaf,
		todoService: TodoService,
		getSettings: () => {
			completedDisplay: CompletedDisplay;
			weekStartsOn: 0 | 1;
			priorityColors: PriorityColors;
			backgroundImage: string;
			backgroundOpacity: number;
			showFestivalHighlight: boolean;
			showWeekendHighlight: boolean;
			showTaskCountBadge: boolean;
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

	getViewType(): string { return VIEW_TYPE_SCHEDULE_MAIN; }
	getDisplayText(): string { return 'Planboard'; }
	getIcon(): string { return 'calendar'; }

	async onOpen(): Promise<void> {
		this.registerEvent(
			(this.app.workspace as any).on(SCHEDULE_EVENT_TODOS_CHANGED, () => this.loadTodos())
		);
		this.renderView();
		await this.loadTodos();
	}

	async onClose(): Promise<void> {}

	private renderView(): void {
		const c = this.containerEl;
		c.empty();
		c.addClass('schedule-container');

		this.applyBackground(c);

		// 顶部品牌栏
		const topBar = c.createDiv({ cls: 'schedule-top-bar' });
		topBar.createSpan({ cls: 'schedule-brand', text: 'Planboard' });

		// 已完成切换（右端）
		const toggleBtn = topBar.createEl('button', {
			cls: 'schedule-toggle-completed',
			text: this.showAll ? '隐藏已完成' : '显示已完成',
		});
		toggleBtn.addEventListener('click', () => {
			this.showAll = !this.showAll;
			toggleBtn.textContent = this.showAll ? '隐藏已完成' : '显示已完成';
			this.refreshContent();
		});

		// ---- 日期导航行（◀ 年月 ▶  |  [+] [月|周] [今日]） ----
		const navRow = c.createDiv({ cls: 'schedule-nav-row' });
		const navGroup = navRow.createDiv({ cls: 'schedule-nav-group' });

		const prevBtn = navGroup.createEl('button', { cls: 'schedule-nav-btn', text: '◀' });
		prevBtn.addEventListener('click', () => this.navigateMonth(-1));

		navGroup.createSpan({ cls: 'schedule-header-title', text: `${this.currentYear}年 ${this.currentMonth + 1}月` });

		const nextBtn = navGroup.createEl('button', { cls: 'schedule-nav-btn', text: '▶' });
		nextBtn.addEventListener('click', () => this.navigateMonth(1));

		// 右侧按钮组
		const actionGroup = navRow.createDiv({ cls: 'schedule-action-group' });

		const addBtn = actionGroup.createEl('button', { cls: 'schedule-add-btn', text: '+' });
		addBtn.addEventListener('click', () => this.openAddModal());

		const switcher = new ViewSwitcherComponent(this.viewMode, (mode) => {
			this.viewMode = mode;
			this.refreshContent();
		});
		actionGroup.appendChild(switcher.getElement());

		const todayBtn = actionGroup.createEl('button', { cls: 'schedule-today-btn', text: '今日' });
		todayBtn.addEventListener('click', () => this.goToToday());

		// 内容区
		this.scheduleContentEl = c.createDiv({ cls: 'schedule-content' });
		this.renderContent();
	}

	private applyBackground(c: HTMLElement): void {
		const bg = this.getSettings().backgroundImage;
		if (bg) {
			c.style.backgroundImage = `url(${bg})`;
			c.style.backgroundSize = 'cover';
			c.style.backgroundPosition = 'center';
			c.style.backgroundRepeat = 'no-repeat';
		} else {
			c.style.backgroundImage = '';
		}
	}

	/* ---- 右键菜单 ---- */

	private showTodoContextMenu(todo: TodoItemData, event: MouseEvent): void {
		const menu = new Menu();

		menu.addItem(item => item
			.setTitle(CONTEXT_MENU_LABELS.copy)
			.setIcon('copy')
			.onClick(() => copyTask(todo.title, todo.priority))
		);

		menu.addItem(item => item
			.setTitle(CONTEXT_MENU_LABELS.moveNextDay)
			.setIcon('arrow-right')
			.onClick(async () => {
				const d = new Date(
					parseInt(todo.date.substring(0, 4)),
					parseInt(todo.date.substring(5, 7)) - 1,
					parseInt(todo.date.substring(8, 10))
				);
				d.setDate(d.getDate() + 1);
				await this.todoService.updateTodo(todo.id, { date: dateToStr(d) });
				await this.loadTodos();
			})
		);

		menu.addItem(item => item
			.setTitle(CONTEXT_MENU_LABELS.moveNextWeek)
			.setIcon('arrow-right')
			.onClick(async () => {
				const d = new Date(
					parseInt(todo.date.substring(0, 4)),
					parseInt(todo.date.substring(5, 7)) - 1,
					parseInt(todo.date.substring(8, 10))
				);
				d.setDate(d.getDate() + 7);
				await this.todoService.updateTodo(todo.id, { date: dateToStr(d) });
				await this.loadTodos();
			})
		);

		// 删除（带确认对话框）
		menu.addItem(item => item
			.setTitle('删除')
			.setIcon('trash')
			.onClick(async () => {
				const confirmModal = new ConfirmDeleteModal(this.app, todo.title, async () => {
					await this.todoService.deleteTodo(todo.id);
					await this.loadTodos();
				});
				confirmModal.open();
			})
		);

		menu.showAtMouseEvent(event);
	}

	private showDateRightClickMenu(date: string, event: MouseEvent): void {
		const menu = new Menu();
		menu.addItem(item => item
			.setTitle(CONTEXT_MENU_LABELS.paste)
			.setIcon('paste')
			.onClick(async () => {
				const data = pasteTask();
				if (!data) return;
				await this.todoService.addTodo({
					title: data.title,
					date,
					priority: data.priority,
				});
				await this.loadTodos();
			})
		);
		menu.showAtMouseEvent(event);
	}

	/* ---- 操作 ---- */

	private openAddModal(date?: string): void {
		new AddTodoModal(this.app, date || this.selectedDate, async (result) => {
			await this.todoService.addTodo(result);
			await this.loadTodos();
		}).open();
	}

	private renderContent(): void {
		if (!this.scheduleContentEl) return;
		this.scheduleContentEl.empty();
		const s = this.getSettings();

		if (this.viewMode === 'month') {
			this.gridComp = new CalendarGridComponent({
				year: this.currentYear, month: this.currentMonth,
				weekStartsOn: s.weekStartsOn,
				todos: this.todos,
				completedDisplay: s.completedDisplay,
				showCompleted: this.showAll,
				selectedDate: this.selectedDate,
				onToggle: async (id) => { await this.todoService.toggleTodo(id); await this.loadTodos(); },
				onTodoClick: (todo) => this.openEditModal(todo),
				onTodoContextMenu: (todo, e) => this.showTodoContextMenu(todo, e),
				onDateClick: (date) => { this.selectedDate = date; this.openAddModal(date); },
				onDateRightClick: (date, e) => this.showDateRightClickMenu(date, e),
				priorityColors: s.priorityColors,
				showBadge: s.showTaskCountBadge,
			});
			this.scheduleContentEl.appendChild(this.gridComp.getElement());
		} else {
			const wd = new Date(
				parseInt(this.selectedDate.substring(0, 4)),
				parseInt(this.selectedDate.substring(5, 7)) - 1,
				parseInt(this.selectedDate.substring(8, 10))
			);
			this.weekComp = new WeekViewComponent({
				focusDate: wd,
				weekStartsOn: s.weekStartsOn,
				todos: this.todos,
				completedDisplay: s.completedDisplay,
				showCompleted: this.showAll,
				onToggle: async (id) => { await this.todoService.toggleTodo(id); await this.loadTodos(); },
				onTodoClick: (todo) => this.openEditModal(todo),
				onTodoContextMenu: (todo, e) => this.showTodoContextMenu(todo, e),
				onNavigate: (dir) => {
					const nd = new Date(wd);
					nd.setDate(nd.getDate() + (dir === 'next' ? 7 : -7));
					this.selectedDate = dateToStr(nd);
					this.loadTodos();
				},
			});
			this.scheduleContentEl.appendChild(this.weekComp.getElement());
		}
	}

	private refreshContent(): void { this.renderContent(); }

	private navigateMonth(delta: number): void {
		this.currentMonth += delta;
		if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
		else if (this.currentMonth < 0) { this.currentMonth = 11; this.currentYear--; }
		this.updateTitle();
		this.loadTodos();
	}

	private goToToday(): void {
		const now = new Date();
		this.currentYear = now.getFullYear();
		this.currentMonth = now.getMonth();
		this.selectedDate = dateToStr(now);
		this.updateTitle();
		this.loadTodos();
	}

	private updateTitle(): void {
		const el = this.containerEl.querySelector('.schedule-header-title');
		if (el) el.textContent = `${this.currentYear}年 ${this.currentMonth + 1}月`;
	}

	private async loadTodos(): Promise<void> {
		if (this.viewMode === 'month') {
			this.todos = await this.todoService.loadTodosForMonth(this.currentYear, this.currentMonth);
		} else {
			const wd = new Date(
				parseInt(this.selectedDate.substring(0, 4)),
				parseInt(this.selectedDate.substring(5, 7)) - 1,
				parseInt(this.selectedDate.substring(8, 10))
			);
			const wds = getWeekDates(wd, this.getSettings().weekStartsOn);
			this.todos = await this.todoService.loadTodosForDateRange(dateToStr(wds[0]), dateToStr(wds[6]));
		}
		this.refreshContent();
	}

	private openEditModal(todo: TodoItemData): void {
		new EditTodoModal(
			this.app, todo,
			async (ch) => { await this.todoService.updateTodo(todo.id, ch); await this.loadTodos(); },
		).open();
	}
}

/**
 * 删除确认对话框
 */
class ConfirmDeleteModal extends Modal {
	private title: string;
	private onConfirm: () => void;

	constructor(app: App, title: string, onConfirm: () => void) {
		super(app);
		this.title = title;
		this.onConfirm = onConfirm;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.addClass('schedule-modal');
		contentEl.empty();
		contentEl.createEl('h3', { text: '确认删除' });
		contentEl.createEl('p', { text: `确定要删除待办「${this.title}」吗？` });

		const btnContainer = contentEl.createDiv({ cls: 'schedule-modal-buttons' });

		const cancelBtn = btnContainer.createEl('button', { text: '取消', cls: 'schedule-btn schedule-btn-cancel' });
		cancelBtn.addEventListener('click', () => this.close());

		const deleteBtn = btnContainer.createEl('button', { text: '删除', cls: 'schedule-btn schedule-btn-danger' });
		deleteBtn.addEventListener('click', () => {
			this.onConfirm();
			this.close();
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
