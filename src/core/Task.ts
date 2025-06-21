import { Node, NodeResult } from './Node';

/**
 * 任务节点抽象基类
 * 任务节点是行为树的叶子节点，执行实际的操作
 */
export abstract class Task extends Node {
    /**
     * 构造函数
     * @param name 节点名称
     */
    constructor(name: string) {
        super(name);
    }

    /**
     * 执行任务
     * @returns 任务执行结果的Promise
     */
    protected abstract override doStart(): Promise<NodeResult>;

    /**
     * 停止任务
     * @returns 停止操作的Promise
     */
    protected abstract override doStop(): Promise<void>;
} 