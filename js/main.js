let sclSlider, noiseScaleSlider, contourSlider, zoffSlider;
let widthInput, heightInput;
let darkMode = true;
let canvas;

function setup() {
    noCanvas(); // prevent auto canvas

    // === Canvas dimension inputs ===
    createP('Canvas Width (px)').position(10, 0).class('input-label');
    widthInput = createInput('800').position(10, 40).size(100).id('input-width');

    createP('Canvas Height (px)').position(150, 0).class('input-label');
    heightInput = createInput('600').position(150, 40).size(100).id('input-height');

    createButton('📐 Create / Resize Canvas').position(300, 40).mousePressed(createOrResizeCanvas);
    // === Sliders ===
    createP('Grid Size (Detail)').position(10, 70);
    sclSlider = createSlider(5, 50, 10, 1).position(10, 100);

    createP('Noise Scale').position(160, 70);
    noiseScaleSlider = createSlider(1, 100, 5, 1).position(160, 100);

    createP('Contour Levels').position(310, 70);
    contourSlider = createSlider(2, 50, 15, 1).position(310, 100);

    createP('Z Offset (Random Pattern)').position(460, 70);
    zoffSlider = createSlider(0, 1000, 0, 1).position(460, 100);

    // === Buttons ===
    createButton('💾 Save as JPG').position(10, 140).mousePressed(() => saveCanvas('topography', 'jpg'));
    createButton('🌓 Toggle BG').position(130, 140).mousePressed(() => {
        darkMode = !darkMode;
        redraw();
    });
    createButton('🔁 Redraw Pattern').position(250, 140).mousePressed(() => redraw());

    // Initial canvas
    createOrResizeCanvas();
}

function createOrResizeCanvas() {
    let w = parseInt(widthInput.value());
    let h = parseInt(heightInput.value());

    if (canvas) canvas.remove(); // Remove existing canvas
    canvas = createCanvas(w, h);
    canvas.position(10, 180);
    noLoop();
    redraw();
}

function draw() {
    let scl = sclSlider.value();
    let noiseScale = noiseScaleSlider.value() / 100;
    let contourLevels = contourSlider.value();
    let zoff = zoffSlider.value();

    background(darkMode ? 0 : 255);
    stroke(darkMode ? 255 : 0);
    noFill();

    let cols = width / scl;
    let rows = height / scl;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let x0 = x * scl;
            let y0 = y * scl;

            let x1 = x0 + scl;
            let y1 = y0 + scl;

            let tl = noise(x * noiseScale, y * noiseScale, zoff);
            let tr = noise((x + 1) * noiseScale, y * noiseScale, zoff);
            let br = noise((x + 1) * noiseScale, (y + 1) * noiseScale, zoff);
            let bl = noise(x * noiseScale, (y + 1) * noiseScale, zoff);

            drawContourCell(x0, y0, scl, tl, tr, br, bl, contourLevels);
        }
    }
}

function drawContourCell(x, y, size, tl, tr, br, bl, contourLevels) {
    for (let i = 1; i < contourLevels; i++) {
        let level = i / contourLevels;
        let points = [];

        if ((tl < level) != (tr < level)) {
            let t = (level - tl) / (tr - tl);
            points.push(createVector(lerp(x, x + size, t), y));
        }
        if ((tr < level) != (br < level)) {
            let t = (level - tr) / (br - tr);
            points.push(createVector(x + size, lerp(y, y + size, t)));
        }
        if ((br < level) != (bl < level)) {
            let t = (level - br) / (bl - br);
            points.push(createVector(lerp(x + size, x, t), y + size));
        }
        if ((bl < level) != (tl < level)) {
            let t = (level - bl) / (tl - bl);
            points.push(createVector(x, lerp(y + size, y, t)));
        }

        if (points.length == 2) {
            line(points[0].x, points[0].y, points[1].x, points[1].y);
        }
    }
}
