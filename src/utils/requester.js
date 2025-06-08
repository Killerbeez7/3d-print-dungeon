// async function requester(method, url, data) {
//     const options = {};

//     // TODO: Implement logic for access token
    
//     // if (accessToken) {
//     //     options.headers = {
//     //         ...options.headers,
//     //         "X-Authorization": accessToken,
//     //     };
//     // }

//     if (method !== "GET") {
//         options.method = method;
//     }

//     if (data) {
//         options.headers = {
//             ...options.headers,
//             "Content-Type": "application/json",
//         };

//         options.body = JSON.stringify(data);
//     }

//     try {
//         const response = await fetch(url, options);
//         const result = await response.json();

//         if (!response.ok) {
//             throw new Error(data.message || "Request failed");
//         }
//         return result;
//     } catch (error) {
//         throw new Error(error.message || "Network error");
//     }
// }

// export const get = requester.bind(null, "GET");
// export const post = requester.bind(null, "POST");
// export const put = requester.bind(null, "PUT");
// export const del = requester.bind(null, "DELETE");

// export default {
//     get,
//     post,
//     put,
//     del,
// };
