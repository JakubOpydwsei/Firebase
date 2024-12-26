import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

function Product({ product, updateQuantity, removeMainProduct }) {
  const [relatedProductsData, setRelatedProductsData] = useState([]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      const promises = product.relatedProducts.map(async (relatedProduct) => {
        const docRef = doc(db, "products", relatedProduct._key.path.segments[6]);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { ...docSnap.data(), id: docSnap.id };
        }
        return null;
      });
      const results = await Promise.all(promises);
      setRelatedProductsData(results.filter(result => result !== null));
    };

    fetchRelatedProducts();
  }, [product.relatedProducts]);

  return (
    <div className="p-4 bg-gray-800 text-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-2">{product.name}</h2>
      <p className="text-gray-300 mb-2">Cena: {product.price} zł</p>
      <p className="text-gray-300 mb-4">Ilość: {product.quantity || 0}</p>
      <div className="flex space-x-2 mb-4">
        <button
          className="btn btn-primary"
          onClick={() => updateQuantity(product.id, 1)}
        >
          +
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => updateQuantity(product.id, -1)}
        >
          -
        </button>
        <button
          className="btn btn-error"
          onClick={() => removeMainProduct(product.id)}
        >
          Usuń główny produkt
        </button>
      </div>

      {relatedProductsData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Produkty powiązane:</h3>
          {relatedProductsData.map((relatedProduct, index) => (
            <div
              key={relatedProduct.id}
              className="p-2 bg-gray-700 text-white rounded-lg mb-2"
            >
              <p>{relatedProduct.name}</p>
              <p className="text-gray-300">Cena: {relatedProduct.price} zł</p>
              <p className="text-gray-300 mb-2">Ilość: {product.relatedProducts[index].quantity || 0}</p>
              <div className="flex space-x-2">
                <button
                  className="btn btn-primary"
                  onClick={() => updateQuantity(product.id, 1, relatedProduct.id)}
                >
                  +
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => updateQuantity(product.id, -1, relatedProduct.id)}
                >
                  -
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Product;
