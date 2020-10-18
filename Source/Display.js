class Display
{
	constructor(sizeInPixels)
	{
		this.sizeInPixels = sizeInPixels;
	}

	clear()
	{
		this.graphics.clearRect(0, 0, this.sizeInPixels.x, this.sizeInPixels.y);
	}

	clearPixel(pos)
	{
		this.graphics.clearRect
		(
			pos.x, pos.y, 1, 1
		);
	}

	clearRectangle(pos, size)
	{
		this.graphics.clearRect
		(
			pos.x, pos.y, size.x, size.y
		);
	}

	drawImage(image, pos)
	{
		pos = pos || new Coords(0, 0);
		this.graphics.drawImage
		(
			image, pos.x, pos.y
		);
	}
 
	drawImagePartial(image, posToDrawFrom, size, posToDrawTo)
	{
		this.graphics.drawImage
		(
			image,
			posToDrawFrom.x, posToDrawFrom.y,
			size.x, size.y,
			posToDrawTo.x, posToDrawTo.y,
			size.x, size.y
		);
	}
 
	drawImageStretched(image)
	{
		this.graphics.drawImage
		(
			image,
			0, 0,
			this.sizeInPixels.x, this.sizeInPixels.y
		);
	}
 
	drawPixel(color, pos)
	{
		this.graphics.fillStyle = color;
		this.graphics.fillRect
		(
			pos.x, pos.y, 1, 1
		);
	}
 
	drawRectangle(color, pos, size)
	{
		this.graphics.fillStyle = color;
		this.graphics.fillRect
		(
			pos.x, pos.y, size.x, size.y
		);
	}
 
	fillWithColor(color)
	{
		this.drawRectangle(color, new Coords(0, 0), this.sizeInPixels);
	}

	getPixelAtPosAsRGBA(pixelPos)
	{
		var imageData = this.graphics.getImageData(pixelPos.x, pixelPos.y, 1, 1);
		var componentsRGBA = imageData.data;
		return componentsRGBA;
	}
 
	initialize(domElementParent)
	{
		var d = document;
		this.canvas = d.createElement("canvas");
		this.canvas.style = "border:1px solid;" 
		this.canvas.width = this.sizeInPixels.x;
		this.canvas.height = this.sizeInPixels.y;

		this.canvas.style.background = "url('./GrayCheckerboard.png')";
 
		domElementParent.appendChild(this.canvas);

		this.graphics = this.canvas.getContext("2d");
		this.graphics.imageSmoothingEnabled = false;
 	}
}
