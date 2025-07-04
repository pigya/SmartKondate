import { useEffect, useState } from "react";

export default function RecipeCandidateList({ ingredients }) {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // ✅ 探索中の状態

  useEffect(() => {
    if (ingredients.trim() === "") return;

    const fetchRecipes = async () => {
      setIsLoading(true); // ✅ 探索中フラグをON
      try {
        const response = await fetch("http://localhost:5000/recipes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ingredients: ingredients.split(" ") }),
        });

        const data = await response.json();
        setRecipes(data);
      } catch (error) {
        console.error("🚨 レシピ取得エラー:", error);
        setRecipes([]);
      } finally {
        setIsLoading(false); // ✅ 探索完了フラグをOFF
      }
    };

    fetchRecipes();
  }, [ingredients]);

  return (
    <div>
      <h2>レシピ候補</h2>

      {ingredients.trim() === "" ? (
        <p>材料を音声入力してください</p>
      ) : recipes.length === 0 ? (
        <p>レシピを探索中...</p>
      ) : (
        <ul>
          {recipes.map((r, i) => (
            <li key={i}>
              <a href={r.recipeUrl} target="_blank" rel="noopener noreferrer">
                {r.recipeTitle}
              </a>
              <div>材料の一致数: {r.match_score}</div>
              <div>材料: {Array.isArray(r.recipeMaterial) ? r.recipeMaterial.join(", ") : r.recipeMaterial}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
