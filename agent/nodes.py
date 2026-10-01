from agent.state import PricingState

from agent.price.competitor_price_provider import TavilyFirecrawlCompetitorPriceProvider
from agent.price.price_validator import validate_competitor_price
from agent.price.pricing_engine import calculate_target_price
from agent.price.price_updater import apply_pricing_decision
from app.product_service import get_all_products
from app.competitor_price_service import save_competitor_prices


def get_products_node(state: PricingState):
    products = get_all_products()
    return {
        "products": products
    }


def process_products_node(state: PricingState):

    products = state["products"]
    provider = TavilyCompetitorPriceProvider()
    results = []

    for product in products:

        product_id = product["product_id"]
        product_name = product["name"]

        # Get competitor prices
        raw_prices = provider.get_prices(
            product_id,
            product_name
        )

        # Validate prices
        validated_prices = validate_competitor_price(
            raw_prices
        )

        # Save competitor price history
        save_competitor_prices(
            product_id=validated_prices.product_id,
            amazon_price=validated_prices.amazon_price,
            flipkart_price=validated_prices.flipkart_price
        )

        # Calculate target price
        decision = calculate_target_price(
            product_id=product_id,
            current_price=int(product["price"]),
            amazon_price=validated_prices.amazon_price,
            flipkart_price=validated_prices.flipkart_price
        )

        # Update product price
        update_result = apply_pricing_decision(
            decision
        )

        results.append({
            "product_id": product_id,
            "decision": decision,
            "update_result": update_result
        })

    return {
        "results": results
    }