import {
    Node,
    Root,
    Selector,
    Sequence,
    Parallel,
    BlackboardCondition,
    Action,
    Wait,
    Blackboard,
    Clock,
    Operator
} from './index';

/**
 * 标准行为树节点接口
 */
export interface StandardTreeNode {
    type: string;
    properties: Record<string, any>;
    children?: StandardTreeNode[];
}

/**
 * 标准行为树配置接口
 */
export interface StandardTreeConfig {
    trees: StandardTreeNode[];
}

/**
 * 行为树构建器
 * 用于从标准JSON配置构建行为树
 */
export class BehaviorTreeBuilder {
    private blackboard: Blackboard;
    private clock: Clock;

    /**
     * 构造函数
     * @param blackboard 黑板（可选）
     * @param clock 时钟（可选）
     */
    constructor(blackboard?: Blackboard, clock?: Clock) {
        this.blackboard = blackboard || new Blackboard();
        this.clock = clock || new Clock();
    }

    /**
     * 从JSON字符串构建行为树
     * @param jsonString JSON字符串
     * @returns 行为树根节点
     */
    buildFromJson(jsonString: string): Root | null {
        try {
            const config = JSON.parse(jsonString) as StandardTreeConfig;
            return this.buildFromConfig(config);
        } catch (error) {
            console.error('Failed to parse JSON:', error);
            return null;
        }
    }

    /**
     * 从标准配置构建行为树
     * @param config 标准配置
     * @returns 行为树根节点
     */
    buildFromConfig(config: StandardTreeConfig): Root | null {
        if (!config.trees || config.trees.length === 0) {
            console.error('No trees found in config');
            return null;
        }

        // 使用第一个树作为主树
        const mainTree = config.trees[0];
        const rootNode = this.buildNode(mainTree);

        if (!rootNode) {
            console.error('Failed to build root node');
            return null;
        }

        return new Root(rootNode, this.blackboard, this.clock);
    }

    /**
     * 构建节点
     * @param nodeConfig 节点配置
     * @returns 节点实例
     */
    private buildNode(nodeConfig: StandardTreeNode): Node | null {
        const { type, properties, children } = nodeConfig;

        // 根据节点类型构建不同的节点
        switch (type) {
            case 'COMPOSITE.SELECTOR':
                return this.buildSelector(properties, children);
            case 'COMPOSITE.SEQUENCE':
                return this.buildSequence(properties, children);
            case 'COMPOSITE.PARALLEL':
                return this.buildParallel(properties, children);
            case 'DECORATOR.BLACKBOARD_CONDITION':
                return this.buildBlackboardCondition(properties, children);
            case 'TASK.ACTION':
                return this.buildAction(properties);
            case 'TASK.WAIT':
                return this.buildWait(properties);
            default:
                console.error(`Unknown node type: ${type}`);
                return null;
        }
    }

    /**
     * 构建选择器节点
     */
    private buildSelector(properties: Record<string, any>, children?: StandardTreeNode[]): Selector | null {
        if (!children || children.length === 0) {
            console.error('Selector node must have children');
            return null;
        }

        const childNodes = children.map(child => this.buildNode(child)).filter(Boolean) as Node[];
        return new Selector(childNodes);
    }

    /**
     * 构建序列节点
     */
    private buildSequence(properties: Record<string, any>, children?: StandardTreeNode[]): Sequence | null {
        if (!children || children.length === 0) {
            console.error('Sequence node must have children');
            return null;
        }

        const childNodes = children.map(child => this.buildNode(child)).filter(Boolean) as Node[];
        return new Sequence(childNodes);
    }

    /**
     * 构建并行节点
     */
    private buildParallel(properties: Record<string, any>, children?: StandardTreeNode[]): Parallel | null {
        if (!children || children.length === 0) {
            console.error('Parallel node must have children');
            return null;
        }

        const childNodes = children.map(child => this.buildNode(child)).filter(Boolean) as Node[];

        // 获取成功和失败策略
        const successPolicy = properties.successPolicy === 'ONE' ? 1 : 0;
        const failurePolicy = properties.failurePolicy === 'ONE' ? 1 : 0;

        return new Parallel(successPolicy, failurePolicy, childNodes);
    }

    /**
     * 构建黑板条件节点
     */
    private buildBlackboardCondition(properties: Record<string, any>, children?: StandardTreeNode[]): BlackboardCondition | null {
        if (!children || children.length !== 1) {
            console.error('BlackboardCondition node must have exactly one child');
            return null;
        }

        const childNode = this.buildNode(children[0]);
        if (!childNode) {
            return null;
        }

        // 获取条件属性
        const key = properties.key || '';
        const operatorStr = properties.operator || 'IS_EQUAL';
        const value = properties.value;

        // 将字符串操作符转换为枚举
        let operator: Operator;
        switch (operatorStr) {
            case 'IS_EQUAL':
                operator = Operator.IS_EQUAL;
                break;
            case 'IS_NOT_EQUAL':
                operator = Operator.IS_NOT_EQUAL;
                break;
            case 'IS_GREATER':
                operator = Operator.IS_GREATER;
                break;
            case 'IS_GREATER_OR_EQUAL':
                operator = Operator.IS_GREATER_OR_EQUAL;
                break;
            case 'IS_SMALLER':
                operator = Operator.IS_SMALLER;
                break;
            case 'IS_SMALLER_OR_EQUAL':
                operator = Operator.IS_SMALLER_OR_EQUAL;
                break;
            default:
                operator = Operator.ALWAYS_TRUE;
        }

        return new BlackboardCondition(key, operator, value, undefined, childNode);
    }

    /**
     * 构建动作节点
     */
    private buildAction(properties: Record<string, any>): Action | null {
        // 创建一个简单的动作节点，打印动作描述
        const actionDescription = properties.actionDescription || 'No description';

        return new Action(() => {
            console.log(`执行动作: ${actionDescription}`);
            return true; // 默认成功
        });
    }

    /**
     * 构建等待节点
     */
    private buildWait(properties: Record<string, any>): Wait | null {
        const waitTime = properties.waitTime || 1.0;
        const randomVariation = properties.randomVariation || 0;

        return new Wait(waitTime, randomVariation);
    }
} 