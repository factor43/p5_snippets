
function SinCosPair () {
  this.m_sin = 0.0;
	this.m_cos = 1.0;

  this.Set = function(x,y) {
    var mag = sqrt(x * x + y * y);
    var invMag = 1.0 / mag;

    this.m_cos = x * invMag;
    this.m_sin = y * invMag;
  };

  this.SetAngle = function(angle)
  {
    this.m_sin = sin(angle);
    this.m_cos = cos(angle);
  };

  this.SetZero = function()
  {
    this.m_sin = 0.0;
    this.m_cos = 1.0;
  };

  this.ToVector = function(mag)
  {
    return createVector(mag * this.m_cos, mag * this.m_sin);
  };

  this.GetAngle = function()
  {
    return atan2(this.m_sin, this.m_cos);
  };

  this.Add = function(other)
  {
    var newCos = this.m_cos * other.m_cos - this.m_sin * other.m_sin;
    this.m_sin = this.m_sin * other.m_cos + this.m_cos * other.m_sin;
    this.m_cos = newCos;
  };

  this.Subtract = function(other)
  {
    var newCos = this.m_cos * other.m_cos + this.m_sin * other.m_sin;
    this.m_sin = this.m_sin * other.m_cos - this.m_cos * other.m_sin;
    this.m_cos = newCos;
  };
}

function CreateDirVectorFromAngle(angle)
{
  return createVector(cos(angle), sin(angle));
}

// Always between 0-180
function AngleDiff( a1, a2 )
{
  var a = a1 - a2;
  a = ( ( a + PI ) % TWO_PI + TWO_PI ) % TWO_PI;
  return a - PI;
}

function clamp(x,a,b)
{
  return min(max(x,a),b);
}

function randomSign()
{
  return random( 1 ) < 0.5 ? -1 : 1;
}

function randomAroundZero(a)
{
  return random(-a,a);
}

function randomAroundOne(a)
{
  return 1 + random(-a,a);
}

function drawSegment( a, b )
{
  line( a.x, a.y, b.x, b.y );
}

function drawSegmentFromTuple( a, b )
{
  line( a[0], a[1], b[0], b[1] );
}

function GetVertCount(flatVertArray)
{
  return flatVertArray.length / 2;
}

function GetVertex(flatVertArray, index)
{
  var i = index * 2;
  return [flatVertArray[i],flatVertArray[i+1]];
}

function GetVertexSafe(flatVertArray, index)
{
  var i = (index % GetVertCount(flatVertArray)) * 2;
  return [flatVertArray[i],flatVertArray[i+1]];
}

function CheckContains( elem, arr )
{
  return arr.indexOf( elem ) != -1;
}

function RemoveFromList( array, elem )
{
  var index = array.indexOf( elem );
  if ( index > -1 )
  {
    array.splice( index, 1 );
  }
}

function GetURLParameterByName(name, def)
{
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
  results = regex.exec(location.search);
  return results === null ? def : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function GetDefaultArg( arg, def )
{
  return ( typeof arg == 'undefined' ? def : arg );
}

function checkLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false
    };
    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator == 0) {
        return result;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));
/*
        // it is worth noting that this should be the same as:
        x = line2StartX + (b * (line2EndX - line2StartX));
        y = line2StartX + (b * (line2EndY - line2StartY));
        */
    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a >= 0 && a <= 1) {
        result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b >= 0 && b <= 1) {
        result.onLine2 = true;
    }
    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
}

function getLineSegmentIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY)
{
  var result = checkLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY);
  if(result.onLine1 && result.onLine2)
    return result;

  return null;
}

function RandomIndex( arr )
{
  return min(floor(random(0,arr.length)),arr.length-1);
}

function SuffleArray( arr )
{
  for(var i=0;i<arr.length; i++)
  {
    var i1 = RandomIndex(arr);
    var i2 = RandomIndex(arr);
    var temp = arr[i1];
    arr[i1] = arr[i2];
    arr[i2] = temp;
  }
}

function RemoveFromList( array, elem )
{
  var index = array.indexOf( elem );
  if ( index > -1 )
  {
    array.splice( index, 1 );
  }
}

// Shortcuts when dealing with vectors
function DrawLine(a,b){ line(a.x,a.y,b.x,b.y); }
function DrawBezier(start, cp0, cp1, end){ bezier( start.x,start.y, cp0.x,cp0.y, cp1.x,cp1.y, end.x,end.y ); }
function DrawBezierRelativeCPs(start, cp0, cp1, end){ bezier( start.x,start.y, start.x + cp0.x, start.y + cp0.y, end.x + cp1.x,end.y + cp1.y, end.x,end.y ); }

if (typeof dat !== 'undefined')
{
  dat.GUI.prototype.removeFolder = function(name) {
    var folder = this.__folders[name];
    if (!folder) {
      return;
    }
    folder.close();
    this.__ul.removeChild(folder.domElement.parentNode);
    delete this.__folders[name];
    this.onResize();
  };
}
