import type { IRequest } from 'itty-router';
import type { DBEntry } from '../types';

const SELECT_QUERY = `SELECT * FROM entries WHERE uuid = ?`;

export const handleGetItem = async (request: IRequest, env: Env): Promise<Response> => {
	const db = env.DB;

	const { uuid } = request.params;
	const { vector, db_id } = request.query;

	const result = await db.prepare(SELECT_QUERY).bind(uuid).first<DBEntry>();

	if (!result) {
		return Response.json({ error: 'not found' }, { status: 404 });
	}

	let vectors: VectorizeVector[] = [];
	if (vector) {
		// get the vectors for each by ids
		vectors = await env.VECTORIZE_INDEX.getByIds([result.uuid]);
	}

	return Response.json({
		id: result.uuid,
		namespace: result.space,
		text: result.text,
		db_id: !!db_id ? result.id : undefined,
		vector: !!vector ? vectors[0].values : undefined,
		created_at: result.created_at,
	});
};

const GET_QUERY = `SELECT * FROM entries WHERE space = ? ORDER BY id DESC LIMIT ? OFFSET ?`;

export const handleGetQuery = async (request: IRequest, env: Env): Promise<Response> => {
	const { namespace } = request.params;
	// query params
	let { limit, offset, db_id, vector } = request.query;

	limit = limit || '10';
	offset = offset || '0';
	if (isNaN(Number(limit)) || isNaN(Number(offset))) {
		return Response.json({ error: 'invalid limit or offset' }, { status: 400 });
	}

	if (Number(limit) > 100 || Number(limit) < 1) {
		limit = '100';
	}

	const db = env.DB;

	const { results } = await db.prepare(GET_QUERY).bind(namespace, limit, offset).all<DBEntry>();

	let vectors: VectorizeVector[] = [];
	if (vector) {
		// get the vectors for each by ids
		vectors = await env.VECTORIZE_INDEX.getByIds(results.map((r) => r.uuid));
	}

	const entries = results.map((result, i) => ({
		id: result.uuid,
		namespace: result.space,
		db_id: !!db_id ? result.id : undefined,
		vector: !!vector ? vectors[i].values : undefined,
		text: result.text,
		created_at: result.created_at,
	}));

	return Response.json(entries);
};
