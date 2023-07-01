
class Color
{
	constructor(componentsRGBA)
	{
		this.componentsRGBA = componentsRGBA;
		this.systemColor = "rgba(" + this.componentsRGBA.join(",") + ")";
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

	equals(other)
	{
		return (this.systemColor == other.systemColor);
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
