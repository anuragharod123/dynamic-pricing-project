from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from agent.graph import pricing_agent
from app.competitor_price_service import get_price_history

from app.product_service import (
    get_all_products,
    get_product,
    update_product_price
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PriceUpdate(BaseModel):
    price: int


@app.get("/products")
def get_products():
    return get_all_products()


@app.get("/products/{product_id}")
def get_product_by_id(product_id: str):

    product = get_product(product_id)

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product


@app.put("/products/update_price/{product_id}")
def update_price(product_id: str, data: PriceUpdate):

    return update_product_price(
        product_id,
        data.price
    )

@app.post("/agent/run")
def run_agent():

    result = pricing_agent.invoke({
        "products": [],
        "results": []
    })

    return result


@app.get("/price-history/{product_id}")
def price_history(product_id: str):
    return get_price_history(product_id)