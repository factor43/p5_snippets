
var GrassBlade = function(params, xPos)
{
  var h0 = g_random.normal( params.height0, params.height0Var );
  var h1 = g_random.normal( params.height1, params.height1Var );
  //this.heights=[h0,h1];
  this.totalHeight = h0 + h1;
  this.origin = createVector(xPos,0);
  this.seg0 = createVector(0,-h0);
  var bend = g_random.normal( params.bend, params.bendVar );
  this.seg1 = CreateDirVectorFromAngle(-HALF_PI + bend).mult(h1);

  var v1 = p5.Vector.add(this.origin,this.seg0);
  var v2 = p5.Vector.add(v1,this.seg1);

  this.width = g_random.normal( params.width, params.widthVar );

  this.cp0 = p5.Vector.lerp(this.origin, v1, 0.5);
  this.cp1 = p5.Vector.lerp(v2, v1, 0.5);
  this.endPoint = v2;

  //this.m_verts = [this.origin,v1,v2];

  this.Draw = function()
  {
    stroke(this.m_color);
    strokeWeight(params.strokeWidth);
    var v1 = p5.Vector.add(this.origin,this.seg0);
    var v2 = p5.Vector.add(v1,this.seg1);
//    DrawLine(this.origin,v1);
//    DrawLine(v1,v2);

    //stroke(10,155,20);
//    var cp0 = p5.Vector.lerp(this.origin, v1, 0.5);
//    var cp1 = p5.Vector.lerp(v2, v1, 0.5);
    noFill();
    DrawBezier(this.origin,this.cp0,this.cp1,this.endPoint);
    noStroke();

    fill(this.m_color);

    // todo just draw verts! begin shape!
    {
      // var prevVector0 = createVector();
      // var prevVector1 = createVector();
      // var currVector0 = createVector();
      // var currVector1 = createVector();
       var normalVector = createVector();

      var side0 = [];
      var side1 = [];

      var steps = this.totalHeight / 10;  // rule of thumb
      for ( var j = 0; j < steps; j++ )
      {
        var t = j / steps;
        var x = bezierPoint(this.origin.x, this.cp0.x, this.cp1.x, this.endPoint.x, t);
        var y = bezierPoint(this.origin.y, this.cp0.y, this.cp1.y, this.endPoint.y, t);

        var tx = bezierTangent(this.origin.x, this.cp0.x, this.cp1.x, this.endPoint.x, t);
        var ty = bezierTangent(this.origin.y, this.cp0.y, this.cp1.y, this.endPoint.y, t);

        var taperTime = 0.5;
        var width = t < taperTime ? this.width : lerp(this.width,0, (t-0.5) * 2);
        normalVector.set(-ty,tx);
        normalVector.normalize().mult(width);

        side0.push(createVector(x - normalVector.x, y - normalVector.y));
        side1.push(createVector(x + normalVector.x, y + normalVector.y));

/*
        currVector0.set(x - normalVector.x, y - normalVector.y);
        currVector1.set(x + normalVector.x, y + normalVector.y);

        //line(x,y,x + normalVector.x, y + normalVector.y);

        if(j > 0)
        //  quad(prevVector0.x, prevVector0.y, prevVector1.x, prevVector1.y, currVector1.x, currVector1.y, currVector0.x, currVector0.y);

        prevVector0.set(currVector0);
        prevVector1.set(currVector1);
        */
      }

      beginShape();

      for(var i=0;i<side0.length;i++)
      {
        vertex(side0[i].x, side0[i].y);
      }

    for(var i=0;i<side1.length;i++)
    {
      var rIndex = side1.length-1-i;
      vertex(side1[rIndex].x, side1[rIndex].y);
    }

    endShape(CLOSE);

    }

//    line(this.xPos,0,this.xPos + this.seg0.x,-100);
  };

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

};
