import satori from 'satori';
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUT_DIR = join(__dirname, '..', 'out');
async function downloadFont() {
    const response = await fetch('https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap');
    const css = await response.text();
    const fontUrl = css.match(/src: url\((.+?)\)/)?.[1];
    if (!fontUrl) {
        throw new Error('Could not find font URL');
    }
    const fontResponse = await fetch(fontUrl);
    const fontBuffer = await fontResponse.arrayBuffer();
    return Buffer.from(fontBuffer);
}
async function generateOgImage() {
    try {
        const fontData = await downloadFont();
        const logoSvg = readFileSync(join(OUT_DIR, 'logo.svg'), 'utf-8');
        const logoData = Buffer.from(logoSvg).toString('base64');
        const svg = await satori({
            type: 'div',
            props: {
                style: {
                    display: 'flex',
                    height: '100%',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fff',
                    padding: '40px',
                },
                children: [
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            },
                            children: [
                                {
                                    type: 'img',
                                    props: {
                                        src: `data:image/svg+xml;base64,${logoData}`,
                                        width: 200,
                                        height: 200,
                                    },
                                },
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            fontSize: 60,
                                            fontWeight: 700,
                                            color: '#000',
                                            marginTop: 20,
                                        },
                                        children: 'Zod Documentation',
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        }, {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: 'Inter',
                    data: fontData,
                    weight: 700,
                    style: 'normal',
                },
            ],
        });
        writeFileSync(join(OUT_DIR, 'og-image.svg'), svg);
        // Convert to PNG using Sharp
        await sharp(Buffer.from(svg))
            .resize(1200, 630)
            .png()
            .toFile(join(OUT_DIR, 'og-image.png'));
        console.log('Generated og:image successfully (SVG and PNG)');
    }
    catch (error) {
        console.error('Failed to generate og:image:', error);
    }
}
generateOgImage().catch(console.error);
