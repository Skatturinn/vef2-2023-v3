import { readFile } from 'fs/promises';
import pg from 'pg';
import dotenv from 'dotenv';
import { Deildir } from './build';
import { Namsskeid } from './readnwrite';

dotenv.config()

const SCHEMA_FILE = './sql/schema.sql';
const DROP_SCHEMA_FILE = './sql/drop.sql';
// DATABASE_URL = 'postgres://Notandi:ShoheiOhtani700M@localhost:5432/vef2-2022-v2'
const { DATABASE_URL: connectionString, NODE_ENV: nodeEnv = 'development' } =
	process.env;

if (!connectionString) {
	console.error('vantar DATABASE_URL í .env');
	process.exit(-1);
}

// Notum SSL tengingu við gagnagrunn ef við erum *ekki* í development
// mode, á heroku, ekki á local vél
const ssl = nodeEnv === 'production' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err: Error) => {
	console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
	process.exit(-1);
});

type QueryInput = string | number | null | Array<string>;

export async function query(q: string, values: Array<QueryInput> = []) {
	let client;
	try {
		client = await pool.connect();
	} catch (e) {
		console.error('unable to get client from pool', e);
		return null;
	}

	try {
		const result = await client.query(q, values);
		return result;
	} catch (e) {
		if (nodeEnv !== 'test') {
			console.error('unable to query', e);
		}
		return null;
	} finally {
		client.release();
	}
}

export async function createSchema(schemaFile = SCHEMA_FILE) {
	const data = await readFile(schemaFile);

	return query(data.toString('utf-8'));
}

export async function dropSchema(dropFile = DROP_SCHEMA_FILE) {
	const data = await readFile(dropFile);

	return query(data.toString('utf-8'));
}

export async function end() {
	await pool.end();
}

function qstring(table: string, strengur: string) {
	let a = ``;
	// console.log('a', strengur, 'q')
	if (strengur) {
		a += `WHERE ${strengur}`;
	}
	// console.log(q)
	return `SELECT * FROM ${table} ${a};`;

}

export async function createDeild({ title, description, csv }: Deildir) {
	const slug = csv.split('.')[0];
	const q = `
	  INSERT INTO deild
		(name, description, slug)
	  VALUES
		($1, $2, $3)
	  RETURNING slug;
	`;
	const values = [title, description, slug];
	const result = await query(q, values);
	if (result && result.rowCount === 1) {
		return result.rows[0];
	}

	return null;
}
export type sqlDeildir = {
	name: string,
	description: string,
	slug: string,
	created: Date | null,
	updated: Date | null;
}
export async function getDeild({ name = '', description = '', slug = '', created = null, updated = null }: sqlDeildir): Promise<Array<mappedDeildir> | mappedDeildir> {
	if (created || updated || description) {
		throw new Error('Ekki í boði að sækja aftir þessum stikum, Heiti eða slug leyfileg')
	}
	const input = [name, slug];
	const queryinput = ['name', 'slug']
	let strengur = '';
	const values: Array<string | number> = [];
	let count = 0;
	input.forEach((stak, index) => {
		if (stak) {
			count += 1;
			strengur += (strengur) ? `, ${queryinput[index]} = $${count}` : `${queryinput[index]} = $${count}`;
			values.push(stak)
		}
	})
	const q = qstring('deild', strengur);
	const result = await query(q, values);
	if (result && result.rowCount) {
		return result.rowCount === 1 ? result.rows[0] : result.rows
	}

	throw new Error(`Error with query: ${q}`);
}
export async function createNamsskeid({ Numer, Heiti, Einingar, Kennslumisseri, Namstig, Vefsida, category }: Namsskeid) {
	const q = `
	  INSERT INTO namsskeid
		(numer, name, category, einingar, kennslumisseri, namstig, vefsida)
	  VALUES
		($1, $2, $3, $4, $5, $6, $7)
	  RETURNING id;
	`;
	const values = [Numer, Heiti, category, Einingar, Kennslumisseri, Namstig, Vefsida];
	const result = await query(q, values);
	if (result && result.rowCount === 1) {
		return result.rows[0];
	}

	throw new Error('Error with query INSERT INTO namsskeid');
}
// getCourseByCourseId,
// getCourseByTitle,
export async function getNamsskeid({ Numer = '', Heiti = '', Einingar = 0, Kennslumisseri = '', Namstig = '', Vefsida = '', category = '' }: Namsskeid): Promise<Array<Namsskeidmapped> | Namsskeidmapped> {
	if (Vefsida) {
		throw new Error('Ekki í boði að gera query með þessum gildum kennslumisseri eða vefsiða')
	}
	const input = [Numer, Heiti, category, Einingar, Kennslumisseri, Namstig];
	const queryinput = ['numer', 'name', 'category', 'kennslumisseri', 'einingar', 'namstig']
	let strengur = '';
	const values: Array<string | number> = [];
	let count = 0;
	input.forEach((stak, index) => {
		if (stak) {
			count += 1;
			strengur += (strengur) ? `, ${queryinput[index]} = $${count}` : `${queryinput[index]} = $${count}`;
			values.push(stak)
		}
	})
	const q = qstring('namsskeid', strengur);
	const result = await query(q, values);
	if (result && result.rowCount) {
		return result.rowCount === 1 ? result.rows[0] : result.rows
	}
	throw new Error(`query: ${q}`);
}

export type Links = {
	self: {
		href: string,
	},
	courses: {
		href: string
	},
}
export type Links2 = {
	self: {
		href: string,
	},
	department: {
		href: string
	},
}

export type mappedDeildir = {
	id: number | undefined,
	name: string,
	slug: string,
	description: string | undefined,
	created: Date | undefined,
	updated: Date | undefined,
	_links: Links | undefined,
};

