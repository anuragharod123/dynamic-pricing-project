import {
    ArrowUp,
    ArrowDown,
    Minus,
    ShoppingCart
} from "lucide-react";

function ProductCard({ product, action }) {

    const price = Number(product.price || 0);

    let statusClass = "neutral";
    let StatusIcon = Minus;
    let priceIconClass = "price-neutral";

    if (action === "INCREASE") {
        statusClass = "increase";
        StatusIcon = ArrowUp;
        priceIconClass = "price-up";
    }

    if (action === "DECREASE") {
        statusClass = "decrease";
        StatusIcon = ArrowDown;
        priceIconClass = "price-down";
    }

    return (
        <div className="product-card">

            <div className="product-card-top">

                <div className="product-icon">
                    <ShoppingCart size={22} />
                </div>

                <span className={`price-status ${statusClass}`}>
                    <StatusIcon size={15} />
                    {action}
                </span>

            </div>

            <div className="product-info">

                <h3>{product.name}</h3>

                <p className="product-id">
                    {product.product_id}
                </p>

            </div>

            <div className="price-section">

                <span>Current Price</span>

                <div className="price-with-arrow">

                    <strong>
                        ₹{price.toLocaleString("en-IN")}
                    </strong>

                    {action === "INCREASE" && (
                        <ArrowUp
                            className={priceIconClass}
                            size={24}
                            strokeWidth={3}
                        />
                    )}

                    {action === "DECREASE" && (
                        <ArrowDown
                            className={priceIconClass}
                            size={24}
                            strokeWidth={3}
                        />
                    )}

                </div>

            </div>

        </div>
    );
}

export default ProductCard;