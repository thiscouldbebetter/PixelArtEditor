
class Session
{
	constructor
	(
		imageTilesetSizeInTiles,
		tileSizeInPixelsActual,
		tileSelectedPosInTiles,
		magnificationFactor,
		colors
	)
	{
		this.imageTilesetSizeInTiles = imageTilesetSizeInTiles;
		this.tileSizeInPixelsActual = tileSizeInPixelsActual;
		this.tileSelectedPosInTiles = tileSelectedPosInTiles;
		this.magnificationFactor = magnificationFactor;
		this.colors = colors;

		this.imageTilesetSizeInPixels =
			this.imageTilesetSizeInTiles.clone().multiply(this.tileSizeInPixelsActual);
		this.isErasing = false;
	}

	static Instance()
	{
		if (Session._instance == null)
		{
			Session._instance = new Session
			(
				new Coords(4, 4), // imageTilesetSizeInTiles
				new Coords(16, 16), // tileSizeInPixelsActual
				new Coords(0, 0), // tileSelectedPosInTiles
				16, // magnificationFactor
				// colors
				[
					"Black",
					"Gray", 
					"White",
					"Red",
					"Orange",
					"Yellow",
					"Green",
					"Blue",
					"Purple",

					"Brown",
					"Cyan",
					"DarkGray",
					"LightGray",
					"LightGreen",
					"LightBlue",
					"Gold",
					"Pink",
					"Salmon",
					"Violet",
					"Tan",
				]
			);
		}
		return Session._instance;
	}

	colorSelect(colorToSelect)
	{
		this.colorSelected = colorToSelect;

		var d = document;

		var buttonColorSwatch = d.getElementById("buttonColorSwatch");
		buttonColorSwatch.style.backgroundColor = this.colorSelected;

		var inputColorRed = d.getElementById("inputColorRed");
		var inputColorGreen = d.getElementById("inputColorGreen");
		var inputColorBlue = d.getElementById("inputColorBlue");
		var inputColorAlpha = d.getElementById("inputColorAlpha");

		var canvas = d.createElement("canvas");
		canvas.width = 1;
		canvas.height = 1;
		var g = canvas.getContext("2d");
		g.fillStyle = this.colorSelected;
		g.fillRect(0, 0, 1, 1);
		var colorComponentsRGBA = g.getImageData(0, 0, 1, 1).data;

		inputColorRed.value = colorComponentsRGBA[0];
		inputColorGreen.value = colorComponentsRGBA[1];
		inputColorBlue.value = colorComponentsRGBA[2];
		inputColorAlpha.value = colorComponentsRGBA[3] / 255;
	}
 
	initialize()
	{
		this.tileSizeInPixelsMagnified = this.tileSizeInPixelsActual.clone().multiplyScalar
		(
			this.magnificationFactor
		);
 
		this.cellSizeInPixels = new Coords(1, 1).multiplyScalar
		(
			this.magnificationFactor
		);
   
		var d = document;

		var divImageTileset = d.getElementById("divImageTileset");
		divImageTileset.innerHTML = "";

		this.displayImageTileset = new Display(this.imageTilesetSizeInPixels);
		this.displayImageTileset.initialize(divImageTileset);
		var canvas = this.displayImageTileset.canvas;
		canvas.onmousedown = this.canvasImageTileset_MouseDown.bind(this);

		var divTileSelected = d.getElementById("divTileSelected");
		divTileSelected.innerHTML = "";
 
		this.displayTileSelectedMagnified = new Display(this.tileSizeInPixelsMagnified);
		this.displayTileSelectedMagnified.initialize(divTileSelected);
		canvas = this.displayTileSelectedMagnified.canvas;
		canvas.onmousedown = this.canvasMagnified_MouseDown.bind(this);
		canvas.onmousemove = this.canvasMagnified_MouseMoved.bind(this);

		this.displayTileSelectedActualSize = new Display(this.tileSizeInPixelsActual);
		this.displayTileSelectedActualSize.initialize(divTileSelected);

		this.colorSelected = this.colors[0];
 
		var divColorsPredefined = d.getElementById("divColorsPredefined");
		divColorsPredefined.innerHTML = "";
 
		var colorsPerRow = 4;

		for (var i = 0; i < this.colors.length; i++)
		{
			if (i > 0 && i % colorsPerRow == 0)
			{
				divColorsPredefined.appendChild(d.createElement("br"));
			}

			var colorName = this.colors[i];
			var buttonColor = d.createElement("button");
			buttonColor.innerHTML = colorName;
			buttonColor.style.backgroundColor = colorName;
			buttonColor.style.width = "96px";
			if (colorName == "Black")
			{
				buttonColor.style.color = "White";
			}
			buttonColor.onclick = this.buttonColor_Clicked.bind(this);
			divColorsPredefined.appendChild(buttonColor);
		} 
	}

