import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

async function UserVerification(response, pool) {
  const existingAccount = await pool.query(
    "SELECT id, email FROM users WHERE oauth_id = $1",
    [response.id],
  );
  if (existingAccount.rows.length > 0) {
    console.log("42 CONNECT, USER ALREADY EXISTS, CONNECTING ...");
    return existingAccount.rows[0].id;
  }

  const existingUsername = await pool.query(
    `SELECT id, email, oauth_provider FROM users WHERE username = $1`,
    [response.login]
  );
  const existingMail = await pool.query(
    `SELECT id, email, oauth_provider FROM users WHERE email = $1`,
    [response.email]
  );
  // User exists
  if (existingUsername.rows.length > 0 || existingMail.rows.length > 0) {
    throw new Error("OAUTH_CONFLICT");
  }
  else {  // User does not exists and need to be created
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const result = await pool.query(
        `INSERT INTO users (username, first_name, last_name, email, password, oauth_provider, oauth_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        [response.login, response.login, response.login, response.email, hashedPassword, 'github', response.id]
    );
    console.log("CREATED NEW USER THROUGH GITHUB");
    return result.rows[0].id;
  }
}

export default async function callback_github(fastify, opts) {
  const pool = opts.pool;

  fastify.get("/callback", async (request, reply) => {
    const { code } = request.query;

    if (!code) {
      return reply.code(400).send({ error: "CODE_MISSING" });
    }

    console.log("code from query string =", code);

    try {
      //  Récupération du token github
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/json",
                  "Accept": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI,
        }),
      });

      const tokenData = await tokenResponse.json();
      if (!tokenData.access_token) {
        console.error("Token error:", tokenData);
        return reply.code(400).send({ error: "INVALID_TOKEN_RESPONSE" });
      }

      const accessToken = tokenData.access_token;

      //  Appel à l'API github pour obtenir les infos utilisateur
      const aboutMe = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const response = await aboutMe.json();

      const aboutEmail = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const emails = await aboutEmail.json();

      const primaryEmailObj = emails.find((e) => e.primary === true);
      const primaryEmail = primaryEmailObj?.email;

      if (!primaryEmail) {
        throw new Error("EMAIL_PRIMARY");
      }
      response.email = primaryEmail;

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
      console.error("Error in github callback:", err);
      if (err.message == "OAUTH_CONFLICT" || err.message === "EMAIL_PRIMARY") {
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
