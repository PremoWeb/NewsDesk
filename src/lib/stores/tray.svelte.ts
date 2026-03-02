import { browser } from '$app/environment';

export interface TrayItem {
	id: string;
	headline: string;
}

function loadFromStorage(): TrayItem[] {
	if (!browser) return [];
	try {
		return JSON.parse(localStorage.getItem('nd-tray') ?? '[]');
	} catch {
		return [];
	}
}

function createTrayStore() {
	let items = $state<TrayItem[]>(loadFromStorage());

	function persist() {
		if (browser) localStorage.setItem('nd-tray', JSON.stringify(items));
	}

	function addItem(id: string, headline: string) {
		const existing = items.findIndex((i) => i.id === id);
		if (existing >= 0) {
			// Update headline in case it changed
			if (items[existing].headline !== headline) {
				items = items.map((i) => (i.id === id ? { id, headline } : i));
				persist();
			}
		} else {
			items = [...items, { id, headline }];
			persist();
		}
	}

	function removeItem(id: string) {
		items = items.filter((i) => i.id !== id);
		persist();
	}

	function clear() {
		items = [];
		persist();
	}

	return {
		get items() {
			return items;
		},
		addItem,
		removeItem,
		clear
	};
}

export const tray = createTrayStore();
