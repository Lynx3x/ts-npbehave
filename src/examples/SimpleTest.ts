import { Action, Wait, NodeResult } from '../core';

/**
 * 简单测试
 */
async function runSimpleTest() {
    console.log('开始简单测试TS-NPBehave节点...');

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

    console.log('\n测试完成!');
}

// 立即执行测试
runSimpleTest().catch(error => {
    console.error('测试过程中发生错误:', error);
});

// 添加空导出，使文件成为模块
export { }; 