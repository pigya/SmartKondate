import requests
import time
import pandas as pd
import re

class RakutenRecipeFetcher:
    def __init__(self, app_id, ingredients, max_total=1000, sample_count=50):
        self.app_id = app_id
        self.ingredients = ingredients
        self.max_total = max_total
        self.sample_count = sample_count

    def fetch_category_ids(self):
        """楽天レシピのカテゴリIDを階層ごとに結合して取得"""
        url = "https://app.rakuten.co.jp/services/api/Recipe/CategoryList/20170426"
        res = requests.get(url, params={"applicationId": self.app_id})
        category_ids = []

        if res.status_code != 200:
            print("カテゴリ一覧取得に失敗")
            return category_ids

        data = res.json()
        large = data["result"]["large"]
        matched_ids = [cat["categoryId"] for cat in large ]
        return matched_ids

    def fetch_ranked_recipes(self, category_ids):
        """カテゴリごとに人気レシピを取得し、材料にマッチするレシピを抽出"""
        url = "https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426"
        results = []

        for cid in category_ids:
            time.sleep(1)  # API制限対策
            resp = requests.get(url, params={"applicationId": self.app_id, "categoryId": cid})
            if resp.status_code != 200:
                continue

            for r in resp.json().get("result", []):
                mats = r.get("recipeMaterial", [])
                if any(any(ing in m for m in mats) for ing in self.ingredients):
                    results.append(r)

            if len(results) >= self.max_total:
                break

        return results

    @staticmethod
    def count_matching_ingredients(materials, ingredients):
        """レシピの材料リストに、指定材料がいくつ含まれているかを数える"""
        if not isinstance(materials, list):
            return 0
        return sum(any(ing in mat for mat in materials) for ing in ingredients)

    @staticmethod
    def extract_required_time(text):
        """所要時間の文字列から数字（分）を抽出"""
        match = re.search(r"\d+", text)
        return int(match.group()) if match else None

    def filter_and_sort_recipes(self, recipes, max_time=30, top_n=10):
        """
        レシピリストをスコア付け・ソート・時間フィルタして上位N件を返す

        - max_time: 所要時間の上限（分）
        - top_n: 結果件数
        """
        df = pd.DataFrame(recipes)

        # 一致数（match_score）を追加
        df["match_score"] = df["recipeMaterial"].apply(
            lambda mats: self.count_matching_ingredients(mats, self.ingredients))

        # 所要時間（数字）の列を追加
        df["minutes"] = df["recipeIndication"].apply(self.extract_required_time)
        # スコア・人気度（rank）順にソート、時間でフィルタ
        df_filtered = df[df["minutes"] < max_time]
        df["rank"] = pd.to_numeric(df["rank"], errors="coerce")#rank を 整数に変換
        df_sorted = df_filtered.sort_values(by=["match_score", "rank"], ascending=[False, True])

        # ✅ recipeUrl が重複していたら最初の1つだけ残す
        df_unique = df_sorted.drop_duplicates(subset="recipeUrl", keep="first")


        return df_unique[["recipeTitle", "recipeUrl","match_score", "recipeMaterial"]].iloc[:top_n]
