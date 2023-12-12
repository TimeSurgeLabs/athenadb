import type { IRequest } from 'itty-router';
import type { DBEntry } from '../types';

const SELECT_QUERY = `SELECT * FROM entries WHERE uuid = ?`;

const handleGet = async (request: IRequest, env: Env): Promise<Response> => {
	const db = env.DB;

	const { uuid } = request.params;

	const result = await db.prepare(SELECT_QUERY).bind(uuid).first<DBEntry>();

	if (!result) {
		return Response.json({ error: 'not found' }, { status: 404 });
	}

	return Response.json({
		id: result.uuid,
		namespace: result.namespace,
		text: result.text,
		created_at: result.created_at,
	});
};

export default handleGet;
