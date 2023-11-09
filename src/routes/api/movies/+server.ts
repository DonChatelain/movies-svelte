import type { Movie } from '../../../models/movie.model';
import type { RequestEvent, RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }: RequestEvent) => {
	const limit = 100;
	const offset = url.searchParams.get('offset') || 0;
	const year = url.searchParams.get('year') || 0;
	const search = url.searchParams.get('search') || '';
	const sortDir = url.searchParams.get('sortDir') || 'asc';
	const sortCol = url.searchParams.get('sortCol') || 'title';
	const genres = url.searchParams.get('genres');

	const pCountData = locals.sql`
		select count(id) from movies

		WHERE id IS NOT NULL

		${search ? locals.sql` AND title ILIKE ${'%' + search.trim() + '%'}` : locals.sql``}
		${year ? locals.sql` AND year = ${year}` : locals.sql``}
		${genres ? locals.sql` AND genres @> ${JSON.parse(genres)}` : locals.sql``}

	`;

	const pData = locals.sql`
    select * from movies 

		WHERE id IS NOT NULL

		${search ? locals.sql` AND title ILIKE ${'%' + search.trim() + '%'}` : locals.sql``}
		${year ? locals.sql` AND year = ${year}` : locals.sql``}
		${genres ? locals.sql` AND genres @> ${JSON.parse(genres)}` : locals.sql``}

		${sortCol.trim() === 'year' ? locals.sql` ORDER BY year` : locals.sql` ORDER BY title`}
		${sortDir === 'asc' ? locals.sql` ASC` : locals.sql` DESC`}

		LIMIT ${limit}
		OFFSET ${offset}
  `;

	try {
		const [countData, data] = await Promise.all([pCountData, pData]);

		const movies = data.map(
			(d) =>
				({
					title: d.title,
					year: d.year,
					href: d.href,
					extract: d.extract,
					thumbnail: d.thumbnail,
					thumbnail_width: d.thumbnail_width,
					thumbnail_height: d.thumbnail_height
				} as Movie)
		);

		return new Response(JSON.stringify({ movies, total: countData[0].count }));
	} finally {
		await locals.sql.end();
	}
};
