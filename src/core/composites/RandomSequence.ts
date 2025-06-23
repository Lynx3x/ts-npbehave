import { Composite } from '../Composite';
import { Node, NodeResult } from '../Node';

/**
 * 随机序列
 * 按随机顺序执行所有子节点，所有子节点成功则成功，任何子节点失败则失败
 */
export class RandomSequence extends Composite {
    private currentIndex: number = -1;
    private currentRandomExecutionOrder: number[] = [];

    /**
     * 构造函数
     * @param children 子节点
     */
    constructor(...children: Node[]) {
        super('RandomSequence', children);
    }

    /**
     * 开始执行复合节点
     * @returns 执行结果的Promise
     */
    protected override async doStart(): Promise<NodeResult> {
        this.currentChildIndex = 0;

        // 创建随机执行顺序
        this.currentRandomExecutionOrder = Array.from(
            { length: this.children.length },
            (_, i) => i
        );

        // 洗牌算法打乱顺序
        for (let i = this.currentRandomExecutionOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.currentRandomExecutionOrder[i], this.currentRandomExecutionOrder[j]] =
                [this.currentRandomExecutionOrder[j], this.currentRandomExecutionOrder[i]];
        }

        // 开始执行第一个随机子节点
        if (this.children.length > 0) {
            this.currentIndex = this.currentRandomExecutionOrder[0];
            return await this.children[this.currentIndex].start();
        } else {
            // 没有子节点，直接成功
            await this.stopped(NodeResult.SUCCESS);
            return NodeResult.SUCCESS;
        }
    }

    /**
     * 停止执行复合节点
     */
    protected override async doStop(): Promise<void> {
        await super.doStop();
    }

    /**
     * 处理子节点停止事件
     * @param child 停止的子节点
     * @param result 执行结果
     */
    override async childStopped(child: Node, result: NodeResult): Promise<void> {
        if (result === NodeResult.FAILURE) {
            // 子节点失败，整个序列失败
            await this.stopped(NodeResult.FAILURE);
        } else {
            // 子节点成功，尝试下一个子节点
            this.currentChildIndex++;

            if (this.currentChildIndex < this.children.length) {
                // 还有子节点需要执行
                this.currentIndex = this.currentRandomExecutionOrder[this.currentChildIndex];
                await this.children[this.currentIndex].start();
            } else {
                // 所有子节点都成功了
                await this.stopped(NodeResult.SUCCESS);
            }
        }
    }
} 