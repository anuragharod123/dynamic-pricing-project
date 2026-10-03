from app.models import CompetitorPrice

def validate_competitor_price(data: dict) -> CompetitorPrice:

    result = CompetitorPrice(**data)

    if (
        result.amazon_price is not None
        and result.amazon_price <= 0
    ):
        raise ValueError("Invalid Amazon price")

    if (
        result.flipkart_price is not None
        and result.flipkart_price <= 0
    ):
        raise ValueError("Invalid Flipkart price")

    return result