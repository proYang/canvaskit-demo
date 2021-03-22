import React, { Component } from 'react'
import styles from './canvas.module.css';
import CanvasKitInit from 'canvaskit-wasm';
import CanvasKitPkg from 'canvaskit-wasm/package.json';

const wasmRemotePath = `https://unpkg.com/canvaskit-wasm@${CanvasKitPkg.version}/bin/`;

export default class Canvas extends Component {

    componentDidMount() {
        this.initCanvasKit();
    }

    initCanvasKit = () => {
        CanvasKitInit({
            locateFile: (file) => `${wasmRemotePath}${file}`,
        }).then((CanvasKit) => {
            const surface = CanvasKit.MakeCanvasSurface('canvas');
            const canvas = surface.getCanvas();

            const paint = new CanvasKit.Paint();
            paint.setColor(CanvasKit.Color4f(0.9, 0, 0, 1.0));
            paint.setStyle(CanvasKit.PaintStyle.Stroke);
            paint.setAntiAlias(true);
            const rr = CanvasKit.RRectXY(CanvasKit.LTRBRect(10, 60, 210, 260), 25, 15);

            function draw(canvas) {
                canvas.clear(CanvasKit.WHITE);
                canvas.drawRRect(rr, paint);
            }
            surface.drawOnce(draw);
        });
    }

    render() {
        return (
            <div className={styles.container}>
                <canvas id="canvas" width="500" height="500" className={styles.canvas}></canvas>
            </div>
        )
    }
}
