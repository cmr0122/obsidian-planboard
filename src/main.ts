import { Plugin } from 'obsidian';
import { VIEW_TYPE_SCHEDULE_MAIN, VIEW_TYPE_SCHEDULE_SIDEBAR, DEFAULT_SETTINGS } from './types';
import type { SchedulePluginSettings } from './types';
import { CalendarView } from './views/CalendarView';
import { SidebarView } from './views/SidebarView';
import { ScheduleSettingTab } from './settings';
import { TodoService } from './services/TodoService';

export default class SchedulePlugin extends Plugin {
	settings: SchedulePluginSettings;
	private todoService!: TodoService;

	async onload(): Promise<void> {
		await this.loadSettings();
		this.todoService = new TodoService(this.app, () => this.settings);

		// 注册主标签页视图
		this.registerView(
			VIEW_TYPE_SCHEDULE_MAIN,
			(leaf) => new CalendarView(leaf, this.todoService, () => ({
				completedDisplay: this.settings.completedDisplay,
				weekStartsOn: this.settings.weekStartsOn,
				priorityColors: this.settings.priorityColors,
				backgroundImage: this.settings.backgroundImage,
				backgroundOpacity: this.settings.backgroundOpacity,
				showFestivalHighlight: this.settings.showFestivalHighlight,
				showWeekendHighlight: this.settings.showWeekendHighlight,
				showTaskCountBadge: this.settings.showTaskCountBadge,
			}))
		);

		// 注册侧边栏视图
		this.registerView(
			VIEW_TYPE_SCHEDULE_SIDEBAR,
			(leaf) => new SidebarView(leaf, this.todoService, () => ({
				completedDisplay: this.settings.completedDisplay,
				weekStartsOn: this.settings.weekStartsOn,
			}))
		);

		this.addRibbonIcon('calendar', '日程', async () => {
			await this.activateViews();
		});

		this.addSettingTab(new ScheduleSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(async () => {
			const mainLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_SCHEDULE_MAIN);
			if (mainLeaves.length === 0) {
				await this.activateViews();
			}
		});
	}

	async onunload(): Promise<void> {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_SCHEDULE_MAIN);
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_SCHEDULE_SIDEBAR);
	}

	async activateViews(): Promise<void> {
		const { workspace } = this.app;

		const mainExisting = workspace.getLeavesOfType(VIEW_TYPE_SCHEDULE_MAIN);
		if (mainExisting.length > 0) {
			workspace.revealLeaf(mainExisting[0]);
		} else {
			const mainLeaf = workspace.getLeaf(true);
			if (mainLeaf) {
				await mainLeaf.setViewState({ type: VIEW_TYPE_SCHEDULE_MAIN, active: true });
			}
		}

		const sideExisting = workspace.getLeavesOfType(VIEW_TYPE_SCHEDULE_SIDEBAR);
		if (sideExisting.length === 0) {
			const sideLeaf = workspace.getRightLeaf(false);
			if (sideLeaf) {
				await sideLeaf.setViewState({ type: VIEW_TYPE_SCHEDULE_SIDEBAR, active: false });
			}
		}
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
		[
			...this.app.workspace.getLeavesOfType(VIEW_TYPE_SCHEDULE_MAIN),
			...this.app.workspace.getLeavesOfType(VIEW_TYPE_SCHEDULE_SIDEBAR),
		].forEach(leaf => {
			if (leaf.view instanceof CalendarView || leaf.view instanceof SidebarView) {
				leaf.view.onOpen();
			}
		});
	}
}
