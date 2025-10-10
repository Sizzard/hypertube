import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


async function UserVerification(response, pool) {
    const existing = await pool.query(
    `SELECT id, email, oauth_provider FROM users WHERE email = $1`,
    [response.email]
  );

  // User exists
  if (existing.rows.length > 0) {
    const user = existing.rows[0];
    // User is already in 42 or mutiple and trying to just connect
    if (user.oauth_provider === '42') {
      console.log("42 USER TRYING TO CONNECT");
      return user.id;
    }
    // User is not in 42 and emails are same // NEED TO LINK THE ACCOUNT
    if (user.email == response.email) {
      throw {type: "LINK_ACCOUNT", email: user.email, provider: '42', id: response.id};
    }
    // User is not in 42 and emails are different
    throw new Error("EMAIL_DIFFERENT");
  }
  else {  // User does not exists and need to be created
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const result = await pool.query(
        `INSERT INTO users (username, first_name, last_name, email, password, oauth_provider, oauth_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        [response.login, response.first_name, response.last_name, response.email, hashedPassword, '42', response.id]
    );
    console.log("CREATED NEW USER THROUGH 42");
    return result.rows[0].id;
  }
}

export default async function callback_42(fastify, opts) {
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
          client_id: process.env.CLIENT_ID_42,
          client_secret: process.env.CLIENT_SECRET_42,
          code,
          redirect_uri: process.env.REDIRECT_URI_42,
          state: process.env.NEXT_PUBLIC_STATE,
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

      const userId = await UserVerification(response, pool);

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
      if (err.message == "EMAIL_DIFFERENT") {
        return reply.redirect(`${process.env.FRONTEND_URL}/auth/error`);
      }
      else if (err.type === "LINK_ACCOUNT") {
        return reply.redirect(`${process.env.FRONTEND_URL}/auth/linking?email=${err.email}&provider=${err.provider}&id=${err.id}`);
      }
      else {
        return reply.code(500).send({ error: "INTERNAL_ERROR" });
      }
    }
  });
}
