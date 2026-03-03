// Tiny fetch wrapper for the backend.
//
// Notes:
// - We call `/api/...` so Vite can proxy to the backend in dev.
// - The backend returns `{ error: "..." }` on failures.

async function parseJsonResponse(response) {
	const contentType = response.headers.get('content-type') || '';
	if (contentType.includes('application/json')) {
		return response.json();
	}
	return null;
}

async function requestJson(url, options) {
	const response = await fetch(url, options);
	const data = await parseJsonResponse(response);

	if (!response.ok) {
		// Keep error messages user-friendly.
		const message = data?.error || `Request failed (${response.status})`;
		throw new Error(message);
	}

	return data;
}

export async function fetchTasks() {
	return requestJson('/api/tasks', { method: 'GET' });
}

export async function createTask({ title, description, priority }) {
	return requestJson('/api/tasks', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ title, description, priority }),
	});
}

export async function updateTask(
	taskId,
	{ title, description, priority, completed },
) {
	return requestJson(`/api/tasks/${taskId}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ title, description, priority, completed }),
	});
}

export async function deleteTask(taskId) {
	const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
	if (!response.ok) {
		const data = await parseJsonResponse(response);
		const message = data?.error || `Delete failed (${response.status})`;
		throw new Error(message);
	}
}

export async function toggleTaskCompletion(taskId) {
	return requestJson(`/api/tasks/${taskId}/toggle`, { method: 'PATCH' });
}
