<script lang="ts">
	import { goto } from '$app/navigation';
	import { navigating, page } from '$app/stores';
	import type { Movie } from '../../models/movie.model';
	import type { PageData } from './$types';

	export let data: PageData;

	export const PAGE_LIMIT = 100;

	export let selectedMovie: Movie | undefined;
	export let selectedMoviePosition = { x: 0, y: 0 };
	export let currentOffset = parseInt($page.url.searchParams.get('offset') || '') || 0;

	export let searchTerm = $page.url.searchParams.get('search') || '';
	export let sortColumn = $page.url.searchParams.get('sortCol') || 'title';
	export let sortDir = $page.url.searchParams.get('sortDir') || 'asc';

	export let selectedGenres: string[] = JSON.parse($page.url.searchParams.get('genres') || '[]');

	// Seed select box with all relevant years
	export const yearRange = [1900, 2023];
	const selectYears: number[] = [];
	for (let i = yearRange[0]; i <= yearRange[1]; i++) {
		selectYears.push(i);
	}

	export let onYearChange = async (year: string) => {
		let query = new URLSearchParams($page.url.searchParams.toString());
		query.set('year', year);
		currentOffset = 0;
		query.set('offset', '0');
		goto(`?${query.toString()}`);
	};

	export let submitSearch = (search: string) => {
		let query = new URLSearchParams($page.url.searchParams.toString());
		query.set('search', search);
		currentOffset = 0;
		query.set('offset', '0');
		goto(`?${query.toString()}`);
	};

	export let hoverMovie = (
		movie: Movie,
		event: MouseEvent & {
			currentTarget: EventTarget & HTMLDivElement;
		}
	) => {
		const POPOVER_WIDTH = 300; // sync with css below
		const POPOVER_HEIGHT = 250; // approximated since height is unset
		let x = event.clientX;
		let y = event.clientY;

		if (x + POPOVER_WIDTH > window.innerWidth) {
			x -= POPOVER_WIDTH;
		}
		if (y + POPOVER_HEIGHT > window.innerHeight) {
			y -= POPOVER_HEIGHT;
		}

		selectedMoviePosition = { x, y };
		selectedMovie = movie;
	};

	export let onSortColumnChange = (col: string) => {
		let query = new URLSearchParams($page.url.searchParams.toString());
		query.set('sortCol', col);
		goto(`?${query.toString()}`);
	};

	export let onSortDirChange = (dir: string) => {
		let query = new URLSearchParams($page.url.searchParams.toString());
		query.set('sortDir', dir);
		goto(`?${query.toString()}`);
	};

	export let handleNextPage = () => {
		let query = new URLSearchParams($page.url.searchParams.toString());
		const newOffset = currentOffset + PAGE_LIMIT;
		currentOffset = newOffset;
		query.set('offset', newOffset.toString());
		goto(`?${query.toString()}`);
	};

	export let handlePrevPage = () => {
		let query = new URLSearchParams($page.url.searchParams.toString());
		const newOffset = Math.max(currentOffset - PAGE_LIMIT, 0);
		currentOffset = newOffset;
		query.set('offset', newOffset.toString());
		goto(`?${query.toString()}`);
	};

	export let handleGenreClick = (genre: string) => {
		const found = selectedGenres.find((g) => g === genre);
		if (found) {
			const copy = [...selectedGenres];
			copy.splice(copy.indexOf(genre), 1);
			selectedGenres = copy;
		} else {
			selectedGenres = [...selectedGenres, genre];
		}

		const query = new URLSearchParams($page.url.searchParams.toString());
		query.set('genres', JSON.stringify(selectedGenres));
		goto(`?${query.toString()}`);
	};
</script>