	drawMagnified()
	{
		this.displayTileSelectedMagnified.clear();

		var imageSizeActual = this.displayTileSelectedActualSize.sizeInPixels;

		var pixelPos = new Coords();
		var drawPos = new Coords();
		var drawSize = new Coords(1, 1).multiplyScalar(this.magnificationFactor);

		for (var y = 0; y < imageSizeActual.y; y++)
		{
			pixelPos.y = y;
			for (var x = 0; x < imageSizeActual.x; x++)
			{
				pixelPos.x = x;
				var pixelColorAsRGBA =
					this.displayTileSelectedActualSize.getPixelAtPosAsRGBA(pixelPos);
				var pixelColor =
					"rgba(" + pixelColorAsRGBA.join(",") + ")";
				drawPos.overwriteWith(pixelPos).multiplyScalar(this.magnificationFactor);
				this.displayTileSelectedMagnified.drawRectangle
				(
					pixelColor, drawPos, drawSize
				);
			}
		}
	}

	drawTileSelectedToTileset()
	{
		var tilePosInPixels =
			this.tileSelectedPosInTiles.clone().multiply(this.tileSizeInPixelsActual);

		this.displayImageTileset.clearRectangle
		(
			tilePosInPixels.x, tilePosInPixels.y,
			this.tileSizeInPixelsActual.x, this.tileSizeInPixelsActual.y
		);

		this.displayImageTileset.drawImage
		(
			this.displayTileSelectedActualSize.canvas, tilePosInPixels
		);
	}
 
	// ui events

	buttonClear_Clicked()
	{
		this.displayTileSelectedActualSize.clear();
		this.displayTileSelectedMagnified.clear();
		this.drawTileSelectedToTileset();
	}
 
	buttonFlood_Clicked()
	{
		this.displayTileSelectedActualSize.fillWithColor(this.colorSelected);
		this.drawMagnified();
		this.drawTileSelectedToTileset();
	}
 
	buttonColor_Clicked(event)
	{
		var buttonColor = event.target;
		this.colorSelect(buttonColor.innerHTML);
	}

	buttonColorFromRGB_Clicked(event)
	{
		var d = document;
		var inputColorRed = d.getElementById("inputColorRed");
		var inputColorGreen = d.getElementById("inputColorGreen");
		var inputColorBlue = d.getElementById("inputColorBlue");
		var inputColorAlpha = d.getElementById("inputColorAlpha");
		var red = inputColorRed.value;
		var green = inputColorGreen.value;
		var blue = inputColorBlue.value;
		var alpha = inputColorAlpha.value;
		var colorFromRGBA = "rgba(" + red + "," + green + "," + blue + "," + alpha + ")";
		this.colorSelect(colorFromRGBA);
	}

	buttonSizeChange_Clicked(event)
	{
		var d = document;

		var canvasTileSelectedActualSize = this.displayTileSelectedActualSize.canvas; 
		var imageActualSizeAsUrl = canvasTileSelectedActualSize.toDataURL("image/png");
		var imageActualSize = d.createElement("img");

		var canvasMagnified = this.displayTileSelectedMagnified.canvas; 
		var imageMagnifiedAsUrl = canvasMagnified.toDataURL("image/png");
		var imageMagnified = d.createElement("img");

		var inputTileSizeInPixelsX = d.getElementById("inputTileSizeInPixelsX");
		var inputTileSizeInPixelsY = d.getElementById("inputTileSizeInPixelsY");
		var inputImageSizeInTilesX = d.getElementById("inputImageSizeInTilesX");
		var inputImageSizeInTilesY = d.getElementById("inputImageSizeInTilesY");
		var inputMagnificationFactor =
			d.getElementById("inputMagnificationFactor");

		this.tileSizeInPixelsActual.x = parseInt(inputTileSizeInPixelsX.value);
		this.tileSizeInPixelsActual.y = parseInt(inputTileSizeInPixelsY.value);
		this.imageTilesetSizeInTiles.x = parseInt(inputImageSizeInTilesX.value);
		this.imageTilesetSizeInTiles.y = parseInt(inputImageSizeInTilesY.value);
		this.magnificationFactor = parseFloat(inputMagnificationFactor.value);

		this.imageTilesetSizeInPixels.overwriteWith
		(
			this.tileSizeInPixelsActual
		).multiply
		(
			this.imageTilesetSizeInTiles
		);

		this.initialize();

		var session = this;

		imageActualSize.onload = () =>
		{
			session.displayTileSelectedActualSize.drawImage(imageActualSize, 0, 0);
			session.drawMagnified();
		}

		imageActualSize.src = imageActualSizeAsUrl;

	} 
 
