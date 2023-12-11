import { Router } from 'itty-router';
import handleInsert from './routes/insert';
import handleEmbeddings from './routes/embeddings';

// now let's create a router (note the lack of "new")
const router = Router();

router.post('/insert/:namespace', handleInsert);

router.post('/embeddings', handleEmbeddings);

router.get('/test', () => new Response('Hello world!'));

// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;
