
var Wave = function( params )
{
  this.m_verts = [];
  this.m_prevControlPoint = [];
  this.m_nextControlPoint = [];
  this.m_period = params.period;
  this.m_widths = [];

  this.m_verticalOffset = g_random.normal( params.verticalOffset, params.verticalOffsetVar );

  var horizBuffer = params.period;
  var xPos = -horizBuffer;
  var amplitudeFactor = 0.5;

  while(xPos < g_canvasWidth + horizBuffer)
  {
    var yPos = amplitudeFactor * g_random.normal( params.amplitude, params.amplitudeVar );

    this.m_verts.push(createVector(xPos,yPos));
    xPos += g_random.normal( params.period, params.periodVar );
    amplitudeFactor *= -1;
    this.m_widths.push(g_random.normal( params.width, params.widthVar ));
  }

  // Second pass, build tangents
  for ( var i = 0; i < this.m_verts.length; i++ )
  {
    var prevTangentLength = (i === 0) ? params.period : (this.m_verts[i].x - this.m_verts[i-1].x);
    var nextTangentLength = (i === (this.m_verts.length-1)) ? params.period : (this.m_verts[i+1].x - this.m_verts[i].x);

    var len0 = params.tangetFraction * prevTangentLength * g_random.normal( 1, params.tangetLengthVar );
    var len1 = params.tangetFraction * nextTangentLength * g_random.normal( 1, params.tangetLengthVar );
    var dir = CreateDirVectorFromAngle( g_random.normal( 0, params.tangetAngleVar * PI / 180 ) );

    this.m_prevControlPoint.push(p5.Vector.mult(dir,-len0).add(this.m_verts[i]));
    this.m_nextControlPoint.push(dir.mult(len1).add(this.m_verts[i]));
  }

  this.InitColor = function( params )
  {
    var baseColor = COLOR( params.baseColor );

    var col = baseColor.shiftHue( g_random.normal( 0, params.hueVariance ) )
      .darkenByRatio( g_random.normal( 0, params.lightenVariance ) )
      .lightenByRatio( g_random.normal( 0, params.lightenVariance ) )
      .desaturateByAmount( g_random.normal( 0, params.saturateVariance ) )
      .saturateByAmount( g_random.normal( 0, params.saturateVariance ) );

    var alpha = g_random.normal(params.alpha,params.alphaVariance);
    this.m_color = [col.getRed() * 255, col.getGreen() * 255, col.getBlue() * 255, alpha];
  };

/*
  this.Draw = function()
  {
    //fill( this.m_color );
    //noStroke();

    noFill();
    stroke(this.m_color);

    translate(0,this.m_verticalOffset);

    var alpha = this.m_color[3];
    var mult = 1.0;
    //for ( var j = 3; j >= 0; j-- )
    var j = 0;
    {
      strokeWeight(this.m_strokeWeight + (j*2));
      stroke(this.m_color[0] * mult,this.m_color[1] * mult,this.m_color[2] * mult,alpha);
      alpha += 50;
      mult *= 1.5;

      for ( var i = 1; i < this.m_verts.length; i++ )
      {
        bezier( this.m_verts[i-1].x,this.m_verts[i-1].y,
                this.m_nextControlPoint[i-1].x,this.m_nextControlPoint[i-1].y,
                this.m_prevControlPoint[i].x,this.m_prevControlPoint[i].y,
                this.m_verts[i].x,this.m_verts[i].y
        );
      }
    }

    translate(0,-this.m_verticalOffset);

  };
  */

  this.Draw = function()
  {
    fill(this.m_color);
    //stroke(10);
    noStroke();

    translate(0,this.m_verticalOffset);

    var normalVector = createVector();
    var prevVector0 = createVector();
    var prevVector1 = createVector();
    var currVector0 = createVector();
    var currVector1 = createVector();

    for ( var i = 1; i < this.m_verts.length; i++ )
    {
      var prevWidth = this.m_widths[i-1];
      var currWidth = this.m_widths[i];

      var steps = this.m_period / 5;  // rule of thumb
      for ( var j = 0; j < steps; j++ )
      {
        var t = j / steps;
        var x = bezierPoint(this.m_verts[i-1].x, this.m_nextControlPoint[i-1].x, this.m_prevControlPoint[i].x, this.m_verts[i].x, t);
        var y = bezierPoint(this.m_verts[i-1].y, this.m_nextControlPoint[i-1].y, this.m_prevControlPoint[i].y, this.m_verts[i].y, t);

        var tx = bezierTangent(this.m_verts[i-1].x, this.m_nextControlPoint[i-1].x, this.m_prevControlPoint[i].x, this.m_verts[i].x, t);
        var ty = bezierTangent(this.m_verts[i-1].y, this.m_nextControlPoint[i-1].y, this.m_prevControlPoint[i].y, this.m_verts[i].y, t);

        var width = lerp(prevWidth,currWidth,t);
        normalVector.set(-ty,tx);
        normalVector.normalize().mult(width);

        currVector0.set(x - normalVector.x, y - normalVector.y);
        currVector1.set(x + normalVector.x, y + normalVector.y);

        //line(x,y,x + normalVector.x, y + normalVector.y);

        quad(prevVector0.x, prevVector0.y, prevVector1.x, prevVector1.y, currVector1.x, currVector1.y, currVector0.x, currVector0.y);

        prevVector0.set(currVector0);
        prevVector1.set(currVector1);
      }
    }

    translate(0,-this.m_verticalOffset);

  };
};
