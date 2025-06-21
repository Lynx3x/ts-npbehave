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
} 