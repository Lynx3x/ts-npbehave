import { Root, Sequence, Action, Wait } from '../core';

/**
 * 一个简单的Hello World示例，展示基本行为树功能
 */
export function runHelloWorldExample() {
    console.log("启动HelloWorld示例...");

    // 创建一个简单的行为树
    const behaviorTree = new Root(
        new Sequence([
            new Action(() => {
                console.log("Hello World!");
                return true; // 表示成功
            }),
            new Wait(1.0), // 等待1秒
            new Action(() => {
                console.log("Goodbye!");
                return true; // 表示成功
            })
        ])
    );

    // 启动行为树
    behaviorTree.start();

    // 在5秒后停止
    setTimeout(() => {
        console.log("停止行为树...");
        behaviorTree.stop();
    }, 5000);
}

// 如果直接运行此文件则执行示例
if (require.main === module) {
    runHelloWorldExample();
} 