const API_BASE_URL =
    "awsgatewaylink"; // Replace with your actual API Gateway URL

export async function getProducts() {
    const response = await fetch(
        `${API_BASE_URL}/products`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }

    return response.json();
}

export async function runAgent() {
    const response = await fetch(
        `${API_BASE_URL}/agent/run`,
        {
            method: "POST"
        }
    );

    if (!response.ok) {
        throw new Error("Failed to run agent");
    }

    return response.json();
}

export async function getPriceHistory(productId) {
    const response = await fetch(
        `${API_BASE_URL}/price-history/${productId}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch price history");
    }

    return response.json();
}