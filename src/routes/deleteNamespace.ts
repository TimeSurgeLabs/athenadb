import type { IRequest } from "itty-router";

const GET_ALL_QUERY = `SELECT * FROM entries WHERE space = ?`;
const DELETE_QUERY = `DELETE FROM entries WHERE uuid = ?`;

const handleDeleteNamespace = async (request: IRequest, env: Env): Promise<Response> => {
	const db = env.DB;

	const { namespace } = request.params;

	// first we get all the uuids in the namespace
	const result = await db.prepare(GET_ALL_QUERY).bind(namespace).all();

	// then we delete each one from the database with a batched query
	const deleteQueries = result.results.map((row) => {
		return db.prepare(DELETE_QUERY).bind(row.uuid);
	});

	const ids = result.results.map((row) => row.uuid);

	await Promise.all([db.batch(deleteQueries), env.VECTORIZE_INDEX.deleteByIds(ids as string[])]);

	return Response.json(result.results);
};

export default handleDeleteNamespace;
