import React from 'react';
import BehaviorTreeEditor from './editor/BehaviorTreeEditor';

/**
 * 应用主组件
 */
const App: React.FC = () => {
    return (
        <div className="App">
            <BehaviorTreeEditor />
        </div>
    );
};

export default App; 