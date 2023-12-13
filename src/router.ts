import { Router } from 'itty-router';
import handleInsert from './routes/insert';
import handleQuery from './routes/query';
import handleEmbeddings from './routes/embeddings';
import { handleGetItem, handleGetQuery } from './routes/get';
import handleDelete from './routes/delete';

// now let's create a router (note the lack of "new")
const router = Router();

router.post('/:namespace/insert', handleInsert);

router.post('/:namespace/query', handleQuery);

router.get('/:namespace/:uuid', handleGetItem);

router.get('/:namespace', handleGetQuery);

router.delete('/:namespace/:uuid', handleDelete);

router.post('/embeddings', handleEmbeddings);

router.get('/test', () => new Response('Hello world!'));

// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;
