import Konva from "konva";
import { InstaxFilmVariant } from "../interfaces/PrinterStateConfig";
import mergeImages from 'merge-images';

function createPolaroidText(polaroidType: InstaxFilmVariant, text: string): string {
	// Create a new canvas element
	const canvas = document.createElement('canvas');
	canvas.id = "polaroid-download-text";

	// Set canvas dimensions based on your configuration
	const width = (polaroidType == InstaxFilmVariant.MINI) ? 600 :
		(polaroidType == InstaxFilmVariant.SQUARE) ? 800 : 1150;
	const height = 200;
	canvas.width = width;
	canvas.height = height;

	// Get 2D context
	const ctx = canvas.getContext("2d");

	// Draw content
	// Clear the canvas (optional, if you want to clear previous drawings)
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw the transparent background
	ctx.fillStyle = "rgba(255, 150, 100, 0)"; // Transparent white background
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Draw the text
	ctx.font = `${(Math.random() * 2) + 60}px biro_script_standardregular`;
	ctx.fillStyle = "rgba(0, 15, 85, .75)";

	// Calculate text width
	const textWidth = ctx.measureText(text).width;

	const x = (canvas.width - textWidth) / 2;
	const y = canvas.height / 2;
	const rotationAngle = (Math.random() * 2) - 1;

	ctx.save();
	ctx.translate(x + textWidth / 2, y);
	ctx.rotate((rotationAngle * Math.PI) / 180);

	ctx.fillText(text, -textWidth / 2, 0);
	ctx.restore();

	// Append canvas to the document
	document.body.appendChild(canvas);

	const textImage = (canvas as HTMLCanvasElement).toDataURL('image/png')


	document.body.removeChild(canvas);

	return textImage;

}



function setPolaroidFilter(image: Konva.Image, background: Konva.Rect): void {
	const filterList = [
		Konva.Filters.Contrast,
		Konva.Filters.HSL,
		Konva.Filters.Brighten,
		Konva.Filters.Noise
	]
	// Apply filters
	image.filters(filterList);
	image.contrast(-1)
	// image.saturation(-0.2)
	image.brightness(.05)
	image.noise(.1)
	image.cache();


	background.filters(filterList)

	background.contrast(-1)
	// backgroundRect.saturation(-0.2)
	background.brightness(.05)
	background.noise(.15)
	background.cache();
}

function removePolaroidFilter(image: Konva.Image, background: Konva.Rect): void {
	image.clearCache();
	image.filters([]);

	background.filters([]);
	background.clearCache();
}


export async function downloadPolaroid(type: InstaxFilmVariant, text: string, image: Konva.Image, background: Konva.Rect, stage: Konva.Stage): Promise<string> {
	setPolaroidFilter(image, background)

	const canvasUrl = stage.toDataURL({ pixelRatio: 2.4 });

	removePolaroidFilter(image, background); // remove all Konva filters

	return mergeImages([
		{ src: canvasUrl, x: type == InstaxFilmVariant.SQUARE ? 28 : type == InstaxFilmVariant.MINI ? 22 : 22, y: 40 },
		{ src: `/polaroids/export/${type}_scale.png`, x: 0, y: 0 },
		{ src: createPolaroidText(type, text), x: 20, y: (Math.random() * 10) + 835 }
	])

}