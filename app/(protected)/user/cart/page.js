"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/lib/AuthContext";
import { db } from "@/app/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  deleteField,
} from "firebase/firestore";
import Product from "./product";

function Cart() {
  const { user } = useAuth();

  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [products, setProducts] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  
  // //   Add products do cart
  // const cart = doc(db, "carts", "xNaMoZxB8RLoKAw2UTKy");
  // const userRef = doc(db, "users", user.uid);
  // const product1 = doc(db, "products", "4bEBlm22yjyff4qW7t2X"); //Telefon
  // const product2 = doc(db, "products", "mpTYTHZZAUtGnv7Pd9ly"); //Laptop
  // const product3 = doc(db, "products", "3IZt9KK9NaYLSAOs6Ssm"); //TY
  // const relatedProduct1 = doc(db, "products", "JxYnzvzcD1sTmQV14pgS"); //Etui
  // const relatedProduct2 = doc(db, "products", "LFySkxKkvicfnWOhMcDl"); //Szybka
  // const relatedProduct3 = doc(db, "products", "8OOgHcSNuRINcgY1jn8u"); //Myszka
  // const relatedProduct4 = doc(db, "products", "VOdO6kjQc3yTzpX3Froq"); //Torba
  // const relatedProduct5 = doc(db, "products", "HUoyEUOQj9jxdmuPl459"); //Głośnik
  // const relatedProduct6 = doc(db, "products", "bwWLZHqh169lPyt5yayP"); //HDMI
  // const newItems = [
  //   {
  //     productId: product1,
  //     quantity: 1,
  //     relatedProducts: [
  //       {
  //         id: relatedProduct1,
  //         quantity: 0,
  //       },
  //       {
  //         id: relatedProduct2,
  //         quantity: 0,
  //       },
  //     ],
  //   },
  //   {
  //     productId: product2,
  //     quantity: 2,
  //     relatedProducts: [
  //       {
  //         id: relatedProduct3,
  //         quantity: 1,
  //       },
  //       {
  //         id: relatedProduct4,
  //         quantity: 1,
  //       },
  //     ],
  //   },
  //   {
  //     productId: product3,
  //     quantity: 0,
  //     relatedProducts: [
  //       {
  //         id: relatedProduct5,
  //         quantity: 0,
  //       },
  //       {
  //         id: relatedProduct6,
  //         quantity: 2,
  //       },
  //     ],
  //   },
  // ];

  // useEffect(() => {
  //   if (user.uid) {
  //     setDoc(cart, {
  //       items: newItems,
  //       user: userRef,
  //     })
  //       .then(() => {
  //         console.log("Koszyk został zaktualizowany");
  //       })
  //       .catch((error) => {
  //         console.error("Błąd podczas aktualizacji koszyka: ", error);
  //       });
  //   }
  // }, [user]);

  ///////////////////////////////////////////////////////////////

  const handleDiscountCodeChange = (event) => {
    setDiscountCode(event.target.value);
  };

  const applyDiscount = () => {
    if (discountCode === "DISCOUNT10") {
      setDiscountPercent(10);
    } else {
      setDiscountPercent(0);
    }
  };

  const updateQuantity = (productId, change, relatedProductId) => {
    console.log("updateQuantity called with:", {
      productId,
      change,
      relatedProductId,
    });

    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        if (product.id === productId && !relatedProductId) {
          const updatedQuantity = Math.max(0, product.quantity + change);
          console.log("Updating main product quantity:", updatedQuantity);
          updateProductInFirestore(productId, null, updatedQuantity);
          return { ...product, quantity: updatedQuantity };
        }

        if (product.id === productId && relatedProductId) {
          const updatedRelatedProducts = product.relatedProducts.map(
            (relatedProduct) => {
              if (relatedProduct._key.path.segments[6] === relatedProductId) {
                const updatedQuantity = Math.max(
                  0,
                  relatedProduct.quantity + change
                );
                console.log("Updating related product quantity:", updatedQuantity);
                updateProductInFirestore(
                  productId,
                  relatedProductId,
                  updatedQuantity
                );
                return { ...relatedProduct, quantity: updatedQuantity };
              }
              return relatedProduct;
            }
          );

          return { ...product, relatedProducts: updatedRelatedProducts };
        }

        return product;
      });
    });
  };

  const updateProductInFirestore = async (
    productId,
    relatedProductId,
    quantity
  ) => {
    try {
      console.log("updateProductInFirestore called with:", { productId, relatedProductId, quantity });

      const userRef = doc(db, "users", user.uid);
      const q = query(collection(db, "carts"), where("user", "==", userRef));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const cartRef = querySnapshot.docs[0].ref;
        const cartData = querySnapshot.docs[0].data();
        const updatedItems = cartData.items.map((item) => {
          if (item.productId._key.path.segments[6] === productId) {
            if (relatedProductId) {
              item.relatedProducts = item.relatedProducts.map(
                (relatedProduct) =>
                  relatedProduct.id._key.path.segments[6] === relatedProductId
                    ? { ...relatedProduct, quantity }
                    : relatedProduct
              );
            } else {
              item.quantity = quantity;
            }
          }
          return item;
        });

        await updateDoc(cartRef, { items: updatedItems });
        console.log("Koszyk został zaktualizowany w Firestore.");
      }
    } catch (error) {
      console.error("Błąd podczas aktualizacji produktu w Firestore:", error);
    }
  };

  const removeMainProduct = async (productId) => {
    setProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== productId)
    );
    await removeProductFromFirestore(productId);
  };

  const removeProductFromFirestore = async (productId) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const q = query(collection(db, "carts"), where("user", "==", userRef));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const cartRef = querySnapshot.docs[0].ref;
        const cartData = querySnapshot.docs[0].data();

        const updatedItems = cartData.items.filter(
          (item) => item.productId._key.path.segments[6] !== productId
        );

        await updateDoc(cartRef, { items: updatedItems });
        // console.log("Produkt został usunięty z koszyka w Firestore.");
      }
    } catch (error) {
      console.error("Błąd podczas usuwania produktu z Firestore:", error);
    }
  };

  const removeAllProductsFromFirestore = async () => {
    try {
      const userRef = doc(db, "users", user.uid);
      const q = query(collection(db, "carts"), where("user", "==", userRef));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const cartRef = querySnapshot.docs[0].ref;
        // console.log(cartRef)
        await updateDoc(cartRef, { items: deleteField() });
        // console.log("Koszyk został usunięty z Firestore.");
        window.location.reload();
      } else {
        // console.log("Nie znaleziono koszyka dla tego użytkownika.");
      }
    } catch (error) {
      console.error("Błąd podczas usuwania koszyka z Firestore:", error);
    }
  };

  useEffect(() => {
    if (!user || !user.uid) {
      return;
    }
    const fetchCartData = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const q = query(collection(db, "carts"), where("user", "==", userRef));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const cartData = querySnapshot.docs[0].data();
          const items = cartData.items || [];
          const productDetails = await Promise.all(
            items.map(async (item) => {
              const productId =item.productId._key.path.segments[6]
              const productDoc = await getDoc(doc(db, "products", productId));
              const productData = productDoc.data();

              const relatedProducts = productData.relatedProducts.map(
                (related) => ({
                  ...related,
                  quantity:
                    item.relatedProducts.find((x) => x.id._key.path.segments[6] === related._key.path.segments[6])
                      .quantity || 0,
                })
              );

              return {
                id: productDoc.id,
                quantity: item.quantity || 0,
                ...productData,
                relatedProducts,
              };
            })
          );

          setProducts(productDetails);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania koszyka:", error);
      }
    };

    fetchCartData();
  }, [user]);

  useEffect(() => {
    const calculateTotalPrice = async () => {
      try {
        let total = 0;

        for (const product of products) {
          if (product.price && product.quantity) {
            total += product.price * product.quantity;
          }

          for (const related of product.relatedProducts) {
            const relatedProductId = related._key.path.segments[6];
            const relatedDoc = await getDoc(
              doc(db, "products", relatedProductId)
            );

            if (relatedDoc.exists()) {
              const relatedData = relatedDoc.data();

              if (relatedData.price && related.quantity) {
                total += relatedData.price * related.quantity;
              }
            }
          }
        }

        setTotalPrice(Number(total.toFixed(2)));
      } catch (error) {
        console.error("Błąd podczas obliczania łącznej ceny:", error);
        setTotalPrice(0);
      }
    };

    calculateTotalPrice();
  }, [products]);

  return (
    <div>
      <h1>Produkty w koszyku</h1>
      {products.length > 0 ? (
        products.map((product) => (
            <Product
              key={product.id}
              product={product}
              updateQuantity={updateQuantity}
              removeMainProduct={removeMainProduct}
            />
        ))
      ) : (
        <p>Obecnie koszyk jest pusty</p>
      )}
      <div className="mt-6">
        <label htmlFor="discountCode" className="block">Kod zniżkowy:</label>
        <input
          id="discountCode"
          type="text"
          value={discountCode}
          onChange={handleDiscountCodeChange}
          className="border p-2"
        />
        <button
          onClick={applyDiscount}
          className="btn ml-2 bg-blue-500 text-white p-2"
        >
          Zastosuj
        </button>
      </div>

      <h2 className="text-2xl font-bold text-center mt-6">
        Łączna cena koszyka: 
        <span className="text-green-300">
          {" " + totalPrice.toFixed(2) * (1 - (discountPercent / 100))}
        </span> zł
      </h2>
      <hr/>
      <button
      onClick={removeAllProductsFromFirestore}
      className="btn bg-red-500 text-white p-2 mt-4"
      >
        Usuń wszystkie produkty
      </button>

    </div>
  );
}

export default Cart;
