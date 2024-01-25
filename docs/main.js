const imageScale = 1;

const canvasSize = {
    w : 128,
    h : 172
}

const sourceSize = {
    w : 128,
    h : 112
}
const imageSize = {
    w : sourceSize.w * imageScale,
    h : sourceSize.h * imageScale,
}

const paletteInput = [
    0x000000,
    0x808080,
    0xc0c0c0,
    0xffffff,
]

let paletteIndex = 0;

const palettes = [
    [
        0x0f380f,
        0x306230,
        0x77a112,
        0x9bbc0f
    ],
    [
        0x4c1759,
        0x8132cc,
        0xd330db,
        0xe89300,
    ],
    [
        0x592202,
        0xaf8119,
        0xdcd644,
        0xfffcda
    ],
    [
        0x0084ff,
        0xf10c92,
        0x25fbb3,
        0xfff368
    ]
];

const CONFIG = {
    palette : palettes[0],
    templateURL : "./templates/default.png",
    imageURL : "./camera/001.bmp"
}


/** @type {HTMLCanvasElement} */
const gbcCanvas = document.getElementById('gbc_canvas');

/** @type {HTMLDivElement} */
const container = document.getElementById('container');

/** @type {CanvasRenderingContext2D} */
const ctx = gbcCanvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

function render() {
    ctx.fillRect(0,0, canvasSize.w, canvasSize.h);
    DrawImage(CONFIG.templateURL, 0, 0, canvasSize.w, canvasSize.h, () => {
        DrawImage(CONFIG.imageURL, 0, (canvasSize.h - imageSize.h) / 2, imageSize.w, imageSize.h, CameraImageReady);
    });
}

function CameraImageReady() {
    function ToRGBA(hex) {
        return [
            (hex & 0xFF0000) >> 16,
            (hex & 0x00FF00) >> 8,
            (hex & 0x0000FF),
            255
        ];
    }

    var paletteRGBA = [
        ToRGBA(CONFIG.palette[0]),
        ToRGBA(CONFIG.palette[1]),
        ToRGBA(CONFIG.palette[2]),
        ToRGBA(CONFIG.palette[3])
    ];

    var imageData = ctx.getImageData(0, 0, canvasSize.w, canvasSize.h).data;
    const newData = ctx.createImageData(1,1);

    var start = Date.now();
    for (let y = 0; y < canvasSize.h; y ++) {
        for (let x = 0; x < canvasSize.w; x ++) {
            
            var pixel = imageData[((y * canvasSize.w) + x) * 4];

            var i = 0;
            if (pixel >= 255) {
                i = 3;
            } else if (pixel >= 192) {
                i = 2;
            } else if (pixel >= 128) {
                i = 1;
            }

            newData.data[0] = paletteRGBA[i][0];
            newData.data[1] = paletteRGBA[i][1];
            newData.data[2] = paletteRGBA[i][2];
            newData.data[3] = paletteRGBA[i][3];
            ctx.putImageData(newData, x, y);
        }
    }
    console.log("elapsed: " + (Date.now()-start) + "ms");
    
    var output_canvas = document.getElementById('output_canvas');
    var outCtx = output_canvas.getContext("2d");
    outCtx.imageSmoothingEnabled = false;

    outCtx.drawImage(gbcCanvas, 0, 0, 1024, 1380);

    
    var link = document.getElementById('dl_link');
    link.download = 'gbc_output.png';
    link.setAttribute('href', output_canvas.toDataURL("image/png"));
}

/**
 * @param {string} src 
 * @param {number} x 
 * @param {number} y 
 * @param {number} w 
 * @param {number} h 
 * @param {()=>void} callback
 */
function DrawImage(src, x, y, w, h, callback = () => {}) {
    var image = new Image();
    image.src = src;

    var OnImageLoaded = () => {
        ctx.drawImage(image, x, y, w, h);
        callback();
    }
    

    if (image.complete) {
        OnImageLoaded();
    } else {
        image.addEventListener('load', OnImageLoaded);
    }
}

render();

document.getElementById('palette_button').addEventListener('click', () => {
    paletteIndex = (paletteIndex + 1) % palettes.length;
    CONFIG.palette = palettes[paletteIndex];
    render();
});

let input = document.getElementById('image_input');
input.addEventListener('change', () => {

    if (input.isDefaultNamespace.length == 0)
        return;

    let file = input.files[0];
    CONFIG.imageURL = URL.createObjectURL(file);
    render();
});
