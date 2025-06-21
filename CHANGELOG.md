# 更新日志

## [0.3.0] - 2023-07-15

### 新增
- 移植了多个装饰器节点
  - Repeater - 重复执行子节点指定次数
  - Inverter - 反转子节点结果
  - Succeeder - 无论子节点结果如何都返回成功
  - Failer - 无论子节点结果如何都返回失败
  - TimeLimit - 限制子节点执行时间
- 新增任务节点
  - WaitForCondition - 等待条件满足
- 创建了详细的API文档
- 添加了使用行为树的React组件示例

### 改进
- 更新了Blackboard类以支持异步操作
- 更新了BlackboardCondition装饰器以支持异步操作
- 优化了Wait任务节点，使用Promise实现异步等待
- 更新了开发计划，标记已完成任务

### 修复
- 修复了BlackboardCondition构造函数参数顺序问题
- 修复了Wait节点中的计时器实现 