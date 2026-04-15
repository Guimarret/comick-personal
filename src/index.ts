import { login_auth, register_user } from './auth/login';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		switch (url.pathname) {
			case '/':
				return new Response('');
			case '/api/login': {
				if (request.method !== 'POST') {
					return new Response('Method Not Allowed', { status: 405 });
				}
				const { identifier, password } = await request.json<{ identifier: string; password: string }>();
				const result = await login_auth(identifier, password, env.comick_personal_db);
				if (!result.success) {
					return Response.json({ success: false, error: result.error }, { status: 401 });
				}
				return Response.json({ success: true });
			}
			case '/api/create_user': {
				if (request.method !== 'POST') {
					return new Response('Method Not Allowed', { status: 405 });
				}
				const { email, password, username } = await request.json<{ email: string; password: string, username: string}>();
				const result = await register_user(email, password, env.comick_personal_db, username);
				if (!result.success) {
					return Response.json({ success: false, error: result.error }, { status: 400 });
				}
				return Response.json({ success: true });
			}
			case '/message':
				return new Response('Hello, World!');
			case '/random':
				return new Response(crypto.randomUUID());
			default:
				return new Response('Not Found', { status: 404 });
		}
	},
} satisfies ExportedHandler<Env>;