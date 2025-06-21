import { Decorator } from '../Decorator';
import { Node, NodeResult } from '../Node';

/**
 * 重复执行装饰器
 * 重复执行子节点指定的次数
 */
export class Repeater extends Decorator {
    private count: number;
    private currentCount: number = 0;
    private infiniteLoop: boolean;

    /**
     * 构造函数
     * @param count 重复次数，如果为0则无限重复
     * @param decoratee 被装饰的子节点
     */
    constructor(count: number, decoratee: Node) {
        super('Repeater', decoratee);
        this.count = count;
        this.infiniteLoop = count <= 0;
    }

    /**
     * 开始执行装饰器
     * @returns 执行结果的Promise
     */
    protected override async doStart(): Promise<NodeResult> {
        this.currentCount = 0;
        return await this.decoratee.start();
    }

    /**
     * 停止执行装饰器
     * @returns 停止操作的Promise
     */
    protected override async doStop(): Promise<void> {
        await super.doStop();
    }

    /**
     * 处理子节点停止事件
     * @param child 停止的子节点
     * @param result 子节点的结果
     */
    override async childStopped(child: Node, result: NodeResult): Promise<void> {
        if (!this.isActive) {
            return;
        }

        // 如果子节点失败，则装饰器也失败
        if (result === NodeResult.FAILURE) {
            await this.stopped(NodeResult.FAILURE);
            return;
        }

        // 增加计数
        this.currentCount++;

        // 检查是否达到重复次数
        if (!this.infiniteLoop && this.currentCount >= this.count) {
            await this.stopped(NodeResult.SUCCESS);
            return;
        }

        // 重新启动子节点
        await this.decoratee.start();
    }
} 