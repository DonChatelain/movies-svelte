import type { Genre } from '../../models/genre.model';
import type { Movie } from '../../models/movie.model';
import type { PageLoad } from './$types';

type Output = {
	movies: Movie[];
	total: number;
	genres: Genre[];
};

export const load: PageLoad<Output> = async ({ fetch, url }) => {
	const offset = url.searchParams.get('offset') || 0;
	const year = url.searchParams.get('year');
	const search = url.searchParams.get('search');
	const sortDir = url.searchParams.get('sortDir');
	const sortCol = url.searchParams.get('sortCol');
	const genreQuery = url.searchParams.get('genres');

	const pMovieResponse = fetch(
		`/api/movies?offset=${offset}
    ${year ? `&year=${year}` : ''}
    ${search ? `&search=${search}` : ''}
    ${sortDir ? `&sortDir=${sortDir}` : ''}
		${sortCol ? `&sortCol=${sortCol}` : ''}
    ${genreQuery ? `&genres=${genreQuery}` : ''}
    `
	).then((r) => r.json());

	const pGenreResponse = fetch(`/api/genres`).then((r) => r.json());

	const [movieData, genres] = await Promise.all([pMovieResponse, pGenreResponse]);

	const data: Output = {
		movies: movieData.movies as Movie[],
		total: movieData.total as number,
		genres: genres.genres as Genre[]
	};

	return { movies: data.movies, total: data.total, genres: data.genres };
};
