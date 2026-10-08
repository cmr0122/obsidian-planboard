import { Menu } from 'obsidian';
import { PRIORITY_CONFIG, CONTEXT_MENU_LABELS } from '../constants';
import type { TodoItemData, PriorityColors } from '../types';
import { hasCopiedTask } from '../utils/todo-clipboard';

export class TodoItemComponent {
	private el: HTMLElement;
	private todo: TodoItemData;
	private onToggle: (id: string) => void;
	private onClick: (todo: TodoItemData) => void;
	private onContextMenu: (todo: TodoItemData, event: MouseEvent) => void;
	private completedDisplay: 'strikethrough' | 'hidden-toggle';
	private showCompleted: boolean;
	private priorityColors?: PriorityColors;

	constructor(config: {
		todo: TodoItemData;
		completedDisplay: 'strikethrough' | 'hidden-toggle';
		showCompleted: boolean;
		onToggle: (id: string) => void;
		onClick: (todo: TodoItemData) => void;
		onContextMenu: (todo: TodoItemData, event: MouseEvent) => void;
		priorityColors?: PriorityColors;
	}) {
		this.todo = config.todo;
		this.completedDisplay = config.completedDisplay;
		this.showCompleted = config.showCompleted;
		this.onToggle = config.onToggle;
		this.onClick = config.onClick;
		this.onContextMenu = config.onContextMenu;
		this.priorityColors = config.priorityColors;
		this.el = this.render();
	}

	getElement(): HTMLElement {
		return this.el;
	}

	private render(): HTMLElement {
		const config = PRIORITY_CONFIG[this.todo.priority];
		const color = this.priorityColors?.[this.todo.priority] || config.color;

		const item = createDiv({
			cls: `schedule-todo-item ${this.todo.completed ? 'is-completed' : ''}`,
		});

		// 优先级色条
		const bar = item.createDiv({ cls: 'schedule-todo-priority' });
		bar.style.backgroundColor = color;

		// Checkbox
		const checkbox = item.createEl('input', {
			cls: 'schedule-todo-checkbox',
			attr: { type: 'checkbox' },
		});
		checkbox.checked = this.todo.completed;
		checkbox.addEventListener('change', (e) => {
			e.stopPropagation();
			this.onToggle(this.todo.id);
		});

		// 标题（带完整文本的 tooltip）
		item.createSpan({
			cls: 'schedule-todo-title',
			text: this.todo.title,
			attr: { title: this.todo.title },
		});

		// 点击编辑（非 checkbox 区域）
		item.addEventListener('click', (e) => {
			if ((e.target as HTMLElement).tagName === 'INPUT') return;
			this.onClick(this.todo);
		});

		// 右键菜单
		item.addEventListener('contextmenu', (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.onContextMenu(this.todo, e);
		});

		if (this.todo.completed && !this.showCompleted) {
			item.addClass('schedule-todo-hidden');
		}

		return item;
	}
}
