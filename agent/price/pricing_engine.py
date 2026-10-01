

def calculate_target_price(
    product_id: str,
    current_price: int,
    amazon_price: int | None,
    flipkart_price: int | None
) -> dict:

    competitor_prices = []

    if amazon_price is not None:
        competitor_prices.append(amazon_price)

    if flipkart_price is not None:
        competitor_prices.append(flipkart_price)

    if len(competitor_prices) == 0:
        return {
            "product_id": product_id,
            "action": "KEEP",
            "current_price": current_price,
            "target_price": current_price,
            "reason": "No competitor price available"
        }

    # Average competitor price
    average_price = int(
        sum(competitor_prices) / len(competitor_prices)
    )

    if current_price < average_price:
        action = "INCREASE"
        reason = "Our price is lower than the average competitor price"

    elif current_price > average_price:
        action = "DECREASE"
        reason = "Our price is higher than the average competitor price"

    else:
        action = "KEEP"
        reason = "Our price is equal to the average competitor price"

    return {
        "product_id": product_id,
        "action": action,
        "current_price": current_price,
        "average_competitor_price": average_price,
        "target_price": average_price,
        "reason": reason
    }