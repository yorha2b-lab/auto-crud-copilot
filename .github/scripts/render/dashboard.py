import os
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from scipy.interpolate import make_interp_spline


def plot_smooth_line(ax, x, y, color, label, fill=True):
    """
    💡 视觉柔化核心：执行信号插值，返回平滑后的坐标轴供后续标注使用
    """
    if len(x) < 4:
        ax.plot(x, y, color=color, lw=2, label=label, marker='o', markersize=3)
        if fill:
            ax.fill_between(x, y, color=color, alpha=0.15)
        return np.arange(len(x)), y

    # 1. 物理脱水：日期转序号
    x_numeric = np.linspace(0, len(x) - 1, len(x))
    x_new = np.linspace(0, len(x) - 1, 300)

    # 2. 三次样条插值
    spl = make_interp_spline(x_numeric, y, k=3)
    y_smooth = spl(x_new)

    # 3. 绘制平滑信号
    if fill:
        ax.fill_between(x_new, y_smooth, color=color, alpha=0.15)
    ax.plot(x_new, y_smooth, color=color, lw=2.5, label=label)

    return x_new, y_smooth


def peak_recon(df):
    print('🤖 Pod 153: 执行“高峰侦察平滑协议”...')
    fig3, axes = plt.subplots(3, 1, figsize=(16, 14))

    # 3.1 核心双轴平滑图
    axA = axes[0]
    xn, yn = plot_smooth_line(
        axA, df['date'], df['Clones'], '#3498db', 'Clones')
    axA_twin = axA.twinx()
    plot_smooth_line(
        axA_twin, df['date'], df['Unique_Visitors'], '#e74c3c', 'Visitors', fill=False)

    # 标注峰值 (在插值空间定位)
    peak_val = df['Clones'].max()
    peak_idx = df['Clones'].idxmax()
    peak_pos = np.where(df.index == peak_idx)[0][0]
    axA.annotate(f'LEGEND PEAK: {peak_val}', xy=(peak_pos, peak_val), xytext=(20, 20),
                 textcoords='offset points', arrowprops=dict(arrowstyle='->', color='yellow'),
                 color='yellow', fontweight='bold')

    axA.set_title('Bunker Signal Intensity (Smooth Peak Mode)',
                  fontsize=14, color='#33cc33')
    axA.set_xticks(np.arange(len(df)))
    axA.set_xticklabels([d.strftime('%m-%d')
                        for d in df['date']], rotation=45, alpha=0.5)

    # 3.2 每周汇总 (保持柱状图稳定)
    axB = axes[1]
    weekly_agg = df.assign(W=df['date'].dt.strftime(
        '%Y-W%W')).groupby('W')[['Clones', 'Unique_Visitors']].sum().tail(12)
    weekly_agg.plot(kind='bar', ax=axB, alpha=0.7,
                    color=['#3498db', '#e74c3c'])
    axB.set_title('Weekly Operational Summary', color='#888')

    # 3.3 比例分析
    axC = axes[2]
    colors = ['#2ecc71' if r < 3 else '#f39c12' if r <
              5 else '#e74c3c' for r in df['ratio']]
    axC.bar(np.arange(len(df)), df['ratio'], color=colors, alpha=0.6)
    axC.set_xticks(np.arange(len(df)))
    axC.set_xticklabels([d.strftime('%m-%d')
                        for d in df['date']], rotation=45, alpha=0.5)
    axC.set_title('Clones/Visitor Ratio Analysis', color='#888')

    plt.tight_layout()
    plt.savefig('plots/bunker_peak_recon.png', dpi=120)


