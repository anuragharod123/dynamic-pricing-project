import { useEffect, useState } from "react";
import {
    History,
    TrendingUp,
    TrendingDown
} from "lucide-react";

import { getProducts, getPriceHistory } from "../api";

function PriceHistory() {

    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        getProducts()
            .then((data) => {

                setProducts(data);

                if (data.length > 0) {
                    setSelectedProduct(data[0].product_id);
                }

            })
            .catch(() => {});

    }, []);

    useEffect(() => {

        if (!selectedProduct) {
            return;
        }

        async function loadHistory() {

            try {

                setLoading(true);

                const data =
                    await getPriceHistory(selectedProduct);

                setHistory(data);

            } catch (error) {

                setHistory(null);

            } finally {

                setLoading(false);

            }
        }

        loadHistory();

    }, [selectedProduct]);

    const selectedProductData =
        products.find(
            product => product.product_id === selectedProduct
        );

    const amazonHistory =
        history?.amazon_price_history || [];

    const flipkartHistory =
        history?.flipkart_price_history || [];

    return (
        <div>

            <div className="page-heading history-header">

                <div>

                    <div className="history-title">
                        <div className="large-page-icon">
                            <History size={25} />
                        </div>

                        <div>
                            <h2>Price History</h2>

                            <p>
                                Track competitor prices over time
                            </p>
                        </div>
                    </div>

                </div>

                <select
                    className="product-select"
                    value={selectedProduct}
                    onChange={(e) =>
                        setSelectedProduct(e.target.value)
                    }
                >

                    {products.map((product) => (

                        <option
                            key={product.product_id}
                            value={product.product_id}
                        >
                            {product.name}
                        </option>

                    ))}

                </select>

            </div>

            {selectedProductData && (

                <div className="history-product-banner">

                    <div>
                        <span>Selected Product</span>
                        <strong>
                            {selectedProductData.name}
                        </strong>
                    </div>

                    <div>
                        <span>Current Price</span>
                        <strong>
                            ₹{Number(
                                selectedProductData.price
                            ).toLocaleString("en-IN")}
                        </strong>
                    </div>

                </div>

            )}

            {loading && (
                <div className="history-loading">
                    Loading price history...
                </div>
            )}

            {!loading && history && (

                <div className="history-grid">

                    {/* AMAZON */}

                    <div className="history-card">

                        <div className="history-card-header">

                            <div>
                                <h3>Amazon</h3>
                                <span>
                                    Competitor price tracking
                                </span>
                            </div>

                            <div className="history-source-icon amazon">
                                <TrendingUp size={20} />
                            </div>

                        </div>

                        <div className="history-list">

                            {amazonHistory.length > 0 ? (

                                [...amazonHistory]
                                    .reverse()
                                    .map((item, index) => (

                                        <div
                                            className="history-row"
                                            key={index}
                                        >

                                            <div>
                                                <strong>
                                                    ₹{Number(
                                                        item.price
                                                    ).toLocaleString("en-IN")}
                                                </strong>

                                                <small>
                                                    {new Date(
                                                        item.timestamp
                                                    ).toLocaleString()}
                                                </small>
                                            </div>

                                            {index === 0 && (
                                                <span className="latest-badge">
                                                    Latest
                                                </span>
                                            )}

                                        </div>

                                    ))

                            ) : (

                                <div className="empty-history">
                                    No Amazon price history yet.
                                </div>

                            )}

                        </div>

                    </div>

                    {/* FLIPKART */}

                    <div className="history-card">

                        <div className="history-card-header">

                            <div>
                                <h3>Flipkart</h3>
                                <span>
                                    Competitor price tracking
                                </span>
                            </div>

                            <div className="history-source-icon flipkart">
                                <TrendingDown size={20} />
                            </div>

                        </div>

                        <div className="history-list">

                            {flipkartHistory.length > 0 ? (

                                [...flipkartHistory]
                                    .reverse()
                                    .map((item, index) => (

                                        <div
                                            className="history-row"
                                            key={index}
                                        >

                                            <div>
                                                <strong>
                                                    ₹{Number(
                                                        item.price
                                                    ).toLocaleString("en-IN")}
                                                </strong>

                                                <small>
                                                    {new Date(
                                                        item.timestamp
                                                    ).toLocaleString()}
                                                </small>
                                            </div>

                                            {index === 0 && (
                                                <span className="latest-badge">
                                                    Latest
                                                </span>
                                            )}

                                        </div>

                                    ))

                            ) : (

                                <div className="empty-history">
                                    No Flipkart price history yet.
                                </div>

                            )}

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default PriceHistory;