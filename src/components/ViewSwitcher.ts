import type { ViewMode } from '../types';

export class ViewSwitcherComponent {
	private el: HTMLElement;
	private currentMode: ViewMode;
	private onSwitch: (mode: ViewMode) => void;

	constructor(currentMode: ViewMode, onSwitch: (mode: ViewMode) => void) {
		this.currentMode = currentMode;
		this.onSwitch = onSwitch;
		this.el = this.render();
	}

	getElement(): HTMLElement {
		return this.el;
	}

	setMode(mode: ViewMode): void {
		this.currentMode = mode;
		this.el.querySelectorAll('.schedule-view-btn').forEach(btn => {
			btn.removeClass('is-active');
		});
		const activeBtn = this.el.querySelector(
			`.schedule-view-btn[data-mode="${mode}"]`
		);
		if (activeBtn) activeBtn.addClass('is-active');
	}

	private render(): HTMLElement {
		const container = createDiv({ cls: 'schedule-view-switcher' });

		const monthBtn = container.createEl('button', {
			cls: `schedule-view-btn ${this.currentMode === 'month' ? 'is-active' : ''}`,
			text: '月',
			attr: { 'data-mode': 'month' },
		});
		monthBtn.addEventListener('click', () => {
			this.setMode('month');
			this.onSwitch('month');
		});

		const weekBtn = container.createEl('button', {
			cls: `schedule-view-btn ${this.currentMode === 'week' ? 'is-active' : ''}`,
			text: '周',
			attr: { 'data-mode': 'week' },
		});
		weekBtn.addEventListener('click', () => {
			this.setMode('week');
			this.onSwitch('week');
		});

		return container;
	}
}
