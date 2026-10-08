import { PluginSettingTab, Setting, App } from 'obsidian';
import type SchedulePlugin from './main';
import type { SchedulePluginSettings } from './types';
import { STORAGE_GRANULARITY_LABELS, COMPLETED_DISPLAY_LABELS, PRIORITY_CONFIG } from './constants';
import { FolderSuggestModal } from './modals/FolderSuggestModal';

export class ScheduleSettingTab extends PluginSettingTab {
	private plugin: SchedulePlugin;

	constructor(app: App, plugin: SchedulePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Planboard 设置' });

		// ===== 数据设置 =====
		containerEl.createEl('h3', { text: '数据设置' });

		new Setting(containerEl)
			.setName('存储粒度')
			.setDesc('选择待办数据的存储方式，按周/月/年创建笔记文件')
			.addDropdown(dropdown => {
				Object.entries(STORAGE_GRANULARITY_LABELS).forEach(([key, label]) => {
					dropdown.addOption(key, label);
				});
				dropdown.setValue(this.plugin.settings.storageGranularity);
				dropdown.onChange(async (value: string) => {
					this.plugin.settings.storageGranularity = value as SchedulePluginSettings['storageGranularity'];
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('存储路径')
			.setDesc('笔记文件的存放目录，可输入关键字搜索或📁按钮浏览选择')
			.addSearch(search => {
				search.setPlaceholder('日程')
					.setValue(this.plugin.settings.basePath)
					.onChange(async (value: string) => {
						this.plugin.settings.basePath = value || '日程';
						await this.plugin.saveSettings();
					});
			})
			.addExtraButton(btn => {
				btn.setIcon('folder')
					.setTooltip('浏览并选择文件夹')
					.onClick(() => {
						const modal = new FolderSuggestModal(this.app, (path) => {
							this.plugin.settings.basePath = path || '日程';
							this.plugin.saveSettings();
							this.display();
						});
						modal.open();
					});
			});

		new Setting(containerEl)
			.setName('已完成显示')
			.setDesc('「划掉保留」始终显示已完成，可手动隐藏；「隐藏」默认隐藏已完成')
			.addDropdown(dropdown => {
				Object.entries(COMPLETED_DISPLAY_LABELS).forEach(([key, label]) => {
					dropdown.addOption(key, label);
				});
				dropdown.setValue(this.plugin.settings.completedDisplay);
				dropdown.onChange(async (value: string) => {
					this.plugin.settings.completedDisplay = value as SchedulePluginSettings['completedDisplay'];
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('周起始日')
			.setDesc('选择每周从哪一天开始')
			.addDropdown(dropdown => {
				dropdown.addOption('1', '周一');
				dropdown.addOption('0', '周日');
				dropdown.setValue(String(this.plugin.settings.weekStartsOn));
				dropdown.onChange(async (value: string) => {
					this.plugin.settings.weekStartsOn = Number(value) as 0 | 1;
					await this.plugin.saveSettings();
				});
			});

		// ===== 外观设置 =====
		containerEl.createEl('h3', { text: '外观设置' });

		// 优先级颜色
		containerEl.createEl('p', {
			text: '自定义各优先级的竖条颜色',
			cls: 'schedule-settings-desc',
		});

		const priorityKeys: Array<{ key: 'high' | 'medium' | 'low'; label: string }> = [
			{ key: 'high', label: '高优先级颜色' },
			{ key: 'medium', label: '中优先级颜色' },
			{ key: 'low', label: '低优先级颜色' },
		];

		priorityKeys.forEach(({ key, label }) => {
			const setting = new Setting(containerEl)
				.setName(label)
				.setDesc(PRIORITY_CONFIG[key].label)
				.addColorPicker(color => {
					color.setValue(this.plugin.settings.priorityColors[key]);
					color.onChange(async (value) => {
						this.plugin.settings.priorityColors[key] = value;
						await this.plugin.saveSettings();
					});
				})
				.addExtraButton(btn => {
					const defaultColor = this.plugin.settings.priorityColors[key];
					btn.setIcon('reset')
						.setTooltip('重置为默认颜色')
						.onClick(async () => {
							// 重置为默认
							const defaults: Record<string, string> = {
								high: '#e74c3c', medium: '#e67e22', low: '#3498db',
							};
							this.plugin.settings.priorityColors[key] = defaults[key];
							await this.plugin.saveSettings();
							this.display();
						});
				});
		});

		// 背景图片
		new Setting(containerEl)
			.setName('背景图片 URL')
			.setDesc('设置主页日历的背景图（建议使用浅色/柔和图片），留空则不使用背景')
			.addText(text => {
				text.setPlaceholder('https://example.com/bg.png 或 local://path')
					.setValue(this.plugin.settings.backgroundImage)
					.onChange(async (value) => {
						this.plugin.settings.backgroundImage = value;
						await this.plugin.saveSettings();
					});
			});

		// 背景透明度
		new Setting(containerEl)
			.setName('背景图透明度')
			.setDesc('背景图的显示强度（0 = 不可见, 1 = 完全显示）')
			.addSlider(slider => {
				slider.setLimits(0, 1, 0.05)
					.setValue(this.plugin.settings.backgroundOpacity)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.backgroundOpacity = value;
						await this.plugin.saveSettings();
					});
			});

		// 显示开关
		new Setting(containerEl)
			.setName('显示周末高亮')
			.setDesc('周六/周日日期使用不同颜色标识')
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.showWeekendHighlight);
				toggle.onChange(async (value) => {
					this.plugin.settings.showWeekendHighlight = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('显示节假日标识')
			.setDesc('节假日日期显示节日名称和特殊背景')
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.showFestivalHighlight);
				toggle.onChange(async (value) => {
					this.plugin.settings.showFestivalHighlight = value;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('显示任务数量角标')
			.setDesc('在日期格子上显示该日待办数量')
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.showTaskCountBadge);
				toggle.onChange(async (value) => {
					this.plugin.settings.showTaskCountBadge = value;
					await this.plugin.saveSettings();
				});
			});

		// ===== 说明信息 =====
		containerEl.createEl('hr');
		containerEl.createEl('h3', { text: '数据说明' });
		const info = containerEl.createEl('div', { cls: 'schedule-settings-info' });

		const { storageGranularity, basePath } = this.plugin.settings;
		const examples: Record<string, string> = {
			month: `${basePath}/2026-06.md（每月一篇）`,
			week: `${basePath}/2026-W23.md（每周一篇）`,
			year: `${basePath}/2026.md（每年一篇）`,
		};

		info.createEl('p', {
			text: `当前设置：${STORAGE_GRANULARITY_LABELS[storageGranularity]}存储，路径为 "${basePath}/"`,
		});
		info.createEl('p', { text: `示例：${examples[storageGranularity]}` });
		info.createEl('p', {
			text: '提示：笔记由插件自动管理，可直接在 Obsidian 中阅读和编辑。请勿删除或修改 HTML 注释格式的元数据。',
			cls: 'schedule-settings-tip',
		});
	}
}
