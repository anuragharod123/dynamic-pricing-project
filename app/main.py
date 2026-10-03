import json
import os
import boto3

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

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


sqs_client = boto3.client(
    "sqs",
    region_name=os.getenv("AWS_REGION")
)


def execute_pricing_agent():
    return pricing_agent.invoke({
        "products": [],
        "results": []
    })


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
def update_price(
    product_id: str,
    data: PriceUpdate
):
    return update_product_price(
        product_id,
        data.price
    )


@app.post("/agent/run", status_code=202)
def run_agent():

    queue_url = os.getenv("SQS_QUEUE_URL")

    if not queue_url:
        raise HTTPException(
            status_code=500,
            detail="SQS_QUEUE_URL is not configured"
        )

    sqs_client.send_message(
        QueueUrl=queue_url,
        MessageBody=json.dumps({
            "action": "run_pricing_agent"
        })
    )

    return {
        "status": "started",
        "message": (
            "Agent is running. "
            "Refresh the dashboard after a few minutes."
        )
    }


@app.get("/price-history/{product_id}")
def price_history(product_id: str):
    return get_price_history(product_id)


mangum_handler = Mangum(app)


def handler(event, context):

    # SQS-triggered Lambda execution
    if (
        event.get("Records")
        and event["Records"][0].get("eventSource") == "aws:sqs"
    ):
        for record in event["Records"]:

            body = json.loads(
                record["body"]
            )

            if body.get("action") == "run_pricing_agent":
                execute_pricing_agent()

        return {
            "status": "completed"
        }

    # API Gateway request
    return mangum_handler(event, context) 