import os
import json
import requests
import pandas as pd

REPO = os.getenv('REPO')
TOKEN = os.getenv('STATS_TOKEN')
HEADERS = {'Authorization': f'token {TOKEN}',
           'Accept': 'application/vnd.github.v3+json'}
API_BASE = f"https://api.github.com/repos/{REPO}"


def fetch_api(url, fallback):
    resp = requests.get(url, headers=HEADERS)
    return resp.json() if resp.status_code == 200 else fallback


def merge_ledger(data, ledger_path, col_name):
    os.makedirs('ghrs-data', exist_ok=True)
    new_df = pd.DataFrame(data)
    if new_df.empty:
        return

    new_df['date'] = new_df['timestamp'].str[:10]
    new_df = new_df.rename(columns={'count': col_name})[
        ['date', col_name, 'uniques']]

    if os.path.exists(ledger_path):
        old_df = pd.read_csv(ledger_path)
        # 💡 物理去重对账逻辑
        combined = pd.concat([old_df, new_df]).drop_duplicates(
            subset=['date'], keep='last')
    else:
        combined = new_df
    combined.sort_values('date', ascending=False).to_csv(
        ledger_path, index=False)


if __name__ == "__main__":
    print("🤖 Pod 042: Executing Data Mining Protocol...")

    # 抓取原始数据
    clones = fetch_api(f"{API_BASE}/traffic/clones", {"clones": []})
    views = fetch_api(f"{API_BASE}/traffic/views", {"views": []})
    repo_info = fetch_api(API_BASE, {"stargazers_count": 0, "forks_count": 0})
    referrers = fetch_api(f"{API_BASE}/traffic/popular/referrers", [])

    # 物理焊接账本
    merge_ledger(clones['clones'], 'ghrs-data/clones_ledger.csv', 'clones')
    merge_ledger(views['views'], 'ghrs-data/views_ledger.csv', 'views')

    # 物理封存 Referrers 用于后续发布
    with open('raw_referrers.json', 'w') as f:
        json.dump(referrers, f)

    # 战绩结算
    c_df = pd.read_csv('ghrs-data/clones_ledger.csv')
    total_clones = int(c_df['clones'].sum())
    stats = {
        "total_clones": total_clones,
        "stars": repo_info['stargazers_count'],
        "forks": repo_info['forks_count']
    }
    with open('bunker-stats.json', 'w') as f:
        json.dump(stats, f)
    print(f"✅ Ledger synced. Total Clones: {total_clones}")
