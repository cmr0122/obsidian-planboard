import { App, Modal, Setting } from 'obsidian';
import type { Priority, TodoItemData } from '../types';
import { PRIORITY_CONFIG, PRIORITY_ORDER } from '../constants';

export class EditTodoModal extends Modal {
	private titleInput: string;
	private dateInput: string;
	private selectedPriority: Priority;
	private onSave: (changes: { title: string; date: string; priority: Priority }) => void;

	constructor(
		app: App,
		todo: TodoItemData,
		onSave: (changes: { title: string; date: string; priority: Priority }) => void,
	) {
		super(app);
		this.titleInput = todo.title;
		this.dateInput = todo.date;
		this.selectedPriority = todo.priority;
		this.onSave = onSave;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.addClass('schedule-modal');
		contentEl.empty();

		contentEl.createEl('h3', { text: '编辑待办' });

		// 标题输入
		new Setting(contentEl)
			.setName('待办内容')
			.addText(text => {
				text.setValue(this.titleInput)
					.onChange(value => { this.titleInput = value; });
				setTimeout(() => text.inputEl?.focus(), 100);
			});

		// 日期选择
		new Setting(contentEl)
			.setName('日期')
			.addText(text => {
				text.setValue(this.dateInput);
				text.inputEl.type = 'date';
				text.onChange(value => { this.dateInput = value; });
			});

		// 优先级选择
		const prioritySetting = new Setting(contentEl).setName('优先级');
		const priorityContainer = prioritySetting.controlEl.createDiv({ cls: 'schedule-priority-selector' });

		PRIORITY_ORDER.forEach(priority => {
			const config = PRIORITY_CONFIG[priority];
			const btn = priorityContainer.createEl('button', {
				cls: `schedule-priority-btn ${priority === this.selectedPriority ? 'is-active' : ''}`,
				text: config.label,
			});
			btn.style.setProperty('--priority-color', config.color);
			btn.style.setProperty('--priority-bg', config.colorBg);
			btn.style.setProperty('--priority-border', config.colorBorder);
			btn.addEventListener('click', () => {
				this.selectedPriority = priority;
				priorityContainer.querySelectorAll('.schedule-priority-btn').forEach(b => b.removeClass('is-active'));
				btn.addClass('is-active');
			});
		});

		// 按钮区域（无删除按钮，删除移至右键菜单）
		const buttonContainer = contentEl.createDiv({ cls: 'schedule-modal-buttons' });

		const cancelBtn = buttonContainer.createEl('button', { text: '取消', cls: 'schedule-btn schedule-btn-cancel' });
		cancelBtn.addEventListener('click', () => this.close());

		const saveBtn = buttonContainer.createEl('button', { text: '保存', cls: 'schedule-btn schedule-btn-primary' });
		saveBtn.addEventListener('click', () => {
			if (!this.titleInput.trim()) return;
			this.onSave({
				title: this.titleInput.trim(),
				date: this.dateInput,
				priority: this.selectedPriority,
			});
			this.close();
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
