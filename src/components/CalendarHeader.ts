export class CalendarHeaderComponent {
	private el: HTMLElement;
	private year: number;
	private month: number;
	private onPrev: () => void;
	private onNext: () => void;

	constructor(
		year: number,
		month: number,
		onPrev: () => void,
		onNext: () => void
	) {
		this.year = year;
		this.month = month;
		this.onPrev = onPrev;
		this.onNext = onNext;
		this.el = this.render();
	}

	getElement(): HTMLElement {
		return this.el;
	}

	update(year: number, month: number): void {
		this.year = year;
		this.month = month;
		const titleEl = this.el.querySelector('.schedule-header-title');
		if (titleEl) {
			titleEl.textContent = `${year}年 ${month + 1}月`;
		}
	}

	private render(): HTMLElement {
		const header = createDiv({ cls: 'schedule-header' });

		const navGroup = header.createDiv({ cls: 'schedule-header-nav' });

		const prevBtn = navGroup.createEl('button', {
			cls: 'schedule-nav-btn',
			text: '◀',
		});
		prevBtn.addEventListener('click', () => this.onPrev());

		navGroup.createSpan({
			cls: 'schedule-header-title',
			text: `${this.year}年 ${this.month + 1}月`,
		});

		const nextBtn = navGroup.createEl('button', {
			cls: 'schedule-nav-btn',
			text: '▶',
		});
		nextBtn.addEventListener('click', () => this.onNext());

		return header;
	}
}
