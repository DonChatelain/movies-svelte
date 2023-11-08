// https://kit.svelte.dev/docs/hooks#server-hooks
import type { Handle } from '@sveltejs/kit';

import postgres from 'postgres';

export const handle: Handle = async ({ event, resolve }) => {
	const sql = postgres('postgres://localhost:5432/dj');

	event.locals = {
		sql: sql
	};
	const response = await resolve(event);
	return response;
};
