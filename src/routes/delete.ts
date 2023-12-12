import type { IRequest } from 'itty-router';

const DELETE_QUERY = `DELETE FROM entries WHERE uuid = ?`;

const handleDelete = async (request: IRequest, env: Env): Promise<Response> => {
	const db = env.DB;

	const { uuid } = request.params;

	const result = await db.prepare(DELETE_QUERY).bind(uuid).run();

	if (result.success) {
		// delete from the vector index
		await env.VECTORIZE_INDEX.deleteByIds([uuid]);
	}

	return Response.json(result);
};

export default handleDelete;
