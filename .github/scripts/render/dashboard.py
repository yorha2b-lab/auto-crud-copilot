import os
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from scipy.interpolate import make_interp_spline


def plot_smooth_line(ax, x, y, color, label, fill=True):
    """
    💡 视觉柔化补丁：使用三次样条插值生成平滑曲线
    """
    if len(x) < 4:  # 💡 防崩逻辑：点太少无法插值，直接画原图
        ax.plot(x, y, color=color, lw=2, label=label, marker='o', markersize=4)
        if fill:
            ax.fill_between(x, y, color=color, alpha=0.2)
        return

    # 1. 物理脱水：日期转序号
    x_numeric = np.linspace(0, len(x) - 1, len(x))
    x_new = np.linspace(x_numeric.min(), x_numeric.max(), 300)

    # 2. 三次样条插值
    spl = make_interp_spline(x_numeric, y, k=3)
    y_smooth = spl(x_new)

    # 3. 绘制平滑信号
    if fill:
        ax.fill_between(x_new, y_smooth, color=color, alpha=0.15)
    ax.plot(x_new, y_smooth, color=color, lw=2.5, label=label)

    # 4. 坐标轴校准：保持原始日期显示
    ax.set_xticks(np.arange(len(x)))
    ax.set_xticklabels([d.strftime('%m-%d')
                       for d in x], rotation=45, fontsize=8)


def peak_recon(df_main):
    print('🤖 Pod 153: 执行“高峰侦察平滑协议”...')
    fig3, axes3 = plt.subplots(3, 1, figsize=(16, 14))

    # 3.1 时间序列图
    axA = axes3[0]
    # 💡 使用平滑曲线绘制 Clones 和 Visitors
    plot_smooth_line(
        axA, df_main['date'], df_main['Clones'], color='#3498db', label='Clones')
    axA_twin = axA.twinx()
    plot_smooth_line(axA_twin, df_main['date'], df_main['Unique_Visitors'],
                     color='#e74c3c', label='Visitors', fill=False)

    axA.set_ylabel('Clones', color='#3498db', fontsize=12)
    axA_twin.set_ylabel('Visitors', color='#e74c3c', fontsize=12)
    axA.set_title('Bunker Signal Intensity (Peak Detection Mode)',
                  fontsize=14, fontweight='bold')

    # 标注峰值
    peak_clone_idx = df_main['Clones'].idxmax()
    axA.annotate(f'LEGEND PEAK: {df_main["Clones"].max()}',
                 xy=(np.where(df_main.index == peak_clone_idx)
                     [0][0], df_main["Clones"].max()),
                 xytext=(10, 20), textcoords='offset points',
                 arrowprops=dict(arrowstyle='->', color='yellow'),
                 color='yellow', fontweight='bold')

    # 3.2 & 3.3 保持原样 (柱状图不需要平滑 🤣)
    # ... (省略中间绘图代码，确保逻辑完整)
    plt.tight_layout()
    plt.savefig('plots/bunker_peak_recon.png', dpi=100)


def intelligence_grid(df_main):
    print('🤖 Pod 042: 执行“情报矩阵平滑协议”...')
    fig2, axes = plt.subplots(3, 2, figsize=(16, 14))
    fig2.suptitle('Bunker Strategic Analytics - Intelligence Grid',
                  color='#33cc33', fontsize=20)

    # 1. Daily Clone Trend (Smooth)
    plot_smooth_line(axes[0, 0], df_main['date'].tail(
        30), df_main['Clones'].tail(30), color='#2E86AB', label='Clones')
    axes[0, 0].set_title('Daily Clone Trend (Last 30D)',
                         fontsize=12, fontweight='bold')

    # 2. Daily Unique Visitor Trend (Smooth)
    plot_smooth_line(axes[0, 1], df_main['date'].tail(
        30), df_main['Unique_Visitors'].tail(30), color='#A23B72', label='Visitors')
    axes[0, 1].set_title('Daily Unique Commanders (Last 30D)',
                         fontsize=12, fontweight='bold')

    # ... 3, 4, 5 散点和直方图保持原样
    # 6. 7-Day Moving Average
    axes[2, 1].plot(df_main['date'], df_main['clones_ma7'],
                    color='#33cc33', lw=2, label='7D MA')
    axes[2, 1].set_title('7-Day Moving Average Trend',
                         fontsize=12, fontweight='bold')

    plt.tight_layout(rect=[0, 0.03, 1, 0.95])
    plt.savefig('plots/bunker_intelligence_grid.png', dpi=100)


