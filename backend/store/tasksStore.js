// In-memory store: super simple, but resets whenever the server restarts.
const tasks = [];
let nextId = 1;

function getAllTasks() {
	return tasks;
}

function createTask({ title, description, priority }) {
	// Keep task shape stable; the frontend relies on these fields.
	const newTask = {
		id: nextId,
		title,
		description,
		completed: false,
		createdAt: new Date(),
		priority,
	};

	tasks.push(newTask);
	nextId += 1;
	return newTask;
}

function findTaskIndexById(id) {
	return tasks.findIndex((task) => task.id === id);
}

function replaceTaskById(id, { title, description, priority, completed }) {
	const taskIndex = findTaskIndexById(id);
	if (taskIndex === -1) return null;

	const existingTask = tasks[taskIndex];
	const updatedTask = {
		...existingTask,
		title,
		description,
		priority,
		completed,
	};

	tasks[taskIndex] = updatedTask;
	return updatedTask;
}

function deleteTaskById(id) {
	const taskIndex = findTaskIndexById(id);
	if (taskIndex === -1) return false;

	tasks.splice(taskIndex, 1);
	return true;
}

function toggleTaskCompletionById(id) {
	const taskIndex = findTaskIndexById(id);
	if (taskIndex === -1) return null;

	const existingTask = tasks[taskIndex];
	const updatedTask = { ...existingTask, completed: !existingTask.completed };
	tasks[taskIndex] = updatedTask;
	return updatedTask;
}

module.exports = {
	getAllTasks,
	createTask,
	replaceTaskById,
	deleteTaskById,
	toggleTaskCompletionById,
};
