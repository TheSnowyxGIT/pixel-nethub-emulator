import React, { Component } from "react";
import P5Sketch from "./sketch";
import { Color, PixelMatrix } from "pixels-matrix";

export default class Screen extends Component {
  matrix = new PixelMatrix(0, 0);
  offColor;
  hasChanged = true;
  constructor(props) {
    super(props);
    this.state = {
      resolution: props.resolution,
    };
    this.offColor = props.offColor ?? new Color(40, 40, 40);
  }

  componentDidUpdate(prevProps, prevState) {
    const prevRes = `${prevState.resolution.width}x${prevState.resolution.height}`;
    const currentRes = `${this.state.resolution.width}x${this.state.resolution.height}`;
    if (prevRes !== currentRes) {
      this.matrix = new PixelMatrix(
        this.state.resolution.width,
        this.state.resolution.height
      );
    }
  }

  changeResolution(width, height) {
    this.setState({
      resolution: { width, height },
    });
  }

  applyBuffer(buffer) {
    console.log(this.props.resolution.width, this.props.resolution.height);
    this.matrix = PixelMatrix.FromBuffer(
      buffer,
      this.props.resolution.width,
      this.props.resolution.height,
      { y_mirrored: true }
    );
    this.hasChanged = true;
  }

  applyPm(pm) {
    const buffer = Buffer.from(pm.ToArray().buffer);
    this.matrix = PixelMatrix.FromBuffer(
      buffer,
      this.props.resolution.width,
      this.props.resolution.height,
      { y_mirrored: true }
    );
    this.hasChanged = true;
  }

  boxSize = 0;
  boxXOffset = 0;
  boxYOffset = 0;
  setup = (p5) => {
    const boxXSize = p5.width / this.props.resolution.width;
    const boxYSize = p5.height / this.props.resolution.height;
    this.boxSize = Math.min(boxXSize, boxYSize);
    this.boxXOffset =
      (p5.width - this.boxSize * this.props.resolution.width) / 2;
    this.boxYOffset =
      (p5.height - this.boxSize * this.props.resolution.height) / 2;
    this.hasChanged = true;
  };

  glow = (p5, color, v) => {
    p5.drawingContext.shadowColor = color;
    p5.drawingContext.shadowBlur = v;
  };

  noGlow = (p5) => {
    p5.drawingContext.shadowBlur = 0;
  };

  draw = (p5) => {
    if (!this.hasChanged) {
      return;
    }
    p5.background(0);
    this.hasChanged = false;
    for (let x = 0; x < this.props.resolution.width; x++) {
      for (let y = 0; y < this.props.resolution.height; y++) {
        const borderSize = this.boxSize / 5;
        p5.noStroke();
        let [r, g, b] = this.matrix.getColor({ x, y }).getRGB();
        if (r === 0 && g === 0 && b === 0) {
          [r, g, b] = this.offColor.getRGB();
        } else {
          //this.glow(p5, `rgb(${r}, ${g}, ${b})`, 20);
          p5.rect(
            this.boxXOffset + x * this.boxSize + borderSize,
            this.boxYOffset + y * this.boxSize + borderSize,
            this.boxSize - borderSize * 2,
            this.boxSize - borderSize * 2
          );
          //this.glow(p5, `rgb(${r}, ${g}, ${b})`, 100);
          p5.rect(
            this.boxXOffset + x * this.boxSize + borderSize,
            this.boxYOffset + y * this.boxSize + borderSize,
            this.boxSize - borderSize * 2,
            this.boxSize - borderSize * 2
          );
        }
        p5.fill(r, g, b);
        p5.rect(
          this.boxXOffset + x * this.boxSize + borderSize,
          this.boxYOffset + y * this.boxSize + borderSize,
          this.boxSize - borderSize * 2,
          this.boxSize - borderSize * 2
        );
        this.noGlow(p5);
      }
    }
  };

  windowResized = (p5) => {
    this.setup(p5);
  };

  render() {
    const width = this.props.resolution.width;
    const height = this.props.resolution.height;

    return (
      <div
        className={`${this.props.className}`}
        style={{
          aspectRatio: `${width} / ${height}`,
          width: width >= height ? "100%" : undefined,
          height: width < height ? "100%" : undefined,
        }}
      >
        <P5Sketch
          responsive
          setup={this.setup}
          draw={this.draw}
          windowResized={this.windowResized}
        />
      </div>
    );
  }
}
