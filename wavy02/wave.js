
var Wave = function( params )
{
  this.m_verts = [];
  this.m_prevControlPoint = [];
  this.m_nextControlPoint = [];

  this.m_strokeWeight = g_random.normal( params.strokeWeight, params.strokeWeightVar );
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
        DrawBezier( this.m_verts[i-1], this.m_nextControlPoint[i-1], this.m_prevControlPoint[i], this.m_verts[i] );
      }
    }

    translate(0,-this.m_verticalOffset);

  };

  this.DebugDraw = function()
  {
    noFill();
    stroke(100);

    for ( var i = 0; i < this.m_verts.length; i++ )
    {
      ellipse(this.m_verts[i].x,this.m_verts[i].y,5,5);
      line(this.m_verts[i].x,this.m_verts[i].y,this.m_prevControlPoint[i].x,this.m_prevControlPoint[i].y);
      line(this.m_verts[i].x,this.m_verts[i].y,this.m_nextControlPoint[i].x,this.m_nextControlPoint[i].y);
    }

  };
};
