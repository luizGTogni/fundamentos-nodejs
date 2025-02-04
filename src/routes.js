import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database();

export const routes = [
	{
		method: 'GET',
		path: buildRoutePath('/tasks'),
		handler: (req, res) => {
			const { text } = req.query;

			const tasks = database.select(
				'tasks',
				text ? { title: text, description: text } : null
			);

			return res.end(JSON.stringify(tasks));
		},
	},
	{
		method: 'POST',
		path: buildRoutePath('/tasks'),
		handler: (req, res) => {
			const { title, description } = req.body;

			if (!title) {
				return res
					.writeHead(400)
					.end(JSON.stringify({ message: 'title is required' }));
			}

			if (!description) {
				return res
					.writeHead(400)
					.end(JSON.stringify({ message: 'description is required' }));
			}

			const task = {
				id: randomUUID(),
				title,
				description,
				completed_at: null,
				created_at: new Date(),
				updated_at: new Date(),
			};

			database.insert('tasks', task);

			return res.writeHead(201).end();
		},
	},
	{
		method: 'PUT',
		path: buildRoutePath('/tasks/:id'),
		handler: (req, res) => {
			const { id } = req.params;
			const { title, description } = req.body;

			let data = { title, description };

			if (!title && !description) {
				return res.writeHead(400).end(
					JSON.stringify({
						message: 'At least one field must be filled in.',
					})
				);
			}

			const task = database.selectById('tasks', id);

			if (!task) {
				return res.writeHead(404).end();
			}

			database.update('tasks', id, {
				title: title ?? task.title,
				description: description ?? task.description,
				updated_at: new Date(),
			});

			return res.writeHead(204).end();
		},
	},
	{
		method: 'PATCH',
		path: buildRoutePath('/tasks/:id/complete'),
		handler: (req, res) => {
			const { id } = req.params;

			const task = database.selectById('tasks', id);

			if (!task) {
				return res.writeHead(404).end();
			}

			const isTaskCompleted = !!task.completed_at;
			const completed_at = isTaskCompleted ? null : new Date();

			database.update('tasks', id, { completed_at });
			return res.writeHead(204).end();
		},
	},
	{
		method: 'DELETE',
		path: buildRoutePath('/tasks/:id'),
		handler: (req, res) => {
			const { id } = req.params;

			const task = database.selectById('tasks', id);

			if (!task) {
				return res.writeHead(404).end();
			}

			database.delete('tasks', id);
			return res.writeHead(204).end();
		},
	},
];
