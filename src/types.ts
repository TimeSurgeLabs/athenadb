export type EmbeddingsResponse = {
	shape: [number, number];
	data: number[][];
};

export type DBEntry = {
	id: number;
	uuid: string;
	space: string;
	text: string;
	created_at: string;
};
