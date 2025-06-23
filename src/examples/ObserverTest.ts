import { TestParent } from './TestParent';
import { Observer, StopMode } from '../core/decorators/Observer';
import { WaitUntilStopped } from '../core/tasks/WaitUntilStopped';
import { Action } from '../core/tasks/actions/Action';
import { Selector } from '../core/composites/Selector';
import { Sequence } from '../core/composites/Sequence';
import { NodeResult } from '../core/Node';
import { Blackboard } from '../core/Blackboard';
import { Clock } from '../core/Clock';
import { Root } from '../core/Root';

/**
 * 测试Observer和WaitUntilStopped节点
 */
async function main() {
    // 创建黑板和时钟
    const blackboard = new Blackboard();
    const clock = new Clock();

    console.log('开始测试Observer和WaitUntilStopped节点...');

    // 控制变量
    let shouldRunTask = false;

    // 创建观察者序列
    const sequenceChildren = [
        new Action(() => {
            console.log('执行任务开始...');
            return NodeResult.SUCCESS;
        }),
        new WaitUntilStopped(),
        new Action(() => {
            console.log('执行任务结束！');
            return NodeResult.SUCCESS;
        })
    ];
    const observerSequence = new Sequence(sequenceChildren);

    // 创建观察者装饰器
    const observerDecorator = new Observer(
        () => shouldRunTask,
        StopMode.IMMEDIATE_RESTART,
        observerSequence
    );

    // 创建等待动作
    const waitAction = new Action(() => {
        console.log('等待任务...');
        return NodeResult.SUCCESS;
    });

    // 创建选择器
    const selectorChildren = [observerDecorator, waitAction];
    const selector = new Selector(selectorChildren);

    // 创建测试父节点
    const testParent = new TestParent();
    testParent.setBlackboard(blackboard);

    // 创建Root节点来管理时钟和黑板
    const rootNode = new Root(selector, blackboard, clock);

    // 启动时钟
    clock.start();

    // 第一次执行 - shouldRunTask为false，将执行第二个动作
    console.log('--- 第一次执行 (shouldRunTask = false) ---');
    let result = await testParent.runAndGetResult(selector);
    console.log(`第一次执行结果: ${NodeResult[result]}`);

    // 修改shouldRunTask为true，再次执行
    console.log('\n设置shouldRunTask = true');
    shouldRunTask = true;

    // 第二次执行 - shouldRunTask为true，将执行第一个序列
    console.log('\n--- 第二次执行 (shouldRunTask = true) ---');
    // 先设置一个定时器，2秒后调用stop方法
    setTimeout(async () => {
        console.log('2秒后停止节点...');
        if (selector.isActive) {
            await selector.stop();
        }
    }, 2000);

    result = await testParent.runAndGetResult(selector);
    console.log(`第二次执行结果: ${NodeResult[result]}`);

    // 等待一会儿，然后再次修改条件
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('\n设置shouldRunTask = false');
    shouldRunTask = false;

    // 最后一次执行 - shouldRunTask为false，将执行第二个动作
    console.log('\n--- 最后一次执行 (shouldRunTask = false) ---');
    result = await testParent.runAndGetResult(selector);
    console.log(`最后一次执行结果: ${NodeResult[result]}`);

    // 停止时钟
    clock.stop();
    console.log('\n测试完成');
}

// 如果是直接运行此文件，则执行main函数
if (require.main === module) {
    main().catch(console.error);
} 