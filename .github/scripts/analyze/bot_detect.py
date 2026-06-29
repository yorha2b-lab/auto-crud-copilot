import os
import pandas as pd
import matplotlib.pyplot as plt


def plot_bot_composition():
    print("🤖 Pod 042: 正在绘制‘肉机成分分析图’...")
    df_c = pd.read_csv('ghrs-data/clones_ledger.csv')
    df_v = pd.read_csv('ghrs-data/views_ledger.csv')
    df = pd.merge(df_c, df_v, on='date', how='inner')

    # 算法：Shadow Ratio > 5 判定为机器
    df['is_bot'] = (df['clones'] / df['views'].replace(0, 1)) > 5
    bot_clones = df[df['is_bot']]['clones'].sum()
    total_clones = df['clones'].sum()
    human_clones = total_clones - bot_clones

    # 💡 绘图：地堡级甜甜圈图
    plt.style.use('dark_background')
    fig, ax = plt.subplots(figsize=(8, 8))

    data = [human_clones, bot_clones]
    labels = ['Human Commanders', 'Machine Lifeforms']
    colors = ['#33cc33', '#444444']  # 地堡绿 vs 灰

    wedges, texts, autotexts = ax.pie(data, labels=labels, autopct='%1.1f%%',
                                      startangle=90, colors=colors, pctdistance=0.85,
                                      explode=(0.05, 0), textprops={'color': "w"})

    # 画个中间的黑洞，变成甜甜圈
    centre_circle = plt.Circle((0, 0), 0.70, fc='#0d1117')
    fig.gca().add_artist(centre_circle)

    ax.set_title("Operational Composition: Meat vs Machine",
                 color='#33cc33', fontsize=14)
    plt.tight_layout()
    os.makedirs('plots', exist_ok=True)
    plt.savefig('plots/bot_composition.png', dpi=100)
    print("✅ 甜甜圈图封存成功。")


if __name__ == "__main__":
    plot_bot_composition()
