import verifyJWT from "./verifyJWT.js";

export default async function searchMovie(fastify, opts) {
    fastify.get("/search-movie", {preHandler: [verifyJWT]}, async (request, reply) => {
        try {
            const title = request.query.title
            if (!title) {
                throw new Error("BAD_REQUEST");
            }
            // const fetchQuery = await fetch(`http://www.omdbapi.com/?apikey=${process.env.OMDB_API}&s=${title}&type=movie`);
            const fetchQuery = await fetch(`https://api.themoviedb.org/3/search/movie?query=${title}`, {
                    headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` },
                });
            const response = await fetchQuery.json();
            if (!response.results) {
                return reply.code(404).send({error: "NOT_FOUND"});
            }
            console.log("BEFORE TRIM:", response.results);
            const filtered = response.results
            .filter((movie) => !movie.adult && movie.poster_path && movie.vote_count > 500)
            .map((movie) => ({
                id: movie.id,
                title: movie.title,
                release_date: movie.release_date,
                poster_path: movie.poster_path,
                overview: movie.overview,
                vote_average: movie.vote_average,
                vote_count: movie.vote_count,
            }));

            filtered.sort((a, b) => a.title.localeCompare(b.title));

            console.log("AFTER TRIM:", filtered);
            return reply.send({
                page: response.page,
                results: filtered,
            });
        }
        catch (err) {
            console.log("ERROR SEARCH-MOVIE:", err);
            return reply.code(400).send({error: "BAD_REQUEST"});
        }
    });
}