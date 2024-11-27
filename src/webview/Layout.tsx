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
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'slider' | 'progress'; // Widget types: slider, tag, or badge
  props: any; // The specific props for each widget type (could be slider value, tag text, etc.)
}

const Layout: React.FC = () => {
  const [layout, setLayout] = React.useState<Widget[]>([]);

  const addWidget = (widget: Widget) => {
    setLayout((prevLayout) => [
      ...prevLayout,
      {
        name: widget.name,
        x: widget.x,
        y: widget.y,
        w: widget.w,
        h: widget.h,
        type: widget.type,
        props: widget.props,
      },
    ]);
  };

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === "ADD_WIDGET") {
        addWidget(message.payload);
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
          return (
            <div style={{ textAlign: 'center'}}>
              <div style={{ marginBottom: '20px' }}>{widget.name}</div>
              <Slider defaultValue={defaultValue} min={min} max={max} step={step} valueLabelDisplay="on" />
            </div>
          );
        }
      case 'progress':
        {
          const { value, min, max } = widget.props; // Destructure progress-specific props
          const normalise = (val: number) => ((val - min) * 100) / (max - min);
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
      {layout.map((widget, index) => (
        <div key={index} data-grid={{ x: widget.x, y: widget.y, w: widget.w, h: widget.h }}>
          {renderWidget(widget)} {/* Render the widget */}
        </div>
      ))}
    </GridLayout>
  );
};

export default Layout;
