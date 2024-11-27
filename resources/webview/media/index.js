import React from 'react';
import ReactDOM from 'react-dom';
import GridLayout from 'react-grid-layout';

document.addEventListener('DOMContentLoaded', () => {
    const vscode = acquireVsCodeApi();

    window.addEventListener('message', event => {
        //Compute the new message
        const message = event.data;
    });

    const layout = [
        { i: 'a', x: 0, y: 0, w: 1, h: 2, static: true },
        { i: 'b', x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 },
        { i: 'c', x: 4, y: 0, w: 1, h: 2 }
    ];
    
    const MyGrid = () => (
        <GridLayout className="layout" layout={layout} cols={12} rowHeight={30} width={1200}>
            <div key="a">A</div>
            <div key="b">B</div>
            <div key="c">C</div>
        </GridLayout>
    );
    
    ReactDOM.render(<MyGrid />, document.getElementById('root'));
});
