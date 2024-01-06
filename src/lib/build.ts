import path from 'path';
import fs from 'fs/promises';
import { createDeild, createNamsskeid, createSchema, dropSchema } from './db.js';
import { lesa } from './readnwrite.js';

export async function getDeildir(): Promise<Array<Deildir>> {
	const filePath = path.join('data', 'index.json');
	try {
		const indexfile = await fs.readFile(filePath, 'utf8');
		return JSON.parse(indexfile);
	} catch (err) {
		console.error('couldnt get deildir', err)
		throw new Error(`${err}`)
	}
}

export type Deildir = {
	title: string,
	description: string,
	csv: string;
};


export async function buildDB(data: Array<Deildir>) {
	await createDB()
	for (const stak of Array.from(data)) {
		const category = (await createDeild(stak)).slug
		const filepath = path.join('data', stak.csv)
		const ArrayofNamsskeid = await lesa(filepath, category)
		try {
			ArrayofNamsskeid.forEach(
				async stak => {
					await createNamsskeid(stak)

				}
			)
			console.info('data inserted', category)
		} catch (err) {
			console.error('data not inserted', category, err)
		}
	}
}

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

export async function gagnagrunn() {
	console.info('Byrja að setja upp gögn í gagnagrunn');
	try {
		await buildDB(await getDeildir());
	} catch (err) {
		console.info('Náði ekki að setja upp gagna grunn', err)
	}
	console.info('Gagnagrunnur uppsettur')
}

gagnagrunn()