import { Composite } from '../Composite';
import { Node, NodeResult } from '../Node';

/**
 * 选择器节点
 * 依次执行子节点，直到一个子节点成功为止
 * 如果所有子节点都失败，则选择器失败
 */
export class Selector extends Composite {
    /**
     * 构造函数
     * @param children 子节点数组
     */
    constructor(children: Node[] = []) {
        super('Selector', children);
    }

    /**
     * 开始执行选择器
     * @returns 执行结果的Promise
     */
    protected override async doStart(): Promise<NodeResult> {
        // 重置子节点索引
        this.currentChildIndex = 0;

        // 如果没有子节点，直接失败
        if (this.children.length === 0) {
            await this.stopped(NodeResult.FAILURE);
            return NodeResult.FAILURE;
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
        // 如果子节点成功，选择器成功
        if (result === NodeResult.SUCCESS) {
            await this.stopped(NodeResult.SUCCESS);
            return;
        }

        // 子节点失败，尝试下一个子节点
        this.currentChildIndex++;

        // 如果还有子节点，启动下一个
        if (this.currentChildIndex < this.children.length) {
            await this.children[this.currentChildIndex].start();
        } else {
            // 所有子节点都失败，选择器失败
            await this.stopped(NodeResult.FAILURE);
        }
    }
} 