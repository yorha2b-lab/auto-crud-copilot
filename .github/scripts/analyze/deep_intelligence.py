import os
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler


def execute_deep_intelligence():
    print("🤖 Pod 042: 启动‘全量情报融合协议’...")

    # 1. 物理对账
    df_c = pd.read_csv('ghrs-data/clones_ledger.csv')
    df_v = pd.read_csv('ghrs-data/views_ledger.csv')
    df = pd.merge(df_c, df_v, on='date', how='inner').fillna(0)

    # 2. 特征工程 (注入 GPT 的对数补丁 🤣)
    df['ratio'] = df['clones'] / df['views'].replace(0, 1)
    df['log_volume'] = np.log1p(df['clones'])
    df['log_intensity'] = np.log1p(df['ratio'])

    # 3. 概率审计 (Weighted Bot Probability)
    df['bot_prob'] = (df['ratio'] / 10).clip(upper=1) * 0.6 + \
        (df['clones'] / 500).clip(upper=1) * 0.4

    # 4. 驱动 DBSCAN 执行聚类
    X = StandardScaler().fit_transform(df[['log_volume', 'log_intensity']])
    db = DBSCAN(eps=0.4, min_samples=3).fit(X)
    df['cluster'] = db.labels_

    # 5. 最终数据结算
    bot_clones = (df['clones'] * df['bot_prob']).sum()
    human_clones = max(0, df['clones'].sum() - bot_clones)
    df['rank'] = df['cluster'].map(
        {-1: 'Legendary', 0: 'Veteran', 1: 'Tactical', 2: 'Unit'})
    rank_counts = df['rank'].value_counts()

    # --- 💡 核心视觉进化：全尺寸大屏构筑 ---
    plt.style.use('dark_background')
    fig = plt.figure(figsize=(24, 8))
    # 物理分配：1(甜甜圈) : 1.2(柱状图) : 1.8(散点星图)
    gs = fig.add_gridspec(1, 3, width_ratios=[1, 1.2, 1.8])

    # A. 扇区 1: 肉机成分 (Donut Chart)
    ax1 = fig.add_subplot(gs[0])
    ax1.pie([human_clones, bot_clones], labels=['Human', 'Machine'], autopct='%1.1f%%',
            colors=['#33cc33', '#444444'], startangle=90, pctdistance=0.85, explode=(0.05, 0))
    ax1.add_artist(plt.Circle((0, 0), 0.70, fc='#0d1117'))
    ax1.set_title("Operational Composition", color='#33cc33', pad=20)

    # B. 扇区 2: 军衔分布 (Bar Chart)
    ax2 = fig.add_subplot(gs[1])
    sns.barplot(x=rank_counts.index, y=rank_counts.values,
                palette='viridis', ax=ax2)
    ax2.set_title("Commander Hierarchy", color='#0066ff', pad=20)
    ax2.set_ylabel("Days Count")
    ax2.grid(axis='y', alpha=0.1)

    # C. 扇区 3: 战力拓扑 (Cluster Map - Log Scale)
    ax3 = fig.add_subplot(gs[2])
    # 💡 这里直接画对数刻度，视觉上会非常均匀且高级
    scatter = ax3.scatter(df['log_volume'], df['log_intensity'], c=df['cluster'],
                          cmap='coolwarm', s=df['clones']*0.8, alpha=0.6, edgecolors='w')
    ax3.set_title("Sovereign Logistic Matrix (Log Space)",
                  color='#ff00ff', pad=20)
    ax3.set_xlabel("Log(Total Clones)")
    ax3.set_ylabel("Log(Intensity)")
    ax3.grid(alpha=0.1)

    plt.tight_layout()
    os.makedirs('plots', exist_ok=True)
    plt.savefig('plots/bunker_intelligence_fusion.png', dpi=120)
    print("✅ 全量情报视觉矩阵封存成功！")


if __name__ == "__main__":
    execute_deep_intelligence()
