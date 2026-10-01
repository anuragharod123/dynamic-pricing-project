import { useEffect, useState } from "react";
import { getProducts } from "../api";

function Products() {

    const [products, setProducts] = useState([]);

    useEffect(() => {

        getProducts()
            .then(setProducts)
            .catch(() => {});

    }, []);

    return (
        <div>

            <div className="page-heading">
                <h2>Products</h2>
                <p>All products currently managed by the pricing system.</p>
            </div>

            <div className="table-container">

                <table>

                    <thead>
                        <tr>
                            <th>Product ID</th>
                            <th>Product</th>
                            <th>Current Price</th>
                        </tr>
                    </thead>

                    <tbody>

                        {products.map((product) => (

                            <tr key={product.product_id}>

                                <td>{product.product_id}</td>

                                <td>{product.name}</td>

                                <td>
                                    ₹{Number(product.price).toLocaleString("en-IN")}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default Products;