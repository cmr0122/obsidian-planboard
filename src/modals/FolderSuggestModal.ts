import { App, FuzzySuggestModal, TFolder } from 'obsidian';

export class FolderSuggestModal extends FuzzySuggestModal<string> {
	private onSelect: (path: string) => void;

	constructor(app: App, onSelect: (path: string) => void) {
		super(app);
		this.onSelect = onSelect;
		this.setPlaceholder('搜索文件夹...');
		this.setInstructions([{ command: '↑↓', purpose: '选择' }, { command: '↵', purpose: '确认' }]);
	}

	getItems(): string[] {
		const folders = this.app.vault.getAllLoadedFiles()
			.filter((f): f is TFolder => f instanceof TFolder)
			.map(f => f.path)
			.sort();
		return ['', ...folders];
	}

	getItemText(item: string): string {
		return item || '/ (Vault 根目录)';
	}

	onChooseItem(item: string): void {
		this.onSelect(item);
	}
}
