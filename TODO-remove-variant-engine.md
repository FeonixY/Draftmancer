# 待办:彻底删除变体轮抽引擎(死代码清理)

MDC 分支只用「标准轮抽」。变体轮抽(Winston / Winchester / Housman / Solomon / Grid /
Rochester / Rotisserie / Minesweeper / Glimpse / Supreme / Silent Auction / Team Sealed /
Sealed / Jumpstart / Jump In)已从 UI 与入口移除,但**底层引擎代码仍在**,处于"有代码、无入口、不会触发"的失效状态。

## 已完成(不用再做)
- 移除「Other Game Modes」下拉及所有变体/Sealed 按钮(仅留标准轮抽「开始」)。
- 移除 13 个变体/开局**对话框组件** + 对应 `start*` 入口方法 + 常量声明。
- 移除 MTGA Collection、原版 News/帮助/关于/捐赠等无关功能及其孤立组件。

## 尚未删除(本待办的目标)
变体引擎与**标准轮抽共用**同一套基础设施(`GameState` 状态机、`DraftState` 类型、socket 协议),
因此**必须谨慎、逐个变体端到端地删**,不能整片扫。涉及:

### 客户端(client/src)
- **对局视图组件**(components/):`WinstonDraft.vue` `WinchesterDraft.vue` `HousmanDraft.vue`
  `SolomonDraft.vue` `GridDraft.vue` `RotisserieDraft.vue` `MinesweeperDraft.vue`
  `SilentAuctionDraft.vue` `TeamSealed.vue` `SealedPresentation.vue`(Rochester/Glimpse/Supreme 复用标准视图)。
- **App.ts**:各变体的 `setXState / xDraftPick / xDraftEnd / onXStateUpdate` 方法;
  `socket.on("startXxx", ...)` 处理器;`spawnDialog(SealedPresentation, ...)`;
  对应的 `import type { XSyncData }`;组件注册项(components 块里 GridDraft/WinstonDraft… 等)。
- **App.vue 模板**:`v-if="gameState === GameState.XPicking/XWaiting/..."` 的各变体渲染块
  (与标准轮抽 Waiting/Picking/Reviewing/Watching/Brewing 交织,注意别误删标准分支)。
- **GameState 枚举**:移除变体状态值(保留 None/Waiting/Picking/Reviewing/Watching/Brewing/Brewing 等核心)。

### 服务端(src/)
- 引擎类/类型:`WinstonDraft.ts` `WinchesterDraft.ts` `GridDraft.ts` `RochesterDraft.ts`
  `RotisserieDraft.ts` `MinesweeperDraftTypes.ts` `HousmanDraft.ts` `SolomonDraft.ts`
  `SilentAuctionDraft*.ts` `TeamSealed.ts` `JumpInTypes.ts` 等。
- `Session.ts`:各 `startXxx` 方法与状态字段;socket 消息路由(server 端注册的对应事件)。
- 共享 `GameState` / 类型定义。

## 建议的安全做法(务必如此)
1. **先在本地/测试环境**把 fork 跑起来(`npm i && npm run build && npm start`),
   确认能**开一局标准轮抽**跑通。
2. **逐个变体**端到端删:客户端视图组件 + 模板块 + App.ts 方法/handler/import/注册
   + GameState 值 + 服务端引擎类 + Session 方法 + socket 路由 + 共享类型。
3. 每删一个变体:`client-type-check`(vue-tsc)+ 服务端 `tsc` 必须过,
   并**再跑一局标准轮抽**确认没坏(类型检查抓不到运行时协议破坏)。
4. 全部完成后再上线部署。

## 为什么不在本次/线上直接做
类型检查只能抓符号错误,抓不到 socket 协议层的运行时破坏;线上一旦弄坏标准轮抽,
损失远大于"少几百行失效源码"的收益。等有测试环境、能跑真实对局验证时再做。
