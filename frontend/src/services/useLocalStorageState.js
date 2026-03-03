import { useEffect, useState } from 'react';

export function useLocalStorageState(key, defaultValue) {
	const [value, setValue] = useState(() => {
		try {
			const raw = window.localStorage.getItem(key);
			if (raw == null) return defaultValue;
			return JSON.parse(raw);
		} catch {
			return defaultValue;
		}
	});

	useEffect(() => {
		try {
			window.localStorage.setItem(key, JSON.stringify(value));
		} catch {
			// ignore
		}
	}, [key, value]);

	return [value, setValue];
}
