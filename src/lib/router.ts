import express, { NextFunction, Request, Response } from "express"
import { Namsskeidmapped, courseMapper, departmentMapper, getDeild, getNamsskeid, mappedDeildir, deleteDepartmentBySlug } from "./db.js";
import { createCourse, createDepartment, deleteCourse, updateCourse, updateDepartment } from "./courses.js";

export const router = express.Router()

export async function index(req: Request, res: Response) {
	return res.json([
		{
			href: '/departments',
			methods: ['GET', 'POST'],
		}, {
			href: '/departments/:slug',
			methods: ['GET', 'PATCH', 'DELETE'],
		}, {
			href: '/departments/:slug/all',
			methods: ['GET', 'POST'],
		}, {
			href: '/departments/:slug/:courseID',
			methods: ['GET', 'PATCH', 'DELETE	'],
		}
	])
}

async function returnDeild(req: Request, res: Response, next: NextFunction) {
	try {
		const a = await getDeild({ name: '', description: '', slug: req.params?.slug, created: null, updated: null });
		const response: Array<mappedDeildir> = [];
		if ((a as Array<mappedDeildir>)?.length) {
			for (const el of Array.from(a as Array<mappedDeildir>)) {
				response.push(departmentMapper(el))
			}
		}
		return res.json(response.length ? response : departmentMapper(a))
	} catch (err) {
		return next(new Error(`Nadi ekki deildir ${err}`));
	}
}
async function returnNamsskeid(req: Request, res: Response, next: NextFunction) {
	try {
		const a = await getNamsskeid({ Numer: req.params?.numer, Heiti: '', Einingar: 0, Kennslumisseri: '', Namstig: '', Vefsida: '', category: '' }) as Array<Namsskeidmapped>;
		const response: Array<Namsskeidmapped | null> = []
		for (const stak of Array.from(a)) {
			response.push(courseMapper(stak))
		}
		return res.json(response);
	} catch (err) {
		return next(new Error(`Nadi ekki deildir ${err}`));
	}
}
export async function deleteDepartment(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const { slug } = req.params;
	try {
		await getDeild({ name: '', description: '', slug: slug, created: null, updated: null });
	} catch (err) {
		return res.status(404)
	}

	const result = await deleteDepartmentBySlug(slug);

	if (!result) {
		return next(new Error('unable to delete department'));
	}

	return res.status(204).json({});
}

router.get('/', index);
router.get('/departments', returnDeild);
router.post('/departments', createDepartment);
router.get('/departments/:slug', returnDeild);
router.patch('/departments/:slug', updateDepartment);
router.delete('/departments/:slug', deleteDepartment);

// // Courses
router.get('/departments/:slug/courses', returnNamsskeid);
router.post('/departments/:slug/courses', (createCourse));
router.get('/departments/:slug/courses/:numer', returnNamsskeid);
router.patch('/departments/:slug/courses/:numer', updateCourse);
router.delete('/departments/:slug/courses/:numer', deleteCourse);
