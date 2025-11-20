let subJWT = null;

async function loginOpenSubTitle() {
    const loginRes = await fetch("https://api.opensubtitles.com/api/v1/login", {
        method: "POST",
        headers: {   
            "Accept": "application/json" ,
            "Api-Key": process.env.OPEN_SUB_API,
            "Content-Type": "application/json",
            "User-Agent": "hypertube v1",
},
        body: JSON.stringify({
            username: process.env.OPEN_SUB_USER,
            password: process.env.OPEN_SUB_PASS,
        }),
    });

    if (!loginRes.ok) {
        throw new Error("Login Failed");
    }

    const data = await loginRes.json();

    subJWT = data.token;

    console.log("subJWT Acquired : ", subJWT);
}

async function openSubFetch(endpoint, options = {}) {
    if (!subJWT) {
        await loginOpenSubTitle();
    }

    const res = await fetch(`https://api.opensubtitles.com/api/v1${endpoint}`, {
        ...options,
        headers: {
            "Accept": "application/json",
            "Api-Key": process.env.OPEN_SUB_API,
            "Authorization": `Bearer ${subJWT}`,
            "User-Agent": "hypertube v1",
            ...(options.headers || {}),
        },
    });

    if (res.status === 403 || res.status === 401) {
        console.log("Cookie expired, relogging...");
        await loginOpenSubTitle();
        return openSubFetch(endpoint, options);
    }
    return res;
}

export default {
    openSubFetch,
};