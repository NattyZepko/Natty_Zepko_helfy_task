const express = require('express');
const cors = require('cors');

const { tasksRouter } = require('./routes/tasksRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { createHttpError } = require('./utils/httpErrors');

const PORT = 4000;

const app = express();

// Keep middleware order boring and predictable:
// 1) CORS + JSON parsing
// 2) API routes
// 3) 404 for anything else
// 4) centralized error handler
app.use(cors());
app.use(express.json());

app.use('/api/tasks', tasksRouter);

app.use((req, res, next) => {
	next(createHttpError(404, 'Route not found'));
});

app.use(errorHandler);

app.listen(PORT, () => {
	// eslint-disable-next-line no-console
	console.log(`Backend listening on http://localhost:${PORT}`);
});
