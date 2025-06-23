import { Sequence, Action, Wait } from '../core';
import { TestParent } from './TestParent';

/**
 * 一个简单的Hello World示例，展示基本行为树功能
 */
export async function runHelloWorldExample() {
    console.log("启动HelloWorld示例...");

    // 创建测试父节点
    const testParent = new TestParent();

    // 创建一个简单的行为树
    const sequenceNode = new Sequence([
        new Action(async () => {
            console.log("Hello World!");
            return true; // 表示成功
        }),
        new Wait(1.0), // 等待1秒
        new Action(async () => {
            console.log("Goodbye!");
            return true; // 表示成功
        })
    ]);

    // 使用TestParent运行一次序列
    console.log("执行行为树...");
    const result = await testParent.runAndGetResult(sequenceNode);

    console.log(`行为树执行完成，结果: ${result}`);
    console.log("示例完成。");
}

// 如果直接运行此文件则执行示例
if (require.main === module) {
    runHelloWorldExample().catch(err => {
        console.error("示例运行出错:", err);
    });
} 