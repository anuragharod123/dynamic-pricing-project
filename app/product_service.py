from app.database import products_table


def get_all_products():
    response = products_table.scan()
    return response["Items"]


def get_product(product_id: str):
    response = products_table.get_item(
        Key={"product_id": product_id}
    )
    return response.get("Item")


def update_product_price(product_id: str, price: int):
    response = products_table.update_item(
        Key={"product_id": product_id},
        UpdateExpression="SET price = :price",
        ExpressionAttributeValues={
            ":price": price
        },
        ReturnValues="ALL_NEW"
    )

    return response["Attributes"]