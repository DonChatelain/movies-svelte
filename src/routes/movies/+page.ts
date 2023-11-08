import type { Movie } from '../../models/movie.model';
import type { PageLoad } from './$types';

type Output = {
	movies: Movie[];
};

export const load: PageLoad<Output> = async ({ fetch, url }) => {
	const offset = url.searchParams.get('offset') || 0;
	const year = url.searchParams.get('year');
	const search = url.searchParams.get('search');
	const sortDir = url.searchParams.get('sortDir');
	const sortCol = url.searchParams.get('sortCol');

	const res = await fetch(
		`/api/movies?offset=${offset}
    ${year ? `&year=${year}` : ''}
    ${search ? `&search=${search}` : ''}
    ${sortDir ? `&sortDir=${sortDir}` : ''}${sortCol ? `&sortCol=${sortCol}` : ''}
    `
	);
	const data = (await res.json()) as {
		movies: Movie[];
		total: number;
	};

	return { movies: data.movies, total: data.total };
};
