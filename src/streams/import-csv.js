import { parse } from 'csv-parse';
import fs from 'node:fs';
import { finished } from 'node:stream/promises';

const databasePath = new URL('../tasks.csv', import.meta.url);

const processFile = async () => {
	const parser = fs.createReadStream(databasePath).pipe(
		parse({
			from_line: 2,
			skip_empty_lines: true,
			delimiter: ',',
		})
	);
	parser.on('readable', async () => {
		let record;
		while ((record = parser.read()) !== null) {
			const [title, description] = record;
			await fetch('http://localhost:3333/tasks', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json,',
				},
				body: JSON.stringify({
					title,
					description,
				}),
			});
			await wait(6000);
		}
	});

	await finished(parser);
};

processFile();

function wait(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
