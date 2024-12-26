"use client"
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/lib/AuthContext";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from "firebase/firestore";
import Product from "./product";

function Cart() {
  const { user } = useAuth();

  if (!user || !user.uid) {
    return <p>Brak użytkownika, nie można załadować koszyka.</p>;
  }
  const [products, setProducts] = useState([]);

  // //   Dodanie produktów do koszyka
// const cart = doc(db, "carts", "xNaMoZxB8RLoKAw2UTKy");
//   const userRef = doc(db, "users", user.uid);
//   const product1 = doc(db, "products", "4bEBlm22yjyff4qW7t2X");
//   const product2 = doc(db, "products", "");
//   const product3 = doc(db, "products", "mpTYTHZZAUtGnv7Pd9ly");
//   const newItems = [
//     {
//       productId: product1,
//       quantity: 1,
//     },
//     {
//       productId: product2,
//       quantity: 2,
//     },
//     {
//         productId: product3,
//         quantity: 1,
//       },
//   ];

//   useEffect(() => {
//     if (user.uid) {
//       setDoc(cart, {
//         items: newItems,
//         user: userRef,
//       })
//         .then(() => {
//           console.log("Koszyk został zaktualizowany");
//         })
//         .catch((error) => {
//           console.error("Błąd podczas aktualizacji koszyka: ", error);
//         });
//     }
//   }, [user]);

  /////////////////////////////////////////////////////////////////

  const updateQuantity = (productId, change, relatedProductId) => {
    console.log("updateQuantity called with:", { productId, change, relatedProductId });

    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        // Zmiana ilości lda głównego produktu
        if (product.id === productId && !relatedProductId) {
          const updatedQuantity = Math.max(0, product.quantity + change);
          // console.log("Updating main product quantity:", updatedQuantity);
          updateProductInFirestore(productId, null, updatedQuantity); // Aktualizacja w Firestore
          return { ...product, quantity: updatedQuantity };
        }
        
        // Zmiana ilości dla powiązanego produktu
        if (product.id === productId && relatedProductId) {
          const updatedRelatedProducts = product.relatedProducts.map((relatedProduct) => {
            if (relatedProduct._key.path.segments[6] === relatedProductId) {
              const updatedQuantity = Math.max(0, relatedProduct.quantity + change);
              // console.log("Updating related product quantity:", updatedQuantity);
              updateProductInFirestore(productId, relatedProductId, updatedQuantity); // Aktualizacja w Firestore
              return { ...relatedProduct, quantity: updatedQuantity };
            }
            return relatedProduct;
          });

          return { ...product, relatedProducts: updatedRelatedProducts };
        }

        return product;
      });
    });
  };

  const updateProductInFirestore = async (productId, relatedProductId, quantity) => {
    try {
      // console.log("updateProductInFirestore called with:", { productId, relatedProductId, quantity });

      const userRef = doc(db, "users", user.uid);
      const q = query(collection(db, "carts"), where("user", "==", userRef));
      const querySnapshot = await getDocs(q);
      // console.log(querySnapshot);
      if (!querySnapshot.empty) {
        const cartRef = querySnapshot.docs[0].ref;
        const cartData = querySnapshot.docs[0].data();
        // console.log(cartData);

        const updatedItems = cartData.items.map((item) => {
          console.log(item.productId._key.path.segments[6])
          if (item.productId._key.path.segments[6] === productId) {
            if (relatedProductId) {
              item.relatedProducts = item.relatedProducts.map((relatedProduct) =>
                relatedProduct.id === relatedProductId
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
    setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId));
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

        const updatedItems = cartData.items.filter((item) => item.productId !== productId);

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

        if (!querySnapshot.empty) {
          const cartData = querySnapshot.docs[0].data();
          const items = cartData.items || [];

          const productDetails = await Promise.all(
            items.map(async (item) => {
              const productId = typeof item.productId === "string" ? item.productId : item.productId.id;
              const productDoc = await getDoc(doc(db, "products", productId));
              const productData = productDoc.data();

              const relatedProducts = productData.relatedProducts.map((related) => ({
                ...related,
                quantity: item.relatedProducts?.find((r) => r.id === related.id)?.quantity || 0,
              }));

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
  },  [user]);

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
