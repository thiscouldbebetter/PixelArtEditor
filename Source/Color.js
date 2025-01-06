
class Color
{
	constructor(componentsRGBA)
	{
		this.componentsRGBA = componentsRGBA;
	}

	static Instances()
	{
		if (Color._instances == null)
		{
			Color._instances = new Color_Instances();
		}
		return Color._instances;
	}

	static byName(name)
	{
		return Color.Instances().byName(name)
	}

	static fromComponentsRgba(componentsRgba)
	{
		return new Color(componentsRgba);
	}

	cacheClear()
	{
		this._systemColor = null;
	}

	componentBlue()
	{
		return this.componentsRGBA[2];
	}

	componentBlueSet(value)
	{
		this.componentsRGBA[2] = value;
		return this;
	}

	componentGreen()
	{
		return this.componentsRGBA[1];
	}

	componentGreenSet(value)
	{
		this.componentsRGBA[1] = value;
		return this;
	}

	componentRed()
	{
		return this.componentsRGBA[0];
	}

	componentRedSet(value)
	{
		this.componentsRGBA[0] = value;
		return this;
	}

	darken()
	{
		alert("Not yet implemented!");
	}

	desaturate()
	{
		alert("Not yet implemented!");
	}

	equals(other)
	{
		return (this.systemColor() == other.systemColor() );
	}

	lighten()
	{
		alert("Not yet implemented!");
	}

	luminanceAsFraction()
	{
		var sumOfComponents = this.sumOfComponents();

		var luminance = sumOfComponents / (3 * 255);

		return luminance;
	}

	luminanceAsFractionSet(value)
	{
		var sumOfComponents = this.sumOfComponents();

		var red = this.componentRed() / sumOfComponents;
		var green = this.componentGreen() / sumOfComponents;
		var blue = this.componentBlue() / sumOfComponents;

		var componentCount = 3;
		var componentMax = 255;
		red *= componentMax * componentCount;
		green *= componentMax * componentCount;
		blue *= componentMax * componentCount;

		this.componentRedSet(red);
		this.componentGreenSet(green);
		this.componentBlueSet(blue);

		this.normalize();

		this.cacheClear();

		return this;
	}

	multiply(multiplier)
	{
		this.componentRedSet(this.componentRed() * multiplier);
		this.componentGreenSet(this.componentGreen() * multiplier);
		this.componentBlueSet(this.componentRed() * multiplier);
		this.normalize();
		return this;
	}

	normalize()
	{
		for (var i = 0; i < 3; i++)
		{
			var component = this.componentsRGBA[i];
			if (component < 0)
			{
				component = 0;
			}
			else if (component > 255)
			{
				component = 255;
			}
			component = Math.round(component);
			this.componentsRGBA[i] = component;
		}

		return this;
	}

	saturate()
	{
		alert("Not yet implemented!");
	}

	sumOfComponents()
	{
		var sumOfComponents =
			this.componentRed()
			+ this.componentGreen()
			+ this.componentBlue();

		return sumOfComponents;
	}

	systemColor()
	{
		if (this._systemColor == null)
		{
			this._systemColor =
				"rgba(" + this.componentsRGBA.join(",") + ")";
		}

		return this._systemColor;
	}
}

class Color_Instances
{
	constructor()
	{
		this.Black = new Color([0, 0, 0, 1]);
		this.GrayDark = new Color([64, 64, 64, 1]);
		this.Gray = new Color([128, 128, 128, 1]);
		this.GrayLight = new Color([192, 192, 192, 1]);
		this.White = new Color([255, 255, 255, 1]);

		this.Red = new Color([255, 0, 0, 1]);
		this.Orange = new Color([255, 128, 0, 1]);
		this.Yellow = new Color([255, 255, 0, 1]);
		this.YellowGreen = new Color([192, 255, 0, 1]);
		this.Green = new Color([0, 255, 0, 1]);
		this.Cyan = new Color([0, 255, 255, 1]);
		this.Blue = new Color([0, 0, 255, 1]);
		this.Violet = new Color([255, 0, 255, 1]);

		this.RedDark = new Color([128, 0, 0, 1]);
		this.Brown = new Color([128, 64, 0, 1]);
		this.Bronze = new Color([128, 128, 0, 1]);
		this.GreenDark = new Color([0, 128, 0, 1]);
		this.CyanDark = new Color([0, 128, 128, 1]);
		this.BlueDark = new Color([0, 0, 128, 1]);
		this.VioletDark = new Color([128, 0, 128, 1]);

		this.Pink = new Color([255, 192, 192, 1]);
		this.Tan = new Color([224, 192, 128, 1]);
		this.Cream = new Color([255, 255, 192, 1]);

		this._All =
		[
			this.Black,
			this.GrayDark,
			this.Gray,
			this.GrayLight,
			this.White,

			this.Red,
			this.Orange,
			this.Yellow,
			this.YellowGreen,
			this.Green,
			this.Cyan,
			this.Blue,
			this.Violet,

			this.RedDark,
			this.Brown,
			this.Bronze,
			this.GreenDark,
			this.CyanDark,
			this.BlueDark,

			this.Pink,
			this.Tan,
			this.Cream,
		];
	}

	byName(name)
	{
		return this[name];
	}

	paletteDefault()
	{
		var colors = [];

		var rowMultipliersRgb =
		[
			[1, 1, 1], // gray
			[1, 0, 0], // red
			[1, .5, 0], // orange
			[1, 1, 0], // yellow,
			[0, 1, 0], // green
			[0, 1, 1], // cyan
			[0, 0, 1], // blue
			[1, 0, 1], // violet
		];

		var shadesPerRow = 16;
		var componentMax = 255;

		for (var r = 0; r < rowMultipliersRgb.length; r++)
		{
			var rowMultiplierRgb = rowMultipliersRgb[r];
			for (var i = 0; i < shadesPerRow; i++)
			{
				var componentStep = i * componentMax / (shadesPerRow - 1);

				var red = Math.round(componentStep * rowMultiplierRgb[0]);
				var green = Math.round(componentStep * rowMultiplierRgb[1]);
				var blue = Math.round(componentStep * rowMultiplierRgb[2]);

				var colorComponentsRgba = [red, green, blue, 1];
				var color = new Color(colorComponentsRgba);
				colors.push(color);
			}
		}

		return colors;
	}
}
