from agent.price.competitor_price_provider import (
    TavilyFirecrawlCompetitorPriceProvider
)

from agent.price.pricing_engine import calculate_target_price
from agent.price.price_updater import apply_pricing_decision
from agent.price.price_validator import validate_competitor_price

from app.competitor_price_service import save_competitor_prices
from app.product_service import get_product


def run_pricing_pipeline(product_id: str):

    # 1. Get product
    product = get_product(product_id)

    if not product:
        raise ValueError(
            f"Product {product_id} not found"
        )

    current_price = int(product["price"])
    product_name = product["name"]

    # 2. Get competitor prices
    provider = TavilyFirecrawlCompetitorPriceProvider()

    raw_prices = provider.get_prices(
        product_id,
        product_name
    )

    # 3. Validate prices
    validated_prices = validate_competitor_price(
        raw_prices
    )

    # 4. Save competitor price snapshot
    save_competitor_prices(
        product_id=validated_prices.product_id,
        amazon_price=validated_prices.amazon_price,
        amazon_url=(
            str(validated_prices.amazon_url)
            if validated_prices.amazon_url
            else None
        ),
        flipkart_price=validated_prices.flipkart_price,
        flipkart_url=(
            str(validated_prices.flipkart_url)
            if validated_prices.flipkart_url
            else None
        )
    )

    # 5. Calculate new price
    decision = calculate_target_price(
        product_id=product_id,
        current_price=current_price,
        amazon_price=validated_prices.amazon_price,
        flipkart_price=validated_prices.flipkart_price
    )

    # 6. Apply price change
    update_result = apply_pricing_decision(
        decision
    )

    return {
        "decision": decision,
        "update": update_result
    }