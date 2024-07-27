
class Coords
{
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
	}

	static zeroes()
	{
		return new Coords(0, 0);
	}

	add(other)
	{
		this.x += other.x;
		this.y += other.y;
		return this;
	}

	clone()
	{
		return new Coords(this.x, this.y);
	}
 
	divide(other)
	{
		this.x /= other.x;
		this.y /= other.y;
		return this;
	}
 
	floor()
	{
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		return this;
	}
 
	isInRange(rangeMax)
	{
		var isInRange =
		(
			this.x >= 0
			&& this.x <= rangeMax.x
			&& this.y >= 0
			&& this.y <= rangeMax.y
		);

		return isInRange;
	}

	multiply(other)
	{
		this.x *= other.x;
		this.y *= other.y;
		return this;
	}
 
	multiplyScalar(scalar)
	{
		this.x *= scalar;
		this.y *= scalar;
		return this;
	}

	overwriteWith(other)
	{
		this.x = other.x;
		this.y = other.y;
		return this;
	}

	overwriteWithXy(x, y)
	{
		this.x = x;
		this.y = y;
		return this;
	}

	subtract(other)
	{
		this.x -= other.x;
		this.y -= other.y;
		return this;
	}
}
