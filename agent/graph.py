from langgraph.graph import StateGraph, START, END

from agent.state import PricingState
from agent.price_pipeline import run_pricing_pipeline

from app.product_service import get_all_products


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


graph = StateGraph(PricingState)

graph.add_node(
    "get_products",
    get_products_node
)

graph.add_node(
    "process_products",
    process_products_node
)

graph.add_edge(
    START,
    "get_products"
)

graph.add_edge(
    "get_products",
    "process_products"
)

graph.add_edge(
    "process_products",
    END
)

pricing_agent = graph.compile()