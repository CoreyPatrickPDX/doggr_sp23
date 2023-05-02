import {FastifyInstance} from "fastify";
import fp from "fastify-plugin";

declare module 'fastify' {
    interface FastifyInstance {
        search: <T>(path: string, handler: any) => void
    }
}

const fastifySearchHttpMethod = async function(fastify: FastifyInstance, options) {

	const search = function search<T>(path, handler) {
		// We have to use .route() here because we need a non-standard http method, SEARCH
		fastify.route<T>(
			{
				method: "SEARCH",
				url: path,

				handler,
			});
	};

	// gives us access to `app.db`
	fastify.decorate("search", search);
};

export const FastifySearchHttpMethodPlugin = fp(fastifySearchHttpMethod, {
	name: "fastify-search-http-method",
});
