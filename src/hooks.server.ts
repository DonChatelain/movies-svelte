// https://kit.svelte.dev/docs/hooks#server-hooks
import { redirect, type Handle } from '@sveltejs/kit';
import { PG_CONNECTION_STRING } from '$env/static/private';

import postgres from 'postgres';

/**
 * key: redirect <from> path
 * value: redirect <to> path
 */
const redirects: Record<string, string> = {
	'/': '/movies'
};

export const handle: Handle = async ({ event, resolve }) => {
	const sql = postgres(PG_CONNECTION_STRING);

	event.locals = {
		sql: sql
	};

	if (redirects[event.url.pathname]) {
		throw redirect(301, redirects[event.url.pathname]);
	}

	return await resolve(event);
};
