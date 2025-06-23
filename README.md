# TS-NPBehave

TypeScript版本的NPBehave行为树库，支持异步操作和Node.js环境。

## 特性

- 基于Promise和async/await的异步操作支持
- 兼容Node.js和浏览器环境
- 完整的行为树节点类型实现
- 可视化编辑器支持
- 从配置文件加载行为树

## 节点类型

### 复合节点

- `Selector` - 依次执行子节点，直到一个子节点成功
- `Sequence` - 依次执行子节点，直到所有子节点成功或一个失败
- `Parallel` - 并行执行所有子节点
- `RandomSelector` - 随机顺序执行子节点，直到一个成功
- `RandomSequence` - 随机顺序执行所有子节点

### 装饰器节点

- `BlackboardCondition` - 基于黑板值的条件装饰器
- `Condition` - 基于自定义函数的条件装饰器
- `Cooldown` - 冷却时间装饰器
- `Failer` - 始终返回失败的装饰器
- `Inverter` - 反转结果的装饰器
- `Observer` - 观察条件变化的装饰器
- `Repeater` - 重复执行子节点的装饰器
- `Succeeder` - 始终返回成功的装饰器
- `TimeLimit` - 时间限制装饰器

### 任务节点

- `Action` - 执行自定义函数的动作节点
- `Wait` - 等待指定时间的节点
- `WaitForCondition` - 等待条件满足的节点
- `WaitUntil` - 等待直到条件满足的节点
- `WaitUntilStopped` - 等待直到被停止的节点
- `IsBlackboardValueSet` - 检查黑板值是否已设置的条件节点

## 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/ts-npbehave.git
cd ts-npbehave

# 安装依赖
npm install
```

## 运行示例

TS-NPBehave包含多个示例，展示各种节点的使用方法。

### 使用npm脚本运行示例

```bash
npm run example ObserverTest
```

### 可用的示例

- `ObserverTest` - 展示Observer装饰器和WaitUntilStopped节点的使用
- `CooldownTest` - 展示Cooldown装饰器和RandomSelector节点的使用
- `ConditionTest` - 展示条件节点的使用
- `LoadFromConfig` - 展示从配置文件加载行为树的使用

## 使用可视化编辑器

```bash
npm run editor
```

然后在浏览器中访问 http://localhost:8080

## 许可证

MIT 