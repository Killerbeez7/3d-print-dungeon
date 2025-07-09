type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
    method?: HttpMethod;
    headers?: Record<string, string>;
    body?: string;
}


async function requester<T = unknown>(method: HttpMethod, url: string, data?: unknown): Promise<T> {
    const options: RequestOptions = {};
    if (method !== "GET") {
        options.method = method;
    }
    if (data) {
        options.headers = {
            ...options.headers,
            "Content-Type": "application/json",
        };
        options.body = JSON.stringify(data);
    }
    try {
        const response = await fetch(url, options);
        const result: T = await response.json();
        if (!response.ok) {
            throw new Error((result as { message?: string }).message || "Request failed");
        }
        return result;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message || "Network error");
        }
        throw new Error("Network error");
    }
}

export const get = <T = unknown>(url: string): Promise<T> => requester<T>("GET", url);
export const post = <T = unknown>(url: string, data?: unknown): Promise<T> => requester<T>("POST", url, data);
export const put = <T = unknown>(url: string, data?: unknown): Promise<T> => requester<T>("PUT", url, data);
export const del = <T = unknown>(url: string): Promise<T> => requester<T>("DELETE", url);

export default {
    get,
    post,
    put,
    del,
};
