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
} from "firebase/firestore";
import Product from "./product";

function Cart() {
  const { user } = useAuth();

  if (!user || !user.uid) {
    return <p>Brak użytkownika, nie można załadować koszyka.</p>;
  }
  const [products, setProducts] = useState([]);

  // //   Dodanie produktów do koszyka
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

  const updateQuantity = (productId, change, relatedProductId) => {
    console.log("updateQuantity called with:", {
      productId,
      change,
      relatedProductId,
    });

    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        // Zmiana ilości lda głównego produktu
        if (product.id === productId && !relatedProductId) {
          const updatedQuantity = Math.max(0, product.quantity + change);
          console.log("Updating main product quantity:", updatedQuantity);
          updateProductInFirestore(productId, null, updatedQuantity); // Aktualizacja w Firestore
          return { ...product, quantity: updatedQuantity };
        }

        // Zmiana ilości dla powiązanego produktu
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
                ); // Aktualizacja w Firestore
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
      // console.log(querySnapshot);
      if (!querySnapshot.empty) {
        const cartRef = querySnapshot.docs[0].ref;
        const cartData = querySnapshot.docs[0].data();
        console.log(cartData);
        // console.log(productId);
        // console.log(relatedProductId);
        const updatedItems = cartData.items.map((item) => {
          // console.log(item.productId._key.path.segments[6])
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

        // console.log(cartData.items[0].productId._key.path.segments[6]);
        const updatedItems = cartData.items.filter(
          (item) => item.productId._key.path.segments[6] !== productId
        );
        // console.log(productId);

        await updateDoc(cartRef, { items: updatedItems });
        console.log("Produkt został usunięty z koszyka w Firestore.");
      }
    } catch (error) {
      console.error("Błąd podczas usuwania produktu z Firestore:", error);
    }
  };

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const q = query(collection(db, "carts"), where("user", "==", userRef));
        const querySnapshot = await getDocs(q);
        // console.log(querySnapshot.docs[0].data().items[0].productId._key.path.segments[6]);

        if (!querySnapshot.empty) {
          const cartData = querySnapshot.docs[0].data();
          const items = cartData.items || [];
          // console.log(items)
          const productDetails = await Promise.all(
            items.map(async (item) => {
              const productId =item.productId._key.path.segments[6]
              const productDoc = await getDoc(doc(db, "products", productId));
              const productData = productDoc.data();

              // console.log(item.relatedProducts[0].id._key.path.segments[6])
              // console.log(item.relatedProducts)
              // console.log(productData.relatedProducts)


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
    </div>
  );
}

export default Cart;
