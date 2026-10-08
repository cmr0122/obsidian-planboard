let counter = 0;

/**
 * 生成短 ID (时间戳 + 计数器 + 随机数)
 */
export function generateId(): string {
	counter = (counter + 1) % 10000;
	const ts = Date.now().toString(36);
	const rand = Math.random().toString(36).substring(2, 6);
	return `${ts}-${rand}-${counter}`;
}
