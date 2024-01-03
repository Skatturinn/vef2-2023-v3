import express from 'express';
import { catchErrors } from './lib/catch-errors.js';
import { router, bye, hello, error } from './routes/api.js';
import { lesa } from './lib/readnwrite.js';

const app = express();


// app.get('/', catchErrors(hello), catchErrors(bye));
// hann var með catchErros(error) á milli hello og bye ? afh
// app.use(router);

const path = './data/hagfraedi.csv'
app.get('/',
	async (req, res) => {
		return res.json(await lesa(path))
	}
)

const port = 3000;

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}/`);
});
