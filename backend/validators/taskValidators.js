const allowedPriorities = new Set(['low', 'medium', 'high']);

function isNonEmptyString(value) {
	return typeof value === 'string' && value.trim().length > 0;
}

function isString(value) {
	return typeof value === 'string';
}

function isBoolean(value) {
	return typeof value === 'boolean';
}

function parseTaskIdParam(idParam) {
	const id = Number(idParam);
	if (!Number.isInteger(id) || id <= 0) return null;
	return id;
}

function validateNewTaskInput(body) {
	if (!body || typeof body !== 'object') {
		return 'Request body must be a JSON object';
	}

	if (!isNonEmptyString(body.title)) {
		return 'Title is required and must be a non-empty string';
	}

	if (
		!Object.prototype.hasOwnProperty.call(body, 'description') ||
		!isString(body.description)
	) {
		return 'Description is required and must be a string';
	}

	if (!allowedPriorities.has(body.priority)) {
		return "Priority is required and must be one of 'low', 'medium', or 'high'";
	}

	return null;
}

function validateReplaceTaskInput(body) {
	if (!body || typeof body !== 'object') {
		return 'Request body must be a JSON object';
	}

	if (!isNonEmptyString(body.title)) {
		return 'Title is required and must be a non-empty string';
	}

	if (
		!Object.prototype.hasOwnProperty.call(body, 'description') ||
		!isString(body.description)
	) {
		return 'Description is required and must be a string';
	}

	if (!allowedPriorities.has(body.priority)) {
		return "Priority is required and must be one of 'low', 'medium', or 'high'";
	}

	if (
		!Object.prototype.hasOwnProperty.call(body, 'completed') ||
		!isBoolean(body.completed)
	) {
		return 'Completed is required and must be a boolean';
	}

	return null;
}

module.exports = {
	parseTaskIdParam,
	validateNewTaskInput,
	validateReplaceTaskInput,
};
