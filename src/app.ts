import express, { Request, Response, ErrorRequestHandler } from 'express';
import dotenv from 'dotenv';
import { buildDB, getDeildir } from './lib/build.js';


dotenv.config();

const app = express();


// app.get('/', catchErrors(hello), catchErrors(bye));
// hann var með catchErros(error) á milli hello og bye ? afh
// app.use(router);

app.get('/build',
	async (req, res) => {
		const a = await buildDB(await getDeildir());
		return res.json(a)
	}
)

const port = 3000;

function notFoundHandler(req: Request, res: Response) {
	console.warn('Not found', req.originalUrl);
	res.status(404).json({ error: 'Not found' });
}

type ErrorRequest = {
	status: number
};

const errorHandler: ErrorRequestHandler = (err: ErrorRequest, req, res) => {
	console.error(err);
	if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
		return res.status(400).json({ error: 'Invalid json' });
	}

	return res.status(500).json({ error: 'Internal server error' });
}

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}/`);
});
