import { Container } from './Container';
import { Node, State, NodeResult } from './Node';
import { Clock } from './Clock';
import { Blackboard } from './Blackboard';

/**
 * Root类 - 行为树的根节点
 */
export class Root extends Container {
    private _blackboard: Blackboard;
    private _clock: Clock;
    private mainNode: Node;

    /**
     * 构造函数
     * @param mainNode 主节点
     * @param blackboard 黑板（可选）
     * @param clock 时钟（可选）
     */
    constructor(mainNode: Node, blackboard?: Blackboard, clock?: Clock) {
        super("Root");
        this.mainNode = mainNode;
        this._blackboard = blackboard || new Blackboard();
        this._clock = clock || new Clock();

        // 设置主节点的根节点和父节点
        this.mainNode.setRoot(this);
        this.mainNode.setParent(this);
    }

    /**
     * 获取黑板
     */
    get blackboard(): Blackboard {
        return this._blackboard;
    }

    /**
     * 获取时钟
     */
    get clock(): Clock {
        return this._clock;
    }

    /**
     * 获取主节点
     */
    getMainNode(): Node {
        return this.mainNode;
    }

    /**
     * 启动行为树
     */
    protected override async doStart(): Promise<NodeResult> {
        this._clock.start();
        await this.mainNode.start();
        return NodeResult.SUCCESS;
    }

    /**
     * 停止行为树
     */
    protected override async doStop(): Promise<void> {
        await this.mainNode.stop();
    }

    /**
     * 处理子节点停止
     * @param child 停止的子节点
     * @param result 执行结果
     */
    async childStopped(child: Node, result: NodeResult): Promise<void> {
        // 根节点会不断重启主节点，无论成功与否
        if (this._currentState === State.ACTIVE) {
            await this.mainNode.start();
        } else {
            this.stopped(result);
        }
    }
} 