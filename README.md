# TS-NPBehave

TS-NPBehave是一个TypeScript实现的行为树库，基于Unity的[NPBehave](https://github.com/meniku/NPBehave)项目移植而来，并添加了对异步操作的支持和图形化编辑器。

## 特点

- 完全使用TypeScript编写，提供类型安全
- 支持异步操作（使用Promise和async/await）
- 内置图形化编辑器，可视化创建和编辑行为树
- 支持导入/导出JSON配置
- 丰富的节点类型：
  - 复合节点：Selector、Sequence、Parallel
  - 装饰器节点：BlackboardCondition、Repeater、Inverter、Succeeder、Failer、TimeLimit
  - 任务节点：Action、Wait、WaitForCondition

## 安装

```bash
npm install ts-npbehave
```

## 快速开始

### 创建简单的行为树

```typescript
import {
    Selector,
    Sequence,
    Action,
    BlackboardCondition,
    Operator,
    Wait
} from 'ts-npbehave';

// 创建行为树
const tree = new Selector([
    new Sequence([
        new BlackboardCondition('energy', Operator.IS_GREATER_OR_EQUAL, 50, 
            new Action(async () => {
                console.log('执行高能量动作');
                return true;
            })
        )
    ]),
    new Sequence([
        new Action(async () => {
            console.log('执行低能量动作');
            return true;
        }),
        new Wait(2.0)
    ])
]);

// 启动行为树
await tree.start();
```

### 使用图形化编辑器

```typescript
import { BehaviorTreeEditor } from 'ts-npbehave/editor';
import React from 'react';

const App = () => {
    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <BehaviorTreeEditor />
        </div>
    );
};

export default App;
```

## 文档

详细的API文档请参阅[API.md](./API.md)。

## 开发计划

查看[DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)了解项目的开发计划和进度。

## 更新日志

查看[CHANGELOG.md](./CHANGELOG.md)了解项目的更新历史。

## 许可证

MIT 