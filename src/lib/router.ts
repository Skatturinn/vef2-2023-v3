import express, { NextFunction, Request, Response } from "express"
import { getDeild, getNamsskeid } from "./db.js";

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
		return res.json(a)
	} catch (err) {
		return next(new Error(`Nadi ekki deildir ${err}`));
	}
}
async function returnNamsskeid(req: Request, res: Response, next: NextFunction) {
	try {
		const a = await getNamsskeid({ Numer: req.params?.numer, Heiti: '', Einingar: 0, Kennslumisseri: '', Namstig: '', Vefsida: '', category: '' });
		return res.json(a)
	} catch (err) {
		return next(new Error(`Nadi ekki deildir ${err}`));
	}
}


router.get('/', index);
router.get('/departments', returnDeild);
// router.post('/departments', createDepartment);
router.get('/departments/:slug', returnDeild);
// router.patch('/departments/:slug', updateDepartment);
// router.delete('/departments/:slug', deleteDepartment);

// // Courses
router.get('/departments/:slug/courses', returnNamsskeid);
// router.post('/departments/:slug/courses', createCourse);
router.get('/departments/:slug/courses/:numer', returnNamsskeid);
// router.patch('/departments/:slug/courses/:courseId', updateCourse);
// router.delete('/departments/:slug/courses/:courseId', deleteCourse);
