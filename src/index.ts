import { login_auth, register_user } from './auth/login';
import { validateSession, delete_session } from './auth/session'

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		// Call function to validate if user is logged based on cookie
		validateSession(request, env.comick_personal_db)

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
				const body = await request.json<{
					email?: string;
					password?: string;
					username?: string | null;
				}>();

				const email = body.email;
				const password = body.password;
				const username = typeof body.username === 'string' ? body.username : null;

				if (!email || !password) {
					return Response.json({ success: false, error: 'Email and password are required' }, { status: 400 });
				}

				const result = await register_user(email, password, env.comick_personal_db, username);
				if (!result.success) {
					return Response.json({ success: false, error: result.error }, { status: 400 });
				}
				return Response.json({ success: true });
			}
			case '/api/logout':
				delete_session(request, env.comick_personal_db)
			default:
				return new Response('Not Found', { status: 404 });
		}
	},
} satisfies ExportedHandler<Env>;