/**
 * 全局待办剪贴板 - 用于跨任务的复制粘贴
 */
import type { Priority } from '../types';

interface CopiedTask {
	title: string;
	priority: Priority;
}

let _clipboard: CopiedTask | null = null;

export function copyTask(title: string, priority: Priority): void {
	_clipboard = { title, priority };
}

export function pasteTask(): CopiedTask | null {
	return _clipboard ? { ..._clipboard } : null;
}

export function hasCopiedTask(): boolean {
	return _clipboard !== null;
}

export function clearClipboard(): void {
	_clipboard = null;
}
