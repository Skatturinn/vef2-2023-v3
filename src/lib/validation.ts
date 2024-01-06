import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import xss from 'xss';
import {
	getNamsskeid,
	getDeild,
} from './db.js';

export const ALLOWED_SEMESTERS = ['Vor', 'Sumar', 'Haust', 'Heilsárs']
/**
 * Checks to see if there are validation errors or returns next middlware if not.
 * @param {object} req HTTP request
 * @param {object} res HTTP response
 * @param {function} next Next middleware
 * @returns Next middleware or validation errors.
 */
export function validationCheck(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const validation = validationResult(req);
	if (!validation.isEmpty()) {
		const errors = validation.array();
		const notFoundError = errors.find((error) => error.msg === 'not found');
		const serverError = errors.find((error) => error.msg === 'server error');

		let status = 400;
		if (serverError) {
			status = 500;
			console.log(serverError, status)
		} else if (notFoundError) {
			status = 404;
			console.log(notFoundError, status)
		}
		console.log(errors, status)
		return res.status(status).json({ errors });
	}
	return next();
}

export function atLeastOneBodyValueValidator(fields: Array<string>) {
	return body().custom(async (value, { req }) => {
		const { body: reqBody } = req;

		let valid = false;

		for (let i = 0; i < fields.length; i += 1) {
			const field = fields[i];

			if (field in reqBody && reqBody[field] != null) {
				valid = true;
				break;
			}
		}

		if (!valid) {
			return Promise.reject(
				new Error(`require at least one value of: ${fields.join(', ')}`),
			);
		}
		return Promise.resolve();
	});
}

export const xssSanitizer = (param: string) =>
	body(param).customSanitizer((v) => xss(v));

export const xssSanitizerMany = (params: string[]) =>
	params.map((param) => xssSanitizer(param));

export const genericSanitizer = (param: string) => { return body(param).trim().escape() };

export const genericSanitizerMany = (params: string[]) =>
	params.map((param) => genericSanitizer(param));

export const stringValidator = ({
	field = '',
	valueRequired = true,
	maxLength = 0,
	optional = false,
} = {}) => {
	const val = body(field)
		.trim()
		.isString()
		.isLength({
			min: valueRequired ? 1 : undefined,
			max: maxLength ? maxLength : undefined,
		})
		.withMessage(
			[
				field,
				valueRequired ? 'required' : '',
				maxLength ? `max ${maxLength} characters` : '',
			]
				.filter((i) => Boolean(i))
				.join(' '),
		);

	if (optional) {
		return val.optional();
	}

	return val;
};

export const semesterValidator = ({ field = '', optional = false } = {}) => {
	const val = body(field)
		.isIn(ALLOWED_SEMESTERS)
		.withMessage(`${field} must be one of: ${ALLOWED_SEMESTERS.join(', ')}`);
	if (optional) {
		return val.optional();
	}
	return val;
};

export const departmentDoesNotExistValidator = body('name').custom(
	async (title) => {
		try {
			if (await getDeild({ name: title, description: '', slug: '', created: null, updated: null })) {
				return Promise.reject(new Error('department with title already exists'));
			}
		} catch {
			return Promise.resolve();
		}
	},
);

export const courseTitleDoesNotExistValidator = body('title').custom(
	async (title: string) => {
		if (await getNamsskeid({ Numer: '', Heiti: title, Einingar: 0, Kennslumisseri: '', Namstig: '', Vefsida: '', category: '' })) {
			return Promise.reject(new Error('course with title already exists'));
		}
		return Promise.resolve();
	},
);

export const courseIdDoesNotExistValidator = body('numer').custom(
	async (courseId: string) => {
		if (await getNamsskeid({ Numer: courseId, Heiti: '', Einingar: 0, Kennslumisseri: '', Namstig: '', Vefsida: '', category: '' })) {
			return Promise.reject(new Error('course with courseId already exists'));
		}
		return Promise.resolve();
	},
);