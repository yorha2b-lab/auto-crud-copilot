import os
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from scipy.interpolate import make_interp_spline

# 💡 地堡核心平滑引擎：不再依赖日期计算，改用物理索引映射


def draw_smooth(ax, y_data, color, label, fill=True):
    if len(y_data) < 4:
        ax.plot(y_data, color=color, lw=2, label=label, marker='o')
        return
    x_raw = np.arange(len(y_data))
    x_smooth = np.linspace(0, len(y_data)-1, 300)
    spl = make_interp_spline(x_raw, y_data, k=3)
    y_smooth = spl(x_smooth)
    if fill:
        ax.fill_between(x_smooth, y_smooth, color=color, alpha=0.15)
    ax.plot(x_smooth, y_smooth, color=color, lw=2.5, label=label)


def peak_recon(df):
    print('🤖 Pod 153: 执行“高峰侦察协议”...')
    fig, axes = plt.subplots(3, 1, figsize=(16, 14))
    plt.style.use('dark_background')

    # A. 核心平滑图
    ax = axes[0]
    draw_smooth(ax, df['Clones'].values, '#3498db', 'Clones')
    ax_t = ax.twinx()
    draw_smooth(ax_t, df['Clones_Uniques'].values,
                '#e74c3c', 'Commanders', fill=False)

    # 峰值标注 (物理定位)
    p_val = df['Clones'].max()
    p_idx = np.where(df['Clones'] == p_val)[0][0]
    ax.annotate(f'PEAK: {p_val}', xy=(p_idx, p_val), xytext=(20, 20),
                textcoords='offset points', arrowprops=dict(arrowstyle='->', color='yellow'),
                color='yellow', fontweight='bold')

    ax.set_title('Bunker Signal Intensity (Smooth Mode)', color='#33cc33')
    ax.set_xticks(np.arange(len(df)))
    ax.set_xticklabels([d.strftime('%m-%d')
                       for d in df['date']], rotation=45, alpha=0.5)

    # B. 每周汇总 (保持原始粗犷美感)
    df['W'] = df['date'].dt.strftime('%Y-W%W')
    weekly = df.groupby('W')[['Clones', 'Clones_Uniques']].sum().tail(12)
    weekly.plot(kind='bar', ax=axes[1],
                alpha=0.7, color=['#3498db', '#e74c3c'])

    # C. 比值分析
    axes[2].bar(np.arange(len(df)), df['ratio'], color='#ff9900', alpha=0.6)
    axes[2].set_xticks(np.arange(len(df)))
    axes[2].set_xticklabels([d.strftime('%m-%d')
                            for d in df['date']], rotation=45, alpha=0.5)

    plt.tight_layout()
    plt.savefig('plots/bunker_peak_recon.png', dpi=100)


def intelligence_grid(df):
    print('🤖 Pod 042: 执行“情报大屏协议”...')
    fig, axes = plt.subplots(3, 2, figsize=(16, 14))
    df30 = df.tail(30).copy()

    # 1 & 2: 趋势
    draw_smooth(axes[0, 0], df30['Clones'].values, '#2E86AB', 'Clones')
    draw_smooth(axes[0, 1], df30['Clones_Uniques'].values,
                '#A23B72', 'Commanders')

    # 3. 散点 (AI 聚类真相)
    sns.regplot(data=df, x='Views', y='Clones', ax=axes[1, 0], color='#0066ff')

    # 4. 分布
    sns.histplot(df['ratio'], bins=15, ax=axes[1, 1],
                 kde=True, color='#F18F01')

    # 5. 每周
    df.groupby(df['date'].dt.strftime('%W'))['Clones'].sum().tail(
        10).plot(kind='bar', ax=axes[2, 0], color='#2E86AB')

    # 6. 7日线
    axes[2, 1].plot(np.arange(len(df)), df['clones_ma7'],
                    color='#33cc33', lw=2)

    # 💡 统一 X 轴标签补丁
    for i in [0]:
        for j in [0, 1]:
            axes[i, j].set_xticks(np.arange(len(df30)))
            axes[i, j].set_xticklabels(
                [d.strftime('%m-%d') for d in df30['date']], rotation=45, fontsize=7)

    plt.tight_layout()
    plt.savefig('plots/bunker_intelligence_grid.png', dpi=100)


def main_dashboard(df):
    print('🤖 Pod 042: 执行“母舰指挥看板协议”...')
    df30 = df.tail(30).copy()
    fig = plt.figure(figsize=(12, 16))
    gs = fig.add_gridspec(4, 1)

    # 子图 1: 实时 (Smooth)
    ax1 = fig.add_subplot(gs[0])
    draw_smooth(ax1, df30['Clones'].values, '#33cc33', 'Clones')
    draw_smooth(ax1, df30['Views'].values, '#ffffff', 'Views', fill=False)
    ax1.set_xticks(np.arange(len(df30)))
    ax1.set_xticklabels([d.strftime('%m-%d')
                        for d in df30['date']], rotation=45, fontsize=8)
    ax1.legend()

    # 子图 2: 累计 (Smooth)
    ax2 = fig.add_subplot(gs[1])
    draw_smooth(ax2, df['cumulative'].values, '#0066ff', 'Total')
    ax2.set_title('Bunker Glory: Total Accumulation', color='#0066ff')

    # 子图 3: 纯度 (Smooth)
    ax3 = fig.add_subplot(gs[2])
    df45 = df.tail(45)
    draw_smooth(ax3, df45['purity'].values, '#ff00ff', 'Purity')
    ax3.set_ylim(0, 105)

    # 子图 4: 热力图
    ax4 = fig.add_subplot(gs[3])
    pivot = df.assign(week=df['date'].dt.isocalendar().week, day=df['date'].dt.day_name()).pivot_table(index='day', columns='week',
                                                                                                       values='Clones', aggfunc='sum').fillna(0).reindex(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    sns.heatmap(pivot, cmap='Greens', ax=ax4, cbar=False, lw=1)

    plt.tight_layout()
    plt.savefig('plots/bunker_main_v7.png', dpi=120)


def load_hard_clean(path, col_name):
    df = pd.read_csv(path)
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df = df.dropna(subset=['date']).copy()
    df[col_name] = pd.to_numeric(
        df[col_name.lower()], errors='coerce').fillna(0)
    df[f"{col_name}_Uniques"] = pd.to_numeric(
        df['uniques'], errors='coerce').fillna(0)
    return df


if __name__ == "__main__":
    plt.style.use('dark_background')
    os.makedirs('plots', exist_ok=True)
    df_c = load_hard_clean('ghrs-data/clones_ledger.csv', 'Clones')
    df_v = load_hard_clean('ghrs-data/views_ledger.csv', 'Views')
    # 对齐
    df = pd.merge(df_c[['date', 'Clones', 'Clones_Uniques']], df_v[[
                  'date', 'Views', 'Views_Uniques']], on='date', how='outer').fillna(0).sort_values('date')
    df['ratio'] = df['Clones'] / df['Views_Uniques'].replace(0, 1)
    df['cumulative'] = df['Clones'].cumsum()
    df['bot_prob'] = (df['ratio'] / 10).clip(upper=1) * 0.6 + \
        (df['Clones'] / 500).clip(upper=1) * 0.4
    df['purity'] = (1.0 - df['bot_prob']) * 100
    df['clones_ma7'] = df['Clones'].rolling(7, min_periods=1).mean()

    peak_recon(df)
    intelligence_grid(df)
    main_dashboard(df)
    print("✅ All Systems Operational. Vision Corrected.")
