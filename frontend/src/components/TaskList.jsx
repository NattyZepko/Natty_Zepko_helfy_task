import { useTaskCarousel } from '../services/useTaskCarousel';
import { TaskItem } from './TaskItem';
import './TaskList.css';

export function TaskList({
	tasks,
	onToggleCompletion,
	onDeleteTask,
	onEditTask,
	onReorderTask,
	allowReorder,
	disabled,
}) {
	const {
		length,
		renderRadius,
		windowTasks,
		dragState,
		canNavigate,
		canReorder,
		isTransitionEnabled,
		shift,
		stepPx,
		trackGapPx,
		translateXPx,
		viewportRef,
		trackRef,
		itemRef,
		slideRefs,
		goNext,
		goPrevious,
		handlePointerDown,
		handleTransitionEnd,
	} = useTaskCarousel({
		tasks,
		disabled,
		allowReorder,
		onReorderTask,
	});

	if (length === 0) {
		return (
			<div className="emptyState">
				<p className="emptyTitle">No tasks yet</p>
				<p className="emptySubtitle">Create a task above to get started.</p>
			</div>
		);
	}

	return (
		<div className="taskCarousel">
			<div className="carouselControls">
				<button
					className="carouselButton"
					onClick={goPrevious}
					disabled={!canNavigate}
					type="button"
				>
					◀
				</button>
				<button
					className="carouselButton"
					onClick={goNext}
					disabled={!canNavigate}
					type="button"
				>
					▶
				</button>
			</div>

			<div className="carouselViewport" ref={viewportRef}>
				<div
					className={`carouselTrack ${isTransitionEnabled && shift !== 0 ? 'carouselTrackAnimate' : ''}`}
					ref={trackRef}
					style={{
						transform: `translateX(${translateXPx}px)`,
						gap: `${trackGapPx}px`,
					}}
					onTransitionEnd={handleTransitionEnd}
				>
					{windowTasks.map((task, idx) => {
						const distance = Math.abs(idx - renderRadius);
						const isFocused = idx === renderRadius;
						const isNear = distance === 1;
						const isFar = distance === 2;
						const isDragSource = dragState?.startIndex === idx;
						const isDraggingNow = dragState?.taskId === task.id;

						let scoochPx = 0;
						if (dragState) {
							const { startIndex, overIndex } = dragState;
							if (overIndex > startIndex) {
								if (idx > startIndex && idx <= overIndex) scoochPx = -stepPx;
							} else if (overIndex < startIndex) {
								if (idx >= overIndex && idx < startIndex) scoochPx = stepPx;
							}
						}

						return (
							<div
								key={`${task.id}-${idx}`}
								className={`carouselSlide ${isDragSource ? 'isDragSource' : ''}`}
								ref={(el) => {
									slideRefs.current[idx] = el;
									if (idx === renderRadius) itemRef.current = el;
								}}
								style={{
									transform: scoochPx ? `translateX(${scoochPx}px)` : undefined,
								}}
								onPointerDown={(e) => handlePointerDown(e, task, idx)}
							>
								<div
									className={`carouselSlideInner ${isFocused ? 'isFocused' : ''} ${isNear ? 'isNear' : ''} ${isFar ? 'isFar' : ''} ${isDraggingNow ? 'isDraggingNow' : ''}`}
								>
									<TaskItem
										task={task}
										isActive={isFocused}
										onToggleCompletion={() => onToggleCompletion(task.id)}
										onDelete={() => onDeleteTask(task.id)}
										onEdit={() => onEditTask(task.id)}
									/>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{dragState ? (
				<div
					className="dragPreview"
					style={{
						left: `${dragState.x}px`,
						top: `${dragState.y}px`,
						width: `${dragState.width}px`,
						height: `${dragState.height}px`,
					}}
				>
					<TaskItem task={dragState.task} isActive />
				</div>
			) : null}

			<p className="carouselHint">
				{canReorder
					? 'Drag a card onto another to reorder (Manual order only).'
					: 'Reordering is available in "Manual" order.'}
			</p>
		</div>
	);
}
