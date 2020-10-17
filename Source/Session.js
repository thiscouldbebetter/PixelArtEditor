
class Session
{
	constructor(imageSizeInPixelsActual, magnificationFactor, colors)
	{
		this.imageSizeInPixelsActual = imageSizeInPixelsActual;
		this.magnificationFactor = magnificationFactor;
		this.colors = colors;

		this.isErasing = false;
	}

	static Instance()
	{
		if (Session._instance == null)
		{
			Session._instance = new Session
			(
				new Coords(16, 16), // imageSizeInPixelsActual
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
		this.imageSizeInPixelsMagnified = this.imageSizeInPixelsActual.clone().multiplyScalar
		(
			this.magnificationFactor
		);
 
		this.cellSizeInPixels = new Coords(1, 1).multiplyScalar
		(
			this.magnificationFactor
		);
   
		var d = document;
    
		var divImages = d.getElementById("divImages");
		divImages.innerHTML = "";
 
		this.displayMagnified = new Display(this.imageSizeInPixelsMagnified);
		this.displayMagnified.initialize(divImages);
		this.displayMagnified.canvas.onmousemove = 
			this.canvasMagnified_MouseMoved.bind(this);

		this.displayActualSize = new Display(this.imageSizeInPixelsActual);
		this.displayActualSize.initialize(divImages);

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
		this.displayMagnified.clear();

		var imageSizeActual = this.displayActualSize.sizeInPixels;

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
					this.displayActualSize.getPixelAtPosAsRGBA(pixelPos);
				var pixelColor =
					"rgba(" + pixelColorAsRGBA.join(",") + ")";
				drawPos.overwriteWith(pixelPos).multiplyScalar(this.magnificationFactor);
				this.displayMagnified.drawRectangle
				(
					pixelColor, drawPos, drawSize
				);
			}
		}
	}
 
	// ui events

	buttonClear_Clicked()
	{
		this.displayActualSize.clear();
		this.displayMagnified.clear();
	}
 
	buttonFlood_Clicked()
	{
		this.displayActualSize.fillWithColor(this.colorSelected);
		this.drawMagnified();
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

		var canvasActualSize = this.displayActualSize.canvas; 
		var imageActualSizeAsUrl = canvasActualSize.toDataURL("image/png");
		var imageActualSize = d.createElement("img");

		var canvasMagnified = this.displayMagnified.canvas; 
		var imageMagnifiedAsUrl = canvasMagnified.toDataURL("image/png");
		var imageMagnified = d.createElement("img");

		var inputSizeX = d.getElementById("inputSizeX");
		var inputSizeY = d.getElementById("inputSizeY");
		var inputMagnificationFactory =
			d.getElementById("inputMagnificationFactor");

		this.imageSizeInPixelsActual.x = parseInt(inputSizeX.value);
		this.imageSizeInPixelsActual.y = parseInt(inputSizeY.value);
		this.magnificationFactor = parseFloat(inputMagnificationFactory.value);

		this.initialize();

		var session = this;

		imageActualSize.onload = () =>
		{
			session.displayActualSize.drawImage(imageActualSize, 0, 0);
			session.drawMagnified();
		}

		imageActualSize.src = imageActualSizeAsUrl;

	} 
 
	buttonSave_Clicked()
	{
		var canvas = this.displayActualSize.canvas;
 
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
 
	canvasMagnified_MouseMoved(event)
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
			this.displayActualSize.clearPixel(clickPosInCells);

			this.drawMagnified();
		}
		else
		{
			var color = this.colorSelected; 

			this.displayActualSize.drawPixel
			(
				color, clickPosInCells
			);

			// Could call .drawMagnified(), but this may be faster,
			// and thus hopefully more responsive.

			var cellPosInPixels = clickPosInCells.clone().multiply
			(
				this.cellSizeInPixels
			);

			this.displayMagnified.drawRectangle
			(
				color,
				cellPosInPixels,
				this.cellSizeInPixels
			);
		}
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
 
		this.imageSizeInPixelsActual.x = imageLoaded.width;
		this.imageSizeInPixelsActual.y = imageLoaded.height;
 
		this.initialize();
 
		this.displayActualSize.drawImage(imageLoaded);
		this.displayMagnified.drawImageStretched(imageLoaded);
	} 
}
