import { TestParent } from './TestParent';
import { Cooldown } from '../core/decorators/Cooldown';
import { Action } from '../core/tasks/Action';
import { RandomSelector } from '../core/composites/RandomSelector';
import { NodeResult } from '../core/Node';
import { Blackboard } from '../core/Blackboard';
import { Clock } from '../core/Clock';
import { Root } from '../core/Root';

/**
 * 测试Cooldown和RandomSelector节点
 */
export async function main() {
    // 创建黑板和时钟
    const blackboard = new Blackboard();
    const clock = new Clock();

    console.log('开始测试Cooldown和RandomSelector节点...');

    // 创建随机选择器和动作节点
    const randomSelector = new RandomSelector(
        new Action(() => {
            console.log('执行动作1: 失败');
            return false;
        }),
        new Action(() => {
            console.log('执行动作2: 成功');
            return true;
        }),
        new Action(() => {
            console.log('执行动作3: 失败');
            return false;
        })
    );

    // 创建带有冷却时间的选择器
    const cooldownNode = new Cooldown(
        2, // 2秒冷却时间
        randomSelector
    );

    // 创建测试父节点
    const testParent = new TestParent();
    testParent.setBlackboard(blackboard);

    // 创建Root节点来管理时钟
    const root = new Root(cooldownNode, blackboard, clock);

    // 启动时钟
    clock.start();

    // 第一次执行
    console.log('--- 第一次执行 ---');
    let result = await testParent.runAndGetResult(cooldownNode);
    console.log(`第一次执行结果: ${NodeResult[result]}`);

    // 立即尝试再次执行（应该失败，因为在冷却中）
    console.log('--- 立即再次执行（应该失败，因为在冷却中） ---');
    result = await testParent.runAndGetResult(cooldownNode);
    console.log(`第二次执行结果: ${NodeResult[result]}`);

    // 等待3秒后再次执行（应该成功，因为已经冷却完成）
    console.log('等待3秒...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('--- 冷却后执行 ---');
    result = await testParent.runAndGetResult(cooldownNode);
    console.log(`第三次执行结果: ${NodeResult[result]}`);

    // 停止时钟
    clock.stop();
    console.log('测试完成');
}

// 如果是直接运行此文件，则执行main函数
if (typeof require !== 'undefined' && require.main === module) {
    main().catch(console.error);
} 