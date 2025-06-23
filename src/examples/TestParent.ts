import { Composite, Node, NodeResult, Blackboard } from '../core';

/**
 * 测试父节点
 * 用于测试其他节点的最终结果
 */
export class TestParent extends Composite {
    private resultPromise: Promise<NodeResult>;
    private resolveResult!: (result: NodeResult) => void;
    private _blackboard?: Blackboard;

    /**
     * 构造函数
     */
    constructor() {
        super('TestParent');
        this.resultPromise = new Promise((resolve) => {
            this.resolveResult = resolve;
        });
    }

    /**
     * 设置黑板
     * @param blackboard 要使用的黑板
     */
    setBlackboard(blackboard: Blackboard): void {
        this._blackboard = blackboard;
    }

    /**
     * 获取黑板
     */
    get blackboard(): Blackboard | undefined {
        return this._blackboard;
    }

    /**
     * 启动子节点并获取最终结果
     * @param child 要测试的子节点
     * @returns 节点的最终结果
     */
    async runAndGetResult(child: Node): Promise<NodeResult> {
        // 重置Promise
        this.resultPromise = new Promise((resolve) => {
            this.resolveResult = resolve;
        });

        // 添加子节点
        this.children = [child];

        // 设置节点关系
        child.setRoot(this);
        child.setParent(this);

        // 启动子节点
        await child.start();

        // 等待结果
        return await this.resultPromise;
    }

    /**
     * 子节点停止回调
     * @param child 停止的子节点
     * @param result 执行结果
     */
    override async childStopped(child: Node, result: NodeResult): Promise<void> {
        // 解析结果Promise
        this.resolveResult(result);
    }

    /**
     * 启动逻辑（不会被调用，因为我们直接启动子节点）
     */
    protected override async doStart(): Promise<NodeResult> {
        return NodeResult.SUCCESS;
    }

    /**
     * 停止逻辑
     */
    protected override async doStop(): Promise<void> {
        // 停止子节点
        if (this.children.length > 0 && this.children[0].isActive) {
            await this.children[0].stop();
        }
    }
} 