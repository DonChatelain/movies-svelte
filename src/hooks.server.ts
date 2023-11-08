// https://kit.svelte.dev/docs/hooks#server-hooks
import type { Handle } from '@sveltejs/kit';
import { PG_CONNECTION_STRING } from '$env/static/private';

import postgres from 'postgres';

export const handle: Handle = async ({ event, resolve }) => {
	const sql = postgres(PG_CONNECTION_STRING);

	event.locals = {
		sql: sql
	};
	const response = await resolve(event);
	return response;
};
