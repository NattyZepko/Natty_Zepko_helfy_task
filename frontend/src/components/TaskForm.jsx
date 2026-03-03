import { useMemo, useState } from 'react';
import './TaskForm.css';

const emptyValues = {
	title: '',
	description: '',
	priority: 'medium',
};

function validate(values) {
	const errors = {};
	if (!values.title || values.title.trim().length === 0) {
		errors.title = 'Title is required';
	}

	if (values.description == null) {
		errors.description = 'Description is required';
	}

	if (!['low', 'medium', 'high'].includes(values.priority)) {
		errors.priority = 'Priority must be low, medium, or high';
	}

	return errors;
}

export function TaskForm({ mode, initialValues, onSubmit, onCancel }) {
	const normalizedInitial = useMemo(() => {
		if (!initialValues) return emptyValues;
		return {
			title: initialValues.title ?? '',
			description: initialValues.description ?? '',
			priority: initialValues.priority ?? 'medium',
		};
	}, [initialValues]);

	const [values, setValues] = useState(() => normalizedInitial);
	const [touched, setTouched] = useState({});

	const errors = useMemo(() => validate(values), [values]);
	const hasErrors = Object.keys(errors).length > 0;

	function updateField(field, value) {
		setValues((prev) => ({ ...prev, [field]: value }));
	}

	function handleBlur(field) {
		setTouched((prev) => ({ ...prev, [field]: true }));
	}

	function handleSubmit(e) {
		e.preventDefault();
		setTouched({ title: true, description: true, priority: true });
		if (hasErrors) return;
		Promise.resolve(onSubmit(values)).then((ok) => {
			if (mode === 'create' && ok === true) {
				setValues(emptyValues);
				setTouched({});
			}
		});
	}

	return (
		<form className="taskForm" onSubmit={handleSubmit}>
			<label className="taskFormLabel">
				Title
				<input
					className="taskFormInput"
					value={values.title}
					onChange={(e) => updateField('title', e.target.value)}
					onBlur={() => handleBlur('title')}
					placeholder="e.g. Finish report"
				/>
				{touched.title && errors.title ? (
					<span className="taskFormError">{errors.title}</span>
				) : null}
			</label>

			<label className="taskFormLabel">
				Description
				<textarea
					className="taskFormTextarea"
					value={values.description}
					onChange={(e) => updateField('description', e.target.value)}
					onBlur={() => handleBlur('description')}
					placeholder="Details…"
					rows={4}
				/>
				{touched.description && errors.description ? (
					<span className="taskFormError">{errors.description}</span>
				) : null}
			</label>

			<label className="taskFormLabel">
				Priority
				<select
					className="taskFormSelect"
					value={values.priority}
					onChange={(e) => updateField('priority', e.target.value)}
					onBlur={() => handleBlur('priority')}
				>
					<option value="low">Low</option>
					<option value="medium">Medium</option>
					<option value="high">High</option>
				</select>
				{touched.priority && errors.priority ? (
					<span className="taskFormError">{errors.priority}</span>
				) : null}
			</label>

			<div className="taskFormButtons">
				<button className="primaryButton" type="submit">
					{mode === 'edit' ? 'Save changes' : 'Add task'}
				</button>
				{mode === 'edit' ? (
					<button className="secondaryButton" type="button" onClick={onCancel}>
						Cancel
					</button>
				) : null}
			</div>
		</form>
	);
}
