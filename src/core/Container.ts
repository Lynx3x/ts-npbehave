import { Node, NodeResult } from './Node';

/**
 * 容器节点抽象基类
 * 用于包含子节点的节点类型（如装饰器和复合节点）的共同基类
 */
export abstract class Container extends Node {
    /**
     * 处理子节点停止事件
     * @param child 已停止的子节点
     * @param result 子节点执行结果
     */
    abstract childStopped(child: Node, result: NodeResult): Promise<void>;

    /**
     * 停止优先级低于指定节点的所有子节点
     * 这个方法由Observer装饰器调用，用于实现LOWER_PRIORITY停止模式
     * 默认实现不执行任何操作，需要由子类重写以提供具体实现
     * @param referenceNode 参考节点
     */
    async stopLowerPriorityChildren(referenceNode: Node): Promise<void> {
        // 默认实现什么都不做
        // 复合节点子类需要重写此方法以支持节点优先级
    }

    /**
     * 立即重启指定节点
     * 这个方法由Observer装饰器调用，用于实现IMMEDIATE_RESTART停止模式
     * 默认实现不执行任何操作，需要由子类重写以提供具体实现
     * @param node 要重启的节点
     */
    async immediateRestart(node: Node): Promise<void> {
        // 默认实现什么都不做
        // 复合节点子类需要重写此方法以支持立即重启
    }
} 