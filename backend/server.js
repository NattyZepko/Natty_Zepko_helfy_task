const express = require('express');
const cors = require('cors');

const { tasksRouter } = require('./routes/tasksRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { createHttpError } = require('./utils/httpErrors');

const PORT = 4000;

const app = express();

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
