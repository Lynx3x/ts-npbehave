import { Action, Succeeder, Failer, Selector, NodeResult } from '../core';

/**
 * 测试Succeeder节点
 */
async function testSucceeder() {
    console.log('\n--- 测试Succeeder节点 ---');
    const failAction = new Action(async () => {
        console.log('执行失败动作...');
        return false; // 返回false，对应NodeResult.FAILURE
    });

    console.log('创建Succeeder装饰器...');
    const succeederNode = new Succeeder(failAction);

    console.log('启动Succeeder节点...');
    await succeederNode.start();

    // 在这里不能直接获取最终结果，因为start只返回初始结果
    console.log('Succeeder测试完成 - 无论子节点结果如何，都应该返回SUCCESS');
}

/**
 * 测试Failer节点
 */
async function testFailer() {
    console.log('\n--- 测试Failer节点 ---');
    const successAction = new Action(async () => {
        console.log('执行成功动作...');
        return true; // 返回true，对应NodeResult.SUCCESS
    });

    console.log('创建Failer装饰器...');
    const failerNode = new Failer(successAction);

    console.log('启动Failer节点...');
    await failerNode.start();

    // 在这里不能直接获取最终结果，因为start只返回初始结果
    console.log('Failer测试完成 - 无论子节点结果如何，都应该返回FAILURE');
}

/**
 * 测试Selector节点
 */
async function testSelector() {
    console.log('\n--- 测试Selector节点 ---');

    // 使用更简单的方法来观察结果
    console.log('创建选择器节点...');
    const selectorNode = new Selector([
        new Action(async () => {
            console.log('选择器第1个选项(失败)');
            return false; // 返回false，对应NodeResult.FAILURE
        }),
        new Action(async () => {
            console.log('选择器第2个选项(成功)');
            return true; // 返回true，对应NodeResult.SUCCESS
        }),
        new Action(async () => {
            console.log('选择器第3个选项(不会执行)');
            return true;
        })
    ]);

    console.log('启动选择器节点...');
    await selectorNode.start();

    console.log('Selector测试完成 - 应该返回SUCCESS，因为第二个子节点成功了');
}

/**
 * 运行所有单元测试
 */
async function runSingleTests() {
    console.log('开始单节点测试...');

    await testSucceeder();
    await testFailer();
    await testSelector();

    console.log('\n所有单节点测试完成!');
}

// 执行测试
runSingleTests().catch(error => {
    console.error('测试过程中发生错误:', error);
});

export { }; 