
class Coords
{
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
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
}
