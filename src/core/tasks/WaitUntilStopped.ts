import { Task } from '../Task';
import { NodeResult } from '../Node';

/**
 * 等待直到被停止的任务节点
 * 这个节点会保持RUNNING状态直到被外部停止
 */
export class WaitUntilStopped extends Task {
    /**
     * 构造函数
     */
    constructor() {
        super('WaitUntilStopped');
    }

    /**
     * 启动节点
     * @returns 始终返回RUNNING，因为这个节点会一直等待直到被外部停止
     */
    protected override async doStart(): Promise<NodeResult> {
        // 这个节点不会自己停止，它会一直运行直到被外部停止
        return NodeResult.RUNNING;
    }

    /**
     * 停止节点
     * 当外部调用stop()时会执行此方法
     */
    protected override async doStop(): Promise<void> {
        // 被外部停止时，将SUCCESS结果传递给父节点
        await this.stopped(NodeResult.SUCCESS);
    }
} 