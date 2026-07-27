import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler


def execute_commander_clustering():
    print('🤖 Pod 042: 启动‘全频道指挥官特征聚类协议’...')

    if not os.path.exists('ghrs-data/clones_ledger.csv'):
        return

    # 1. 提取原始基因（数据）
    df = pd.read_csv('ghrs-data/clones_ledger.csv')
    # 计算能级指标：总量(Volume) vs 强度(Intensity)
    df['volume'] = df['clones']
    df['intensity'] = df['clones'] / df['uniques'].replace(0, 1)

    # 2. 物理标准化：消除量级偏差
    features = ['volume', 'intensity']
    X = StandardScaler().fit_transform(df[features])

    # 3. 驱动 DBSCAN 执行黑客级聚类
    # eps: 搜索半径，min_samples: 构成集群的最小样本数
    db = DBSCAN(eps=0.5, min_samples=3).fit(X)
    df['cluster'] = db.labels_

    # 💡 逻辑映射：根据聚类结果自动定义军衔
    # -1 通常是离群点（那些 859 次、360 次的奇迹时刻）
    def map_rank(c_id):
        if c_id == -1:
            return 'Legendary (Anomalies)'
        if c_id == 0:
            return 'Hardcore Veteran'
        return f'Tactical Unit {c_id}'

    df['rank'] = df['cluster'].map(map_rank)
    rank_counts = df['rank'].value_counts()

    # --- 绘图：地堡级双维度大屏 ---
    plt.style.use('dark_background')
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(18, 7))

    # 左图：战力梯度柱状图 (保留你喜欢的 BarPlot)
    sns.barplot(x=rank_counts.index, y=rank_counts.values,
                palette='magma', ax=ax1)
    ax1.set_title('Commander Hierarchy Distribution',
                  color='#33cc33', fontsize=14)
    ax1.set_ylabel('Days Recorded')

    # 右图：【黑科技】特征分布散点图 (展示聚类真相)
    scatter = ax2.scatter(df['volume'], df['intensity'], c=df['cluster'],
                          cmap='viridis', s=df['clones']/2, alpha=0.6, edgecolors='w')
    ax2.set_title('Cluster Map: Volume vs Intensity',
                  color='#0066ff', fontsize=14)
    ax2.set_xlabel('Total Daily Clones')
    ax2.set_ylabel('Clones Per User (Intensity)')

    # 加上网格
    ax1.grid(axis='y', alpha=0.1)
    ax2.grid(alpha=0.1)

    plt.tight_layout()
    os.makedirs('plots', exist_ok=True)
    plt.savefig('plots/commander_profiles.png', dpi=120)
    print(f"✅ 聚类审计达成。识别到 {len(rank_counts)} 个战斗序列。")


if __name__ == "__main__":
    execute_commander_clustering()
