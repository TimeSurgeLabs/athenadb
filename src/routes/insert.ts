import { Ai } from '@cloudflare/ai';

import generateUUID from '../utils/uuid';
import { IRequest } from 'itty-router';

const INSERT_QUERY = 'INSERT INTO embeddings (namespace, text) VALUES (?, ?)';

type InsertBody = {
	input?: string;
	inputs?: string[];
};

type EmbeddingsResponse = {
	batchedInput: {
		text: string[];
	};
	batchedResponse: {
		shape: [number, number];
		data: number[][];
	};
};

type EmbeddingPair = {
	text: string;
	embedding: number[];
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
			return Response.json({ error: 'input too long' }, { status: 400 });
		}
		text = inputs;
	} else {
		return Response.json({ error: 'missing input or inputs' }, { status: 400 });
	}

	try {
		const embeddings = await ai.run('@cf/baai/bge-base-en-v1.5', { text });
		const { batchedInput, batchedResponse } = embeddings as EmbeddingsResponse;
		// iterate through the batched input text and response data at the same time
		const embeddingPairs: EmbeddingPair[] = [];
		for (let i = 0; i < batchedInput.text.length; i++) {
			const text = batchedInput.text[i];
			const embedding = batchedResponse.data[i];
			// add to the array of embedding pairs
			embeddingPairs.push({ text, embedding });
		}
		const inserts = embeddingPairs.map(({ text }) => {
			return db.prepare(INSERT_QUERY).bind(namespace, text);
		});
		const vectors = embeddingPairs.map(({ embedding, text }) => {
			return { id: generateUUID(), namespace, values: embedding, metadata: { text } };
		});
		await db.batch(inserts);
		await env.VECTORIZE_INDEX.insert(vectors);
		return Response.json({ vectors });
	} catch (e: unknown) {
		console.error(e);
		//@ts-ignore
		return Response.json({ error: e?.message }, { status: 400 });
	}
};

export default handleInsert;
