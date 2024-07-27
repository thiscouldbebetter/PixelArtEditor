
class UiEventHandler
{
	static Instance()
	{
		if (this._instance == null)
		{
			this._instance = new UiEventHandler();
		}
		return this._instance;
	}

	body_KeyDown(event)
	{
		var key = event.key;
		var keyAsInteger = parseInt(key);
		if (isNaN(keyAsInteger) == false)
		{
			keyAsInteger--;

			var d = document;
			var selectTool = d.getElementById("selectTool");
			var tools = selectTool.options;
			if (keyAsInteger < tools.length)
			{
				var toolToSelect = tools[keyAsInteger];
				selectTool.value = toolToSelect.value;
				var session = Session.Instance();
				session.toolSelectedName = toolToSelect;
			}
		}
	}

	buttonColorSelectedAddToPalette_Clicked()
	{
		var session = Session.Instance();
		var wasColorAddSuccessful =
			session.colorAddToPalette(session.colorSelected);
		if (wasColorAddSuccessful == false)
		{
			alert("The selected color is already in the palette.");
		}
	} 

	buttonColor_Clicked(event)
	{
		var buttonColor = event.target;
		var session = Session.Instance();
		session.colorSelect(buttonColor.color);
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
		var session = Session.Instance();
		session.colorSelect(colorFromRGBA);
	}

	buttonFlipHorizontal_Clicked()
	{
		Session.Instance().flipHorizontal();
	}

	buttonFlipVertical_Clicked()
	{
		Session.Instance().flipVertical();
	}

	buttonPaletteClear_Clicked()
	{
		Session.Instance().colorPaletteClear();
	}

	buttonPaletteExtract_Clicked()
	{
		var session = Session.Instance();
		var display = session.displayImageTileset;
		var size = display.sizeInPixels;
		var pixelPos = Coords.zeroes();
		for (var y = 0; y < size.y; y++)
		{
			pixelPos.y = y;

			for (var x = 0; x < size.x; x++)
			{
				pixelPos.x = x;
				var pixelColor = display.colorAtPos(pixelPos);
				session.colorAddToPalette(pixelColor);
			}
		}
	}

	buttonPaletteReset_Clicked()
	{
		Session.Instance().colorPaletteReset();
	}

	buttonResizeDouble_Clicked()
	{
		var d = document;

		var inputTileSizeInPixelsX =
			d.getElementById("inputTileSizeInPixelsX");
		var inputTileSizeInPixelsY =
			d.getElementById("inputTileSizeInPixelsY");

		var multiplier = 2;

		inputTileSizeInPixelsX.value *= multiplier;
		inputTileSizeInPixelsY.value *= multiplier;

		Session.Instance().resize(multiplier);
	}

	buttonResizeHalf_Clicked()
	{
		var d = document;

		var inputTileSizeInPixelsX =
			d.getElementById("inputTileSizeInPixelsX");
		var inputTileSizeInPixelsY =
			d.getElementById("inputTileSizeInPixelsY");

		var multiplier = .5;

		inputTileSizeInPixelsX.value =
			Math.ceil(inputTileSizeInPixelsX.value * multiplier);
		inputTileSizeInPixelsY.value =
			Math.ceil(inputTileSizeInPixelsY.value * multiplier);

		Session.Instance().resize(multiplier);
	}

	buttonRotateRight_Clicked()
	{
		Session.Instance().rotateRight();
	}

	buttonSizeChange_Clicked()
	{
		Session.Instance().resize(1);
	}
 
