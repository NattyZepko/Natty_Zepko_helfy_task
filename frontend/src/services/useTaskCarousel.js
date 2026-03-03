import { useEffect, useMemo, useRef, useState } from 'react';

/*
	This hook is the "endless carousel" brain.

	High-level idea:
	- We keep one task "focused" (activeIndex).
	- We render a small window around it (windowTasks) by wrapping indices with modulo.
	- When you click next/prev, we animate one step (shift), then we "snap" state back
	  to shift=0 by moving activeIndex. The user never sees the snap because the
	  transform goes back to the centered position.
	- Drag reorder is pointer-based: we track pointer position and figure out which
	  neighbor you're closest to.
*/

function readPxNumber(value) {
	if (!value) return 0;
	const parsed = Number.parseFloat(value);
	return Number.isNaN(parsed) ? 0 : parsed;
}

function shouldStartDragFromTarget(target) {
	// Don't start a drag if the user is clicking a button/input inside the card.
	if (!(target instanceof Element)) return true;
	return (
		target.closest('button, a, input, textarea, select, [data-no-drag]') == null
	);
}

function computeOverIndex(clientX, slideRefs, startIndex, windowTasks) {
	// Pick the slide whose *center* is closest to the pointer.
	let bestIndex = startIndex;
	let bestDistance = Number.POSITIVE_INFINITY;

	for (let idx = 0; idx < windowTasks.length; idx += 1) {
		const el = slideRefs.current[idx];
		if (!el) continue;
		const rect = el.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const dist = Math.abs(clientX - centerX);
		if (dist < bestDistance) {
			bestDistance = dist;
			bestIndex = idx;
		}
	}

	return bestIndex;
}