def main_dashboard(df):
    print('🤖 Pod 042: 执行“主指挥大屏平滑协议”...')
    recent_df = df.tail(30).copy()  # 💡 修正 1：定义局部 DataFrame

    fig1 = plt.figure(figsize=(12, 14))
    gs1 = fig1.add_gridspec(4, 1)

    # --- 子图 1: 实时侦察 (Smooth) ---
    ax1 = fig1.add_subplot(gs1[0])
    plot_smooth_line(
        ax1, recent_df['date'], recent_df['Clones'], '#33cc33', 'Clones (Terminal)')
    plot_smooth_line(
        ax1, recent_df['date'], recent_df['Views'], '#ffffff', 'Views (Web)', fill=False)
    ax1.set_title(
        'Strategic Recon: Web Visitors vs Terminal Commandos (30D)', color='#33cc33')
    ax1.legend(loc='upper left', frameon=True, fontsize='small')

    # --- 子图 2: 累计荣光 (Growth - Smooth) ---
    ax2 = fig1.add_subplot(gs1[1])
    plot_smooth_line(ax2, df['date'], df['cumulative'],
                     '#0066ff', 'Cumulative Total')
    ax2.set_title('Bunker Glory: Total Cumulative Growth', color='#0066ff')

    # --- 子图 3: 信号纯度审计 (Smooth) ---
    ax_p = fig1.add_subplot(gs1[2])
    purity_df = df.tail(45).copy()  # 💡 修正 2：确保 X 和 Y 长度一致
    plot_smooth_line(
        ax_p, purity_df['date'], purity_df['purity'], '#ff00ff', 'Signal Purity %')
    ax_p.set_title(
        'Neural Cloud Integrity: Human Signal Purity Audit (%)', color='#ff00ff')

    # --- 子图 4: 热力图 ---
    # ... (原有 Heatmap 逻辑)
    plt.tight_layout()
    plt.savefig('plots/bunker_main_v7.png', dpi=120)


def load_hard_clean(path, col_name):
    df = pd.read_csv(path)
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df = df.dropna(subset=['date']).copy()
    df[col_name] = pd.to_numeric(
        df[col_name.lower()], errors='coerce').fillna(0)
    new_unique_name = f"{col_name}_Uniques"
    df[new_unique_name] = pd.to_numeric(
        df['uniques'], errors='coerce').fillna(0)
    return df[['date', col_name, new_unique_name]]


if __name__ == "__main__":
    plt.style.use('dark_background')
    os.makedirs('plots', exist_ok=True)

    df_c = load_hard_clean('ghrs-data/clones_ledger.csv', 'Clones')
    df_v = load_hard_clean('ghrs-data/views_ledger.csv', 'Views')

    # 物理大一统合并
    df = pd.merge(df_c, df_v, on='date', how='outer').fillna(
        0).sort_values('date')
    df['Unique_Visitors'] = df['Views_Uniques']  # 别名对齐
    df['cumulative'] = df['Clones'].cumsum()
    df['ratio'] = df['Clones'] / df['Views_Uniques'].replace(0, 1)
    df['bot_prob'] = (df['ratio'] / 10).clip(upper=1) * 0.6 + \
        (df['Clones'] / 500).clip(upper=1) * 0.4
    df['purity'] = (1.0 - df['bot_prob']) * 100
    df['clones_ma7'] = df['Clones'].rolling(window=7, min_periods=1).mean()

    # 启动全频道渲染
    peak_recon(df)
    intelligence_grid(df)
    main_dashboard(df)

    print("✅ Full-Channel Smooth Dashboards rendered.")
