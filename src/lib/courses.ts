import { NextFunction, Request, Response } from 'express';
import {
	Namsskeidmapped,
	conditionalUpdate,
	courseMapper,
	deleteCourseByCourseId,
	departmentMapper,
	getDeild,
	getNamsskeid,
	insertCourse,
	insertDepartment,
	mappedDeildir
} from '../lib/db.js';
// import { departmentMapper } from '../lib/mappers.js';
import {
	ALLOWED_SEMESTERS,
	atLeastOneBodyValueValidator,
	departmentDoesNotExistValidator,
	genericSanitizer,
	genericSanitizerMany,
	stringValidator,
	validationCheck,
	xssSanitizer,
	xssSanitizerMany,
} from '../lib/validation.js';
import { Namsskeid } from './readnwrite.js';
import slugify from 'slugify';
import { Deildir } from './build.js';
import { body } from 'express-validator';

export type Department = {
	title: string,
	slug: string,
	description: string,
	courses: Array<Namsskeid>;
}


export async function createDepartmentHandler(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	req?.body
	const { name, description } = req.body;
	const departmentToCreate: Deildir = {
		title: name,
		description: description,
		csv: slugify(String(name))
	};

	const createdDeprtment = await insertDepartment(departmentToCreate);

	if (!createdDeprtment) {
		return next(new Error('unable to create department'));
	}

	return res.status(201).json(createdDeprtment);
}
export async function updateDepartmentHandler(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const { slug } = req.params;
	const department = await getDeild({ name: '', description: '', slug: slug, created: null, updated: null }) as mappedDeildir;

	if (!department) {
		return next();
	}

	const { title, description } = req.body;

	const fields = [
		typeof title === 'string' && title ? 'title' : null,
		typeof title === 'string' && title ? 'slug' : null,
		typeof description === 'string' && description ? 'description' : null,
	];

	const values = [
		typeof title === 'string' && title ? title : null,
		typeof title === 'string' && title ? slugify(title).toLowerCase() : null,
		typeof description === 'string' && description ? description : null,
	];

	const updated = await conditionalUpdate(
		'deild',
		department.id as number,
		fields,
		values,
	);

	if (!updated) {
		return next(new Error('unable to update department'));
	}

	const updatedDepartment = departmentMapper(updated.rows[0]);
	return res.json(updatedDepartment);
}

export const createDepartment = [
	stringValidator({ field: 'name', maxLength: 64 }),
	stringValidator({
		field: 'description',
		valueRequired: false,
		maxLength: 1000,
	}),
	departmentDoesNotExistValidator,
	xssSanitizer('name'),
	xssSanitizer('description'),
	validationCheck,
	genericSanitizer('name'),
	genericSanitizer('description'),
	createDepartmentHandler
];

export const updateDepartment = [
	stringValidator({ field: 'name', maxLength: 64, optional: true }),
	stringValidator({
		field: 'description',
		valueRequired: false,
		maxLength: 1000,
		optional: true,
	}),
	atLeastOneBodyValueValidator(['name', 'description']),
	xssSanitizer('name'),
	xssSanitizer('description'),
	validationCheck,
	updateDepartmentHandler,
];
export const semesterValidator = ({ field = '', optional = false } = {}) => {
	const val = body(field)
		.isIn(ALLOWED_SEMESTERS)
		.withMessage(`${field} must be one of: ${ALLOWED_SEMESTERS.join(', ')}`);
	if (optional) {
		return val.optional();
	}
	return val;
};

export const courseTitleDoesNotExistValidator = body('name').custom(
	async (title) => {
		try {
			await getNamsskeid({ Numer: '', Heiti: title, Einingar: 0, Kennslumisseri: '', Namstig: '', Vefsida: '', category: '' });
			return Promise.reject(new Error('course with title already exists'))
		}
		catch {
			return Promise.resolve();
		}
	},
);
export const courseIdDoesNotExistValidator = body('numer').custom(
	async (courseId) => {
		try {
			await getNamsskeid({ Numer: courseId, Heiti: '', Einingar: 0, Kennslumisseri: '', Namstig: '', Vefsida: '', category: '' });
			return Promise.reject(new Error('course with courseId already exists'))
		} catch {
			return Promise.resolve();
		}
	},
);
export async function createCoursesHandler(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const { slug } = req.params;
	const { numer, name, einingar, kennslumisseri, namstig, vefsida } = req.body;
	const department = await getDeild({ name: '', description: '', slug: slug, created: null, updated: null }) as mappedDeildir;

	if (!department) {
		return next();
	}

	const courseToCreate: Namsskeid = {
		Numer: numer,
		Heiti: name,
		Einingar: einingar,
		Kennslumisseri: kennslumisseri,
		Namstig: namstig,
		Vefsida: vefsida,
		category: slug,
	};

	const createdCourse = await insertCourse(courseToCreate);

	if (!createdCourse) {
		return next(new Error('unable to create course'));
	}

	return res.json(courseMapper(createdCourse));
}
const courseFields = ['numer', 'name', 'namstig', 'vefsida', 'kennslumisseri', 'einingar'];

