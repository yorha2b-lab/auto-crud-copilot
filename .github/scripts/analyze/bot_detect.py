import os
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np


def plot_bot_composition():
    print('🤖 Pod 042: 启动‘异常流量概率审计协议’...')

    # 读取双账本
    if not os.path.exists('ghrs-data/clones_ledger.csv') or not os.path.exists('ghrs-data/views_ledger.csv'):
        print("⚠️ 账本缺失，取消审计。")
        return

    df_c = pd.read_csv('ghrs-data/clones_ledger.csv')
    df_v = pd.read_csv('ghrs-data/views_ledger.csv')

    # 物理合并
    df = pd.merge(df_c, df_v, on='date', how='inner')

    # 💡 借鉴算法：构筑“异常概率模型”
    # 1. 影子比 (Shadow Ratio): 每一个访客产生的克隆数
    df['ratio'] = df['clones'] / df['views'].replace(0, 1)

    # 2. 频率得分: 单日克隆量对 500 的映射 (参考指挥官 859 次的爆发力)
    df['freq_score'] = (df['clones'] / 500).clip(upper=1)

    # 3. 异常概率计算 (Bot Probability):
    # 权重分配：60% 取决于影子比(比例越夸张越像机器)，40% 取决于单日爆发总量
    df['bot_prob'] = (df['ratio'] / 10).clip(upper=1) * \
        0.6 + df['freq_score'] * 0.4

    # 💡 物理结算：不再是一刀切，而是按概率“加权”计算
    # 比如某天有 100 个克隆，判定机器人概率 0.8，则计入 80 个到机器人桶里
    bot_clones = (df['clones'] * df['bot_prob']).sum()
    total_clones = df['clones'].sum()
    human_clones = max(0, total_clones - bot_clones)

    # --- 绘图逻辑：保持地堡美学 ---
    plt.style.use('dark_background')
    fig, ax = plt.subplots(figsize=(8, 8))

    data = [human_clones, bot_clones]
    labels = ['Human Commanders', 'Machine Lifeforms']
    colors = ['#33cc33', '#444444']  # 地堡绿 vs 工业灰

    # 物理渲染：带阴影的甜甜圈
    wedges, texts, autotexts = ax.pie(data, labels=labels, autopct='%1.1f%%',
                                      startangle=90, colors=colors, pctdistance=0.85,
                                      explode=(0.05, 0), textprops={'color': "w", 'weight': 'bold'})

    # 绘制地堡中心黑洞
    centre_circle = plt.Circle((0, 0), 0.70, fc='#0d1117')
    fig.gca().add_artist(centre_circle)

    # 增加审计元数据
    avg_prob = df['bot_prob'].mean()
    plt.text(0, -0.1, f"Anomaly Coeff: {avg_prob:.2f}",
             ha='center', color='#888', fontsize=10)

    ax.set_title('Operational Audit: Meat vs Machine (Weighted)',
                 color='#33cc33', fontsize=14, pad=20)
    plt.tight_layout()

    os.makedirs('plots', exist_ok=True)
    plt.savefig('plots/bot_composition.png', dpi=120)
    print(f"✅ 概率审计图物理封存成功。当前人类战力占比: {human_clones/total_clones*100:.1f}%")


if __name__ == "__main__":
    plot_bot_composition()
