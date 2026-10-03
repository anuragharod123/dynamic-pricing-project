from agent.price_pipeline import run_pricing_pipeline
from app.product_service import get_all_products
from agent.state import PricingState


def get_products_node(state: PricingState):
    products = get_all_products()
    return {
        "products": products
    }


def process_products_node(state: PricingState):
    products = state["products"]
    results = []

    for product in products:
        product_id = product["product_id"]
        
        result = run_pricing_pipeline(
            product_id
        )

        results.append({
            "product_id": product_id,
            "result": result
        })

    return {
        "results": results
    }