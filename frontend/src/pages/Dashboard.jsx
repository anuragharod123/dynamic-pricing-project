import { useEffect, useState } from "react";
import {
    Play,
    RefreshCw,
    Package,
    IndianRupee,
    TrendingUp,
    TrendingDown
} from "lucide-react";

import { getProducts, runAgent } from "../api";
import ProductCard from "../components/ProductCard";

function Dashboard() {

    const [products, setProducts] = useState([]);
    const [actions, setActions] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function loadProducts() {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            setError("Unable to load products.");
        }
    }

    useEffect(() => {
        loadProducts();
    }, []);

    async function handleRunAgent() {

        try {
            setLoading(true);
            setError("");

            const result = await runAgent();

            const newActions = {};

            if (result?.results) {

                result.results.forEach((item) => {

                    newActions[item.product_id] =
                        item.result?.decision?.action || "KEEP";

                });
            }

            setActions(newActions);

            // Fetch latest prices after agent updates DynamoDB
            await loadProducts();

        } catch (error) {
            setError("Agent execution failed.");
        } finally {
            setLoading(false);
        }
    }

    const prices = products.map(
        product => Number(product.price || 0)
    );

    const totalProducts = products.length;

    const averagePrice =
        totalProducts > 0
            ? Math.round(
                prices.reduce((sum, price) => sum + price, 0)
                / totalProducts
            )
            : 0;

    const highestPrice =
        prices.length > 0 ? Math.max(...prices) : 0;

    const lowestPrice =
        prices.length > 0 ? Math.min(...prices) : 0;

    const increaseCount = Object.values(actions)
        .filter(action => action === "INCREASE")
        .length;

    const decreaseCount = Object.values(actions)
        .filter(action => action === "DECREASE")
        .length;

    return (
        <div>

            {/* DASHBOARD HEADER */}

            <div className="dashboard-toolbar">

                <div>
                    <h2>Pricing Overview</h2>

                    <p>
                        Monitor and optimize product prices using AI.
                    </p>
                </div>

                <button
                    className="run-agent-btn"
                    onClick={handleRunAgent}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <RefreshCw
                                size={19}
                                className="spin"
                            />
                            Running Agent...
                        </>
                    ) : (
                        <>
                            <Play size={19} />
                            Run Agent
                        </>
                    )}
                </button>

            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* KPI CARDS */}

            <div className="kpi-grid">

                <div className="kpi-card">

                    <div className="kpi-icon orange">
                        <Package size={22} />
                    </div>

                    <div>
                        <span>Total Products</span>
                        <strong>{totalProducts}</strong>
                    </div>

                </div>

                <div className="kpi-card">

                    <div className="kpi-icon blue">
                        <IndianRupee size={22} />
                    </div>

                    <div>
                        <span>Average Price</span>
                        <strong>
                            ₹{averagePrice.toLocaleString("en-IN")}
                        </strong>
                    </div>

                </div>

                <div className="kpi-card">

                    <div className="kpi-icon green">
                        <TrendingUp size={22} />
                    </div>

                    <div>
                        <span>Highest Price</span>
                        <strong>
                            ₹{highestPrice.toLocaleString("en-IN")}
                        </strong>
                    </div>

                </div>

                <div className="kpi-card">

                    <div className="kpi-icon red">
                        <TrendingDown size={22} />
                    </div>

                    <div>
                        <span>Lowest Price</span>
                        <strong>
                            ₹{lowestPrice.toLocaleString("en-IN")}
                        </strong>
                    </div>

                </div>

            </div>

            {/* AGENT SUMMARY */}

            {Object.keys(actions).length > 0 && (

                <div className="agent-summary">

                    <div>
                        <span>Last Agent Run</span>
                        <strong>Pricing analysis completed</strong>
                    </div>

                    <div className="agent-summary-stats">

                        <span className="summary-increase">
                            ↑ {increaseCount} Increased
                        </span>

                        <span className="summary-decrease">
                            ↓ {decreaseCount} Decreased
                        </span>

                    </div>

                </div>

            )}

            {/* PRODUCTS */}

            <div className="section-heading">

                <div>
                    <h2>Product Pricing</h2>
                    <p>
                        Current pricing decisions across your catalog
                    </p>
                </div>

                <span className="product-count">
                    {totalProducts} Products
                </span>

            </div>

            <div className="product-grid">

                {products.map((product) => (

                    <ProductCard
                        key={product.product_id}
                        product={product}
                        action={
                            actions[product.product_id] || "KEEP"
                        }
                    />

                ))}

            </div>

        </div>
    );
}

export default Dashboard;