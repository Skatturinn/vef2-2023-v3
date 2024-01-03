import path from 'path';
import fs from 'fs/promises';
import { createDeild, createNamsskeid, createSchema, dropSchema, end, query } from './db.js';
import { lesa, Namsskeid } from './readnwrite.js';
// import { tabletemplate, template } from './html.js';
// import { skrifa } from './readandwrite.js';
// import { isPathValid } from './prufur.js';

// File path
const filePath = path.join('data', 'index.json');

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
	await end()
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
// const direct = path.join('dist');
// let a = await isPathValid(direct)
// if (!a) {
// 	fs.mkdir(direct)
// }
// Athugum hvort index.json object yfir deildir sé gilt, skrifum svo skrárnar
// if (indexfile) {
// 	const loford = indexfile.map(async (stak) => {
// 		const table = tabletemplate(await skrifa(path.join('data', stak.csv)))
// 		const header = `<h1>${stak.title}</h1>
// 		<p>${stak.description}</p>`
// 		const htmlstrengur = template(stak.title, header, table, `<a href="/" class="tbaka">Til baka</a>`)
// 		const href = `${stak.csv.slice(0, -3)}html`;
// 		fs.writeFile(path.join('dist', href), htmlstrengur);
// 		return `<li class="card">
// 		<a href='./${href}'>
// 		<h2>${stak.title}</h2>
// 		<p>${stak.description}</p>
// 		</a>
// 	</li>`;
// 	});
// 	Promise.all(loford).then(stak => {
// 		const indexstrengur = `<ul class="cardtainer">
// 		${stak.join('')}
// 		</ul>`;
// 		const indextitle = 'Vefforitun kennsluskrá HÍ';
// 		const wfile = template(indextitle, `<h1>${indextitle}</h1><p>Vef2-23-v1</p>`, indexstrengur,
// 			``);
// 		fs.writeFile(path.join('dist', 'index.html'), wfile);
// 	})
// }