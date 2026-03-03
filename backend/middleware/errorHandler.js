function errorHandler(err, req, res, next) {
	void req;
	void next;

	const statusCode = typeof err?.statusCode === 'number' ? err.statusCode : 500;
	const message = statusCode === 500 ? 'Unexpected server error' : err.message;

	res.status(statusCode).json({ error: message });
}

module.exports = { errorHandler };
