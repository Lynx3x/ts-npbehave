import {
    Selector,
    Sequence,
    Action,
    BlackboardCondition,
    Blackboard,
    Operator,
    NodeResult
} from '../core';
import { TestParent } from './TestParent';

/**
 * 测试黑板条件节点
 */
async function testBlackboardCondition() {
    console.log("开始测试BlackboardCondition节点...");

    // 创建黑板和测试父节点
    const blackboard = new Blackboard();
    const testParent = new TestParent();

    // 设置测试父节点的根节点黑板
    testParent.setBlackboard(blackboard);

    // 创建一个简单的条件行为树
    const behaviorTree = new Selector([
        // 条件分支：isHungry === true
        new BlackboardCondition(
            'isHungry',
            Operator.IS_EQUAL,
            true,
            new Sequence([
                new Action(async () => {
                    console.log("执行进食行为...");
                    return true;
                })
            ])
        ),
        // 默认分支
        new Action(async () => {
            console.log("执行巡逻行为...");
            return true;
        })
    ]);

    // 第一次运行 - isHungry未设置，应该执行巡逻
    console.log("\n第一次运行 (isHungry未设置):");
    console.log("预期：执行巡逻行为");
    let result = await testParent.runAndGetResult(behaviorTree);
    console.log(`行为树执行结果: ${NodeResult[result]}`);

    // 第二次运行 - isHungry = false，应该执行巡逻
    console.log("\n第二次运行 (isHungry = false):");
    console.log("预期：执行巡逻行为");
    await blackboard.set('isHungry', false);
    result = await testParent.runAndGetResult(behaviorTree);
    console.log(`行为树执行结果: ${NodeResult[result]}`);

    // 第三次运行 - isHungry = true，应该执行进食
    console.log("\n第三次运行 (isHungry = true):");
    console.log("预期：执行进食行为");
    await blackboard.set('isHungry', true);
    result = await testParent.runAndGetResult(behaviorTree);
    console.log(`行为树执行结果: ${NodeResult[result]}`);

    console.log("\n测试完成");
}

// 执行测试
if (require.main === module) {
    testBlackboardCondition().catch(err => {
        console.error("测试出错:", err);
    });
}

export { testBlackboardCondition }; 