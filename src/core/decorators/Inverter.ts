import { Decorator } from '../Decorator';
import { Node, NodeResult } from '../Node';

/**
 * 反转装饰器
 * 反转子节点的执行结果：成功变为失败，失败变为成功
 */
export class Inverter extends Decorator {
    /**
     * 构造函数
     * @param decoratee 被装饰的子节点
     */
    constructor(decoratee: Node) {
        super('Inverter', decoratee);
    }

    /**
     * 开始执行装饰器
     * @returns 执行结果的Promise
     */
    protected override async doStart(): Promise<NodeResult> {
        return await this.decoratee.start();
    }

    /**
     * 处理子节点停止事件
     * @param child 停止的子节点
     * @param result 子节点的结果
     */
    override async childStopped(child: Node, result: NodeResult): Promise<void> {
        // 反转结果：成功变为失败，失败变为成功
        if (result === NodeResult.SUCCESS) {
            await this.stopped(NodeResult.FAILURE);
        } else if (result === NodeResult.FAILURE) {
            await this.stopped(NodeResult.SUCCESS);
        } else {
            // 对于RUNNING状态，保持不变
            await this.stopped(result);
        }
    }
} 