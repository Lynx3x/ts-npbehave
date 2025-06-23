const {
    Selector,
    Sequence,
    Action,
    Wait,
    Repeater,
    Inverter,
    Succeeder,
    Failer,
    TimeLimit,
    WaitForCondition,
    NodeResult
} = require('../core');

/**
 * 简单测试各种节点的功能（Node.js环境）
 */
async function runNodeTest() {
    console.log('开始测试TS-NPBehave节点...');

    // 测试Action节点
    console.log('\n--- 测试Action节点 ---');
    const actionNode = new Action(async () => {
        console.log('执行Action节点');
        return true;
    });
    const actionResult = await actionNode.start();
    console.log(`Action节点结果: ${NodeResult[actionResult]}`);

    // 测试Wait节点
    console.log('\n--- 测试Wait节点 ---');
    console.log('等待1秒...');
    const waitNode = new Wait(1.0);
    const waitResult = await waitNode.start();
    console.log(`Wait节点结果: ${NodeResult[waitResult]}`);

    // 测试WaitForCondition节点
    console.log('\n--- 测试WaitForCondition节点 ---');
    let conditionMet = false;
    setTimeout(() => {
        console.log('条件已满足');
        conditionMet = true;
    }, 2000);

    const waitConditionNode = new WaitForCondition(() => conditionMet, 0.1, 5);
    console.log('等待条件满足(最多5秒)...');
    const waitConditionResult = await waitConditionNode.start();
    console.log(`WaitForCondition节点结果: ${NodeResult[waitConditionResult]}`);

    // 测试Repeater节点
    console.log('\n--- 测试Repeater节点 ---');
    let counter = 0;
    const repeatAction = new Action(async () => {
        counter++;
        console.log(`重复执行第${counter}次`);
        return true;
    });
    const repeaterNode = new Repeater(3, repeatAction);
    const repeaterResult = await repeaterNode.start();
    console.log(`Repeater节点结果: ${NodeResult[repeaterResult]}`);

    // 测试Inverter节点
    console.log('\n--- 测试Inverter节点 ---');
    const successAction = new Action(async () => {
        console.log('这个动作总是成功');
        return true;
    });
    const inverterNode = new Inverter(successAction);
    const inverterResult = await inverterNode.start();
    console.log(`Inverter节点结果: ${NodeResult[inverterResult]}`);

    // 测试Succeeder节点
    console.log('\n--- 测试Succeeder节点 ---');
    const failAction = new Action(async () => {
        console.log('这个动作总是失败');
        return false; // 返回false对应NodeResult.FAILURE
    });
    const succeederNode = new Succeeder(failAction);
    const succeederResult = await succeederNode.start();
    console.log(`Succeeder节点结果: ${NodeResult[succeederResult]}`);
    // Succeeder节点应该返回SUCCESS，无论子节点结果如何

    // 测试Failer节点
    console.log('\n--- 测试Failer节点 ---');
    const failerNode = new Failer(successAction);
    const failerResult = await failerNode.start();
    console.log(`Failer节点结果: ${NodeResult[failerResult]}`);
    // Failer节点应该返回FAILURE，无论子节点结果如何

    // 测试TimeLimit节点
    console.log('\n--- 测试TimeLimit节点 ---');
    const longTask = new Action(async () => {
        console.log('开始执行长时间任务(3秒)...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('长时间任务执行完成');
        return true;
    });
    const timeLimitNode = new TimeLimit(2.0, longTask);
    console.log('使用TimeLimit限制执行时间为2秒...');
    const timeLimitResult = await timeLimitNode.start();
    console.log(`TimeLimit节点结果: ${NodeResult[timeLimitResult]}`);

    // 测试Sequence节点
    console.log('\n--- 测试Sequence节点 ---');
    const sequenceNode = new Sequence([
        new Action(async () => {
            console.log('序列第1步');
            return true;
        }),
        new Action(async () => {
            console.log('序列第2步');
            return true;
        }),
        new Action(async () => {
            console.log('序列第3步');
            return true;
        })
    ]);
    const sequenceResult = await sequenceNode.start();
    console.log(`Sequence节点结果: ${NodeResult[sequenceResult]}`);

    // 测试Selector节点
    console.log('\n--- 测试Selector节点 ---');
    const selectorNode = new Selector([
        new Action(async () => {
            console.log('选择器第1个选项(失败)');
            return false; // 返回false对应NodeResult.FAILURE
        }),
        new Action(async () => {
            console.log('选择器第2个选项(成功)');
            return true; // 返回true对应NodeResult.SUCCESS
        }),
        new Action(async () => {
            console.log('选择器第3个选项(不会执行)');
            return true;
        })
    ]);
    const selectorResult = await selectorNode.start();
    console.log(`Selector节点结果: ${NodeResult[selectorResult]}`);
    // Selector节点应该返回SUCCESS，因为第二个子节点成功了

    console.log('\n测试完成!');
}

// 立即执行测试
runNodeTest().catch(error => {
    console.error('测试过程中发生错误:', error);
});

// 添加空导出，使文件成为模块
export { };