import { Action, Succeeder, Failer, Selector, NodeResult, Blackboard, Clock, Root } from '../core';
import { TestParent } from './TestParent';

/**
 * 测试Succeeder节点的最终结果
 */
async function testSucceeder() {
    console.log('\n--- 测试Succeeder节点 ---');
    const testParent = new TestParent();

    // 创建一个失败的动作节点
    const failAction = new Action(async () => {
        console.log('执行失败动作...');
        return false; // 返回false，对应NodeResult.FAILURE
    });

    // 使用Succeeder装饰
    console.log('创建Succeeder装饰器...');
    const succeederNode = new Succeeder(failAction);

    // 运行并获取结果
    console.log('启动Succeeder节点...');
    const result = await testParent.runAndGetResult(succeederNode);

    // 打印最终结果
    console.log(`Succeeder节点最终结果: ${NodeResult[result]}`);
    console.log(`测试${result === NodeResult.SUCCESS ? '成功' : '失败'} - Succeeder应该返回SUCCESS`);
}

/**
 * 测试Failer节点的最终结果
 */
async function testFailer() {
    console.log('\n--- 测试Failer节点 ---');
    const testParent = new TestParent();

    // 创建一个成功的动作节点
    const successAction = new Action(async () => {
        console.log('执行成功动作...');
        return true; // 返回true，对应NodeResult.SUCCESS
    });

    // 使用Failer装饰
    console.log('创建Failer装饰器...');
    const failerNode = new Failer(successAction);

    // 运行并获取结果
    console.log('启动Failer节点...');
    const result = await testParent.runAndGetResult(failerNode);

    // 打印最终结果
    console.log(`Failer节点最终结果: ${NodeResult[result]}`);
    console.log(`测试${result === NodeResult.FAILURE ? '成功' : '失败'} - Failer应该返回FAILURE`);
}

/**
 * 测试Selector节点的最终结果
 */
async function testSelector() {
    console.log('\n--- 测试Selector节点 ---');
    const testParent = new TestParent();

    // 创建选择器
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

    // 运行并获取结果
    console.log('启动选择器节点...');
    const result = await testParent.runAndGetResult(selectorNode);

    // 打印最终结果
    console.log(`Selector节点最终结果: ${NodeResult[result]}`);
    console.log(`测试${result === NodeResult.SUCCESS ? '成功' : '失败'} - Selector应该返回SUCCESS`);
}

/**
 * 创建简单的行为树测试，不使用Root节点
 */
async function testSimpleTree() {
    console.log('\n--- 测试简单行为树 ---');

    const testParent = new TestParent();

    // 创建一个简单的行为树
    const treeNode = new Selector([
        new Action(async () => {
            console.log('第一个动作(失败)');
            return false;
        }),
        new Succeeder(
            new Action(async () => {
                console.log('第二个动作(失败但被Succeeder转为成功)');
                return false;
            })
        ),
        new Action(async () => {
            console.log('第三个动作(不会执行)');
            return true;
        })
    ]);

    // 运行并获取结果
    console.log('启动行为树...');
    const result = await testParent.runAndGetResult(treeNode);

    // 打印最终结果
    console.log(`行为树最终结果: ${NodeResult[result]}`);
    console.log(`测试${result === NodeResult.SUCCESS ? '成功' : '失败'} - 行为树应该返回SUCCESS`);
}

/**
 * 运行所有高级测试
 */
async function runAdvancedTests() {
    console.log('开始高级测试...');

    await testSucceeder();
    await testFailer();
    await testSelector();
    await testSimpleTree();

    console.log('\n所有高级测试完成!');
}

// 执行测试
runAdvancedTests().catch(error => {
    console.error('测试过程中发生错误:', error);
});

export { };