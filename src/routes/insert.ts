import { Ai } from '@cloudflare/ai';
import type { IRequest } from 'itty-router';

import generateUUID from '../utils/uuid';
import type { EmbeddingsResponse } from '../types';

const INSERT_QUERY = 'INSERT INTO entries (uuid, space, text) VALUES (?, ?, ?)';

type InsertBody = {
	input?: string;
	inputs?: string[];
};

type EmbeddingPair = {
	text: string;
	embedding: number[];
	uuid: string;
};

const handleInsert = async (request: IRequest, env: Env): Promise<Response> => {
	const ai = new Ai(env.AI);
	const db = env.DB;

	// get the namespace from the request params
	const { namespace } = request.params;

	const body = (await request.json()) as InsertBody;

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
			return Response.json({ error: 'one of the inputs is too long' }, { status: 400 });
		}
		text = inputs;
	} else {
		return Response.json({ error: 'missing input or inputs' }, { status: 400 });
	}

	try {
		const embeddings = await ai.run('@cf/baai/bge-base-en-v1.5', { text });
		const { data } = embeddings as EmbeddingsResponse;
		// iterate through the batched input text and response data at the same time
		const embeddingPairs: EmbeddingPair[] = [];
		for (let i = 0; i < text.length; i++) {
			const t = text[i];
			const embedding = data[i];
			// add to the array of embedding pairs
			embeddingPairs.push({ text: t, embedding, uuid: generateUUID() });
		}
		const inserts = embeddingPairs.map(({ text, uuid }) => {
			return db.prepare(INSERT_QUERY).bind(uuid, namespace, text);
		});
		const vectors = embeddingPairs.map(({ embedding, text, uuid }) => {
			return { id: uuid, namespace, values: embedding, metadata: { text } };
		});
		await Promise.all([db.batch(inserts), env.VECTORIZE_INDEX.insert(vectors)]);
		return Response.json({ vectors });
	} catch (e: unknown) {
		console.error(e);
		//@ts-ignore
		return Response.json({ error: e?.message }, { status: 400 });
	}
};

export default handleInsert;
