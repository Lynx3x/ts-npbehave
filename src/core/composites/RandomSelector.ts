import { Composite } from '../Composite';
import { Node, NodeResult } from '../Node';

/**
 * 随机选择器
 * 随机选择一个子节点执行，如果成功则返回成功，所有子节点都失败则返回失败
 */
export class RandomSelector extends Composite {
    private currentIndex: number = -1;
    private currentRandomExecutionOrder: number[] = [];

    /**
     * 构造函数
     * @param children 子节点
     */
    constructor(...children: Node[]) {
        super('RandomSelector', children);
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
            // 没有子节点，直接失败
            await this.stopped(NodeResult.FAILURE);
            return NodeResult.FAILURE;
        }
    }

    /**
     * 停止执行复合节点
     */
    protected override async doStop(): Promise<void> {
        if (this.currentIndex >= 0 && this.currentIndex < this.children.length) {
            await this.children[this.currentIndex].stop();
        }
    }

    /**
     * 处理子节点停止事件
     * @param child 停止的子节点
     * @param result 执行结果
     */
    override async childStopped(child: Node, result: NodeResult): Promise<void> {
        if (result === NodeResult.SUCCESS) {
            // 子节点成功，整个选择器成功
            await this.stopped(NodeResult.SUCCESS);
        } else {
            // 子节点失败，尝试下一个子节点
            this.currentChildIndex++;

            if (this.currentChildIndex < this.children.length) {
                // 还有子节点可以尝试
                this.currentIndex = this.currentRandomExecutionOrder[this.currentChildIndex];
                await this.children[this.currentIndex].start();
            } else {
                // 所有子节点都失败了
                await this.stopped(NodeResult.FAILURE);
            }
        }
    }
} 