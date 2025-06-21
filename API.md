# TS-NPBehave API 文档

## 核心概念

TS-NPBehave 是一个用 TypeScript 实现的行为树库，支持异步操作。行为树是一种用于构建复杂 AI 行为的工具，特别适用于游戏和交互式应用程序。

### 节点状态

节点可以处于以下状态之一：

- `INACTIVE`：节点未激活
- `ACTIVE`：节点正在执行
- `STOP_REQUESTED`：节点已请求停止

### 节点结果

节点执行完成后可以返回以下结果之一：

- `SUCCESS`：节点执行成功
- `FAILURE`：节点执行失败
- `RUNNING`：节点仍在执行中

## 核心类

### Node

所有行为树节点的基类，提供基本的生命周期管理。

```typescript
abstract class Node {
    async start(): Promise<NodeResult>;
    async stop(): Promise<void>;
    protected abstract doStart(): Promise<NodeResult>;
    protected abstract doStop(): Promise<void>;
}
```

### Container

容器节点的基类，可以包含其他节点。

```typescript
abstract class Container extends Node {
    abstract childStopped(child: Node, result: NodeResult): Promise<void>;
}
```

### Composite

复合节点的基类，包含多个子节点并定义它们的执行顺序。

```typescript
abstract class Composite extends Container {
    protected children: Node[];
    protected currentChildIndex: number;
}
```

### Decorator

装饰器节点的基类，包装一个子节点并修改其行为。

```typescript
abstract class Decorator extends Container {
    protected decoratee: Node;
}
```

### Task

任务节点的基类，是行为树的叶子节点，执行实际操作。

```typescript
abstract class Task extends Node {
    // 任务节点实现
}
```

## 复合节点

### Selector

依次执行子节点，直到一个子节点成功为止。如果所有子节点都失败，则选择器失败。

```typescript
class Selector extends Composite {
    // 如果一个子节点成功，则选择器成功
    // 如果所有子节点失败，则选择器失败
}
```

### Sequence

依次执行子节点，直到所有子节点成功或一个子节点失败。

```typescript
class Sequence extends Composite {
    // 如果所有子节点成功，则序列成功
    // 如果一个子节点失败，则序列失败
}
```

### Parallel

并行执行所有子节点。

```typescript
class Parallel extends Composite {
    // 根据成功和失败策略决定结果
}
```

## 装饰器节点

### Repeater

重复执行子节点指定的次数。

```typescript
class Repeater extends Decorator {
    constructor(count: number, decoratee: Node);
    // count为0时无限重复
}
```

### Inverter

反转子节点的执行结果：成功变为失败，失败变为成功。

```typescript
class Inverter extends Decorator {
    constructor(decoratee: Node);
}
```

### Succeeder

无论子节点的执行结果如何，都返回成功。

```typescript
class Succeeder extends Decorator {
    constructor(decoratee: Node);
}
```

### Failer

无论子节点的执行结果如何，都返回失败。

```typescript
class Failer extends Decorator {
    constructor(decoratee: Node);
}
```

### TimeLimit

限制子节点的执行时间，超时则返回失败。

```typescript
class TimeLimit extends Decorator {
    constructor(limitSeconds: number, decoratee: Node);
}
```

### BlackboardCondition

根据黑板中的值决定是否执行子节点。

```typescript
class BlackboardCondition extends Decorator {
    constructor(key: string, operator: Operator, value: any, decoratee: Node);
}
```

## 任务节点

### Action

执行指定的函数作为行为树的任务。

```typescript
class Action extends Task {
    constructor(action: () => boolean | void | Promise<boolean | void>);
}
```

### Wait

等待指定时间。

```typescript
class Wait extends Task {
    constructor(waitTime: number, randomVariation?: number);
}
```

### WaitForCondition

等待直到条件满足或超时。

```typescript
class WaitForCondition extends Task {
    constructor(
        condition: () => boolean | Promise<boolean>,
        checkInterval?: number,
        timeout?: number
    );
}
```

## 工具类

### Blackboard

用于存储和共享行为树节点之间的数据。

```typescript
class Blackboard {
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T): Promise<void>;
}
```

### BehaviorTreeBuilder

用于从JSON配置构建行为树。

```typescript
class BehaviorTreeBuilder {
    buildFromJson(jsonString: string): Root | null;
    buildFromConfig(config: StandardTreeConfig): Root | null;
}
```

## 使用示例

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
const tree = new Selector('RootSelector', [
    new Sequence('CheckEnergySequence', [
        new BlackboardCondition('energy', Operator.IS_GREATER, 50, 
            new Action(async () => {
                console.log('执行高能量动作');
                return true;
            })
        )
    ]),
    new Sequence('LowEnergySequence', [
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

### 使用异步操作

```typescript
import { Action, Sequence } from 'ts-npbehave';

const fetchDataAction = new Action(async () => {
    try {
        const response = await fetch('https://api.example.com/data');
        const data = await response.json();
        console.log('获取数据成功:', data);
        return true;
    } catch (error) {
        console.error('获取数据失败:', error);
        return false;
    }
});

const processDataAction = new Action(async () => {
    console.log('处理数据');
    // 处理数据的逻辑
    return true;
});

const dataSequence = new Sequence('DataSequence', [
    fetchDataAction,
    processDataAction
]);

// 启动序列
await dataSequence.start();
```

### 从JSON配置构建行为树

```typescript
import { BehaviorTreeBuilder } from 'ts-npbehave';

const jsonConfig = `{
    "trees": [
        {
            "type": "COMPOSITE.SELECTOR",
            "properties": {
                "label": "RootSelector"
            },
            "children": [
                {
                    "type": "COMPOSITE.SEQUENCE",
                    "properties": {
                        "label": "MainSequence"
                    },
                    "children": [
                        {
                            "type": "TASK.ACTION",
                            "properties": {
                                "label": "DoSomething",
                                "actionDescription": "执行某项操作"
                            }
                        },
                        {
                            "type": "TASK.WAIT",
                            "properties": {
                                "label": "WaitABit",
                                "waitTime": 1.5
                            }
                        }
                    ]
                }
            ]
        }
    ]
}`;

const builder = new BehaviorTreeBuilder();
const tree = builder.buildFromJson(jsonConfig);

if (tree) {
    await tree.start();
}
```

## 最佳实践

1. **使用异步操作**：所有节点都支持异步操作，可以在Action节点中执行异步函数。

2. **组合节点**：通过组合不同类型的节点构建复杂的行为。

3. **使用黑板共享数据**：在不同节点之间使用黑板共享数据，而不是使用全局变量。

4. **使用装饰器修改行为**：装饰器节点可以修改子节点的行为，例如重复执行、反转结果等。

5. **使用构建器从配置创建行为树**：使用BehaviorTreeBuilder从JSON配置创建行为树，方便动态加载和修改行为。 