def intelligence_grid(df):
    print('🤖 Pod 042: 执行“情报矩阵平滑协议”...')
    fig2, axes = plt.subplots(3, 2, figsize=(16, 14))
    fig2.suptitle('Bunker Strategic Analytics - Intelligence Grid',
                  color='#33cc33', fontsize=20)

    df30 = df.tail(30).copy()

    # 1 & 2: 趋势平滑图
    plot_smooth_line(axes[0, 0], df30['date'],
                     df30['Clones'], '#2E86AB', 'Clones')
    plot_smooth_line(axes[0, 1], df30['date'],
                     df30['Unique_Visitors'], '#A23B72', 'Visitors')

    # 3. 相关性散点 (不可平滑)
    sns.regplot(data=df, x='Unique_Visitors', y='Clones',
                ax=axes[1, 0], color='#0066ff', scatter_kws={'alpha': 0.4})

    # 4. 人均分布
    sns.histplot(df['ratio'], bins=20, ax=axes[1, 1],
                 color='#F18F01', kde=True)

    # 5. 每周吞吐
    weekly = df.assign(W=df['date'].dt.strftime('%W')).groupby('W')[
        'Clones'].sum().tail(12)
    weekly.plot(kind='bar', ax=axes[2, 0], color='#2E86AB', alpha=0.6)

    # 6. 7日均线 (MA 已经是平滑的了，直接画)
    axes[2, 1].plot(df['date'], df['clones_ma7'], color='#33cc33', lw=2)
    axes[2, 1].xaxis.set_major_formatter(mdates.DateFormatter('%m-%d'))

    plt.tight_layout(rect=[0, 0.03, 1, 0.95])
    plt.savefig('plots/bunker_intelligence_grid.png', dpi=100)


def main_dashboard(df):
    print('🤖 Pod 042: 执行“主指挥大屏平滑协议”...')
    df30 = df.tail(30).copy()

    fig1 = plt.figure(figsize=(12, 14))
    gs1 = fig1.add_gridspec(4, 1)

    # 子图 1: 实时侦察 (Smooth)
    ax1 = fig1.add_subplot(gs1[0])
    plot_smooth_line(ax1, df30['date'], df30['Clones'], '#33cc33', 'Clones')
    plot_smooth_line(ax1, df30['date'], df30['Views'],
                     '#ffffff', 'Views', fill=False)
    ax1.legend(loc='upper left', fontsize='x-small')

    # 子图 2: 累计荣光 (Smooth)
    ax2 = fig1.add_subplot(gs1[1])
    plot_smooth_line(ax2, df['date'], df['cumulative'], '#0066ff', 'Total')

    # 子图 3: 信号纯度 (Smooth)
    ax_p = fig1.add_subplot(gs1[2])
    df45 = df.tail(45).copy()
    plot_smooth_line(ax_p, df45['date'], df45['purity'], '#ff00ff', 'Purity')
    ax_p.set_ylim(0, 110)

    # 子图 4: 热力图
    ax3 = fig1.add_subplot(gs1[3])
    pivot = df.assign(week=df['date'].dt.isocalendar().week, day=df['date'].dt.day_name()).pivot_table(index='day', columns='week',
                                                                                                       values='Clones', aggfunc='sum').fillna(0).reindex(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    sns.heatmap(pivot, cmap='Greens', ax=ax3,
                cbar=False, lw=2, linecolor='#1a1a1a')

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
    df = pd.merge(df_c[['date', 'Clones', 'Clones_Uniques']], df_v[[
                  'date', 'Views', 'Views_Uniques']], on='date', how='outer').fillna(0).sort_values('date')
    df['Unique_Visitors'] = df['Views_Uniques']
    df['cumulative'] = df['Clones'].cumsum()
    df['ratio'] = df['Clones'] / df['Views_Uniques'].replace(0, 1)
    df['bot_prob'] = (df['ratio'] / 10).clip(upper=1) * 0.6 + \
        (df['Clones'] / 500).clip(upper=1) * 0.4
    df['purity'] = (1.0 - df['bot_prob']) * 100
    df['clones_ma7'] = df['Clones'].rolling(window=7, min_periods=1).mean()

    peak_recon(df)
    intelligence_grid(df)
    main_dashboard(df)
    print("✅ All Signal Channels Restored & Smoothed.")
