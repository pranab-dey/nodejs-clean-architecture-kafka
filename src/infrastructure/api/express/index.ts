import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import methodOverride from 'method-override';
import routes from './routes';
import { IError } from '../../../interfaces';
import { loadAppConfig } from '../../../config';

const app: express.Application = express();
const appConfig = loadAppConfig();

app.use(logger('dev'));
app.use(express.json());
app.use(
	cors({
		origin: appConfig.cors.origin,
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		credentials: appConfig.cors.credentials,
	})
);
app.use(express.urlencoded({ extended: false }));

app.get('/', async (_req: express.Request, res: express.Response) => {
	res.send({ name: 'API' });
});

routes.attach(app);

app.use('*', (req: express.Request, res: express.Response) => {
	res.status(404).send({
		error: 'NotFound',
		message: `Cannot ${req.method} ${req.baseUrl}`,
	});
});

app.use(methodOverride());
app.use((err: IError, _req: express.Request, res: express.Response) => {
	console.error(err);
	res.status(err?.statusCode || 500).send({
		error: err.name,
		message: err.message,
		details: err?.details,
	});
});

export default app;
