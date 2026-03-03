import './TaskItem.css';

function formatCreatedAt(isoString) {
	try {
		const date = new Date(isoString);
		return date.toLocaleString();
	} catch {
		return isoString;
	}
}

export function TaskItem({
	task,
	isActive = false,
	onToggleCompletion,
	onDelete,
	onEdit,
	draggable = false,
	onDragStart,
	onDragEnd,
	onDrop,
}) {
	const canToggle = typeof onToggleCompletion === 'function';
	const canEdit = typeof onEdit === 'function';
	const canDelete = typeof onDelete === 'function';
	const enableHtmlDnD =
		Boolean(draggable) &&
		(typeof onDragStart === 'function' ||
			typeof onDragEnd === 'function' ||
			typeof onDrop === 'function');

	return (
		<article
			className={`taskCard ${isActive ? 'taskCardActive' : ''} ${task.completed ? 'taskCardCompleted' : 'taskCardPending'}`}
			draggable={enableHtmlDnD}
			onDragStart={
				enableHtmlDnD
					? (e) => {
							e.dataTransfer.effectAllowed = 'move';
							try {
								e.dataTransfer.setData('text/plain', String(task.id));
							} catch {
								// ignore
							}
							if (typeof onDragStart === 'function') onDragStart();
						}
					: undefined
			}
			onDragEnd={
				enableHtmlDnD && typeof onDragEnd === 'function' ? onDragEnd : undefined
			}
			onDragOver={enableHtmlDnD ? (e) => e.preventDefault() : undefined}
			onDrop={
				enableHtmlDnD
					? (e) => {
							e.preventDefault();
							if (typeof onDrop === 'function') onDrop();
						}
					: undefined
			}
		>
			<div className="taskCardBody">
				<div className="taskCardTitleRow">
					<h3 className="taskTitle">{task.title}</h3>
					<span className={`priorityBadge priority-${task.priority}`}>
						{task.priority}
					</span>
				</div>
				<p className="taskDescription">{task.description}</p>
			</div>

			<div className="taskMetaRow">
				<span className="taskMeta">
					Created: {formatCreatedAt(task.createdAt)}
				</span>
				<span className="taskMeta">
					Status: {task.completed ? 'Completed' : 'Pending'}
				</span>
			</div>

			<div className="taskActions">
				<button
					className="taskActionButton"
					type="button"
					onClick={canToggle ? onToggleCompletion : undefined}
					disabled={!canToggle}
				>
					{task.completed ? 'Mark pending' : 'Mark done'}
				</button>
				<button
					className="taskActionButton"
					type="button"
					onClick={canEdit ? onEdit : undefined}
					disabled={!canEdit}
				>
					Edit
				</button>
				<button
					className="taskActionButton danger"
					type="button"
					onClick={canDelete ? onDelete : undefined}
					disabled={!canDelete}
				>
					Delete
				</button>
			</div>
		</article>
	);
}
