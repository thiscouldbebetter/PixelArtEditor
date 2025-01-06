
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

		this.gridColor = Color.Instances().Cyan;

		this.imageTilesetSizeInPixels =
			this.imageTilesetSizeInTiles.clone().multiply(this.tileSizeInPixelsActual);

		this.toolSelectedName = "Paint Pixel";

		this.canvasesForSnapshots = [];
		this.canvasSaved = null;
	}

	static Instance()
	{
		if (Session._instance == null)
		{
			var sizeInTiles = new Coords(4, 4);
			var tileSizeInPixels = new Coords(16, 16);
			var tileSelectedPosInTiles = Coords.zeroes();
			var colors = Color.Instances().paletteDefault();

			Session._instance = new Session
			(
				sizeInTiles, // imageTilesetSizeInTiles
				tileSizeInPixels, // tileSizeInPixelsActual
				tileSelectedPosInTiles,
				16, // magnificationFactor
				colors
			);
		}
		return Session._instance;
	}

	// Instance methods.

	// Colors.

	colorSelect(colorToSelect)
	{
		this.colorSelected = colorToSelect;

		var d = document;

		var buttonColorSwatch = d.getElementById("buttonColorSwatch");
		buttonColorSwatch.style.backgroundColor =
			this.colorSelected.systemColor();

		var inputColorRed = d.getElementById("inputColorRed");
		var inputColorGreen = d.getElementById("inputColorGreen");
		var inputColorBlue = d.getElementById("inputColorBlue");
		var inputColorAlpha = d.getElementById("inputColorAlpha");

		var canvas = d.createElement("canvas");
		canvas.width = 1;
		canvas.height = 1;
		var g = canvas.getContext("2d");
		g.fillStyle = this.colorSelected.systemColor();
		g.fillRect(0, 0, 1, 1);
		var colorComponentsRGBA = g.getImageData(0, 0, 1, 1).data;

		inputColorRed.value = colorComponentsRGBA[0];
		inputColorGreen.value = colorComponentsRGBA[1];
		inputColorBlue.value = colorComponentsRGBA[2];
		inputColorAlpha.value = colorComponentsRGBA[3] / 255;
	}

	colorAddToPalette(colorToAdd)
	{
		var colorIsInPalette =
			this.colors.some(x => x.equals(colorToAdd) );

		if (colorIsInPalette == false)
		{
			this.colors.push(colorToAdd);
			this.initializePalette();
		}

		var wasSuccessful =
			(colorIsInPalette == false);

		return wasSuccessful;
	}

	colorPaletteClear()
	{
		this.colors.length = 0;
		this.initializePalette();
	}

	colorPaletteReset()
	{
		this.colors = Color.Instances().paletteDefault();
		this.initializePalette();
	}

	// Draw.

	drawMagnified()
	{
		this.displayTileSelectedMagnified.clear();

		var imageSizeActual =
			this.displayTileSelectedActualSize.sizeInPixels;

		var pixelPos = Coords.zeroes();
		var drawPos = Coords.zeroes();
		var drawSize =
			new Coords(1, 1).multiplyScalar(this.magnificationFactor);

		var displayActualSize = this.displayTileSelectedActualSize;
		var displayMagnified = this.displayTileSelectedMagnified;

		var gridColor = this.gridColor;

		for (var y = 0; y < imageSizeActual.y; y++)
		{
			pixelPos.y = y;
			for (var x = 0; x < imageSizeActual.x; x++)
			{
				pixelPos.x = x;

				var pixelColorAsRGBA =
					displayActualSize.pixelAtPosGetAsRGBA(pixelPos);

				var pixelColor = new Color(pixelColorAsRGBA);

				drawPos
					.overwriteWith(pixelPos)
					.multiplyScalar(this.magnificationFactor);

				displayMagnified.drawRectangleOfSizeAtPosWithColorsFillAndBorder
				(
					drawSize, drawPos, pixelColor, gridColor
				);
			}
		}
	}

	drawTileSelectedToTileset()
	{
		var tilePosInPixels =
			this.tileSelectedPosInTiles
				.clone()
				.multiply(this.tileSizeInPixelsActual);

		this.displayImageTileset.clearRectangle
		(
			tilePosInPixels, this.tileSizeInPixelsActual
		);

		this.displayImageTileset.drawImage
		(
			this.displayTileSelectedActualSize.canvas,
			tilePosInPixels
		);

		/*
		this.displayImageTileset.clear().drawRectangleOfSizeAtPosWithColorsFillAndBorder
		(
			this.tileSizeInPixelsActual,
			tilePosInPixels,
			null, // colorFill
			Color.Instances().Cyan
		);
		*/
	}

	// Initialization.

	initialize()
	{
		this.initializeForImageTileset();
		this.initializeKeyboardShortcuts();
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
		canvas.onmousedown =
			(event) =>
				UiEventHandler
					.Instance()
					.canvasImageTileset_MouseDown(event);

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
		var uiEventHandler = UiEventHandler.Instance();
		canvas.onmousedown = (event) =>
			uiEventHandler.canvasMagnified_MouseDown(event);
		canvas.onmousemove = (event) =>
			uiEventHandler.canvasMagnified_MouseMoved(event);
		canvas.onmouseup = (event) =>
			uiEventHandler.canvasMagnified_MouseUp(event);

		// Touchscreen events.
		canvas.ontouchstart = (event) =>
			uiEventHandler.canvasMagnified_MouseDown(event);
		canvas.ontouchmove = (event) =>
			uiEventHandler.canvasMagnified_MouseMoved(event);
		canvas.ontouchend = (event) =>
			uiEventHandler.canvasMagnified_MouseUp(event);

		this.displayTileSelectedActualSize = new Display(this.tileSizeInPixelsActual);
		this.displayTileSelectedActualSize.initialize(divTileSelected);
	}

	initializeKeyboardShortcuts()
	{
		document.body.onkeydown = this.body_KeyDown;
	}

	initializePalette()
	{ 
		var d = document;

		var divColorsPredefined =
			d.getElementById("divColorsPredefined");
		divColorsPredefined.innerHTML = "";
 
		var colorsPerRow = 16;

		for (var i = 0; i < this.colors.length; i++)
		{
			if (i > 0 && i % colorsPerRow == 0)
			{
				divColorsPredefined
					.appendChild(d.createElement("br") );
			}

			var color = this.colors[i];
			var buttonColor = d.createElement("button");
			buttonColor.color = color; 
			//buttonColor.innerHTML = "&nbsp;&nbsp;";
			buttonColor.style.backgroundColor =
				color.systemColor();

			var buttonSize =
				new Coords(1, 2).multiplyScalar(8);
			buttonColor.style.width = buttonSize.x + "px";
			buttonColor.style.height = buttonSize.y + "px";
			buttonColor.onclick = (event) =>
				UiEventHandler.Instance().buttonColor_Clicked(event);
			divColorsPredefined.appendChild(buttonColor);
		} 
	}

	// Flip, shift and rotate.

	flipOrRotate(pixelPosAfterSetFromBeforeAndSize)
	{
		this.snapshotForUndoSave();

		var displayBefore = this.displayTileSelectedActualSize;

		var canvasSaved = displayBefore.toCanvas();

		var displayAfter = displayBefore.clone();

		displayAfter.clear();

		var pixelPosBefore = new Coords();
		var pixelPosAfter = new Coords();

		var sizeInPixels = this.tileSizeInPixelsActual;

		for (var y = 0; y < sizeInPixels.y; y++)
		{
			pixelPosBefore.y = y;

			for (var x = 0; x < sizeInPixels.x; x++)
			{
				pixelPosBefore.x = x;

				var pixelColor =
					displayBefore.pixelAtPosGetAsColor(pixelPosBefore);

				pixelPosAfterSetFromBeforeAndSize
				(
					pixelPosAfter, pixelPosBefore, sizeInPixels
				);

				displayAfter.drawPixel(pixelColor, pixelPosAfter);
			}
		}

		var canvasAfter = displayAfter.toCanvas();
		displayBefore.clear().drawImage(canvasAfter, Coords.zeroes() );

		this.drawTileSelectedToTileset();
		this.drawMagnified();
	}

	flipHorizontal()
	{
		var pixelPosAfterSetFromBeforeAndSize =
			(pixelPosAfter, pixelPosBefore, sizeInPixels) =>
				pixelPosAfter.overwriteWithXy
				(
					sizeInPixels.x - 1 - pixelPosBefore.x,
					pixelPosBefore.y
				);

		this.flipOrRotate(pixelPosAfterSetFromBeforeAndSize);
	}

	flipVertical()
	{
		var pixelPosAfterSetFromBeforeAndSize =
			(pixelPosAfter, pixelPosBefore, sizeInPixels) =>
				pixelPosAfter.overwriteWithXy
				(
					pixelPosBefore.x,
					sizeInPixels.y - 1 - pixelPosBefore.y
				);

		this.flipOrRotate(pixelPosAfterSetFromBeforeAndSize);
	}

	rotateRight()
	{
		this.snapshotForUndoSave();

		var pixelPosAfterSetFromBeforeAndSize =
			(pixelPosAfter, pixelPosBefore, sizeInPixels) =>
				pixelPosAfter.overwriteWithXy
				(
					sizeInPixels.y - 1 - pixelPosBefore.y,
					pixelPosBefore.x
				);

		this.flipOrRotate(pixelPosAfterSetFromBeforeAndSize);
	}

	shiftPixelsInDirection(directionToShift)
	{
		this.snapshotForUndoSave();

		var display = this.displayTileSelectedActualSize;

		var canvasSaved = display.toCanvas();

		display.clear();
		display.drawImage(canvasSaved, directionToShift);

		this.drawTileSelectedToTileset();
		this.drawMagnified();
	}

	// Size.

	resize(scaleFactor)
	{
		var d = document;

		var canvasTileset = this.displayImageTileset.canvas;
		var imageTilesetAsUrl = canvasTileset.toDataURL("image/png");

		var inputTileSizeInPixelsX =
			d.getElementById("inputTileSizeInPixelsX");
		var inputTileSizeInPixelsY =
			d.getElementById("inputTileSizeInPixelsY");
		var inputImageSizeInTilesX =
			d.getElementById("inputImageSizeInTilesX");
		var inputImageSizeInTilesY =
			d.getElementById("inputImageSizeInTilesY");
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
				displayImageTileset.drawImage(imageTileset, Coords.zeroes() );
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
				session.displayTileSelectedActualSize.drawImage(imageActualSize, Coords.zeroes() );
				session.drawMagnified();
			}
			imageActualSize.src = imageActualSizeAsUrl;
		}
	}

	// Tools.

	pixelAtPosClear(posInCells)
	{
		this.displayTileSelectedActualSize.clearPixel(posInCells);

		this.drawMagnified();
	}

	floodFillWithColorStartingAtPos(colorToFillWith, pixelPosToStartAt)
	{
		this.snapshotForUndoSave();

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

	pixelAtPosSetToColor(posInCells, color)
	{
		this.displayTileSelectedActualSize.drawPixel
		(
			color, posInCells
		);

		// Could call .drawMagnified(), but this may be faster,
		// and thus hopefully more responsive.

		var cellPosInPixels =
			posInCells
				.clone()
				.multiply(this.cellSizeInPixels);

		this.displayTileSelectedMagnified.drawRectangleOfSizeAtPosWithColorsFillAndBorder
		(
			this.cellSizeInPixels, cellPosInPixels, color, this.gridColor
		);
	}

	// Copy/Paste.

	tileSelectedCopy()
	{
		if (this.displayTileSelectedActualSize != null)
		{
			this.canvasSaved =
				this.displayTileSelectedActualSize.toCanvas();
		}
	}

	tileSelectedPaste()
	{
		if (this.displayTileSelectedActualSize != null)
		{
			if (this.canvasSaved != null)
			{
				this.displayTileSelectedActualSize
					.drawImage(this.canvasSaved);
				this.drawMagnified();
				this.drawTileSelectedToTileset();
			}
		}
	}

	// Undo.

	snapshotForUndoSave()
	{
		var display = this.displayTileSelectedActualSize;

		var canvasSnapshot = display.toCanvas();

		this.canvasesForSnapshots.splice(0, 0, canvasSnapshot);

		UiEventHandler.Instance()
			.buttonUndoClearSnapshotsCountUpdate();
	}

	snapshotsForUndoClear()
	{
		this.canvasesForSnapshots.length = 0;
		this.snapshotForUndoSave();
		UiEventHandler.Instance()
			.buttonUndoClearSnapshotsCountUpdate();
	}

	toolSelectedNameSet(value)
	{
		this.toolSelectedName = value;
		return this;
	}

	undo()
	{
		if (this.canvasesForSnapshots.length > 1)
		{
			this.canvasesForSnapshots.splice(0, 1);
			var canvasSnapshot = this.canvasesForSnapshots[0];

			var display = this.displayTileSelectedActualSize;

			display.clear();
			display.drawImage(canvasSnapshot, Coords.zeroes() );

			this.drawTileSelectedToTileset();
			this.drawMagnified();

			this.buttonUndoClearSnapshotsCountUpdate();
		}
	}
}