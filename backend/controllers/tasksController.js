const {
	getAllTasks,
	createTask,
	replaceTaskById,
	deleteTaskById,
	toggleTaskCompletionById,
} = require('../store/tasksStore');

const {
	parseTaskIdParam,
	validateNewTaskInput,
	validateReplaceTaskInput,
} = require('../validators/taskValidators');

const { createHttpError } = require('../utils/httpErrors');

function applyTaskQueryFilters(tasks, query) {
	// Placeholder: we don't filter on the backend yet.
	// It's here because it's a nice seam if we ever add query params.
	void query;
	return tasks;
}

async function handleGetTasks(req, res, next) {
	try {
		const tasks = getAllTasks();
		const filteredTasks = applyTaskQueryFilters(tasks, req.query);
		res.status(200).json(filteredTasks);
	} catch (error) {
		next(error);
	}
}

async function handleCreateTask(req, res, next) {
	try {
		const validationError = validateNewTaskInput(req.body);
		if (validationError) {
			throw createHttpError(400, validationError);
		}

		const newTask = createTask({
			title: req.body.title,
			description: req.body.description,
			priority: req.body.priority,
		});

		res.status(201).json(newTask);
	} catch (error) {
		next(error);
	}
}

async function handleReplaceTask(req, res, next) {
	try {
		const taskId = parseTaskIdParam(req.params.id);
		if (!taskId) {
			throw createHttpError(400, 'Task id must be a positive integer');
		}

		const validationError = validateReplaceTaskInput(req.body);
		if (validationError) {
			throw createHttpError(400, validationError);
		}

		const updatedTask = replaceTaskById(taskId, {
			title: req.body.title,
			description: req.body.description,
			priority: req.body.priority,
			completed: req.body.completed,
		});

		if (!updatedTask) {
			throw createHttpError(404, 'Task not found');
		}

		res.status(200).json(updatedTask);
	} catch (error) {
		next(error);
	}
}

async function handleDeleteTask(req, res, next) {
	try {
		const taskId = parseTaskIdParam(req.params.id);
		if (!taskId) {
			throw createHttpError(400, 'Task id must be a positive integer');
		}

		const deleted = deleteTaskById(taskId);
		if (!deleted) {
			throw createHttpError(404, 'Task not found');
		}

		res.status(204).send();
	} catch (error) {
		next(error);
	}
}

async function handleToggleTaskCompletion(req, res, next) {
	try {
		const taskId = parseTaskIdParam(req.params.id);
		if (!taskId) {
			throw createHttpError(400, 'Task id must be a positive integer');
		}

		const updatedTask = toggleTaskCompletionById(taskId);
		if (!updatedTask) {
			throw createHttpError(404, 'Task not found');
		}

		res.status(200).json(updatedTask);
	} catch (error) {
		next(error);
	}
}

module.exports = {
	handleGetTasks,
	handleCreateTask,
	handleReplaceTask,
	handleDeleteTask,
	handleToggleTaskCompletion,
};
