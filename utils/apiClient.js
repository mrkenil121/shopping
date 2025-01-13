// utils/apiClient.js

const apiClient = async (url, options = {}) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null; // Get token from local storage (browser side)

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }), // Add token to the headers if available
    ...options.headers, // Merge any custom headers passed in the options
  };

  const config = {
    method: options.method || "GET", // Default to GET method if not provided
    headers,
    body: options.method !== "GET" && options.body ? JSON.stringify(options.body) : undefined, // Add body if not GET
    ...options, // Spread any other options provided (e.g., mode, cache, etc.)
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      // If response is not ok, throw an error
      const errorData = await response.json();
      const errorMessage = errorData.message || "Something went wrong";
      throw new Error(errorMessage);
    }

    // Return the JSON response if successful
    return await response.json();
  } catch (error) {
    // Handle any errors that occur during the fetch operation
    console.error("API error:", error);
    throw error; // Rethrow the error for the calling function to handle
  }
};

export default apiClient;