export const createCourse = [
	stringValidator({ field: 'numer', maxLength: 16 }),
	stringValidator({ field: 'name', maxLength: 64 }),
	body('einingar')
		.isFloat({ min: 0.5, max: 100 })
		.withMessage('units must be a number between 0.5 and 100'),
	semesterValidator({ field: 'kennslumisseri' }),
	stringValidator({ field: 'namstig', valueRequired: false, maxLength: 128 }),
	stringValidator({ field: 'vefsida', valueRequired: false, maxLength: 256 }),
	courseTitleDoesNotExistValidator,
	courseIdDoesNotExistValidator,
	xssSanitizerMany(courseFields),
	validationCheck,
	genericSanitizerMany(courseFields),
	createCoursesHandler
].flat();

export async function updateCourseHandler(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const { slug, numer } = req.params;
	const department = await getDeild({ name: '', description: '', slug: slug, created: null, updated: null });

	if (!department) {
		return next();
	}

	const course = await getNamsskeid({ Numer: numer, Heiti: '', Einingar: 0, Kennslumisseri: '', Namstig: '', Vefsida: '', category: '' }) as Namsskeidmapped;

	if (!course) {
		return next();
	}

	const {
		numer: newCourseId,
		name: title,
		einingar: units,
		kennslumisseri: semester,
		namstig: level,
		vefsida: url
	} = req.body;

	const fields = [
		typeof newCourseId === 'string' && newCourseId ? 'numer' : null,
		typeof title === 'string' && title ? 'name' : null,
		typeof level === 'string' && level ? 'namstig' : null,
		typeof url === 'string' && url ? 'vefsida' : null,
		typeof semester === 'string' && semester ? 'kennslumisseri' : null,
		typeof units === 'string' && units ? 'einingar' : null,
	];

	const values = [
		typeof newCourseId === 'string' && newCourseId ? newCourseId : null,
		typeof title === 'string' && title ? title : null,
		typeof level === 'string' && level ? level : null,
		typeof url === 'string' && url ? url : null,
		typeof semester === 'string' && semester ? semester : null,
		typeof units === 'string' && units ? units : null,
	];

	const updated = await conditionalUpdate('namsskeid', course.id as number, fields, values);
	console.log('updated :>> ', updated);
	if (!updated) {
		return next(new Error('unable to update course'));
	}

	const updatedCourse = courseMapper(updated.rows[0]);
	return res.json(updatedCourse);
}

export const updateCourse = [
	stringValidator({ field: 'numer', maxLength: 16, optional: true }),
	stringValidator({ field: 'name', maxLength: 64, optional: true }),
	body('einingar')
		.isFloat({ min: 0.5, max: 100 })
		.withMessage('units must be a number between 0.5 and 100')
		.optional(),
	semesterValidator({ field: 'kennslumisseri', optional: true }),
	stringValidator({
		field: 'namstig',
		valueRequired: false,
		maxLength: 128,
		optional: true,
	}),
	stringValidator({
		field: 'vefsida',
		valueRequired: false,
		maxLength: 256,
		optional: true,
	}),
	atLeastOneBodyValueValidator(courseFields),
	xssSanitizerMany(courseFields),
	validationCheck,
	genericSanitizerMany(courseFields),
	updateCourseHandler
].flat();

export async function deleteCourse(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const { slug, numer } = req.params;

	const department = await getDeild({ name: '', description: '', slug: slug, created: null, updated: null });

	if (!department) {
		return next();
	}

	const course = await getNamsskeid({ Numer: numer, Heiti: '', Einingar: 0, Kennslumisseri: '', Namstig: '', Vefsida: '', category: '' });

	if (!course) {
		return next();
	}

	const result = await deleteCourseByCourseId(numer);

	if (!result) {
		return next(new Error('unable to delete course'));
	}

	return res.status(204).json({});
}