	buttonSave_Clicked()
	{
		var session = Session.Instance();

		var canvas = session.displayImageTileset.canvas;
 
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

	buttonShiftPixelsDown_Clicked()
	{
		Session.Instance().shiftPixelsInDirection(new Coords(0, 1) );
	}

	buttonShiftPixelsLeft_Clicked()
	{
		Session.Instance().shiftPixelsInDirection(new Coords(-1, 0) );
	}

	buttonShiftPixelsRight_Clicked()
	{
		Session.Instance().shiftPixelsInDirection(new Coords(1, 0) );
	}

	buttonShiftPixelsUp_Clicked()
	{
		Session.Instance().shiftPixelsInDirection(new Coords(0, -1) );
	}

	buttonTileSelectedCopy_Clicked()
	{
		Session.Instance().tileSelectedCopy();
	}

	buttonTileSelectedPaste_Clicked()
	{
		Session.Instance().tileSelectedPaste();
	}

	buttonUndo_Clicked()
	{
		Session.Instance().undo();
	}

	buttonUndoClearSnapshots_Clicked()
	{
		Session.Instance().snapshotsForUndoClear();
	}

	buttonUndoClearSnapshotsCountUpdate()
	{
		var d = document;
		var buttonUndoClearSnapshots =
			d.getElementById("buttonUndoClearSnapshots");
		var buttonText = buttonUndoClearSnapshots.innerText;
		var parts = buttonText.split(": ").slice(0, 1);
		var session = Session.Instance();
		var count = session.canvasesForSnapshots.length - 1;
		parts.push("" + count);
		buttonText = parts.join(": ");
		buttonUndoClearSnapshots.innerText = buttonText;
	}

	canvasImageTileset_MouseDown(event)
	{
		if (event.buttons == 0)
		{
			return;
		}

		var session = Session.Instance();

		session.initializeForTileSelected();

		var canvas = event.target;
		var canvasBounds = canvas.getBoundingClientRect();

		var clickPosInPixels = new Coords
		(
			event.clientX - canvasBounds.left, 
			event.clientY - canvasBounds.top
		);

		session.tileSelectedPosInTiles =
			clickPosInPixels
				.clone()
				.divide(session.tileSizeInPixelsActual)
				.floor();

		var d = document;
		var inputTileSelectedPosInTilesX =
			d.getElementById("inputTileSelectedPosInTilesX");
		var inputTileSelectedPosInTilesY =
			d.getElementById("inputTileSelectedPosInTilesY");

		inputTileSelectedPosInTilesX.value =
			session.tileSelectedPosInTiles.x;
		inputTileSelectedPosInTilesY.value =
			session.tileSelectedPosInTiles.y;

		var tileSelectedPosInPixels =
			session.tileSelectedPosInTiles
				.clone()
				.multiply(session.tileSizeInPixelsActual);

		session.displayTileSelectedActualSize.clear();
		session.displayTileSelectedActualSize.drawImagePartial
		(
			session.displayImageTileset.canvas,
			tileSelectedPosInPixels, // posToDrawFrom,
			session.tileSizeInPixelsActual, // size
			Coords.zeroes() // posToDrawTo
		);
		session.drawMagnified();

		session.snapshotsForUndoClear();
	}

	canvasMagnified_MouseDown(event)
	{
		this.canvasMagnified_MouseDownOrMoved(event);
	}
 
	canvasMagnified_MouseMoved(event)
	{
		this.canvasMagnified_MouseDownOrMoved(event);
	}

	canvasMagnified_MouseUp(event)
	{
		Session.Instance().snapshotForUndoSave();
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

		var session = Session.Instance();

		var clickPosInCells = clickPosInPixels.clone().divide
		(
			session.cellSizeInPixels
		).floor();
 
		var toolSelectedName = session.toolSelectedName;
		if (toolSelectedName == "Erase")
		{
			session.pixelAtPosClear(clickPosInCells);
		}
		else if (toolSelectedName == "ERASE ENTIRE TILE")
		{
			session.displayTileSelectedActualSize.clear();
			session.displayTileSelectedMagnified.clear();
			session.drawTileSelectedToTileset();
		}
		else if (toolSelectedName == "Extract Color")
		{
			var colorToSelect =
				session.displayTileSelectedActualSize
					.colorAtPos(clickPosInCells);
			session.colorSelect(colorToSelect);
		}
		else if (toolSelectedName == "Flood Fill")
		{
			session.floodFillWithColorStartingAtPos
			(
				session.colorSelected, clickPosInCells
			);
			session.drawMagnified();
		}
		else if (toolSelectedName == "PAINT ENTIRE TILE")
		{
			session.displayTileSelectedActualSize
				.fillWithColor(session.colorSelected);
			session.drawMagnified();
		}
		else if (toolSelectedName == "Paint Pixel")
		{
			session.pixelAtPosSetToColor
			(
				clickPosInCells, session.colorSelected
			);
		}
		else
		{
			throw new Error
			(
				"Unrecognized tool name: " + toolSelectedName
			);
		}

		session.drawTileSelectedToTileset();
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

		var session = Session.Instance();

		session.imageTilesetSizeInPixels.x =
			imageLoaded.width;
		session.imageTilesetSizeInPixels.y =
			imageLoaded.height;

		session.tileSizeInPixelsActual.x = 16;
		session.tileSizeInPixelsActual.y = 16;
 
		session.imageTilesetSizeInTiles.overwriteWith
		(
			session.imageTilesetSizeInPixels
		).divide
		(
			session.tileSizeInPixelsActual
		);
 
		session.initializeForImageTileset();
 
		session.displayImageTileset.drawImage(imageLoaded);
	}

	selectTool_Changed(selectTool)
	{
		var session = Session.Instance();
		session.toolSelectedName = selectTool.value;
	}
}
