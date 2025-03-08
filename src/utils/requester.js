export class Requester {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, method = "GET", body = null) {
        const options = {
            method,
            headers: {
                "Content-Type": "application/json",
            },
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, options);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Request failed");
            }
            return data;
        } catch (error) {
            throw new Error(error.message || "Network error");
        }
    }

    get(endpoint) {
        return this.request(endpoint, "GET");
    }

    post(endpoint, body) {
        return this.request(endpoint, "POST", body);
    }

    put(endpoint, body) {
        return this.request(endpoint, "PUT", body);
    }

    delete(endpoint) {
        return this.request(endpoint, "DELETE");
    }
}
