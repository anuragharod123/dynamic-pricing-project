import { useEffect, useState } from "react";
import {
    History,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Clock3
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


    const amazonLatest =
        amazonHistory.length > 0
            ? amazonHistory[amazonHistory.length - 1]
            : null;


    const flipkartLatest =
        flipkartHistory.length > 0
            ? flipkartHistory[flipkartHistory.length - 1]
            : null;


    function formatPrice(price) {

        return `₹${Number(price).toLocaleString("en-IN")}`;

    }


    function formatDate(timestamp) {

        return new Date(timestamp).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    function getPriceChange(historyData) {

        if (historyData.length < 2) {
            return null;
        }

        const latest =
            Number(
                historyData[historyData.length - 1].price
            );

        const previous =
            Number(
                historyData[historyData.length - 2].price
            );

        const difference = latest - previous;

        return {
            difference,
            direction:
                difference > 0
                    ? "up"
                    : difference < 0
                        ? "down"
                        : "same"
        };

    }


    const amazonChange =
        getPriceChange(amazonHistory);


    const flipkartChange =
        getPriceChange(flipkartHistory);


    /*
     * Build combined chart data.
     * We use the most recent 8 records from both competitors.
     */
    const chartData = [

        ...amazonHistory.map(item => ({
            source: "Amazon",
            price: Number(item.price),
            timestamp: item.timestamp
        })),

        ...flipkartHistory.map(item => ({
            source: "Flipkart",
            price: Number(item.price),
            timestamp: item.timestamp
        }))

    ]
        .sort(
            (a, b) =>
                new Date(a.timestamp) -
                new Date(b.timestamp)
        )
        .slice(-8);


    const chartPrices =
        chartData.map(item => item.price);


    const chartMin =
        chartPrices.length > 0
            ? Math.min(...chartPrices)
            : 0;


    const chartMax =
        chartPrices.length > 0
            ? Math.max(...chartPrices)
            : 0;


    function getChartY(price) {

        if (chartMax === chartMin) {
            return 50;
        }

        return (
            90 -
            (
                (price - chartMin) /
                (chartMax - chartMin)
            ) * 70
        );

    }


    return (

        <div>

            {/* PAGE HEADER */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                    marginBottom: "24px"
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
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: "rgba(249, 115, 22, 0.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >

                        <History
                            size={24}
                            style={{
                                color: "#f97316"
                            }}
                        />

                    </div>


                    <div>

                        <h2
                            style={{
                                margin: 0,
                                fontSize: "22px"
                            }}
                        >
                            Price History
                        </h2>

                        <p
                            style={{
                                margin: "5px 0 0",
                                color: "#888",
                                fontSize: "13px"
                            }}
                        >
                            Track competitor prices over time
                        </p>

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


            {/* SELECTED PRODUCT */}

            {selectedProductData && (

                <div
                    style={{
                        background:
                            "linear-gradient(135deg, #202020, #191919)",
                        border: "1px solid #303030",
                        borderRadius: "14px",
                        padding: "18px 22px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "22px"
                    }}
                >

                    <div>

                        <span
                            style={{
                                display: "block",
                                fontSize: "11px",
                                color: "#777",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                marginBottom: "6px"
                            }}
                        >
                            Selected Product
                        </span>

                        <strong
                            style={{
                                fontSize: "16px"
                            }}
                        >
                            {selectedProductData.name}
                        </strong>

                    </div>


                    <div
                        style={{
                            textAlign: "right"
                        }}
                    >

                        <span
                            style={{
                                display: "block",
                                fontSize: "11px",
                                color: "#777",
                                marginBottom: "5px"
                            }}
                        >
                            Current Price
                        </span>

                        <strong
                            style={{
                                fontSize: "19px",
                                color: "#f5f5f5"
                            }}
                        >
                            {formatPrice(
                                selectedProductData.price
                            )}
                        </strong>

                    </div>

                </div>

            )}


            {/* LOADING */}

            {loading && (

                <div
                    style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "#777"
                    }}
                >
                    Loading price history...
                </div>

            )}


            {!loading && history && (

                <>

                    {/* COMPETITOR SUMMARY */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(2, minmax(0, 1fr))",
                            gap: "18px",
                            marginBottom: "20px"
                        }}
                    >

                        {/* AMAZON */}

                        <div
                            style={{
                                background: "#1d1d1d",
                                border: "1px solid #303030",
                                borderRadius: "14px",
                                padding: "20px"
                            }}
                        >

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start"
                                }}
                            >

                                <div>

                                    <span
                                        style={{
                                            fontSize: "12px",
                                            color: "#777"
                                        }}
                                    >
                                        COMPETITOR
                                    </span>

                                    <h3
                                        style={{
                                            margin:
                                                "5px 0 0",
                                            fontSize: "18px",
                                            color: "#f97316"
                                        }}
                                    >
                                        Amazon
                                    </h3>

                                </div>


                                <div
                                    style={{
                                        width: "38px",
                                        height: "38px",
                                        borderRadius: "10px",
                                        background:
                                            "rgba(249,115,22,0.12)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                >

                                    <TrendingUp
                                        size={19}
                                        style={{
                                            color: "#f97316"
                                        }}
                                    />

                                </div>

                            </div>


                            <div
                                style={{
                                    marginTop: "22px"
                                }}
                            >

                                <span
                                    style={{
                                        color: "#777",
                                        fontSize: "12px"
                                    }}
                                >
                                    Latest Price
                                </span>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        marginTop: "4px"
                                    }}
                                >

                                    <strong
                                        style={{
                                            fontSize: "24px"
                                        }}
                                    >
                                        {amazonLatest
                                            ? formatPrice(
                                                amazonLatest.price
                                            )
                                            : "—"}
                                    </strong>


                                    {amazonChange &&
                                        amazonChange.direction !== "same" && (

                                            <span
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "3px",
                                                    fontSize: "11px",
                                                    color:
                                                        amazonChange.direction ===
                                                        "up"
                                                            ? "#ef4444"
                                                            : "#22c55e"
                                                }}
                                            >

                                                {amazonChange.direction ===
                                                "up"
                                                    ? (
                                                        <ArrowUpRight
                                                            size={14}
                                                        />
                                                    )
                                                    : (
                                                        <ArrowDownRight
                                                            size={14}
                                                        />
                                                    )}

                                                {formatPrice(
                                                    Math.abs(
                                                        amazonChange.difference
                                                    )
                                                )}

                                            </span>

                                        )}

                                </div>

                            </div>

                        </div>


                        {/* FLIPKART */}

                        <div
                            style={{
                                background: "#1d1d1d",
                                border: "1px solid #303030",
                                borderRadius: "14px",
                                padding: "20px"
                            }}
                        >

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start"
                                }}
                            >

                                <div>

                                    <span
                                        style={{
                                            fontSize: "12px",
                                            color: "#777"
                                        }}
                                    >
                                        COMPETITOR
                                    </span>

                                    <h3
                                        style={{
                                            margin:
                                                "5px 0 0",
                                            fontSize: "18px",
                                            color: "#60a5fa"
                                        }}
                                    >
                                        Flipkart
                                    </h3>

                                </div>


                                <div
                                    style={{
                                        width: "38px",
                                        height: "38px",
                                        borderRadius: "10px",
                                        background:
                                            "rgba(59,130,246,0.12)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                >

                                    <TrendingDown
                                        size={19}
                                        style={{
                                            color: "#60a5fa"
                                        }}
                                    />

                                </div>

                            </div>


                            <div
                                style={{
                                    marginTop: "22px"
                                }}
                            >

                                <span
                                    style={{
                                        color: "#777",
                                        fontSize: "12px"
                                    }}
                                >
                                    Latest Price
                                </span>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        marginTop: "4px"
                                    }}
                                >

                                    <strong
                                        style={{
                                            fontSize: "24px"
                                        }}
                                    >
                                        {flipkartLatest
                                            ? formatPrice(
                                                flipkartLatest.price
                                            )
                                            : "—"}
                                    </strong>


                                    {flipkartChange &&
                                        flipkartChange.direction !== "same" && (

                                            <span
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "3px",
                                                    fontSize: "11px",
                                                    color:
                                                        flipkartChange.direction ===
                                                        "up"
                                                            ? "#ef4444"
                                                            : "#22c55e"
                                                }}
                                            >

                                                {flipkartChange.direction ===
                                                "up"
                                                    ? (
                                                        <ArrowUpRight
                                                            size={14}
                                                        />
                                                    )
                                                    : (
                                                        <ArrowDownRight
                                                            size={14}
                                                        />
                                                    )}

                                                {formatPrice(
                                                    Math.abs(
                                                        flipkartChange.difference
                                                    )
                                                )}

                                            </span>

                                        )}

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* PRICE MOVEMENT */}

                    {chartData.length > 1 && (

                        <div
                            style={{
                                background: "#1d1d1d",
                                border: "1px solid #303030",
                                borderRadius: "14px",
                                padding: "22px",
                                marginBottom: "20px"
                            }}
                        >

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "20px"
                                }}
                            >

                                <div>

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px"
                                        }}
                                    >

                                        <Activity
                                            size={18}
                                            style={{
                                                color: "#f97316"
                                            }}
                                        />

                                        <h3
                                            style={{
                                                margin: 0,
                                                fontSize: "16px"
                                            }}
                                        >
                                            Price Movement
                                        </h3>

                                    </div>

                                    <span
                                        style={{
                                            display: "block",
                                            marginTop: "5px",
                                            color: "#777",
                                            fontSize: "12px"
                                        }}
                                    >
                                        Recent competitor price changes
                                    </span>

                                </div>


                                <div
                                    style={{
                                        display: "flex",
                                        gap: "18px",
                                        fontSize: "11px",
                                        color: "#888"
                                    }}
                                >

                                    <span>
                                        <span
                                            style={{
                                                display: "inline-block",
                                                width: "8px",
                                                height: "8px",
                                                borderRadius: "50%",
                                                background: "#f97316",
                                                marginRight: "6px"
                                            }}
                                        />
                                        Amazon
                                    </span>

                                    <span>
                                        <span
                                            style={{
                                                display: "inline-block",
                                                width: "8px",
                                                height: "8px",
                                                borderRadius: "50%",
                                                background: "#60a5fa",
                                                marginRight: "6px"
                                            }}
                                        />
                                        Flipkart
                                    </span>

                                </div>

                            </div>


                            <div
                                style={{
                                    width: "100%",
                                    height: "220px"
                                }}
                            >

                                <svg
                                    width="100%"
                                    height="100%"
                                    viewBox="0 0 800 220"
                                    preserveAspectRatio="none"
                                >

                                    {[25, 75, 125, 175].map(
                                        y => (

                                            <line
                                                key={y}
                                                x1="0"
                                                y1={y}
                                                x2="800"
                                                y2={y}
                                                stroke="#292929"
                                                strokeWidth="1"
                                            />

                                        )
                                    )}


                                    {chartData.map(
                                        (item, index) => {

                                            if (
                                                index ===
                                                chartData.length - 1
                                            ) {
                                                return null;
                                            }

                                            const next =
                                                chartData[index + 1];

                                            const x1 =
                                                (
                                                    index /
                                                    Math.max(
                                                        chartData.length - 1,
                                                        1
                                                    )
                                                ) * 800;

                                            const x2 =
                                                (
                                                    (index + 1) /
                                                    Math.max(
                                                        chartData.length - 1,
                                                        1
                                                    )
                                                ) * 800;

                                            const y1 =
                                                getChartY(
                                                    item.price
                                                );

                                            const y2 =
                                                getChartY(
                                                    next.price
                                                );

                                            return (

                                                <line
                                                    key={
                                                        `${index}-${item.source}`
                                                    }
                                                    x1={x1}
                                                    y1={y1}
                                                    x2={x2}
                                                    y2={y2}
                                                    stroke={
                                                        item.source ===
                                                        "Amazon"
                                                            ? "#f97316"
                                                            : "#60a5fa"
                                                    }
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    opacity="0.9"
                                                />

                                            );

                                        }
                                    )}


                                    {chartData.map(
                                        (item, index) => {

                                            const x =
                                                (
                                                    index /
                                                    Math.max(
                                                        chartData.length - 1,
                                                        1
                                                    )
                                                ) * 800;

                                            const y =
                                                getChartY(
                                                    item.price
                                                );

                                            return (

                                                <circle
                                                    key={
                                                        `${item.source}-${index}`
                                                    }
                                                    cx={x}
                                                    cy={y}
                                                    r="4"
                                                    fill={
                                                        item.source ===
                                                        "Amazon"
                                                            ? "#f97316"
                                                            : "#60a5fa"
                                                    }
                                                />

                                            );

                                        }
                                    )}

                                </svg>

                            </div>

                        </div>

                    )}


                    {/* RECENT HISTORY */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(2, minmax(0, 1fr))",
                            gap: "18px"
                        }}
                    >

                        {/* AMAZON HISTORY */}

                        <div
                            style={{
                                background: "#1d1d1d",
                                border: "1px solid #303030",
                                borderRadius: "14px",
                                overflow: "hidden"
                            }}
                        >

                            <div
                                style={{
                                    padding: "17px 20px",
                                    borderBottom:
                                        "1px solid #2c2c2c",
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems: "center"
                                }}
                            >

                                <div>

                                    <h3
                                        style={{
                                            margin: 0,
                                            fontSize: "15px"
                                        }}
                                    >
                                        Amazon History
                                    </h3>

                                    <span
                                        style={{
                                            color: "#777",
                                            fontSize: "11px"
                                        }}
                                    >
                                        {amazonHistory.length} records
                                    </span>

                                </div>


                                <TrendingUp
                                    size={17}
                                    style={{
                                        color: "#f97316"
                                    }}
                                />

                            </div>


                            <div>

                                {amazonHistory.length > 0 ? (

                                    [...amazonHistory]
                                        .reverse()
                                        .map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <div
                                                    key={index}
                                                    style={{
                                                        padding:
                                                            "13px 20px",
                                                        display:
                                                            "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        alignItems:
                                                            "center",
                                                        borderBottom:
                                                            "1px solid #292929"
                                                    }}
                                                >

                                                    <div>

                                                        <strong
                                                            style={{
                                                                fontSize:
                                                                    "14px"
                                                            }}
                                                        >
                                                            {formatPrice(
                                                                item.price
                                                            )}
                                                        </strong>

                                                        <div
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: "5px",
                                                                marginTop:
                                                                    "4px",
                                                                color:
                                                                    "#777",
                                                                fontSize:
                                                                    "10px"
                                                            }}
                                                        >

                                                            <Clock3
                                                                size={
                                                                    11
                                                                }
                                                            />

                                                            {formatDate(
                                                                item.timestamp
                                                            )}

                                                        </div>

                                                    </div>


                                                    {index ===
                                                        0 && (

                                                        <span
                                                            style={{
                                                                padding:
                                                                    "4px 8px",
                                                                borderRadius:
                                                                    "20px",
                                                                background:
                                                                    "rgba(249,115,22,0.12)",
                                                                color:
                                                                    "#f97316",
                                                                fontSize:
                                                                    "10px",
                                                                fontWeight:
                                                                    "600"
                                                            }}
                                                        >
                                                            Latest
                                                        </span>

                                                    )}

                                                </div>

                                            )
                                        )

                                ) : (

                                    <div
                                        style={{
                                            padding:
                                                "35px 20px",
                                            textAlign:
                                                "center",
                                            color: "#666",
                                            fontSize: "12px"
                                        }}
                                    >
                                        No Amazon price history yet.
                                    </div>

                                )}

                            </div>

                        </div>


                        {/* FLIPKART HISTORY */}

                        <div
                            style={{
                                background: "#1d1d1d",
                                border: "1px solid #303030",
                                borderRadius: "14px",
                                overflow: "hidden"
                            }}
                        >

                            <div
                                style={{
                                    padding: "17px 20px",
                                    borderBottom:
                                        "1px solid #2c2c2c",
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems: "center"
                                }}
                            >

                                <div>

                                    <h3
                                        style={{
                                            margin: 0,
                                            fontSize: "15px"
                                        }}
                                    >
                                        Flipkart History
                                    </h3>

                                    <span
                                        style={{
                                            color: "#777",
                                            fontSize: "11px"
                                        }}
                                    >
                                        {flipkartHistory.length} records
                                    </span>

                                </div>


                                <TrendingDown
                                    size={17}
                                    style={{
                                        color: "#60a5fa"
                                    }}
                                />

                            </div>


                            <div>

                                {flipkartHistory.length > 0 ? (

                                    [...flipkartHistory]
                                        .reverse()
                                        .map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <div
                                                    key={index}
                                                    style={{
                                                        padding:
                                                            "13px 20px",
                                                        display:
                                                            "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        alignItems:
                                                            "center",
                                                        borderBottom:
                                                            "1px solid #292929"
                                                    }}
                                                >

                                                    <div>

                                                        <strong
                                                            style={{
                                                                fontSize:
                                                                    "14px"
                                                            }}
                                                        >
                                                            {formatPrice(
                                                                item.price
                                                            )}
                                                        </strong>

                                                        <div
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: "5px",
                                                                marginTop:
                                                                    "4px",
                                                                color:
                                                                    "#777",
                                                                fontSize:
                                                                    "10px"
                                                            }}
                                                        >

                                                            <Clock3
                                                                size={
                                                                    11
                                                                }
                                                            />

                                                            {formatDate(
                                                                item.timestamp
                                                            )}

                                                        </div>

                                                    </div>


                                                    {index ===
                                                        0 && (

                                                        <span
                                                            style={{
                                                                padding:
                                                                    "4px 8px",
                                                                borderRadius:
                                                                    "20px",
                                                                background:
                                                                    "rgba(59,130,246,0.12)",
                                                                color:
                                                                    "#60a5fa",
                                                                fontSize:
                                                                    "10px",
                                                                fontWeight:
                                                                    "600"
                                                            }}
                                                        >
                                                            Latest
                                                        </span>

                                                    )}

                                                </div>

                                            )
                                        )

                                ) : (

                                    <div
                                        style={{
                                            padding:
                                                "35px 20px",
                                            textAlign:
                                                "center",
                                            color: "#666",
                                            fontSize: "12px"
                                        }}
                                    >
                                        No Flipkart price history yet.
                                    </div>

                                )}

                            </div>

                        </div>

                    </div>

                </>

            )}

        </div>

    );
}


export default PriceHistory;