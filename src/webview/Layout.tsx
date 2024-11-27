import * as React from 'react';
import * as GridLayout from "react-grid-layout";
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import Slider from '@mui/material/Slider';
import { CircularProgress } from '@mui/material';

const vscode = acquireVsCodeApi();

// Define the types for the widgets
interface Widget {
  name: string;
  interval: number;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'slider' | 'progress'; // Widget types: slider, tag, or badge
  props: any; // The specific props for each widget type (could be slider value, tag text, etc.)
}

const Layout: React.FC = () => {
  const [layout, setLayout] = React.useState<Widget[]>([]);
  const intervalRefs = React.useRef<{ [key: string]: NodeJS.Timeout }>({});

  const addWidget = (widget: Widget) => {
    setLayout((prevLayout) => [
      ...prevLayout,
      {
        name: widget.name,
        interval: widget.interval,
        x: widget.x,
        y: widget.y,
        w: widget.w,
        h: widget.h,
        type: widget.type,
        props: widget.props,
      },
    ]);

    if (widget.type === 'progress' && widget.interval > 0) {
      intervalRefs.current[widget.name] = setInterval(() => {
        vscode.postMessage({
          command: 'REQUEST',
          payload: {
            type: widget.type,
            name: widget.name,
            props: widget.props,
          },
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
            widget.name === message.payload.name
              ? { ...widget, props: message.payload.props }
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
  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'slider':
        {
          const { defaultValue, min, max, step } = widget.props; // Destructure slider-specific props

          const handleChange = (event: Event, value: number | number[]) => {
            vscode.postMessage({
              command: 'UPDATE', payload: {
                type: widget.type,
                name: widget.name,
                props: { value: value },
              },
            });
          };
          return (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '20px' }}>{widget.name}</div>
              <Slider defaultValue={defaultValue} min={min} max={max} step={step} valueLabelDisplay="on" onChange={handleChange} />
            </div>
          );
        }
      case 'progress':
        {
          const { value, min, max } = widget.props; // Destructure progress-specific props
          const normalise = (val: number) => ((val - min) * 100) / (max - min);
          console.warn(normalise(value));
          return (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '20px' }}>{widget.name}</div>
              <CircularProgress variant="determinate" value={normalise(value)} />
            </div>
          );
        }
      default:
        return null;
    }
  };

  return (
    <GridLayout className="layout" cols={12} rowHeight={30} width={1200}>
      {layout.map((widget) => (
        <div key={widget.name} data-grid={{ x: widget.x, y: widget.y, w: widget.w, h: widget.h }}>
          {renderWidget(widget)} {/* Render the widget */}
        </div>
      ))}
    </GridLayout>
  );
};

export default Layout;
