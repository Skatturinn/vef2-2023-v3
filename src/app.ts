import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { router } from './lib/router.js';

dotenv.config();

function cors(req: Request, res: Response, next: NextFunction) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization',
	);
	next();
}

const app = express();

app.use(express.json());

app.use(cors);
app.use(router);

const port = process.env.PORT || 3000;

app.use((req: Request, res: Response) => {
	res.status(404).json({ error: 'not found' });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	if (
		err instanceof SyntaxError &&
		'status' in err &&
		err.status === 400 &&
		'body' in err
	) {
		return res.status(400).json({ error: 'invalid json' });
	}

	console.error('error handling route', err);
	return res
		.status(500)
		.json({ error: err.message ?? 'internal server error' });
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}/`);
});
