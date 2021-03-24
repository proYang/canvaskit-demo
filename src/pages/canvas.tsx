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
            let robotoData = null;
            fetch('https://storage.googleapis.com/skia-cdn/google-web-fonts/Roboto-Regular.ttf').then((resp) => {
                resp.arrayBuffer().then((buffer) => {
                    robotoData = buffer;
                    requestAnimationFrame(drawFrame);
                });
            });

            let emojiData = null;
            fetch('https://storage.googleapis.com/skia-cdn/misc/NotoColorEmoji.ttf').then((resp) => {
                resp.arrayBuffer().then((buffer) => {
                    emojiData = buffer;
                    requestAnimationFrame(drawFrame);
                });
            });

            const surface = CanvasKit.MakeCanvasSurface('canvas');
            if (!surface) {
                throw 'Could not make surface';
            }
            const skcanvas = surface.getCanvas();

            const font = new CanvasKit.Font(null, 18);
            const fontPaint = new CanvasKit.Paint();
            fontPaint.setStyle(CanvasKit.PaintStyle.Fill);
            fontPaint.setAntiAlias(true);
            skcanvas.drawText(`Fetching Font data...`, 5, 450, fontPaint, font);
            surface.flush();

            const context = CanvasKit.currentContext();

            let paragraph = null;
            let X = 250;
            let Y = 250;
            const str = 'The quick brown fox 🦊 ate a zesty hamburgerfons 🍔.\nThe 👩‍👩‍👧‍👧 laughed.';

            function drawFrame() {
                if (robotoData && emojiData && !paragraph) {
                    const fontMgr = CanvasKit.FontMgr.FromData([robotoData, emojiData]);

                    const paraStyle = new CanvasKit.ParagraphStyle({
                        textStyle: {
                            color: CanvasKit.BLACK,
                            fontFamilies: ['Roboto', 'Noto Color Emoji', 'Dream-XinCuSongGB'],
                            fontSize: 50,
                        },
                        textDirection: CanvasKit.TextDirection.Ltr,
                        textAlign: CanvasKit.TextAlign.Justify,
                        maxLines: 7,
                        ellipsis: '...',
                    });

                    const builder = CanvasKit.ParagraphBuilder.Make(paraStyle, fontMgr);
                    builder.addText(str);
                    paragraph = builder.build();
                }
                if (!paragraph) {
                    requestAnimationFrame(drawFrame);
                    return;
                }
                CanvasKit.setCurrentContext(context);
                skcanvas.clear(CanvasKit.WHITE);

                let wrapTo = 350 + 150 * Math.sin(Date.now() / 2000);
                paragraph.layout(wrapTo);
                skcanvas.drawParagraph(paragraph, 0, 0);
                skcanvas.drawLine(wrapTo, 0, wrapTo, 400, fontPaint);

                const posA = paragraph.getGlyphPositionAtCoordinate(X, Y);
                const cp = str.codePointAt(posA.pos);
                if (cp) {
                    const glyph = String.fromCodePoint(cp);
                    skcanvas.drawText(`At (${X.toFixed(2)}, ${Y.toFixed(2)}) glyph is '${glyph}'`, 5, 450, fontPaint, font);
                }

                surface.flush();
                requestAnimationFrame(drawFrame);
            }

            // Make animation interactive
            canvas.addEventListener('mousemove', (e) => {
                X = e.offsetX - 10;
                Y = e.offsetY;
            });
            // const canvas = surface.getCanvas();

            // const paint = new CanvasKit.Paint();
            // paint.setColor(CanvasKit.Color4f(0.9, 0, 0, 1.0));
            // paint.setStyle(CanvasKit.PaintStyle.Stroke);
            // paint.setAntiAlias(true);
            // const rr = CanvasKit.RRectXY(CanvasKit.LTRBRect(10, 60, 210, 260), 25, 15);

            // function draw(canvas) {
            //     canvas.clear(CanvasKit.WHITE);
            //     canvas.drawRRect(rr, paint);
            // }
            // surface.drawOnce(draw);
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
