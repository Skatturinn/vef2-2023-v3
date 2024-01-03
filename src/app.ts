import express, { NextFunction, Request, Response, Errback, ErrorRequestHandler } from 'express';
import dotenv from 'dotenv';
import { catchErrors } from './lib/catch-errors.js';
import { router, bye, hello, error } from './routes/api.js';
import { lesa } from './lib/readnwrite.js';
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

function notFoundHandler(req: Request, res: Response, next: NextFunction) {
	console.warn('Not found', req.originalUrl);
	res.status(404).json({ error: 'Not found' });
}

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
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
