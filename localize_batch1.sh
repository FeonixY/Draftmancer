#!/bin/bash
# Draftmancer汉化脚本 - 第一批

cd ~/draftmancer-src/client/src

echo "开始汉化Draftmancer界面..."

# 备份
cp App.vue App.vue.batch1_backup

# 批量替换主要按钮
sed -i '424s|>Start</button>|>{{ $t("common.start") }}</button>|' App.vue
sed -i '1653s|>Start</span>|>{{ $t("common.start") }}</span>|' App.vue
sed -i '1837s|>Join</button>|>{{ $t("common.join") }}</button>|' App.vue
sed -i '1673s|<h2>Help</h2>|<h2>{{ $t("menu.help") }}</h2>|' App.vue
sed -i '1856s|<h2>Help</h2>|<h2>{{ $t("menu.help") }}</h2>|' App.vue
sed -i '2829s|<h2>About</h2>|<h2>{{ $t("menu.about") }}</h2>|' App.vue
sed -i '2846s|>About</span>|>{{ $t("menu.about") }}</span>|' App.vue
sed -i '1953s|<h2>Game Logs</h2>|<h2>{{ $t("menu.gameLogs") }}</h2>|' App.vue
sed -i '2277s|<h4>Game Logs</h4>|<h4>{{ $t("menu.gameLogs") }}</h4>|' App.vue

echo "✅ 第一批汉化完成"
