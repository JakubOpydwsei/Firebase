"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where, doc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import ArticleCard from "./card";
import { useAuth } from "@/app/lib/AuthContext";

function Article() {
  const [articles, setArticles] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchArticles = async () => {
      if (user?.uid) {
        const userRef = doc(db, "users", user.uid);
        const q = query(
          collection(db, "articles"),
          where("user", "==", userRef)
        );

        const querySnapshot = await getDocs(q);
        const articleList = querySnapshot.docs.map((doc) => doc.data());
        setArticles(articleList);
      }
    };
    fetchArticles();
  }, []);

  return (
    <>
      <div>
        <h1>Articles:</h1>
        <hr />

        {articles.map((article, index) => (
          <ArticleCard
            key={index}
            article={article}
            index={index}
          />
        ))}
      </div>
    </>
  );
}

export default Article;
