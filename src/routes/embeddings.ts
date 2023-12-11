import { Ai } from '@cloudflare/ai';
import { IRequest } from 'itty-router';

const handleEmbeddings = async (request: IRequest, env: Env) => {
	const ai = new Ai(env.AI);

	const { input, inputs } = (await request.json()) as { input?: string; inputs?: string[] };

	if (!input && !inputs) {
		return Response.json({ error: 'missing input or inputs' }, { status: 400 });
	}

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
	}

	const embeddings = await ai.run('@cf/baai/bge-base-en-v1.5', { text });

	return Response.json({ vectors: embeddings });
};

export default handleEmbeddings;
