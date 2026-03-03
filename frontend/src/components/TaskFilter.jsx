import './TaskFilter.css';

export function TaskFilter({
	completionFilter,
	onChangeCompletionFilter,
	priorityFilter,
	onChangePriorityFilter,
	orderBy,
	onChangeOrderBy,
	searchQuery,
	onChangeSearchQuery,
}) {
	return (
		<div className="taskFilter">
			<div className="taskFilterSection">
				<p className="taskFilterSectionTitle">Filters</p>
				<div className="taskFilterRow">
					<label className="taskFilterLabel">
						Completion status
						<select
							className="taskFilterSelect"
							value={completionFilter}
							onChange={(e) => onChangeCompletionFilter(e.target.value)}
						>
							<option value="all">All</option>
							<option value="completed">Completed</option>
							<option value="pending">Pending</option>
						</select>
					</label>

					<label className="taskFilterLabel">
						Priority
						<select
							className="taskFilterSelect"
							value={priorityFilter}
							onChange={(e) => onChangePriorityFilter(e.target.value)}
						>
							<option value="all">All</option>
							<option value="low">Low</option>
							<option value="medium">Medium</option>
							<option value="high">High</option>
						</select>
					</label>
				</div>

				<div className="taskFilterRow">
					<label className="taskFilterLabel">
						Search
						<input
							className="taskFilterInput"
							value={searchQuery}
							onChange={(e) => onChangeSearchQuery(e.target.value)}
							placeholder="Title or description…"
						/>
					</label>
				</div>
			</div>

			<div className="taskFilterSection">
				<p className="taskFilterSectionTitle">Ordering</p>
				<div className="taskFilterRow">
					<label className="taskFilterLabel">
						Order by
						<select
							className="taskFilterSelect"
							value={orderBy}
							onChange={(e) => onChangeOrderBy(e.target.value)}
						>
							<option value="manual">Manual</option>
							<option value="date-asc">Date (Ascending)</option>
							<option value="date-desc">Date (Descending)</option>
							<option value="priority">Priority</option>
							<option value="status">Status</option>
						</select>
					</label>
				</div>
			</div>
		</div>
	);
}
