import { Composite } from '../Composite';
import { Node, NodeResult } from '../Node';

/**
 * 序列节点
 * 依次执行子节点，直到所有子节点成功或一个子节点失败
 * 如果所有子节点成功，则序列成功
 * 如果任何子节点失败，则序列失败
 */
export class Sequence extends Composite {
    /**
     * 构造函数
     * @param children 子节点数组
     */
    constructor(children: Node[] = []) {
        super('Sequence', children);
    }

    /**
     * 开始执行序列
     * @returns 执行结果的Promise
     */
    protected override async doStart(): Promise<NodeResult> {
        // 重置子节点索引
        this.currentChildIndex = 0;

        // 如果没有子节点，直接成功
        if (this.children.length === 0) {
            await this.stopped(NodeResult.SUCCESS);
            return NodeResult.SUCCESS;
        }

        // 启动第一个子节点
        return await this.children[this.currentChildIndex].start();
    }

    /**
     * 处理子节点停止事件
     * @param child 停止的子节点
     * @param result 执行结果
     */
    override async childStopped(child: Node, result: NodeResult): Promise<void> {
        // 如果子节点失败，序列失败
        if (result === NodeResult.FAILURE) {
            await this.stopped(NodeResult.FAILURE);
            return;
        }

        // 子节点成功，尝试下一个子节点
        this.currentChildIndex++;

        // 如果还有子节点，启动下一个
        if (this.currentChildIndex < this.children.length) {
            await this.children[this.currentChildIndex].start();
        } else {
            // 所有子节点都成功，序列成功
            await this.stopped(NodeResult.SUCCESS);
        }
    }
}
