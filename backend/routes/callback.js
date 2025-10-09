import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default async function callback(fastify, opts) {
  const pool = opts.pool;

  fastify.get("/callback", async (request, reply) => {
    const { code } = request.query;

    if (!code) {
      return reply.code(400).send({ error: "CODE_MISSING" });
    }

    console.log("code from query string =", code);

    try {
      //  Récupération du token 42
      const tokenResponse = await fetch("https://api.intra.42.fr/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "authorization_code",
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          code,
          redirect_uri: process.env.REDIRECT_URI,
          state: process.env.NEXT_PUBLIC_STATE_,
        }),
      });

      const tokenData = await tokenResponse.json();
      if (!tokenData.access_token) {
        console.error("Token error:", tokenData);
        return reply.code(400).send({ error: "INVALID_TOKEN_RESPONSE" });
      }

      const accessToken = tokenData.access_token;

      //  Appel à l'API 42 pour obtenir les infos utilisateur
      const aboutMe = await fetch("https://api.intra.42.fr/v2/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const response = await aboutMe.json();

      // console.log(
      //   "About me:",
      //   response.login,
      //   response.first_name,
      //   response.last_name,
      //   response.email,
      //   response.id,
      // );

      //  Vérifier si l'utilisateur existe déjà
      const existing = await pool.query(
        `SELECT id FROM users WHERE email = $1`,
        [response.email]
      );

      if (existing.rows.length > 0) {
        const user = existing.rows[0];
        if (!user.oauth_provider) {
            await pool.query(
                `UPDATE users SET oauth_provider = $1, oauth_id = $2 WHERE id = $3`,
                ['42', response.id, user.id],
            );
        }
        console.log("User already exists:", response.id);
      } else {
        //  Créer un mot de passe aléatoire
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        //  Insérer le nouvel utilisateur
        const result = await pool.query(
          `INSERT INTO users (username, first_name, last_name, email, password, oauth_provider)
           VALUES ($1,$2,$3,$4,$5,$6)
           RETURNING id`,
          [response.login, response.first_name, response.last_name, response.email, hashedPassword, "42"]
        );

        let userId = result.rows[0].id;
        console.log("User created via 42 Connect:", userId);
      }

      // générer un JWT ici et le renvoyer dans l’URL
      const token = jwt.sign(
            {
                id: userId,
                email: response.email,
                username: response.login,
            },
            process.env.JWT_SECRET,
            {expiresIn: "2h"}
        );
      return reply.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);

    } catch (err) {
      console.error("Error in 42 callback:", err);
      return reply.code(500).send({ error: "INTERNAL_ERROR" });
    }
  });
}
