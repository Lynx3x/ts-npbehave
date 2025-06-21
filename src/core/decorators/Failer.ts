import { Decorator } from '../Decorator';
import { Node, NodeResult } from '../Node';

/**
 * 失败装饰器
 * 无论子节点的执行结果如何，都返回失败
 */
export class Failer extends Decorator {
    /**
     * 构造函数
     * @param decoratee 被装饰的子节点
     */
    constructor(decoratee: Node) {
        super('Failer', decoratee);
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
        // 无论子节点结果如何，都返回失败
        await this.stopped(NodeResult.FAILURE);
    }
} 