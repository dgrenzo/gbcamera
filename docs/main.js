/**
 * @typedef {Object} Dimensions
 * @property {number} width
 * @property {number} height
 */

/** @typedef {[number, number, number, number]} PaletteColor */
/** @typedef {[PaletteColor, PaletteColor, PaletteColor, PaletteColor]} Palette */

/**
 * @typedef {Object} GBCOptions
 * @property {Palette} palette
 * @property {Dimensions} dimensions
 */

const imageScale = 1;

/** @type {Dimensions} */
const canvasSize = {
    width : 128,
    height : 172
}

/** @type {Dimensions} */
const sourceSize = {
    width : 128,
    height : 112
}

/** @type {Dimensions} */
const imageSize = {
    width : sourceSize.width * imageScale,
    height : sourceSize.height * imageScale,
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
    ],
    [
        0x314731,
        0x628162,
        0x9AB15E,
        0xEBEE8B
    ]
];


/**
 * @param {number} hex 
 * @returns {PaletteColor}
 */
function ToRGBA(hex) {
    return [
        (hex & 0xFF0000) >> 16,
        (hex & 0x00FF00) >> 8,
        (hex & 0x0000FF),
        255
    ];
}

/**
 * @class
 * @param {GBCOptions} options 
 */
function GBCImage(options) {

    //Setup the html content
    const div = this.div = document.createElement('div');
    div.style.float = "left";
    const canvas = document.createElement('canvas');
    div.appendChild(canvas);
    div.appendChild(document.createElement('br'));
    let dlRect;
    div.appendChild(dlRect = document.createElement('a'));
    dlRect.href = "";
    dlRect.style.color = "#FFFFFF";
    dlRect.text = "rect";
    dlRect.setAttribute('download', 'gbc_out_rect.png');

    div.appendChild(document.createElement('br'));
    div.appendChild(document.createElement('br'));

    let dlSquare;
    div.appendChild(dlSquare = document.createElement('a'));
    dlSquare.href = "";
    dlSquare.style.color = "#FFFFFF";
    dlSquare.text = "square";
    dlSquare.setAttribute('download', 'gbc_out_square.png');


    const outputRect = document.createElement('canvas');
    outputRect.width = 1024;
    outputRect.height = 1380;
    const ctxRect = outputRect.getContext('2d');
    ctxRect.imageSmoothingEnabled = false;

    const outputSquare = document.createElement('canvas');
    outputSquare.width = 1380;
    outputSquare.height = 1220;
    const ctxSquare = outputSquare.getContext('2d');
    ctxSquare.imageSmoothingEnabled = false;

    /** @type {Palette} */
    const palette = [
        ToRGBA(options.palette[0]),
        ToRGBA(options.palette[1]),
        ToRGBA(options.palette[2]),
        ToRGBA(options.palette[3])
    ];

    
    const width = canvas.width = options.dimensions.width;
    const height = canvas.height = options.dimensions.height;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const newData = ctx.createImageData(width, height);

    /**
     * @param {ImageData} imageData 
     */
    this.PalletizeImage = (imageData) => {
        let pixel;
        let paletteIndex;

        for (let index = 0; index < width * height * 4; index += 4) {
            pixel = imageData.data[index];

            paletteIndex = 0;
            if (pixel >= 255) {
                paletteIndex = 3;
            } else if (pixel >= 192) {
                paletteIndex = 2;
            } else if (pixel >= 128) {
                paletteIndex = 1;
            }
            newData.data[index] = palette[paletteIndex][0];
            newData.data[index + 1] = palette[paletteIndex][1];
            newData.data[index + 2] = palette[paletteIndex][2];
            newData.data[index + 3] = palette[paletteIndex][3];
        }

        ctx.putImageData(newData, 0, 0);

        ctxRect.drawImage(canvas, 0, 0, 1024, 1380);
        dlRect.setAttribute('href', outputRect.toDataURL("image/png"));

        ctxSquare.drawImage(canvas, 0,0, 1, 1, 0, 0, 1380, 1220);
        ctxSquare.drawImage(canvas, 0, (canvasSize.height - imageSize.height) / 2, 128, 112, 50, 50, 1280, 1120)
        dlSquare.setAttribute('href', outputSquare.toDataURL("image/png"));
        
    }
}

const CONFIG = {
    palette : palettes[0],
    templateURL : "./templates/default.png",
    imageURL : "./camera/001.bmp"
}


/** @type {HTMLCanvasElement} */
const gbcCanvas = document.getElementById('gbc_canvas');

/** @type {HTMLDivElement} */
const container = document.getElementById('container');

/** @type {HTMLDivElement} */
const output_container = document.getElementById('output_container');

/** @type {CanvasRenderingContext2D} */
const ctx = gbcCanvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

/** @type {GBCImage[]} */
const gbcImages = [];
for (let i = 0; i < palettes.length; i ++) {
    gbcImages.push(new GBCImage({
        palette : palettes[i],
        dimensions: {
            width : canvasSize.width,
            height : canvasSize.height
        }
    }));
    output_container.appendChild(gbcImages[i].div);
}

function render() {
    ctx.fillRect(0,0, canvasSize.width, canvasSize.height);
    DrawImage(CONFIG.templateURL, 0, 0, canvasSize.width, canvasSize.height, () => {
        DrawImage(CONFIG.imageURL, 0, (canvasSize.height - imageSize.height) / 2, imageSize.width, imageSize.height, CameraImageReady);
    });
}

function CameraImageReady() {
    let imageData = ctx.getImageData(0, 0, canvasSize.width, canvasSize.height);
    
    for (let i = 0; i < gbcImages.length; i ++) {
        gbcImages[i].PalletizeImage(imageData);
    }
}

/**
 * @param {string} src 
 * @param {number} x 
 * @param {number} y 
 * @param {number} width 
 * @param {number} height 
 * @param {()=>void} callback
 */
function DrawImage(src, x, y, width, height, callback = () => {}) {
    var image = new Image();
    image.src = src;

    var OnImageLoaded = () => {
        ctx.drawImage(image, x, y, width, height);
        callback();
    }
    

    if (image.complete) {
        OnImageLoaded();
    } else {
        image.addEventListener('load', OnImageLoaded);
    }
}

render();

let input = document.getElementById('image_input');
input.addEventListener('change', () => {

    if (input.isDefaultNamespace.length == 0)
        return;

    let file = input.files[0];
    CONFIG.imageURL = URL.createObjectURL(file);
    render();
});
