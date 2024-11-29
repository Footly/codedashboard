import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import * as GridLayout from "react-grid-layout";
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import Slider from '@mui/material/Slider';
import { CircularProgress } from '@mui/material';

const vscode = acquireVsCodeApi();

// Define the types for the widgets
interface Widget {
  backend: string;
  value: any;
  name: string;
  interval: number;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'slider' | 'progress' | 'canvas'; // Include canvas type
  props: any;
  children?: Widget[]; // Optional children for canvas widgets
}

const layoutComponent: React.FC = () => {
  const [layout, setLayout] = React.useState<Widget[]>([]);
  const intervalRefs = React.useRef<{ [key: string]: NodeJS.Timeout }>({});

  const addWidget = (widget: Widget) => {
    setLayout((prevLayout) => [
      ...prevLayout,
      {
        ...widget,
        x: widget.x ?? 0,   // Default x position
        y: widget.y ?? 0, // Auto-place at the bottom
        w: widget.w ?? 2,   // Default width
        h: widget.h ?? 2,   // Default height
      },
    ]);

    console.warn(widget);

    if (widget.type === 'progress' && widget.interval > 0) {
      intervalRefs.current[widget.name] = setInterval(() => {
        vscode.postMessage({
          command: 'REQUEST',
          payload: { widget: widget },
        });
      }, widget.interval);
    }
  };

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === "ADD_WIDGET") {
        addWidget(message.payload);
      }
      if (message.command === "UPDATE") {
        setLayout((prevLayout) =>
          prevLayout.map((widget) =>
            widget.name === message.payload.widget.name
              ? { ...message.payload.widget }
              : widget
          )
        );
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Recursive function to render widgets (including nested ones)
  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'slider':
        {
          const { defaultValue, min, max, step } = widget.props; // Destructure slider-specific props
          const handleChange = () => {
            vscode.postMessage({
              command: 'UPDATE', payload: {
                widget: widget,
              },
            });
          };
          return (
            <div style={{ textAlign: 'center' }}>
              <div>{widget.name}</div>
              <Slider defaultValue={defaultValue} min={min} max={max} step={step} valueLabelDisplay="on" onChange={handleChange} />
            </div>
          );
        }
      case 'progress':
        {
          const { min, max } = widget.props;
          const normalise = (val: number) => ((val - min) * 100) / (max - min);
          return (
            <div style={{ textAlign: 'center' }}>
              <div>{widget.name}</div>
              <CircularProgress variant="determinate" value={normalise(widget.value)} />
            </div>
          );
        }
      case 'canvas': // Special case for canvas (container) widgets
        {
          return (
            <div style={{
              border: '2px solid #ccc',
              backgroundColor: '#f9f9f9',
              textAlign: 'center',
              position: 'relative',
            }}>
              <div>{widget.name}</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Render children widgets inside the canvas */}
                {widget.children && widget.children.length > 0 && renderLayout(widget.children)}
              </div>
            </div>
          );
        }
      default:
        return null;
    }
  };

  const renderLayout = (layout: Widget[]) => {
    // Map the widgets to a layout array for GridLayout
    const gridLayout = layout.map((widget) => {
      if (widget.x === null || widget.y === null || widget.w === null || widget.h === null) {
        console.error(`Widget ${widget.name} has invalid properties:`, widget);
        return null;
      }
      return {
        i: widget.name, // Unique key for each widget
        x: widget.x,
        y: widget.y,
        w: widget.w,
        h: widget.h,
      };
    }).filter(Boolean); // Filter out invalid widgets
  
    return (
      <GridLayout
        className="layout"
        layout={gridLayout as any} // Pass the layout array to GridLayout
        cols={12}
        rowHeight={30}
        width={1200}
      >
        {layout.map((widget) => (
          <div key={widget.name}>
            {renderWidget(widget)}
          </div>
        ))}
      </GridLayout>
    );
  };
  
  return <>{renderLayout(layout)}</>;
};

export default layoutComponent;
