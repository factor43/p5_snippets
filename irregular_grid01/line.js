
function DrawCornerBezier(a,b,c)
{
  DrawBezier(p5.Vector.lerp(a,b,0.5),b,b,p5.Vector.lerp(c,b,0.5));
}

var LineLoop = function( params, verts )
{
  var gridSize = Math.round(params.gridSize);
  var spacing = g_canvasWidth / (gridSize + 1);
  var halfRange = params.curveVariance * spacing * 0.5;
  for(var pIndex =0;pIndex < 4;pIndex++)
  {
    //  p[pIndex].x += random(-halfRange,halfRange);
    //  p[pIndex].y += random(-halfRange,halfRange);
    verts[pIndex].x += g_random.normal( 0, halfRange );
    verts[pIndex].y += g_random.normal( 0, halfRange );
  }

  this.verts = verts;
  this.params = params;

  this.Draw = function()
  {
    stroke( this.m_color );
    strokeWeight( this.params.strokeWidth );
  //  fill(this.m_color);

    var p = this.verts;
    DrawCornerBezier(p[0],p[1],p[2]);
    DrawCornerBezier(p[1],p[2],p[3]);
    DrawCornerBezier(p[2],p[3],p[0]);
    DrawCornerBezier(p[3],p[0],p[1]);
  };

  this.InitColor = function( params )
  {
    var baseColor = COLOR( params.baseColor );

    var col = baseColor.shiftHue( g_random.normal( 0, params.hueVariance ) )
      .darkenByRatio( g_random.normal( 0, params.lightenVariance ) )
      .lightenByRatio( g_random.normal( 0, params.lightenVariance ) )
      .desaturateByAmount( g_random.normal( 0, params.saturateVariance ) )
      .saturateByAmount( g_random.normal( 0, params.saturateVariance ) );

    var alpha = g_random.normal( params.alpha, params.alphaVariance );
    this.m_color = [ col.getRed() * 255, col.getGreen() * 255, col.getBlue() * 255, alpha ];
  };

};
