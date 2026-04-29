export function fetcher(...args: Parameters<typeof fetch>) {
    return fetch(...args)
        .then((res) => {
            if (!res.ok) {
                throw Error(res.statusText);
            }

            return res.json();
        })
        .catch((error) => {
            console.error(error);
            throw error;
        });
}

export function fetcherWithToken(token: string, ...args: Parameters<typeof fetch>) {
    const hasBody = args[1]?.body !== undefined;
    const method = hasBody ? 'POST' : 'GET';

    return fetch(args[0], {
        ...args[1],
        method: args[1]?.method || method,
        headers: {
            ...args[1]?.headers,
            Authorization: `Bearer ${token}`,
            ...(hasBody && { 'Content-Type': 'application/json' }),
        },
    })
        .then((res) => {
            if (!res.ok) {
                throw Error(res.statusText);
            }

            return res.json();
        })
        .catch((error) => {
            console.error(error);
            throw error;
        });
}
