import { TodoItemComponent } from '../components/TodoItem';
import type { TodoItemData, CompletedDisplay } from '../types';
import { getWeekDates, formatDisplayDate, dateToStr, formatDate } from '../utils/date-utils';

export class WeekViewComponent {
	private el: HTMLElement;
	private focusDate: Date;
	private weekStartsOn: 0 | 1;
	private allTodos: TodoItemData[];
	private completedDisplay: CompletedDisplay;
	private showCompleted: boolean;
	private onToggle: (id: string) => void;
	private onTodoClick: (todo: TodoItemData) => void;
	private onTodoContextMenu: (todo: TodoItemData, event: MouseEvent) => void;
	private onNavigate: (direction: 'prev' | 'next') => void;

	constructor(config: {
		focusDate: Date;
		weekStartsOn: 0 | 1;
		todos: TodoItemData[];
		completedDisplay: CompletedDisplay;
		showCompleted: boolean;
		onToggle: (id: string) => void;
		onTodoClick: (todo: TodoItemData) => void;
		onTodoContextMenu: (todo: TodoItemData, event: MouseEvent) => void;
		onNavigate: (direction: 'prev' | 'next') => void;
	}) {
		this.focusDate = config.focusDate;
		this.weekStartsOn = config.weekStartsOn;
		this.allTodos = config.todos;
		this.completedDisplay = config.completedDisplay;
		this.showCompleted = config.showCompleted;
		this.onToggle = config.onToggle;
		this.onTodoClick = config.onTodoClick;
		this.onTodoContextMenu = config.onTodoContextMenu;
		this.onNavigate = config.onNavigate;
		this.el = this.render();
	}

	getElement(): HTMLElement { return this.el; }

	refresh(config: {
		focusDate: Date;
		todos: TodoItemData[];
		completedDisplay: CompletedDisplay;
		showCompleted: boolean;
	}): void {
		this.focusDate = config.focusDate;
		this.allTodos = config.todos;
		this.completedDisplay = config.completedDisplay;
		this.showCompleted = config.showCompleted;
		const newEl = this.render();
		this.el.replaceWith(newEl);
		this.el = newEl;
	}

	private render(): HTMLElement {
		const container = createDiv({ cls: 'schedule-week-view' });

		const nav = container.createDiv({ cls: 'schedule-week-nav' });
		const prevBtn = nav.createEl('button', { cls: 'schedule-nav-btn', text: '◀' });
		prevBtn.addEventListener('click', () => this.onNavigate('prev'));

		const weekDates = getWeekDates(this.focusDate, this.weekStartsOn);
		const sd = weekDates[0], ed = weekDates[6];
		nav.createSpan({ cls: 'schedule-week-title', text: `${sd.getMonth() + 1}月${sd.getDate()}日 - ${ed.getMonth() + 1}月${ed.getDate()}日` });

		const nextBtn = nav.createEl('button', { cls: 'schedule-nav-btn', text: '▶' });
		nextBtn.addEventListener('click', () => this.onNavigate('next'));

		const daysContainer = container.createDiv({ cls: 'schedule-week-days' });
		const todayStr = dateToStr(new Date());

		weekDates.forEach(date => {
			const dateStr = formatDate(date.getFullYear(), date.getMonth(), date.getDate());
			const isToday = dateStr === todayStr;
			const dayCol = daysContainer.createDiv({ cls: `schedule-week-day ${isToday ? 'is-today' : ''}` });

			const dayHeader = dayCol.createDiv({ cls: 'schedule-week-day-header' });
			dayHeader.createSpan({ cls: 'schedule-week-day-name', text: formatDisplayDate(date) });

			let dayTodos = this.allTodos.filter(t => t.date === dateStr);
			if (!this.showCompleted) dayTodos = dayTodos.filter(t => !t.completed);

			const todoList = dayCol.createDiv({ cls: 'schedule-week-todo-list' });
			if (dayTodos.length === 0) {
				todoList.createSpan({ cls: 'schedule-week-empty', text: '暂无待办' });
			} else {
				dayTodos.forEach(todo => {
					const comp = new TodoItemComponent({
						todo,
						completedDisplay: this.completedDisplay,
						showCompleted: this.showCompleted,
						onToggle: this.onToggle,
						onClick: this.onTodoClick,
						onContextMenu: this.onTodoContextMenu,
					});
					todoList.appendChild(comp.getElement());
				});
			}
		});

		return container;
	}
}
