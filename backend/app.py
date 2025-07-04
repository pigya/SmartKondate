from flask import Flask, request, jsonify
from flask_cors import CORS
from rakutenRecipeFetcher import RakutenRecipeFetcher  # 作成済みクラスをインポート

app = Flask(__name__)
CORS(app)

@app.route("/recipes", methods=["GET", "POST"])
def get_recipes():
    data = request.get_json()
    ingredients = data.get("ingredients", [])
    print("🧾 受け取った材料:", ingredients)  # ← ここを追加

    fetcher = RakutenRecipeFetcher(app_id=APP_ID,ingredients=ingredients)
    category_ids = fetcher.fetch_category_ids()
    recipes = fetcher.fetch_ranked_recipes(category_ids)
    filtered_recipes = fetcher.filter_and_sort_recipes(recipes)

    return jsonify(filtered_recipes.to_dict(orient="records"))

if __name__ == "__main__":
    app.run(debug=True, port=5000)

