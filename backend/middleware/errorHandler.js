function errorHandler(err, req, res, next) {
	void req;
	void next;

	// Controllers throw errors with `statusCode` for expected failures.
	// For 500s we intentionally keep the message generic.
	const statusCode = typeof err?.statusCode === 'number' ? err.statusCode : 500;
	const message = statusCode === 500 ? 'Unexpected server error' : err.message;

	res.status(statusCode).json({ error: message });
}

module.exports = { errorHandler };
