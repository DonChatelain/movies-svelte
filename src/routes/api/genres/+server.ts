import type { Genre } from '../../../models/genre.model';
import type { RequestEvent, RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }: RequestEvent) => {
	const data = await locals.sql`
    select * from genres
  `;

	await locals.sql.end();

	const genres: Genre[] = data.map((d) => ({
		id: d.id,
		name: d.name
	}));

	return new Response(JSON.stringify({ genres }));
};
