import axios from "axios";

//Initialize an axios instance with default configuration.
const api = axios.create({
    // Origin Url connect to backend
    baseURL: 'http://localhost:5051',
    // Include a login cookie in every request (this is crucial for the Cookie Auth mechanism)
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
})

export default api