
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

		this.toolSelectedName = "Paint Pixel";
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
				Color.Instances()._All
			);
		}
		return Session._instance;
	}

	// Instance methods.

	colorSelect(colorToSelect)
	{
		this.colorSelected = colorToSelect;

		var d = document;

		var buttonColorSwatch = d.getElementById("buttonColorSwatch");
		buttonColorSwatch.style.backgroundColor =
			this.colorSelected.systemColor;

		var inputColorRed = d.getElementById("inputColorRed");
		var inputColorGreen = d.getElementById("inputColorGreen");
		var inputColorBlue = d.getElementById("inputColorBlue");
		var inputColorAlpha = d.getElementById("inputColorAlpha");

		var canvas = d.createElement("canvas");
		canvas.width = 1;
		canvas.height = 1;
		var g = canvas.getContext("2d");
		g.fillStyle = this.colorSelected.systemColor;
		g.fillRect(0, 0, 1, 1);
		var colorComponentsRGBA = g.getImageData(0, 0, 1, 1).data;

		inputColorRed.value = colorComponentsRGBA[0];
		inputColorGreen.value = colorComponentsRGBA[1];
		inputColorBlue.value = colorComponentsRGBA[2];
		inputColorAlpha.value = colorComponentsRGBA[3] / 255;
	}

	colorAddToPalette(colorToAdd)
	{
		var isColorInPalette = this.colors.some(x => x.equals(colorToAdd));
		if (isColorNotInPalette == false)
		{
			this.colors.push(colorToAdd);
			this.initializePalette();
		}
		var wasSuccessful = isColorNotInPalette;
		return wasSuccessful;
	}

	colorPaletteClear()
	{
		this.colors.length = 0;
		this.initializePalette();
	}

	colorPaletteReset()
	{
		this.colors = Session.colorsDefault();
		this.initializePalette();
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
				var pixelColor = new Color(pixelColorAsRGBA);
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
			tilePosInPixels, this.tileSizeInPixelsActual
		);

		this.displayImageTileset.drawImage
		(
			this.displayTileSelectedActualSize.canvas, tilePosInPixels
		);
	}
 
	initialize()
	{
		this.initializeForImageTileset();
		this.initializePalette();
		this.colorSelect(this.colors[0]);
	}

	initializeForImageTileset()
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

		var inputTileSizeInPixelsX = d.getElementById("inputTileSizeInPixelsX");
		var inputTileSizeInPixelsY = d.getElementById("inputTileSizeInPixelsY");
		var inputImageSizeInTilesX = d.getElementById("inputImageSizeInTilesX");
		var inputImageSizeInTilesY = d.getElementById("inputImageSizeInTilesY");

		inputTileSizeInPixelsX.value = this.tileSizeInPixelsActual.x;
		inputTileSizeInPixelsY.value = this.tileSizeInPixelsActual.y;
		inputImageSizeInTilesX.value = this.imageTilesetSizeInTiles.x;
		inputImageSizeInTilesY.value = this.imageTilesetSizeInTiles.y;

		var divImageTileset = d.getElementById("divImageTileset");
		divImageTileset.innerHTML = "";

		this.displayImageTileset = new Display(this.imageTilesetSizeInPixels);
		this.displayImageTileset.initialize(divImageTileset);
		var canvas = this.displayImageTileset.canvas;
		canvas.onmousedown = this.canvasImageTileset_MouseDown.bind(this);

		var divTileSelected = d.getElementById("divTileSelected");
		divTileSelected.innerHTML = "[none]";
	}

	initializeForTileSelected()
	{
		var d = document;

		var divTileSelected = d.getElementById("divTileSelected");
		divTileSelected.innerHTML = "";
 
		this.displayTileSelectedMagnified = new Display(this.tileSizeInPixelsMagnified);
		this.displayTileSelectedMagnified.initialize(divTileSelected);
		var canvas = this.displayTileSelectedMagnified.canvas;
		canvas.onmousedown = this.canvasMagnified_MouseDown.bind(this);
		canvas.onmousemove = this.canvasMagnified_MouseMoved.bind(this);

		this.displayTileSelectedActualSize = new Display(this.tileSizeInPixelsActual);
		this.displayTileSelectedActualSize.initialize(divTileSelected);
	}

	initializePalette()
	{ 
		var d = document;

		var divColorsPredefined = d.getElementById("divColorsPredefined");
		divColorsPredefined.innerHTML = "";
 
		var colorsPerRow = 16;

		for (var i = 0; i < this.colors.length; i++)
		{
			if (i > 0 && i % colorsPerRow == 0)
			{
				divColorsPredefined.appendChild(d.createElement("br"));
			}

			var color = this.colors[i];
			var buttonColor = d.createElement("button");
			buttonColor.color = color; 
			buttonColor.innerHTML = "&nbsp;&nbsp;";
			buttonColor.style.backgroundColor = color.systemColor;
			buttonColor.onclick = this.buttonColor_Clicked.bind(this);
			divColorsPredefined.appendChild(buttonColor);
		} 
	}

	resize(scaleFactor)
	{
		var d = document;

		var canvasTileset = this.displayImageTileset.canvas;
		var imageTilesetAsUrl = canvasTileset.toDataURL("image/png");

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

		this.initializeForImageTileset();

		var session = this;

		var imageTileset = d.createElement("img");
		imageTileset.onload = () =>
		{
			var displayImageTileset = session.displayImageTileset;
			if (scaleFactor == 1)
			{
				displayImageTileset.drawImage(imageTileset, new Coords(0, 0) );
			}
			else
			{
				displayImageTileset.drawImageStretched
				(
					imageTileset
				);
			}
		}
		imageTileset.src = imageTilesetAsUrl;

		if (this.displayTileSelectedActualSize != null)
		{
			var canvasTileSelectedActualSize = this.displayTileSelectedActualSize.canvas; 
			var imageActualSizeAsUrl = canvasTileSelectedActualSize.toDataURL("image/png");

			var imageActualSize = d.createElement("img");
			imageActualSize.onload = () =>
			{
				session.displayTileSelectedActualSize.drawImage(imageActualSize, 0, 0);
				session.drawMagnified();
			}
			imageActualSize.src = imageActualSizeAsUrl;
		}
	} 
 
	// ui events
 
	buttonColorSelectedAddToPalette_Clicked()
	{
		var wasColorAddSuccessful =
			this.colorAddToPalette(this.colorSelected);
		if (wasColorAddSuccessful == false)
		{
			alert("The selected color is already in the palette.");
		}
	} 

	buttonColor_Clicked(event)
	{
		var buttonColor = event.target;
		this.colorSelect(buttonColor.color);
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

	buttonPaletteClear_Clicked()
	{
		this.colorPaletteClear();
	}

	buttonPaletteExtract_Clicked()
	{
		var display = this.displayImageTileset;
		var size = display.sizeInPixels;
		var pixelPos = new Coords(0, 0);
		for (var y = 0; y < size.y; y++)
		{
			pixelPos.y = y;

			for (var x = 0; x < size.x; x++)
			{
				pixelPos.x = x;
				var pixelColor = display.colorAtPos(pixelPos);
				this.colorAddToPalette(pixelColor);
			}
		}
	}

	buttonPaletteReset_Clicked()
	{
		this.colorPaletteReset();
	}

	buttonResizeDouble_Clicked()
	{
		var d = document;

		var inputTileSizeInPixelsX = d.getElementById("inputTileSizeInPixelsX");
		var inputTileSizeInPixelsY = d.getElementById("inputTileSizeInPixelsY");

		var multiplier = 2;

		inputTileSizeInPixelsX.value *= multiplier;
		inputTileSizeInPixelsY.value *= multiplier;

		this.resize(multiplier);
	}

	buttonResizeHalf_Clicked()
	{
		var d = document;

		var inputTileSizeInPixelsX = d.getElementById("inputTileSizeInPixelsX");
		var inputTileSizeInPixelsY = d.getElementById("inputTileSizeInPixelsY");

		var multiplier = .5;

		inputTileSizeInPixelsX.value =
			Math.ceil(inputTileSizeInPixelsX.value * multiplier);
		inputTileSizeInPixelsY.value =
			Math.ceil(inputTileSizeInPixelsY.value * multiplier);

		this.resize(multiplier);
	}

	buttonSizeChange_Clicked()
	{
		this.resize(1);
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

		this.initializeForTileSelected();
 
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
 
		if (this.toolSelectedName == "Erase")
		{
			this.displayTileSelectedActualSize.clearPixel(clickPosInCells);

			this.drawMagnified();
		}
		else if (this.toolSelectedName == "ERASE ENTIRE TILE")
		{
			this.displayTileSelectedActualSize.clear();
			this.displayTileSelectedMagnified.clear();
			this.drawTileSelectedToTileset();
		}
		else if (this.toolSelectedName == "Extract Color")
		{
			var colorToSelect =
				this.displayTileSelectedActualSize.colorAtPos(clickPosInCells);
			this.colorSelect(colorToSelect);
		}
		else if (this.toolSelectedName == "Flood Fill")
		{
			this.floodFillWithColorStartingAtPos
			(
				this.colorSelected, clickPosInCells
			);
			this.drawMagnified();
		}
		else if (this.toolSelectedName == "PAINT ENTIRE TILE")
		{
			this.displayTileSelectedActualSize.fillWithColor(this.colorSelected);
			this.drawMagnified();
		}
		else if (this.toolSelectedName == "Paint Pixel")
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
				color, cellPosInPixels, this.cellSizeInPixels
			);
		}
		else
		{
			throw new Error("Unrecognized tool name: " + this.toolSelectedName);
		}

		this.drawTileSelectedToTileset();
	}
 
	floodFillWithColorStartingAtPos(colorToFillWith, pixelPosToStartAt)
	{
		var colorDifferenceTolerance = 0; 
		var display = this.displayTileSelectedActualSize;

		var imageSize = display.sizeInPixels;
		var imageSizeMinusOnes =
			imageSize.clone().subtract(new Coords(1, 1));
 
		var colorToFillOverRGBA =
			display.colorAtPos(pixelPosToStartAt).componentsRGBA;
 
		var pixelPos = pixelPosToStartAt.clone();
		var pixelIndexStart = pixelPos.y * imageSize.x + pixelPos.x;
		var pixelIndicesToTest = [ pixelIndexStart ];
		var pixelIndicesAlreadyTested = [];
 
		var neighborOffsets =
		[
			new Coords(-1, 0),
			new Coords(1, 0),
			new Coords(0, -1),
			new Coords(0, 1)
		];
 
		while (pixelIndicesToTest.length > 0)
		{
			var pixelIndex = pixelIndicesToTest[0];
			pixelIndicesToTest.splice(0, 1);
			pixelIndicesAlreadyTested[pixelIndex] = pixelIndex;

			pixelPos.x = pixelIndex % imageSize.x;
			pixelPos.y = Math.floor(pixelIndex / imageSize.x);

			var pixelColor = display.colorAtPos(pixelPos);
			var pixelRGBA = pixelColor.componentsRGBA;
			var pixelDifference = Math.abs
			(
				pixelRGBA[0] - colorToFillOverRGBA[0]
				+ pixelRGBA[1] - colorToFillOverRGBA[1]
				+ pixelRGBA[2] - colorToFillOverRGBA[2]
				+ (pixelRGBA[3] - colorToFillOverRGBA[3]) * 255
			);

			if (pixelDifference <= colorDifferenceTolerance)
			{
				display.drawPixel(colorToFillWith, pixelPos);

				var neighborPos = new Coords();

				for (var n = 0; n < neighborOffsets.length; n++)
				{
					var neighborOffset = neighborOffsets[n];

					neighborPos.overwriteWith
					(
						pixelPos
					).add
					(
						neighborOffset
					);
 
					if (neighborPos.isInRange(imageSize))
					{
						var neighborIndex =
							neighborPos.y * imageSize.x + neighborPos.x;
						var isPixelIndexAlreadyUnderConsideration =
						(
							pixelIndicesToTest.indexOf(neighborIndex) >= 0
							|| pixelIndicesAlreadyTested[neighborIndex] != null
						)
						if (isPixelIndexAlreadyUnderConsideration == false)
						{
							pixelIndicesToTest.push(neighborIndex);
						}
					}
				}
			}
		}
	}

	inputFileToLoad_Changed(inputFileToLoad)
	{
		var fileToLoad = inputFileToLoad.files[0];
		if (fileToLoad != null)
		{
			if (fileToLoad.type.match("image.*") != null)
			{
				var fileReader = new FileReader();
				fileReader.onload =
					this.inputFileToLoad_Changed_FileLoaded.bind(this); 
				fileReader.readAsDataURL(fileToLoad);
			}
		}
	}
 
	inputFileToLoad_Changed_FileLoaded(fileLoadedEvent) 
	{
		var imageLoaded = document.createElement("img");
		imageLoaded.onload =
			this.inputFileToLoad_Changed_FileLoaded_ImgLoaded.bind(this);
		imageLoaded.src = fileLoadedEvent.target.result;
	}

	inputFileToLoad_Changed_FileLoaded_ImgLoaded(imgLoadedEvent)
	{
		var imageLoaded = imgLoadedEvent.target;

		this.imageTilesetSizeInPixels.x = imageLoaded.width;
		this.imageTilesetSizeInPixels.y = imageLoaded.height;

		this.tileSizeInPixelsActual.x = 16;
		this.tileSizeInPixelsActual.y = 16;
 
		this.imageTilesetSizeInTiles.overwriteWith
		(
			this.imageTilesetSizeInPixels
		).divide
		(
			this.tileSizeInPixelsActual
		);
 
		this.initializeForImageTileset();
 
		this.displayImageTileset.drawImage(imageLoaded);
	}

	selectTool_Changed(selectTool)
	{
		this.toolSelectedName = selectTool.value;
	}
}