export function useTaskCarousel({
	tasks,
	disabled,
	allowReorder,
	onReorderTask,
}) {
	const length = tasks.length;

	const radius = useMemo(() => {
		if (length >= 7) return 3;
		if (length >= 5) return 2;
		if (length >= 3) return 1;
		return 0;
	}, [length]);

	const renderRadius = useMemo(() => {
		// Render a small off-screen buffer so edges don't pop in during animation.
		const buffer = length > 1 ? 2 : 0;
		return radius + buffer;
	}, [radius, length]);

	const [dragState, setDragState] = useState(null);
	const [activeIndex, setActiveIndex] = useState(0);
	const [shift, setShift] = useState(0); // -1 prev, 0 focused, +1 next
	const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
	const [stepPx, setStepPx] = useState(0);
	const [viewportWidthPx, setViewportWidthPx] = useState(0);
	const [slideWidthPx, setSlideWidthPx] = useState(0);
	const [trackGapPx, setTrackGapPx] = useState(12);

	const viewportRef = useRef(null);
	const trackRef = useRef(null);
	const itemRef = useRef(null);
	const transitionRafRef = useRef(0);
	const shiftRef = useRef(shift);
	const focusedTaskIdRef = useRef(null);
	const slideRefs = useRef([]);
	const dragStateRef = useRef(null);

	useEffect(() => {
		shiftRef.current = shift;
	}, [shift]);

	useEffect(() => {
		dragStateRef.current = dragState;
	}, [dragState]);

	const windowTasks = useMemo(() => {
		// This is the little "ring buffer" we actually render.
		// It's what makes the carousel feel infinite without duplicating the whole list.
		if (length === 0) return [];
		const result = [];
		for (let offset = -renderRadius; offset <= renderRadius; offset += 1) {
			const idx = (activeIndex + offset + length) % length;
			result.push(tasks[idx]);
		}
		return result;
	}, [tasks, length, activeIndex, renderRadius]);

	useEffect(() => {
		// Remember the currently focused task id so we can keep focus stable
		// if the list gets filtered/reordered.
		if (length === 0) {
			focusedTaskIdRef.current = null;
			return;
		}
		focusedTaskIdRef.current = tasks[activeIndex]?.id ?? null;
	}, [tasks, length, activeIndex]);

	useEffect(() => {
		function measure() {
			// Measure the actual slide width + gap so our translateX math stays correct.
			const viewport = viewportRef.current;
			const track = trackRef.current;
			const item = itemRef.current;
			if (!viewport || !track || !item) return;

			const viewportRect = viewport.getBoundingClientRect();
			const itemRect = item.getBoundingClientRect();
			const styles = window.getComputedStyle(track);
			const gap = readPxNumber(styles.columnGap || styles.gap) || 12;
			const step = itemRect.width + gap;
			if (!Number.isFinite(step) || step <= 0) return;

			setViewportWidthPx(viewportRect.width);
			setSlideWidthPx(itemRect.width);
			setTrackGapPx(gap);
			setStepPx(step);
		}

		measure();
		window.addEventListener('resize', measure);
		return () => window.removeEventListener('resize', measure);
	}, [length, renderRadius]);

	useEffect(() => {
		return () => {
			if (transitionRafRef.current) {
				window.cancelAnimationFrame(transitionRafRef.current);
			}
		};
	}, []);

	useEffect(() => {
		// Try to keep the same task focused when the list changes.
		const focusedId = focusedTaskIdRef.current;

		let raf2 = 0;
		const raf1 = window.requestAnimationFrame(() => {
			let nextIndex = 0;

			if (length > 0 && focusedId != null) {
				const found = tasks.findIndex((t) => t.id === focusedId);
				if (found !== -1) nextIndex = found;
			}

			setIsTransitionEnabled(false);
			setShift(0);
			setActiveIndex(nextIndex);

			// Re-enable transitions on the next frame so we don't animate the "snap".
			raf2 = window.requestAnimationFrame(() => {
				setIsTransitionEnabled(true);
			});
		});

		return () => {
			window.cancelAnimationFrame(raf1);
			if (raf2) window.cancelAnimationFrame(raf2);
		};
	}, [length, tasks]);

	const isDragging = dragState != null;
	const canNavigate = length > 1 && !disabled && !isDragging;
	const canReorder = allowReorder && !disabled && length > 1;

	function goByStep(direction) {
		// Only allow one step at a time; prevents piling up transforms mid-animation.
		if (!canNavigate) return;
		if (shiftRef.current !== 0) return;
		setIsTransitionEnabled(true);
		setShift(direction);
	}

	function goNext() {
		if (!canNavigate) return;
		goByStep(1);
	}

	function goPrevious() {
		if (!canNavigate) return;
		goByStep(-1);
	}

	function handlePointerDown(e, task, indexInWindow) {
		// Pointer-based drag. We store enough info to render the floating preview.
		if (!canReorder) return;
		if (shiftRef.current !== 0) return;
		if (!shouldStartDragFromTarget(e.target)) return;

		const slideEl = slideRefs.current[indexInWindow];
		if (!slideEl) return;
		const rect = slideEl.getBoundingClientRect();

		e.preventDefault();
		try {
			slideEl.setPointerCapture(e.pointerId);
		} catch {
			// ignore
		}

		setDragState({
			pointerId: e.pointerId,
			task,
			taskId: task.id,
			startIndex: indexInWindow,
			overIndex: indexInWindow,
			offsetX: e.clientX - rect.left,
			offsetY: e.clientY - rect.top,
			x: rect.left,
			y: rect.top,
			width: rect.width,
			height: rect.height,
		});
	}

	useEffect(() => {
		if (!dragState) return;

		// TODO: This logic works but is a bit hairy. Might extract more later.
		function onPointerMove(e) {
			const current = dragStateRef.current;
			if (!current) return;
			if (e.pointerId !== current.pointerId) return;

			const nextOver = computeOverIndex(
				e.clientX,
				slideRefs,
				current.startIndex,
				windowTasks,
			);

			setDragState((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					overIndex: nextOver,
					x: e.clientX - prev.offsetX,
					y: e.clientY - prev.offsetY,
				};
			});
		}

		function finishDrag(e) {
			const current = dragStateRef.current;
			if (!current) return;
			if (e.pointerId !== current.pointerId) return;

			setDragState(null);

			if (!canReorder) return;
			if (typeof onReorderTask !== 'function') return;
			if (current.overIndex === current.startIndex) return;
			const targetTask = windowTasks[current.overIndex];
			if (!targetTask) return;
			if (targetTask.id === current.taskId) return;
			onReorderTask(current.taskId, targetTask.id);
		}

		document.addEventListener('pointermove', onPointerMove, { passive: true });
		document.addEventListener('pointerup', finishDrag, { passive: true });
		document.addEventListener('pointercancel', finishDrag, { passive: true });
		return () => {
			document.removeEventListener('pointermove', onPointerMove);
			document.removeEventListener('pointerup', finishDrag);
			document.removeEventListener('pointercancel', finishDrag);
		};
	}, [dragState, windowTasks, canReorder, onReorderTask]);

	function handleTransitionEnd() {
		// This is the "infinite" trick:
		// - While animating we shift the track by 1 slide.
		// - When animation ends we update activeIndex and reset shift back to 0
		//   with transitions disabled, so the track is centered again.
		if (length <= 1) return;
		if (shift === 0) return;

		setIsTransitionEnabled(false);
		setActiveIndex((prev) => (prev + shift + length) % length);
		setShift(0);
		transitionRafRef.current = window.requestAnimationFrame(() => {
			setIsTransitionEnabled(true);
		});
	}

	const centerOffsetPx =
		viewportWidthPx > 0 ? viewportWidthPx / 2 - slideWidthPx / 2 : 0;
	const baseTranslatePx =
		stepPx > 0 ? -(renderRadius * stepPx) + centerOffsetPx : 0;
	const translateXPx = stepPx > 0 ? baseTranslatePx - shift * stepPx : 0;

	return {
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
	};
}
