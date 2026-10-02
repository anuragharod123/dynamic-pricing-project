import { useEffect, useState } from "react";
import {
    Play,
    RefreshCw,
    Package,
    IndianRupee,
    TrendingUp,
    TrendingDown,
    Sparkles
} from "lucide-react";

import { getProducts, runAgent } from "../api";
import ProductCard from "../components/ProductCard";


function Dashboard() {

    const [products, setProducts] = useState([]);
    const [actions, setActions] = useState({});
    const [loading, setLoading] = useState(false);
    const [agentMessage, setAgentMessage] = useState("");
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
            setAgentMessage("");
            setActions({});

            const result = await runAgent();

            if (result?.status === "started") {

                setAgentMessage(
                    "Agent is analyzing competitor prices and optimizing your catalog. Please refresh dashboard after a few minutes."
                );

            }

        } catch (error) {

            setError("Unable to start the pricing agent.");

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
                prices.reduce(
                    (sum, price) => sum + price,
                    0
                ) / totalProducts
            )
            : 0;


    const highestPrice =
        prices.length > 0
            ? Math.max(...prices)
            : 0;


    const lowestPrice =
        prices.length > 0
            ? Math.min(...prices)
            : 0;


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

                            Starting Agent...

                        </>

                    ) : (

                        <>

                            <Play size={19} />

                            Run Agent

                        </>

                    )}

                </button>

            </div>


            {/* AGENT STATUS */}

            {agentMessage && (

                <div
                    style={{
                        marginTop: "18px",
                        padding: "16px 20px",
                        borderRadius: "12px",
                        background:
                            "linear-gradient(135deg, #202020 0%, #191919 100%)",
                        border: "1px solid #303030",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                        boxShadow: "0 4px 18px rgba(0, 0, 0, 0.18)"
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px"
                        }}
                    >

                        <div
                            style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "10px",
                                background: "rgba(249, 115, 22, 0.12)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0
                            }}
                        >

                            <Sparkles
                                size={19}
                                style={{
                                    color: "#f97316"
                                }}
                            />

                        </div>


                        <div>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    marginBottom: "3px"
                                }}
                            >

                                <span
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        color: "#f5f5f5"
                                    }}
                                >
                                    AI Pricing Agent is running
                                </span>


                                <span
                                    style={{
                                        width: "7px",
                                        height: "7px",
                                        borderRadius: "50%",
                                        background: "#22c55e",
                                        display: "inline-block",
                                        boxShadow:
                                            "0 0 8px rgba(34, 197, 94, 0.7)"
                                    }}
                                />

                            </div>


                            <span
                                style={{
                                    fontSize: "12px",
                                    color: "#888",
                                    lineHeight: "1.4"
                                }}
                            >
                                {agentMessage}
                            </span>

                        </div>

                    </div>


                    <RefreshCw
                        size={17}
                        className="spin"
                        style={{
                            color: "#777",
                            flexShrink: 0
                        }}
                    />

                </div>

            )}


            {/* ERROR */}

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

                        <strong>
                            {totalProducts}
                        </strong>

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

                        <strong>
                            Pricing analysis completed
                        </strong>

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