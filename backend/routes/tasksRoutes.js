const express = require('express');

const {
	handleGetTasks,
	handleCreateTask,
	handleReplaceTask,
	handleDeleteTask,
	handleToggleTaskCompletion,
} = require('../controllers/tasksController');

const tasksRouter = express.Router();

// Routes are intentionally thin: they just map URL -> controller.
// Validation + business logic lives in the controller/store.

tasksRouter.get('/', handleGetTasks);
tasksRouter.post('/', handleCreateTask);
tasksRouter.put('/:id', handleReplaceTask);
tasksRouter.delete('/:id', handleDeleteTask);
tasksRouter.patch('/:id/toggle', handleToggleTaskCompletion);

module.exports = { tasksRouter };
