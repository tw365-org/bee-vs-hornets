# 🐝 小蜜蜂大戰虎頭蜂 (Bee vs Hornets)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Phaser](https://img.shields.io/badge/Phaser-3.80.1-orange.svg)](https://phaser.io/)
[![Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020.svg?logo=cloudflare)](https://pages.cloudflare.com/)
[![Pure ESM](https://img.shields.io/badge/Architecture-Native%20ESM-blue.svg)]()
[![Zero Build](https://img.shields.io/badge/Build-Zero%20Config-success.svg)]()

> 一款基於 **Phaser 3** 與 **原生 ES Modules (ESM)** 打造的復古 8-Bit 像素街機彈幕射擊遊戲。  
> 具備 **4 階重武器進階系統**、**程序化像素紋理動態生成**、**Web Audio 晶片合成音效** 與 **花粉核爆必殺技**。  
> 專為零構建 (Zero-Build) 設計，隨開即玩，支援直接部署至 **Cloudflare Pages** 與 **GitHub Pages**！

---

## 🎮 遊戲特點 (Features)

- 🕹️ **經典街機手感**：CRT 掃描線濾鏡、8-Bit 點陣字體與懷舊像素微光特效。
- ⚡ **4 階重武器進階系統**：隨分數突破自動升級，從雙連發蜂針、花蜜散彈、蜂王追蹤微導彈，一路解鎖至毀滅性的等離子重砲！
- 💥 **花粉天譴核爆 (Pollen Supernova)**：累積能量後一鍵全螢幕肅清敵機與彈幕。
- 👾 **高智能敵機編隊**：普通工蜂陣型巡邏俯衝、重型裝甲蜂散射尾針、以及多階段變態狂暴的虎頭蜂女王 (Queen Boss)。
- 🎨 **100% 程式化像素美術 (Procedural Pixel Art)**：遊戲內建 Canvas 像素繪製引擎，零靜態外部圖片依賴，永遠不會遇到 404 斷圖。
- 🔊 **Web Audio 晶片級即時合成**：方波射擊、白噪聲爆炸、A Major 升級琶音，無外連音檔載入延遲。
- 🚀 **雲端與開源友善**：零打包配置（No Webpack/Vite required），可直接丟上 Cloudflare Pages 或任何靜態主機。

---

## 🕹️ 操作控制 (Controls)

| 按鍵 | 操作動作 |
|:---:|:---|
| <kbd>←</kbd> <kbd>→</kbd> 或 <kbd>A</kbd> <kbd>D</kbd> | 左右靈巧穿梭飛行 |
| <kbd>↑</kbd> <kbd>↓</kbd> 或 <kbd>W</kbd> <kbd>S</kbd> | 上下微調走位（活動於下半部防空區） |
| <kbd>SPACE</kbd> (空白鍵) | 高速連射主武器蜂針 |
| <kbd>X</kbd> 或 <kbd>B</kbd> | 釋放 **花粉天譴核爆**（全螢幕肅清） |

---

## ⚔️ 重武器套件系統 (Heavy Weapon System)

| 等級 | 解鎖分數 | 武器名稱 | 特性描述 | 彈幕特效 |
|:---:|:---:|:---|:---|:---|
| **LV.0** | 0 PTS | **雙連發蜂針** | 初始標配雙軌蜂針，高射速、筆直射線 | 青色雷射 |
| **LV.1** | 1,000 PTS | **花蜜散彈針** | 5 條扇形散射蜂針，大幅增加打擊廣度 | 金黃菱形擴散 |
| **LV.2** | 2,500 PTS | **蜂王追蹤微導彈** | 雙針 + 2 枚具備主動導引功能的微型巡弋飛彈 | 綠色推進火焰飛彈 |
| **LV.3** | 5,000 PTS | **重型等離子轟爆砲** | 穿透型巨型電漿光球，附帶電弧與範圍貫穿傷害 | 紫粉巨型能量球 |
| **SP** | 炸彈圖示 | **花粉天譴核爆** | 清除全場敵方彈幕，並秒殺或重創全螢幕敵人 | 全屏金粉暴風 |

---

## 📂 專案架構 (Project Structure)

```
bee-vs-hornets/
├── index.html                  # 遊戲首頁入口 (載入 Phaser 3 CDN 與 main.js 模組)
├── index.legacy.html           # 第一代原生 Canvas 原型歷史備份
├── play.cmd                    # Windows 零依賴雙擊即玩伺服器
├── _headers                    # Cloudflare Pages 快取與安全標頭配置
├── LICENSE                     # MIT 開源授權條款
├── README.md                   # 專案詳細說明文檔
├── css/
│   └── style.css               # 街機外框、CRT 掃描線、微光 Glow 樣式
└── src/
    ├── config.js               # 遊戲全域平衡設定與武器門檻配置
    ├── main.js                 # 啟動腳本，實例化 Phaser.Game
    ├── audio/
    │   └── SoundManager.js     # Web Audio 8-Bit 晶片合成音效引擎
    ├── gfx/
    │   └── TextureGenerator.js # 原生 Canvas 程式化像素精靈繪製器
    ├── entities/
    │   ├── Player.js           # 玩家小蜜蜂 (移動、護盾、大絕)
    │   ├── Hornet.js           # 普通虎頭蜂 (編隊、波浪俯衝 AI)
    │   ├── ArmoredHornet.js    # 裝甲巨蜂 (高耐久、散射尾針)
    │   └── QueenBoss.js        # 虎頭蜂女王 (多階段 Boss、召喚護衛、雷射掃射)
    ├── weapons/
    │   ├── WeaponSystem.js     # 重武器里程碑狀態機與子彈物件池
    │   └── Bullet.js           # 子彈物理碰撞與導引邏輯
    ├── ui/
    │   └── HUD.js              # 街機抬頭顯示器 (HP、武器位階、炸彈、Boss血條)
    └── scenes/
        ├── BootScene.js        # 動態紋理繪製與資源啟動
        ├── MenuScene.js        # 街機標題畫面與投幣說明
        ├── GameScene.js        # 戰鬥主迴圈、波次循環、碰撞監聽
        └── GameOverScene.js    # 結算評級 (S/A/B/C) 與重新開局
```

---

## 💻 本地運行 (Local Development)

### 方法 A：Windows 一鍵即玩（最推薦）
直接在專案根目錄**雙擊 `play.cmd`**！
> 腳本會自動偵測 Python 或 Node.js；若都沒有，將自動喚起 Windows 內建的 PowerShell 迷你伺服器並自動開啟預設瀏覽器，100% 免安裝額外環境！

### 方法 B：使用任意靜態伺服器
```bash
# 使用 Python
python -m http.server 8080

# 或使用 Node.js
npx serve .
```
接著在瀏覽器打開 `http://localhost:8080` 即可暢玩。

---

## 🌐 部署至 Cloudflare Pages (Deploy to Cloudflare)

本專案採用純靜態 ESM 架構，完美契合 Cloudflare Pages 的全球邊緣加速網路：

### 步驟 1：推送到 GitHub
請參考下方「開源至 GitHub」步驟，將代碼推送至您的 GitHub Repository。

### 步驟 2：在 Cloudflare Pages 建立專案
1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2. 進入 **Workers & Pages** > 點擊 **Create application** > 選擇 **Pages**。
3. 點選 **Connect to Git** 並授權存取您的 GitHub `bee-vs-hornets` 專案。
4. 設定建置參數 (Build Settings)：
   - **Framework preset**: `None`
   - **Build command**: *（保持完全留空）*
   - **Build output directory**: `/` *（代表根目錄）*
5. 點擊 **Save and Deploy**！
> ⏱️ 幾秒鐘內即可完成部署，取得類似 `https://bee-vs-hornets.pages.dev` 的全球 CDN 網址！

---

## 🐙 開源至 GitHub (Publish to GitHub)

在專案目錄下打開終端機 (PowerShell / Git Bash)，執行以下指令：

```bash
# 1. 初始化 Git 倉庫
git init

# 2. 加入所有檔案
git add .

# 3. 提交首次版本
git commit -m "feat: initial release of Bee vs Hornets arcade game built with Phaser 3 & ESM"

# 4. 關聯遠端 GitHub 倉庫
git branch -M main
git remote add origin https://github.com/tw365-org/bee-vs-hornets.git

# 5. 推送代碼
git push -u origin main
```

---

## 📜 開源協議 (License)

本專案採用 [MIT License](LICENSE) 開源授權，歡迎自由修改、分發與用於個人或商業專案。
