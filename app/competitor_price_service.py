from datetime import datetime, timezone

from app.database import competitor_prices_table


MAX_HISTORY = 10


def save_competitor_prices(
    product_id: str,
    amazon_price: int | None,
    amazon_url: str | None,
    flipkart_price: int | None,
    flipkart_url: str | None
):
    response = competitor_prices_table.get_item(
        Key={"product_id": product_id}
    )

    existing = response.get("Item", {})

    amazon_history = existing.get(
        "amazon_price_history",
        []
    )

    flipkart_history = existing.get(
        "flipkart_price_history",
        []
    )

    timestamp = datetime.now(timezone.utc).isoformat()

    if amazon_price is not None:
        amazon_history.append({
            "price": amazon_price,
            "url": amazon_url,
            "timestamp": timestamp
        })

    if flipkart_price is not None:
        flipkart_history.append({
            "price": flipkart_price,
            "url": flipkart_url,
            "timestamp": timestamp
        })

    amazon_history = amazon_history[-MAX_HISTORY:]
    flipkart_history = flipkart_history[-MAX_HISTORY:]

    item = {
        "product_id": product_id,
        "amazon_price_history": amazon_history,
        "flipkart_price_history": flipkart_history
    }

    competitor_prices_table.put_item(
        Item=item
    )

    return item


def get_price_history(product_id: str):
    response = competitor_prices_table.get_item(
        Key={"product_id": product_id}
    )

    item = response.get("Item")

    if not item:
        return {
            "product_id": product_id,
            "amazon_price_history": [],
            "flipkart_price_history": []
        }

    return {
        "product_id": product_id,
        "amazon_price_history": item.get(
            "amazon_price_history",
            []
        ),
        "flipkart_price_history": item.get(
            "flipkart_price_history",
            []
        )
    }