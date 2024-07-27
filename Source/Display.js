class Display
{
	constructor(sizeInPixels)
	{
		this.sizeInPixels = sizeInPixels;
	}

	clear()
	{
		this.graphics.clearRect(0, 0, this.sizeInPixels.x, this.sizeInPixels.y);
		return this;
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

	clone()
	{
		var returnValue = new Display(this.sizeInPixels.clone() );
		returnValue.initialize();
		returnValue.drawImage(this.canvas, new Coords(0, 0) );
		return returnValue;
	}

	colorAtPos(pixelPos)
	{
		var componentsRGBA =
			this.graphics.getImageData(pixelPos.x, pixelPos.y, 1, 1).data;
		var color = new Color(componentsRGBA);
		return color;
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
		this.graphics.fillStyle = color.systemColor;
		this.graphics.fillRect
		(
			pos.x, pos.y, 1, 1
		);
	}
 
	drawRectangleOfSizeAtPosWithColorsFillAndBorder
	(
		size, pos, colorFill, colorBorder
	)
	{
		var g = this.graphics;

		if (colorFill != null)
		{
			g.fillStyle = colorFill.systemColor;
			g.fillRect
			(
				pos.x, pos.y, size.x, size.y
			);
		}

		if (colorBorder != null)
		{
			g.strokeStyle = colorBorder.systemColor;
			g.strokeRect
			(
				pos.x, pos.y, size.x, size.y
			);
		}
	}
 
	fillWithColor(color)
	{
		this.drawRectangleOfSizeAtPosWithColorsFillAndBorder
		(
			this.sizeInPixels,
			new Coords(0, 0),
			color,
			null
		);
	}
 
	initialize(domElementParent)
	{
		var d = document;
		this.canvas = d.createElement("canvas");
		this.canvas.style = "border:1px solid;" 
		this.canvas.width = this.sizeInPixels.x;
		this.canvas.height = this.sizeInPixels.y;

		this.canvas.style.background = "url('./GrayCheckerboard.png')";
 
		if (domElementParent != null)
		{
			domElementParent.appendChild(this.canvas);
		}

		this.graphics = this.canvas.getContext("2d");
		this.graphics.imageSmoothingEnabled = false;
 	}

	pixelAtPosGetAsColor(pixelPos)
	{
		var rgba = this.pixelAtPosGetAsRGBA(pixelPos);
		return Color.fromComponentsRgba(rgba);
	}

	pixelAtPosGetAsRGBA(pixelPos)
	{
		var imageData = this.graphics.getImageData(pixelPos.x, pixelPos.y, 1, 1);
		var componentsRGBA = imageData.data;
		return componentsRGBA;
	}
 
	toCanvas()
	{
		var d = document;
		var canvas = d.createElement("canvas");
		canvas.width = this.sizeInPixels.x;
		canvas.height = this.sizeInPixels.y;
		var graphics = canvas.getContext("2d");
		graphics.drawImage(this.canvas, 0, 0);
		return canvas;
	}

 	toRGBATuples()
 	{
		return this.canvas.getImageData(0, 0, this.sizeInPixels.x, this.sizeInPixels.y);
 	}
}
