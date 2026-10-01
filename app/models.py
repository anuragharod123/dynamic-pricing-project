from pydantic import BaseModel, HttpUrl


class CompetitorPrice(BaseModel):
    product_id: str

    amazon_price: int | None
    amazon_url: HttpUrl | None

    flipkart_price: int | None
    flipkart_url: HttpUrl | None