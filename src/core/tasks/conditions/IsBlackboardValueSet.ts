import { Node, NodeResult, Composite } from '../../Node';
import { Blackboard } from '../../Blackboard';

/**
 * 黑板值是否已设置条件节点
 * 检查黑板上的键值是否已设置（不为undefined）
 */
export class IsBlackboardValueSet extends Node {
    private key: string;
    private observed: boolean = false;
    private observer: () => Promise<void>;

    /**
     * 构造函数
     * @param key 黑板键
     */
    constructor(key: string) {
        super('IsBlackboardValueSet');
        this.key = key;
        this.observer = this.onValueChanged.bind(this);
    }

    /**
     * 启动节点
     * @returns 执行结果的Promise
     */
    protected override async doStart(): Promise<NodeResult> {
        // 添加黑板观察者
        if (this.blackboard) {
            this.blackboard.addObserver(this.key, this.observer);
            this.observed = true;
        }

        // 检查黑板值是否已设置
        if (this.blackboard) {
            const value = await this.blackboard.get(this.key);
            const isSet = value !== undefined;
            await this.stopped(isSet ? NodeResult.SUCCESS : NodeResult.FAILURE);
            return isSet ? NodeResult.SUCCESS : NodeResult.FAILURE;
        }

        // 没有黑板，默认失败
        await this.stopped(NodeResult.FAILURE);
        return NodeResult.FAILURE;
    }

    /**
     * 停止节点
     */
    protected override async doStop(): Promise<void> {
        this.unobserveBlackboard();
    }

    /**
     * 当父复合节点停止时
     * @param composite 复合节点
     */
    protected override async doParentCompositeStopped(composite: Composite): Promise<void> {
        this.unobserveBlackboard();
    }

    /**
     * 取消观察黑板
     */
    private unobserveBlackboard(): void {
        if (this.observed && this.blackboard) {
            this.blackboard.removeObserver(this.key, this.observer);
            this.observed = false;
        }
    }

    /**
     * 黑板值变化回调
     */
    private async onValueChanged(): Promise<void> {
        if (this.isActive && this.blackboard) {
            const value = await this.blackboard.get(this.key);
            const isSet = value !== undefined;

            // 只有在活动状态下才更新结果
            if (this.isActive) {
                await this.stopped(isSet ? NodeResult.SUCCESS : NodeResult.FAILURE);
            }
        }
    }
} 