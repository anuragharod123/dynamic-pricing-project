from app.product_service import update_product_price


def apply_pricing_decision(decision: dict) -> dict:

    if decision["action"] == "KEEP":
        return {
            "updated": False,
            "message": "Price remains unchanged",
            "price": decision["current_price"]
        }

    new_price = decision["target_price"]

    updated_product = update_product_price(
        product_id=decision["product_id"],
        price=new_price
    )

    return {
        "updated": True,
        "message": f"Price changed to {new_price}",
        "product": updated_product
    }