	buttonSave_Clicked()
	{
		var canvas = this.displayImageTileset.canvas;
 
		var imageFromCanvasURL = canvas.toDataURL("image/png");
 
		var imageAsByteString = atob(imageFromCanvasURL.split(',')[1]);
		var imageAsArrayBuffer = new ArrayBuffer(imageAsByteString.length);
		var imageAsArrayUnsigned = new Uint8Array(imageAsArrayBuffer);
		for (var i = 0; i < imageAsByteString.length; i++) 
		{
			imageAsArrayUnsigned[i] = imageAsByteString.charCodeAt(i);
		}
		var imageAsBlob = new Blob([imageAsArrayBuffer], {type:'image/png'});
 
		var link = document.createElement("a");
		link.href = window.URL.createObjectURL(imageAsBlob);
		link.download = "Image.png";
		link.click();
	}

	canvasImageTileset_MouseDown(event)
	{
		if (event.buttons == 0)
		{
			return;
		}
 
		var canvas = event.target;
		var canvasBounds = canvas.getBoundingClientRect();
 
		var clickPosInPixels = new Coords
		(
			event.clientX - canvasBounds.left, 
			event.clientY - canvasBounds.top
		);

		this.tileSelectedPosInTiles = clickPosInPixels.clone().divide
		(
			this.tileSizeInPixelsActual
		).floor();

		var d = document;
		var inputTileSelectedPosInTilesX =
			d.getElementById("inputTileSelectedPosInTilesX");
		var inputTileSelectedPosInTilesY =
			d.getElementById("inputTileSelectedPosInTilesY");

		inputTileSelectedPosInTilesX.value = this.tileSelectedPosInTiles.x;
		inputTileSelectedPosInTilesY.value = this.tileSelectedPosInTiles.y;

		var tileSelectedPosInPixels =
			this.tileSelectedPosInTiles.clone().multiply(this.tileSizeInPixelsActual);

		this.displayTileSelectedActualSize.clear();
		this.displayTileSelectedActualSize.drawImagePartial
		(
			this.displayImageTileset.canvas,
			tileSelectedPosInPixels, // posToDrawFrom,
			this.tileSizeInPixelsActual, // size
			new Coords(0, 0) // posToDrawTo
		);
		this.drawMagnified();
	}

	canvasMagnified_MouseDown(event)
	{
		this.canvasMagnified_MouseDownOrMoved(event);
	}
 
	canvasMagnified_MouseMoved(event)
	{
		this.canvasMagnified_MouseDownOrMoved(event);
	}

	canvasMagnified_MouseDownOrMoved(event)
	{
		if (event.buttons == 0)
		{
			return;
		}
 
		var canvas = event.target;
		var canvasBounds = canvas.getBoundingClientRect();
 
		var clickPosInPixels = new Coords
		(
			event.clientX - canvasBounds.left, 
			event.clientY - canvasBounds.top
		);

		var clickPosInCells = clickPosInPixels.clone().divide
		(
			this.cellSizeInPixels
		).floor();
 
		if (this.isErasing)
		{
			this.displayTileSelectedActualSize.clearPixel(clickPosInCells);

			this.drawMagnified();
		}
		else
		{
			var color = this.colorSelected; 

			this.displayTileSelectedActualSize.drawPixel
			(
				color, clickPosInCells
			);

			// Could call .drawMagnified(), but this may be faster,
			// and thus hopefully more responsive.

			var cellPosInPixels = clickPosInCells.clone().multiply
			(
				this.cellSizeInPixels
			);

			this.displayTileSelectedMagnified.drawRectangle
			(
				color,
				cellPosInPixels,
				this.cellSizeInPixels
			);
		}

		this.drawTileSelectedToTileset();
	}

	checkboxErase_Changed(checkboxErase)
	{
		this.isErasing = checkboxErase.checked;
	}
 
	inputFileToLoad_Changed(inputFileToLoad)
	{
		var fileToLoad = inputFileToLoad.files[0];
		if (fileToLoad != null)
		{
			if (fileToLoad.type.match("image.*") != null)
			{
				var fileReader = new FileReader();
				fileReader.onload = this.inputFileToLoad_Changed_Loaded.bind(this); 
				fileReader.readAsDataURL(fileToLoad);
			}
		}
	}
 
	inputFileToLoad_Changed_Loaded(fileLoadedEvent) 
	{
		var imageLoaded = document.createElement("img");
		imageLoaded.src = fileLoadedEvent.target.result;
 
		this.tileSizeInPixelsActual.x = imageLoaded.width;
		this.tileSizeInPixelsActual.y = imageLoaded.height;
 
		this.initialize();
 
		this.displayImageTileset.drawImage(imageLoaded);

		//this.displayActualSize.drawImage(imageLoaded);
		//this.displayMagnified.drawImageStretched(imageLoaded);
	} 
}
