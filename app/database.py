import boto3
import os
from dotenv import load_dotenv

load_dotenv()

dynamodb = boto3.resource(
    "dynamodb",
    region_name=os.getenv("AWS_REGION")
)

products_table = dynamodb.Table("Products")
competitor_prices_table = dynamodb.Table("CompetitorPrices")