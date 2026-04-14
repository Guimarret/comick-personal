export default {
	async fetch(request, env, ctx): Promise<Response> {   
		const url = new URL(request.url);
		switch (url.pathname) {
			case '/':
				return new Response('')
			case '/message':
				return new Response('Hello, World!');
			case '/random':
				return new Response(crypto.randomUUID());
			default:
				return new Response('Not Found', { status: 404 });
		}
	},
} satisfies ExportedHandler<Env>;