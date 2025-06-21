import React from 'react';

interface PropertyEditorProps {
    id: string;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'textarea';
    value: any;
    onChange: (value: any) => void;
    options?: { value: string; label: string; }[];
    min?: number;
    max?: number;
    step?: number;
}

/**
 * 通用属性编辑器组件
 * 支持多种类型的属性编辑
 */
const PropertyEditor: React.FC<PropertyEditorProps> = ({
    id,
    label,
    type,
    value,
    onChange,
    options = [],
    min,
    max,
    step = 1
}) => {
    // 处理值变化
    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        let newValue: any = e.target.value;

        // 根据类型转换值
        if (type === 'number') {
            newValue = parseFloat(newValue);
            if (isNaN(newValue)) newValue = 0;
        }

        onChange(newValue);
    };

    // 处理复选框变化
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.checked);
    };

    // 根据类型渲染不同的编辑控件
    const renderEditor = () => {
        switch (type) {
            case 'text':
                return (
                    <input
                        id={id}
                        type="text"
                        className="form-control"
                        value={value || ''}
                        onChange={handleValueChange}
                    />
                );

            case 'number':
                return (
                    <input
                        id={id}
                        type="number"
                        className="form-control"
                        value={value || 0}
                        min={min}
                        max={max}
                        step={step}
                        onChange={handleValueChange}
                    />
                );

            case 'boolean':
                return (
                    <div className="checkbox-container">
                        <input
                            id={id}
                            type="checkbox"
                            checked={!!value}
                            onChange={handleCheckboxChange}
                        />
                        <label htmlFor={id} className="checkbox-label">
                            {value ? '是' : '否'}
                        </label>
                    </div>
                );

            case 'select':
                return (
                    <select
                        id={id}
                        className="form-control"
                        value={value || ''}
                        onChange={handleValueChange}
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'textarea':
                return (
                    <textarea
                        id={id}
                        className="form-control"
                        value={value || ''}
                        onChange={handleValueChange}
                        rows={3}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div className="form-group">
            <label htmlFor={id}>{label}</label>
            {renderEditor()}
        </div>
    );
};

export default PropertyEditor; 