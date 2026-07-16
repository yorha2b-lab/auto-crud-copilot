import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt


def plot_commander_profiles():
    print('🤖 Pod 042: 正在绘制‘指挥官军衔分布图’...')
    df_c = pd.read_csv('ghrs-data/clones_ledger.csv')
    df_c['intensity'] = df_c['clones'] / df_c['uniques'].replace(0, 1)

    # 定义军衔逻辑
    def get_rank(row):
        if row['intensity'] > 5:
            return 'Industrial (CI/CD)'
        if row['intensity'] > 1.5:
            return 'Veteran (Hardcore)'
        return 'Recruit (Fresh)'

    df_c['rank'] = df_c.apply(get_rank, axis=1)
    rank_counts = df_c['rank'].value_counts()

    # 💡 绘图：战力梯度图
    plt.style.use('dark_background')
    plt.figure(figsize=(10, 6))

    # 用 seaborn 画出更有质感的柱状图
    ax = sns.barplot(x=rank_counts.index,
                     y=rank_counts.values, palette='viridis')

    plt.title('Commander Hierarchy Distribution', color='#0066ff', fontsize=14)
    plt.ylabel('Node Count', color='#888')
    plt.grid(axis='y', color='#333', linestyle='--', alpha=0.5)

    plt.tight_layout()
    plt.savefig('plots/commander_profiles.png', dpi=100)
    print('✅ 军衔分布图封存成功。')


if __name__ == '__main__':
    plot_commander_profiles()
