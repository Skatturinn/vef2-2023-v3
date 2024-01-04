import { NextFunction, Request, Response } from 'express';
import {
	//   conditionalUpdate,
	//   deleteDepartmentBySlug,
	//   getDepartmentBySlug,
	//   getDepartments,
	//   insertDepartment,
} from '../lib/db.js';
// import { departmentMapper } from '../lib/mappers.js';
import {
	atLeastOneBodyValueValidator,
	departmentDoesNotExistValidator,
	genericSanitizer,
	stringValidator,
	validationCheck,
	xssSanitizer,
} from '../lib/validation.js';
// import { Department } from '../types.js';

export async function listDepartments(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const departments = await getDepartments();

	if (!departments) {
		return next(new Error('unable to get departments'));
	}

	return res.json(departments);
}

export async function getDepartment(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const { slug } = req.params;

	const department = await getDepartmentBySlug(slug);

	if (!department) {
		return next();
	}

	return res.json(department);
}

export async function createDepartmentHandler(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const { title, description } = req.body;

	const departmentToCreate: Omit<Department, 'id'> = {
		title,
		slug: slugify(title),
		description,
		courses: [],
	};

	const createdDeprtment = await insertDepartment(departmentToCreate, false);

	if (!createdDeprtment) {
		return next(new Error('unable to create department'));
	}

	return res.status(201).json(createdDeprtment);
}

export const createDepartment = [
	stringValidator({ field: 'title', maxLength: 64 }),
	stringValidator({
		field: 'description',
		valueRequired: false,
		maxLength: 1000,
	}),
	departmentDoesNotExistValidator,
	xssSanitizer('title'),
	xssSanitizer('description'),
	validationCheck,
	genericSanitizer('title'),
	genericSanitizer('description'),
	createDepartmentHandler,
];

export const updateDepartment = [
	stringValidator({ field: 'title', maxLength: 64, optional: true }),
	stringValidator({
		field: 'description',
		valueRequired: false,
		maxLength: 1000,
		optional: true,
	}),
	atLeastOneBodyValueValidator(['title', 'description']),
	xssSanitizer('title'),
	xssSanitizer('description'),
	validationCheck,
	updateDepartmentHandler,
];

export async function updateDepartmentHandler(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const { slug } = req.params;
	const department = await getDepartmentBySlug(slug);

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
		'department',
		department.id,
		fields,
		values,
	);

	if (!updated) {
		return next(new Error('unable to update department'));
	}

	const updatedDepartment = departmentMapper(updated.rows[0]);
	return res.json(updatedDepartment);
}

export async function deleteDepartment(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const { slug } = req.params;
	const department = await getDepartmentBySlug(slug);

	if (!department) {
		return next();
	}

	const result = await deleteDepartmentBySlug(slug);

	if (!result) {
		return next(new Error('unable to delete department'));
	}

	return res.status(204).json({});
}