export function departmentMapper(
	potentialDepartment: unknown
): mappedDeildir {
	const department = potentialDepartment as Partial<mappedDeildir> | null;

	if (!department || !department.id || !department.name || !department.slug) {
		const mapped: mappedDeildir = {
			id: department?.id,
			name: String(!!department?.name),
			slug: String(!!department?.slug),
			description: String(!!department?.description),
			created: department?.created,
			updated: department?.updated,
			_links: undefined,
		};
		return mapped;
	}

	const links: Links = {
		self: {
			href: `/departments/${department.slug}`,
		},
		courses: {
			href: `/departments/${department.slug}/courses`,
		},
	};

	const mapped: mappedDeildir = {
		id: department.id,
		name: department.name,
		slug: department.slug,
		description: department.description ?? undefined,
		created: department.created,
		updated: department.updated,
		_links: links,
	};

	return mapped;
}
export type Namsskeidmapped = {
	id: number | undefined,
	numer: string,
	name: string,
	einingar: number,
	kennslumisseri: string,
	namstig: string,
	vefsida: string,
	category: string;
	created: Date | undefined,
	update: Date | undefined,
	_links: Links | Links2
};

export function courseMapper(potentialCourse: unknown): Namsskeidmapped | null {
	const course = potentialCourse as Namsskeidmapped | null;

	if (!course || !course.id) {
		return null;
	}

	const links: Links2 = {
		self: {
			href: `/departments/${course.category}/courses/${course.numer}`,
		},
		department: {
			href: `/departments/${course.category}`
		}
	};
	const mapped: Namsskeidmapped = {
		id: course.id,
		numer: course.numer,
		name: course.name,
		einingar: course.einingar ?? undefined,
		kennslumisseri: course.kennslumisseri ?? undefined,
		namstig: course.namstig ?? undefined,
		vefsida: course.vefsida ?? undefined,
		category: course.category,
		created: course?.created,
		update: course?.update,
		_links: links
	};

	return mapped;
}


export async function insertCourse(course: Namsskeid): Promise<Namsskeidmapped | null> {
	const result = await query(
		'INSERT INTO namsskeid (numer, name, einingar, kennslumisseri, namstig, vefsida, category) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;',
		[course.Numer, course.Heiti, course.Einingar, course.Kennslumisseri, course.Namstig, course.Vefsida, course.category],
	);
	const mapped = courseMapper(result?.rows[0]);
	return mapped;
}


export async function insertDepartment(
	department: Deildir
): Promise<mappedDeildir | null> {
	const { title, description, csv } = department;
	const result = await query(
		'INSERT INTO deild (name, description, slug) VALUES ($1, $2, $3) RETURNING id, name, slug, description, created, updated',
		[title, description || '', csv]
	);

	const mapped = departmentMapper(result?.rows[0]);

	return mapped;
}

export async function conditionalUpdate(
	table: 'deild' | 'namsskeid',
	id: number,
	fields: Array<string | null>,
	values: Array<string | number | null>,
) {
	const filteredFields = fields.filter((i) => typeof i === 'string');
	const filteredValues = values.filter(
		(i): i is string | number => typeof i === 'string' || typeof i === 'number',
	);

	if (filteredFields.length === 0) {
		return false;
	}

	if (filteredFields.length !== filteredValues.length) {
		throw new Error('fields and values must be of equal length');
	}

	// id is field = 1
	const updates = filteredFields.map((field, i) => `${field} = $${i + 2}`);

	const q = `
	  UPDATE ${table}
		SET ${updates.join(', ')}
	  WHERE
		id = $1
	  RETURNING *
	  `;

	const queryValues: Array<string | number> = (
		[id] as Array<string | number>
	).concat(filteredValues);
	const result = await query(q, queryValues);

	return result;
}

export async function deleteDepartmentBySlug(slug: string): Promise<boolean> {
	const result = await query('DELETE FROM deild WHERE slug = $1', [slug]);

	if (!result) {
		return false;
	}

	return result.rowCount === 1;
}
export async function deleteCourseByCourseId(
	numer: string,
): Promise<boolean> {
	const result = await query('DELETE FROM namsskeid WHERE numer = $1', [
		numer,
	]);

	if (!result) {
		return false;
	}

	return result.rowCount === 1;
}
// getDepartmentBySlug,
// export async function deleteEvent(id) {
// 	const q = `
// 	  DELETE FROM events
// 	  WHERE id = $1;
// 	`;
// 	const result = await query(q, id);
// 	if (result && result.rowCount === 1) {
// 		return result.rows[0];
// 	}

// 	return null;
// }
// export async function listEventByName(name) {
// 	const q = `
// 	  SELECT
// 		id, name, slug, description, created, updated
// 	  FROM
// 		events
// 	  WHERE name = $1
// 	`;

// 	const result = await query(q, [name]);

// 	if (result && result.rowCount === 1) {
// 		return result.rows[0];
// 	}

// 	return null;
// }

// // Updatear ekki description, erum ekki að útfæra partial update
// export async function updateEvent(id, { name, slug, description }: object<string> = {}) {
// 	const q = `
// 	  UPDATE events
// 		SET
// 		  name = $1,
// 		  slug = $2,
// 		  description = $3,
// 		  updated = CURRENT_TIMESTAMP
// 	  WHERE
// 		id = $4
// 	  RETURNING id, name, slug, description;
// 	`;
// 	const values = [name, slug, description, id];
// 	const result = await query(q, values);

// 	if (result && result.rowCount === 1) {
// 		return result.rows[0];
// 	}

// 	return null;
// }