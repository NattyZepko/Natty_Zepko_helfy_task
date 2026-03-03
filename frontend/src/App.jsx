import { useEffect, useMemo, useState } from 'react';
import './styles/App.css';

import {
	createTask,
	deleteTask,
	fetchTasks,
	toggleTaskCompletion,
	updateTask,
} from './services/tasksApi';

import { useLocalStorageState } from './services/useLocalStorageState';

import { TaskFilter } from './components/TaskFilter';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';

function getErrorMessage(error, fallback) {
	if (error && typeof error === 'object' && 'message' in error) {
		const message = error.message;
		if (typeof message === 'string' && message.trim().length > 0)
			return message;
	}
	return fallback;
}

function moveIdBeforeTarget(orderIds, sourceId, targetId) {
	if (sourceId === targetId) return orderIds;
	if (!orderIds.includes(sourceId) || !orderIds.includes(targetId))
		return orderIds;

	const withoutSource = orderIds.filter((id) => id !== sourceId);
	const targetIndex = withoutSource.indexOf(targetId);
	if (targetIndex === -1) return orderIds;

	const nextOrder = withoutSource.slice();
	nextOrder.splice(targetIndex, 0, sourceId);
	return nextOrder;
}

export default function App() {
	const [tasks, setTasks] = useState([]);
	const [taskOrderIds, setTaskOrderIds] = useState([]);
	const [loading, setLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	const [completionFilter, setCompletionFilter] = useState('all');
	const [priorityFilter, setPriorityFilter] = useState('all');
	const [orderBy, setOrderBy] = useState('manual');
	const [searchQuery, setSearchQuery] = useState('');

	const [editingTaskId, setEditingTaskId] = useState(null);
	const [theme, setTheme] = useLocalStorageState('task-manager-theme', 'light');

	useEffect(() => {
		document.documentElement.classList.toggle('theme-dark', theme === 'dark');
		document.documentElement.classList.toggle('theme-light', theme !== 'dark');
	}, [theme]);

	useEffect(() => {
		let cancelled = false;

		async function loadTasks() {
			setLoading(true);
			setErrorMessage('');

			try {
				const loadedTasks = await fetchTasks();
				if (cancelled) return;

				setTasks(loadedTasks);
				setTaskOrderIds(loadedTasks.map((task) => task.id));
			} catch (error) {
				if (cancelled) return;
				setErrorMessage(getErrorMessage(error, 'Failed to load tasks'));
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		loadTasks();
		return () => {
			cancelled = true;
		};
	}, []);

	const tasksById = useMemo(() => {
		const map = new Map();
		for (const task of tasks) map.set(task.id, task);
		return map;
	}, [tasks]);

	const orderedTasks = useMemo(() => {
		const ordered = [];
		const seen = new Set();

		for (const id of taskOrderIds) {
			const task = tasksById.get(id);
			if (task) {
				ordered.push(task);
				seen.add(id);
			}
		}

		for (const task of tasks) {
			if (!seen.has(task.id)) ordered.push(task);
		}

		return ordered;
	}, [taskOrderIds, tasksById, tasks]);

	const visibleTasks = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();

		let filtered = orderedTasks;

		if (completionFilter !== 'all') {
			const shouldBeCompleted = completionFilter === 'completed';
			filtered = filtered.filter(
				(task) => task.completed === shouldBeCompleted,
			);
		}

		if (priorityFilter !== 'all') {
			filtered = filtered.filter((task) => task.priority === priorityFilter);
		}

		if (normalizedQuery.length > 0) {
			filtered = filtered.filter((task) => {
				const titleMatch = task.title.toLowerCase().includes(normalizedQuery);
				const descriptionMatch = task.description
					.toLowerCase()
					.includes(normalizedQuery);
				return titleMatch || descriptionMatch;
			});
		}

		if (orderBy === 'date-asc') {
			filtered = filtered
				.slice()
				.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
		} else if (orderBy === 'date-desc') {
			filtered = filtered
				.slice()
				.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
		} else if (orderBy === 'priority') {
			const priorityRank = { high: 0, medium: 1, low: 2 };
			filtered = filtered
				.slice()
				.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
		} else if (orderBy === 'status') {
			filtered = filtered.slice().sort((a, b) => {
				const aRank = a.completed ? 1 : 0;
				const bRank = b.completed ? 1 : 0;
				return aRank - bRank;
			});
		}

		return filtered;
	}, [orderedTasks, completionFilter, priorityFilter, orderBy, searchQuery]);

	const editingTask = useMemo(() => {
		if (editingTaskId == null) return null;
		return tasksById.get(editingTaskId) || null;
	}, [editingTaskId, tasksById]);

	async function handleCreateTaskSubmit(values) {
		setErrorMessage('');
		try {
			const created = await createTask(values);
			setTasks((prev) => prev.concat(created));
			setTaskOrderIds((prev) => prev.concat(created.id));
			return true;
		} catch (error) {
			setErrorMessage(getErrorMessage(error, 'Failed to create task'));
			return false;
		}
	}

	async function handleEditTaskSubmit(values) {
		if (!editingTask) return;
		setErrorMessage('');

		try {
			const updated = await updateTask(editingTask.id, {
				...values,
				completed: editingTask.completed,
			});

			setTasks((prev) =>
				prev.map((task) => (task.id === updated.id ? updated : task)),
			);
			setEditingTaskId(null);
			return true;
		} catch (error) {
			setErrorMessage(getErrorMessage(error, 'Failed to update task'));
			return false;
		}
	}

	async function handleDeleteTask(taskId) {
		setErrorMessage('');

		try {
			await deleteTask(taskId);
			setTasks((prev) => prev.filter((task) => task.id !== taskId));
			setTaskOrderIds((prev) => prev.filter((id) => id !== taskId));
			setEditingTaskId((prev) => (prev === taskId ? null : prev));
		} catch (error) {
			setErrorMessage(getErrorMessage(error, 'Failed to delete task'));
		}
	}

	async function handleToggleTaskCompletion(taskId) {
		setErrorMessage('');

		try {
			const updated = await toggleTaskCompletion(taskId);
			setTasks((prev) =>
				prev.map((task) => (task.id === updated.id ? updated : task)),
			);
		} catch (error) {
			setErrorMessage(getErrorMessage(error, 'Failed to toggle completion'));
		}
	}

	function handleStartEditTask(taskId) {
		setEditingTaskId(taskId);
	}

	function handleCancelEdit() {
		setEditingTaskId(null);
	}

	function handleReorderTask(sourceTaskId, targetTaskId) {
		setTaskOrderIds((prev) =>
			moveIdBeforeTarget(prev, sourceTaskId, targetTaskId),
		);
	}

	function handleThemeToggle() {
		setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
	}

	return (
		<div className="app">
			<header className="appHeader">
				<div className="appHeaderTitle">
					<h1 className="appTitle">Natty's Task Manager - Helfy Assignment</h1>
					<p className="appSubtitle">
						Create tasks, filter them, reorder them, and browse them in a
						carousel
					</p>
				</div>

				<button
					type="button"
					className="themeToggle"
					onClick={handleThemeToggle}
				>
					Theme: {theme === 'dark' ? 'Dark' : 'Light'}
				</button>
			</header>

			{errorMessage ? <div className="errorBanner">{errorMessage}</div> : null}

			<div className="appGrid">
				<section className="panel">
					<h2 className="panelTitle">Find tasks</h2>
					<TaskFilter
						completionFilter={completionFilter}
						onChangeCompletionFilter={setCompletionFilter}
						priorityFilter={priorityFilter}
						onChangePriorityFilter={setPriorityFilter}
						orderBy={orderBy}
						onChangeOrderBy={setOrderBy}
						searchQuery={searchQuery}
						onChangeSearchQuery={setSearchQuery}
					/>
				</section>

				<section className="panel">
					<h2 className="panelTitle">
						{editingTask ? 'Edit task' : 'Create task'}
					</h2>
					<TaskForm
						key={editingTask ? `edit-${editingTask.id}` : 'create'}
						mode={editingTask ? 'edit' : 'create'}
						initialValues={editingTask}
						onSubmit={
							editingTask ? handleEditTaskSubmit : handleCreateTaskSubmit
						}
						onCancel={editingTask ? handleCancelEdit : null}
					/>
				</section>
			</div>

			<section className="panel panelWide">
				<div className="panelHeaderRow">
					<h2 className="panelTitle">Tasks</h2>
					{loading ? (
						<span className="subtle">Loading…</span>
					) : (
						<span className="subtle">
							{visibleTasks.length === 0
								? 'No tasks to show'
								: visibleTasks.length === 1
									? 'One task'
									: `${visibleTasks.length} tasks`}
						</span>
					)}
				</div>

				<TaskList
					tasks={visibleTasks}
					onToggleCompletion={handleToggleTaskCompletion}
					onDeleteTask={handleDeleteTask}
					onEditTask={handleStartEditTask}
					onReorderTask={handleReorderTask}
					allowReorder={orderBy === 'manual'}
					disabled={loading}
				/>
			</section>
		</div>
	);
}
