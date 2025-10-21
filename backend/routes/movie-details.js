import verifyJWT from "./verifyJWT.js";

function formatRuntime(runtime) {
    if (!runtime)  {
         return "Unknown";
    }
    const hours = Math.floor(runtime/60);
    const minutes = runtime % 60;
    return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

export default async function movieDetails(fastify, opts) {
    fastify.get("/movie-details", {preHandler: [verifyJWT]}, async (request, reply) => {
        try {
            const id = request.query.id
            if (!id) {
                throw new Error("BAD_REQUEST");
            }
            console.log("MOVIE ID:", id);
            const fetchQuery = await fetch(`https://api.themoviedb.org/3/movie/${id}?append_to_response=credits`, {
                    headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` },
                });
            const data = await fetchQuery.json();

            const main_actors = data.credits.cast
            ?.slice(0, 5)
            .map((actor) => ({
                name: actor.name,
                character: actor.character,
            })) || [];

            const directors = data.credits.crew
            ?.filter((person) => person.job == "Director")
            .map((d) => d.name) || [];

            const producers = data.credits.crew
            ?.filter((person) => person.job == "Producer")
            .map((d) => d.name) || [];
            console.log("BEFOR TRIM:",data);
            const movie = {
                id: data.id,
                imdb_id: data.imdb_id,
                title: data.title,
                release_date: data.release_date,
                runtime: formatRuntime(data.runtime),
                genres: data.genres?.map((g) => g.name) || [],
                vote_average: `${data.vote_average?.toFixed(1)} / 10`,
                overview: data.overview,
                poster_url: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
                backdrop_url: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
                main_actors,
                directors,
                producers,
            }
            console.log(movie)
            return reply.send(movie);
        }
        catch (err) {
            console.log("ERROR REQUEST TITLE:", err);
            return reply.code(400).send({error: "BAD_REQUEST"});
        }
    });
}