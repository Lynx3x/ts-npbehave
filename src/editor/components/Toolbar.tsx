import React from 'react';

interface ToolbarProps {
    onSave: () => void;
    onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onExport: () => void;
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    onDelete: () => void;
    onCopy?: () => void;
    canDelete: boolean;
    canCopy?: boolean;
    lastSaved: string | null;
}

/**
 * 工具栏组件
 */
const Toolbar: React.FC<ToolbarProps> = ({
    onSave,
    onLoad,
    onExport,
    onImport,
    onClear,
    onDelete,
    onCopy,
    canDelete,
    canCopy,
    lastSaved
}) => {
    // 创建文件输入引用，用于触发文件选择
    const loadFileRef = React.useRef<HTMLInputElement>(null);
    const importFileRef = React.useRef<HTMLInputElement>(null);

    // 处理打开文件点击
    const handleLoadClick = () => {
        if (loadFileRef.current) {
            loadFileRef.current.click();
        }
    };

    // 处理导入文件点击
    const handleImportClick = () => {
        if (importFileRef.current) {
            importFileRef.current.click();
        }
    };

    return (
        <div className="toolbar">
            <div className="toolbar-left">
                <h2>TS-NPBehave 行为树编辑器</h2>
                {lastSaved && (
                    <div className="save-status">
                        上次保存: {new Date(lastSaved).toLocaleString()}
                    </div>
                )}
            </div>

            <div className="toolbar-right">
                <button
                    className="button danger"
                    onClick={onDelete}
                    disabled={!canDelete}
                    title="删除选中的节点或连线 (Delete)"
                >
                    删除
                </button>

                {onCopy && (
                    <button
                        className="button primary"
                        onClick={onCopy}
                        disabled={!canCopy}
                        title="复制选中的节点 (Ctrl+C)"
                    >
                        复制
                    </button>
                )}

                <button className="button secondary" onClick={handleLoadClick} title="加载编辑器状态">
                    打开
                </button>
                <input
                    ref={loadFileRef}
                    type="file"
                    accept=".json"
                    onChange={onLoad}
                    style={{ display: 'none' }}
                />

                <button className="button secondary" onClick={handleImportClick} title="导入标准配置">
                    导入配置
                </button>
                <input
                    ref={importFileRef}
                    type="file"
                    accept=".json"
                    onChange={onImport}
                    style={{ display: 'none' }}
                />

                <button className="button" onClick={onSave} title="保存编辑器状态">
                    保存
                </button>

                <button className="button" onClick={onExport} title="导出标准配置">
                    导出配置
                </button>

                <button className="button warning" onClick={onClear} title="清除编辑器">
                    清除
                </button>
            </div>
        </div>
    );
};

export default Toolbar; 