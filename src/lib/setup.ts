import { readFile } from 'fs/promises';
import { createSchema, dropSchema, end, query } from './db.js';

export async function createDB() {
	const drop = await dropSchema();

	if (drop) {
		console.info('schema dropped');
	} else {
		console.info('schema not dropped, exiting');
		process.exit(-1)
	}

	const result = await createSchema();

	if (result) {
		console.info('schema created');
	} else {
		console.info('schema not created')
	}
}