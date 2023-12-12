import { Ai } from '@cloudflare/ai';
import type { IRequest } from 'itty-router';

import type { EmbeddingsResponse } from '../types';
import type { DBEntry } from '../types';

const SELECT_QUERY = 'SELECT * FROM entries WHERE uuid = ?';

type QueryBody = {
	input?: string;
	inputs?: string[];
};

const handleQuery = async (request: IRequest, env: Env): Promise<Response> => {
	const ai = new Ai(env.AI);
	const db = env.DB;

	// get the namespace from the request params
	const { namespace } = request.params;

	const body = (await request.json()) as QueryBody;

	const { input, inputs } = body;

	let text: string[] = [];

	if (input) {
		// if the text is longer than 1024 characters, return an error
		if (input.length > 1024) {
			return Response.json({ error: 'input too long' }, { status: 400 });
		}
		text = [input];
	} else if (inputs) {
		// if any of the texts are longer than 1024 characters, return an error
		if (inputs.some((t) => t.length > 1024)) {
			return Response.json({ error: 'input too long' }, { status: 400 });
		}
		text = inputs;
	} else {
		return Response.json({ error: 'missing input or inputs' }, { status: 400 });
	}

	try {
		const embeddings = await ai.run('@cf/baai/bge-base-en-v1.5', { text });
		const { data } = embeddings as EmbeddingsResponse;
		const embedding = data[0];
		const { matches } = await env.VECTORIZE_INDEX.query(embedding, { topK: 5, namespace });

		const selects = matches.map((m) => {
			return db.prepare(SELECT_QUERY).bind(m.id);
		});

		const batchResults = await db.batch<DBEntry>(selects);

		const vectors = batchResults
			.map((b) => b.results)
			.flat()
			.map((r) => {
				const match = matches.find((m) => m.id === r.uuid);
				if (!match) return;
				return {
					id: match.id,
					namespace: r.namespace,
					score: match.score,
					text: r.text,
					created_at: r.created_at,
				};
			})
			.filter((v) => !!v)
			// @ts-ignore
			.sort((a, b) => b.score - a.score);

		return Response.json({ vectors });
	} catch (e: unknown) {
		// @ts-ignore
		return Response.json({ error: e.message }, { status: 500 });
	}
};

export default handleQuery;
