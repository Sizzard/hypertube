let qbtCookie = null;

async function loginQbittorrent() {
    const loginRes = await fetch("http://qbittorrent:8080/api/v2/auth/login", {
        method: "POST",
        headers: { "Content-type" : "application/x-www-form-urlencoded"},
        body: new URLSearchParams({
            username: "admin",
            password: "adminadmin",
        }),
    });

    if (!loginRes.ok) {
        throw new Error("Login Failed");
    }
    console.log(loginRes);
    const cookie = loginRes.headers.get("set-cookie");
    
    if (!cookie) {
        throw new Error("No auth cookie received");
    }
    qbtCookie = cookie.split(";")[0];
    console.log("QbtCookie Acquired : ", qbtCookie);
}

async function qbtFetch(endpoint, options) {
    if (!qbtCookie) {
        await loginQbittorrent();
    }

    const res = await fetch(`http://qbittorrent:8080/${endpoint}`, {
        ...options,
        headers: {
            ...fetch(options.headers || {}),
            Cookie: qbtCookie,
        },
    });

    if (res.status === 403 || res.status === 401) {
        console.log("Cookie expired, relogging...");
        await loginQbittorrent();
        return qbtFetch(endpoint, options);
    }
    return res;
}

export default {
    qbtFetch,
};