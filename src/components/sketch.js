import React from "react";

export const p5Events = [
  "draw",
  "windowResized",
  "preload",
  "mouseClicked",
  "doubleClicked",
  "mouseMoved",
  "mousePressed",
  "mouseWheel",
  "mouseDragged",
  "mouseReleased",
  "keyPressed",
  "keyReleased",
  "keyTyped",
  "touchStarted",
  "touchMoved",
  "touchEnded",
  "deviceMoved",
  "deviceTurned",
  "deviceShaken",
];

export default class P5Sketch extends React.Component {
  canvasParentRef;
  canvas = null;
  loaded;
  constructor(props) {
    super(props);
    this.canvasParentRef = React.createRef();
    this.loaded = Promise.resolve();
  }

  async componentDidMount() {
    const loadP5 = async () => {
      let p5 = await import("p5");
      this.canvas = new p5.default((p) => {
        p.setup = () => {
          if (this.props.responsive) {
            const parent = this.canvasParentRef.current;
            if (parent) {
              const width = parent.clientWidth;
              const height = parent.clientHeight;
              p.resizeCanvas(width, height);
            }
          }
          this.props.setup(p, this.canvasParentRef.current);
        };

        p5Events.forEach((event) => {
          if (this.props[event]) {
            const propEvent = this.props[event];
            p[event] = (...rest) => {
              propEvent(p, ...rest);
            };
          }
        });

        if (this.props.responsive) {
          p.windowResized = () => {
            const parent = this.canvasParentRef.current;
            if (parent) {
              const width = parent.clientWidth;
              const height = parent.clientHeight;
              p.resizeCanvas(width, height);
            }
            this.props.windowResized && this.props.windowResized(p);
          };
        }
      }, this.canvasParentRef.current);
    };
    this.loaded = loadP5();
    await this.loaded;
  }
  shouldComponentUpdate() {
    return false;
  }
  componentWillUnmount() {
    console.log("unmounting");
    this.removeCanvas();
  }

  removeCanvas = () => {
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
    }
  };

  render() {
    return (
      <div
        ref={this.canvasParentRef}
        className={this.props.className || "react-p5 h-full w-full"}
        style={this.props.style || {}}
      />
    );
  }
}
