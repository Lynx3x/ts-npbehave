import { Action, Wait, NodeResult } from '../core';

/**
 * 日志输出到DOM元素
 * @param text 日志文本
 */
function logToDOM(text: string) {
    if (typeof document !== 'undefined') {
        const logArea = document.getElementById('log-area');
        if (logArea) {
            const logLine = document.createElement('div');
            logLine.textContent = text;
            logArea.appendChild(logLine);
            logArea.scrollTop = logArea.scrollHeight;
        }
    }
    console.log(text);
}

/**
 * 简单测试
 */
export async function runTest() {
    const startMessage = '开始简单测试TS-NPBehave节点...';
    logToDOM(startMessage);

    // 测试Action节点
    logToDOM('\n--- 测试Action节点 ---');
    const actionNode = new Action(async () => {
        logToDOM('执行Action节点');
        return true;
    });
    const actionResult = await actionNode.start();
    logToDOM(`Action节点结果: ${NodeResult[actionResult]}`);

    // 测试Wait节点
    logToDOM('\n--- 测试Wait节点 ---');
    logToDOM('等待1秒...');
    const waitNode = new Wait(1.0);
    const waitResult = await waitNode.start();
    logToDOM(`Wait节点结果: ${NodeResult[waitResult]}`);

    logToDOM('\n测试完成!');
}

// 仅在直接执行此文件时运行测试
if (typeof window !== 'undefined' && window.document) {
    // 浏览器环境，不自动执行
} else {
    // Node.js环境，自动执行
    runTest().catch(error => {
        console.error('测试过程中发生错误:', error);
    });
} 