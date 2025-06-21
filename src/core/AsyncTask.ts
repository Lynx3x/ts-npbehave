import { AsyncNode, NodeResult } from './AsyncNode';

/**
 * 异步任务节点抽象基类
 * 任务节点是行为树的叶子节点，执行实际的操作
 */
export abstract class AsyncTask extends AsyncNode {
    /**
     * 构造函数
     * @param name 节点名称
     */
    constructor(name: string) {
        super(name);
    }

    /**
     * 开始执行任务
     * 子类需要重写此方法以实现特定的任务逻辑
     */
    protected abstract override doStart(): Promise<NodeResult>;

/**
 * 停止执行任务
 * 子类需要重写此方法以实现特定的任务停止逻辑
 */