<header>
	<h1>Movie Search</h1>
	<h2>{data.total} Movies</h2>

	<select on:change={(e) => onYearChange(e.currentTarget.value)} name="yearSelect">
		<option value="">All Time</option>
		{#each selectYears as year, i}
			<option selected={year.toString() === $page.url.searchParams.get('year')} value={year}
				>{year}</option
			>
		{/each}
	</select>

	<input
		bind:value={searchTerm}
		on:keypress={(e) => e.key === 'Enter' && submitSearch(e.currentTarget.value)}
		placeholder="Search by Title"
	/>

	<div class="sorters">
		<span>Sort by: </span>
		<select on:change={(e) => onSortColumnChange(e.currentTarget.value)} bind:value={sortColumn}>
			<option value="title">Title</option>
			<option value="year">Year</option>
		</select>

		<select on:change={(e) => onSortDirChange(e.currentTarget.value)} bind:value={sortDir}>
			<option value="asc">Ascending</option>
			<option value="desc">Descending</option>
		</select>
	</div>

	<div class="genres-input">
		{#each data.genres as genre}
			<input
				type="checkbox"
				value={genre.name}
				checked={selectedGenres.indexOf(genre.name) !== -1}
				id={genre.id}
				on:change={(e) => handleGenreClick(e.currentTarget.value)}
			/>
			<label for={genre.id}>{genre.name}</label>
		{/each}
	</div>

	{#if $navigating}
		<span class="spinner">Loading</span>
	{/if}
</header>

<div class="movieWrapper">
	{#each data.movies as movie}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="movie"
			style:background-image={`url(${movie.thumbnail})`}
			on:mouseleave={() => (selectedMovie = undefined)}
			on:mouseenter={(e) => hoverMovie(movie, e)}
		>
			<div class="info-bg">
				<p class="title">{movie.title}</p>
				<p class="year">{movie.year}</p>
				<a class="link" href={`https://en.wikipedia.org/wiki/${movie.href}`} target="_blank"
					>Details</a
				>
			</div>
		</div>
	{/each}
</div>

{#if selectedMovie}
	<div
		class="summary-modal"
		style:top={selectedMoviePosition.y + 'px'}
		style:left={selectedMoviePosition.x + 'px'}
	>
		<p>{selectedMovie.extract}</p>
	</div>
{/if}

<div class="page-controls">
	<button
		on:click={() => handlePrevPage()}
		class={'previous-page-btn ' + (currentOffset === 0 ? 'hidden' : '')}>Previous</button
	>
	<button
		on:click={() => handleNextPage()}
		class={'next-page-btn ' + (data.total < currentOffset + PAGE_LIMIT ? 'hidden' : '')}
		>Next</button
	>
</div>

<style>
	.hidden {
		visibility: hidden;
	}

	.page-controls {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100vw;
		display: flex;
		justify-content: space-between;
	}

	.page-controls > button {
		margin: 15px;
	}

	header {
		margin: 10px auto;
		text-align: center;
	}
	.movieWrapper {
		flex-wrap: wrap;
		margin-top: 40px;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		grid-gap: 10px;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
	}

	.summary-modal {
		position: fixed;
		width: 300px;
		padding: 20px;
		background-color: white;
		box-shadow: 2px 2px 10px #0000001f;
		border-radius: 10px;
		pointer-events: none;
	}

	.movie {
		width: 180px;
		height: 300px;
		box-shadow: 0px 11px 15px #0000005e;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
		background-size: cover;
		background-repeat: no-repeat;
		background-position-x: 50%;
		transition: transform 100ms ease-in-out;
	}

	.movie:hover {
		transform: scale(1.05, 1.05);
	}

	.info-bg {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		top: 0;
		background: linear-gradient(0deg, #000000b5, transparent);
		color: white;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		padding-bottom: 20px;
	}

	.link {
		color: white;
	}

	.title {
		text-align: center;
		padding: 0 20px;
		font-size: larger;
		text-shadow: 1px 2px #000000cf;
		font-family: sans-serif;
		margin: 0;
	}

	.year {
	}

	.spinner {
		position: absolute;
		right: 50px;
		top: 50px;
	}

	.skeleton-loader-background {
		width: 80%;
		height: 20px;
		display: block;
		background: linear-gradient(
				to right,
				rgba(255, 255, 255, 0),
				rgba(255, 255, 255, 0.5) 30%,
				rgba(255, 255, 255, 0) 60%
			),
			lightgray;
		background-repeat: repeat-y;
		background-size: 50px 500px;
		background-position: 0 0;
		animation: shine 1s infinite;
	}

	@keyframes shine {
		to {
			background-position: 100% 0;
		}
	}
</style>
