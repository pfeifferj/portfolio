const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const color = "#ff0000";
const spacing = 50;
const dSize = 250;
const dotSize = 2;

let xPos = -dSize/2;
let yPos = -dSize/2;
let mouseX = xPos;
let mouseY = yPos;

canvas.addEventListener("mousemove", setMousePosition, false);

function setMousePosition(e) {
  mouseX = e.clientX - dSize/2;
  mouseY = e.clientY - dSize/2;
}

function animate() {
  const dX = mouseX - xPos;
  const dY = mouseY - yPos;

  xPos += (dX / 25);
  yPos += (dY / 25);

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const paddingH = (canvas.width % spacing) / 2;
  const paddingV = (canvas.height % spacing) / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;

  for (let x = paddingH; x < canvas.width; x += spacing) {
    for (let y = paddingV; y < canvas.height; y += spacing) {
      ctx.fillRect(x - dotSize/2, y - dotSize/2, dotSize, dotSize);
    }
  }

  const data = ctx.getImageData(xPos, yPos, dSize, dSize);
  const pixels = data.data;
  const pixelsCopy = [];
  let index = 0;

  for (var i = 0; i <= pixels.length; i += 4) {
    pixelsCopy[index] = [
      pixels[i],
      pixels[i + 1],
      pixels[i + 2],
      pixels[i + 3],
    ];
    index++;
  }

  const result = fisheye(pixelsCopy, dSize, dSize);

  for (var i = 0; i < result.length; i++) {
    index = 4 * i;
    if (result[i] != undefined) {
      pixels[index + 0] = result[i][0];
      pixels[index + 1] = result[i][1];
      pixels[index + 2] = result[i][2];
      pixels[index + 3] = result[i][3];
    }
  }

  ctx.putImageData(data, xPos, yPos);

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

function fisheye(srcpixels, w, h) {
  const dstpixels = srcpixels.slice();

  for (let y = 0; y < h; y++) {
    let ny = (2 * y) / h - 1;
    let ny2 = ny * ny;
    for (let x = 0; x < w; x++) {
      let nx = (2 * x) / w - 1;
      let nx2 = nx * nx;
      let r = Math.sqrt(nx2 + ny2);

      if (0.0 <= r && r <= 1.0) {
        let nr = Math.sqrt(1.0 - r * r);
        nr = (r + (1.0 - nr)) / 2.0;

        if (nr <= 1.0) {
          let theta = Math.atan2(ny, nx);
          let nxn = nr * Math.cos(theta);
          let nyn = nr * Math.sin(theta);
          let x2 = parseInt(((nxn + 1) * w) / 2);
          let y2 = parseInt(((nyn + 1) * h) / 2);
          let srcpos = parseInt(y2 * w + x2);
          if ((srcpos >= 0) & (srcpos < w * h)) {
            dstpixels[parseInt(y * w + x)] = srcpixels[srcpos];
          }
        }
      }
    }
  }
  return dstpixels;
}
