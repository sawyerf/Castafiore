const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const assetsDir = path.join(__dirname, '..', '.assets')

// create .assets folder
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
  console.log('Created assets directory');
} else {
  console.log('Assets directory already exists');
}

const svgOrigin = path.join(__dirname, '..', 'public', 'PWA', 'icon.svg');

const getDecalage = (newSize, scale) => {
  const H = 289.455
  const h = 239.159
  const y = 0

  const W = 349.100
  const w = 343.856
  const x = 0

  const decalageX = (W - w) / 2 - x
  const decalageY = (H - h) / 2 - y

  return {
    x: Math.floor(decalageX * (newSize / W) * scale),
    y: Math.floor(decalageY * (newSize / H) * scale)
  }
}

const convertSvgToPng = async ({ name, size = 1024, scale = 1, backgroundColor = { r: 0, g: 0, b: 0, alpha: 0 }}) => {
  const resize = Math.floor(size * scale);
  const image = await sharp(svgOrigin)
    .resize(resize, resize, {
      fit: sharp.fit.contain,
      scale: 0.5,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer()

  const decalage = getDecalage(size * scale, scale);
  console.log(`decalage for ${name}:`, decalage);
  console.log(`Resize for ${name}:`, resize, size * scale);
  sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: backgroundColor
    }
  })
    .composite([{
      input: image,
      left: decalage.x + Math.floor((size - size * scale) / 2),
      top: decalage.y + Math.floor((size - size * scale) / 2)
    }])
    .png()
    .toFile(path.join(assetsDir, `${name}.png`))
}

convertSvgToPng({ name: 'icon',  size: 1024,  scale: 0.67, backgroundColor: "#660000" })
convertSvgToPng({ name: 'icon_foreground', size: 1024, scale: 0.43 })
