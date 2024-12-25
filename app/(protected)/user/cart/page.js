"use client";
import { useAuth } from "@/app/lib/AuthContext";
import { db } from "@/app/lib/firebase";
import { collection, getDocs, query, where, doc, setDoc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

function Cart() {
  const { user } = useAuth(); // Hook do uzyskania danych użytkownika, np. z contextu

  // Sprawdzamy, czy user jest dostępny przed dalszymi operacjami
  if (!user || !user.uid) {
    return <p>Brak użytkownika, nie można załadować koszyka.</p>;
  }

//   const cart = doc(db, "carts", "xNaMoZxB8RLoKAw2UTKy");
//   const userRef = doc(db, "users", user.uid);
//   const product1 = doc(db, "products", "4bEBlm22yjyff4qW7t2X");
//   const product2 = doc(db, "products", "JxYnzvzcD1sTmQV14pgS");
//   const product3 = doc(db, "products", "LFySkxKkvicfnWOhMcDl");
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
//         quantity: 20,
//       },
//   ];

// //   Dodanie produktów do koszyka

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

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (user && user.uid) {
          const userRef = doc(db, "users", user.uid);
          const q = query(
            collection(db, "carts"),
            where("user", "==", userRef)
          );

          const querySnapshot = await getDocs(q);
          const productsList = querySnapshot.docs.map((doc) => doc.data());
          setProducts(productsList);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania produktów:", error);
      }
    };

    if (user && user.uid) {
      fetchProducts();
    }
  }, [user]);

  /////////////////////////////////////////////////////////////////

  const [productsDetails, setProductsDetails] = useState([]);
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (products.length > 0 && products[0]?.items) {
        try {
          const productRefs = products[0].items.map((item) => item.productId);

          if (productRefs && productRefs.length > 0) {
            const productSnapshots = await Promise.all(productRefs.map(getDoc));

            const details = productSnapshots
              .map((snap) => ({
                  id: snap.id,
                  ...snap.data(),
              }));

            setProductsDetails(details);
          }
        } catch (error) {
          console.error("Błąd podczas pobierania szczegółów produktów:", error);
        }
      }
    };

    if (products.length > 0) {
      fetchProductDetails();
    }
  }, [products]);

  return (
    <div>
      <h1>Produkty</h1>
      {products.length > 0 && products[0]?.items ? (
        <ul>
          {products[0].items.map((product, index) => {
              
              const productId = product.productId?.id;
              const productDetails = productsDetails.find((p) => p.id === productId);
            //   console.log(product);
            console.log(productsDetails);
            return (
              <li key={index}>
                {productDetails ? (
                  <>
                    <p>Nazwa produktu: {productDetails.name}</p>
                    <p>Opis: {productDetails.describe}</p>
                    <p>Ilość: {product.quantity}</p>
                    <img src={productDetails.image} alt={"Image of: " + productDetails.name }/>
                  </>
                ) : (
                  <p>Ładowanie szczegółów produktu...</p>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>Obecnie koszyk jest pusty</p>
      )}
    </div>
  );
}

export default Cart;
