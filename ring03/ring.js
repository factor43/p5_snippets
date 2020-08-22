

var CurveSegment = function(v0,cp0,cp1,v1,w0,w1)
{
  this.m_vert0 = v0;
  this.m_vert1 = v1;

  this.m_cp0 = cp0;
  this.m_cp1 = cp1;

  this.m_width0 = w0;
  this.m_width1 = w1;

  this.inner = [];
  this.outer = [];

  this.AddVertsAtTime = function(t)
  {
    var x = bezierPoint(this.m_vert0.x, this.m_cp0.x, this.m_cp1.x, this.m_vert1.x, t);
    var y = bezierPoint(this.m_vert0.y, this.m_cp0.y, this.m_cp1.y, this.m_vert1.y, t);

    var tx = bezierTangent(this.m_vert0.x, this.m_cp0.x, this.m_cp1.x, this.m_vert1.x, t);
    var ty = bezierTangent(this.m_vert0.y, this.m_cp0.y, this.m_cp1.y, this.m_vert1.y, t);

    var width = lerp(w0,w1,t);
    var normalVector = createVector(-ty,tx);
    normalVector.normalize().mult(width);

    //this.outer.push( createVector(x - normalVector.x, y - normalVector.y) );
    this.outer.push( createVector(x, y) );
    this.inner.push( createVector(x + normalVector.x, y + normalVector.y) );
  };

  this.AddVertsAtTime(-0.0001);
  var steps = 100;
  for ( var i = 0; i <= steps; i++ )
  {
    this.AddVertsAtTime(i / steps);
  }
  this.AddVertsAtTime(1.0001);

  this.InnerVertices = function()
  {
    for(var i=0;i<this.inner.length;i++)
      vertex(this.inner[i].x, this.inner[i].y);
  };

  this.Draw = function()
  {
  //  noFill();
    stroke(0);
  //  DrawBezier(this.m_vert0,this.m_cp0,this.m_cp1,this.m_vert1);

  //  fill(0);
    noStroke();
    beginShape();

    this.InnerVertices();

    for(var i=0;i<this.outer.length;i++)
    {
      var rIndex = this.outer.length-1-i;
      vertex(this.outer[rIndex].x, this.outer[rIndex].y);

    }

    endShape(CLOSE);


/*
    stroke(255,0,0);
    for(var i=0;i<this.outer.length;i++)
    {
      ellipse(this.outer[i].x, this.outer[i].y,5,5);
    }

    stroke(255,0,255);
    for(var i=0;i<this.inner.length;i++)
    {
      ellipse(this.inner[i].x, this.inner[i].y,5,5);
    }
*/

  }
};

var Ring = function(params, corners, radiusFactor, col)
{
//  this.m_radialItems = [];
  var segCount = params.segCount;
  this.m_cornerPoints = [];
  this.m_midPoints = [];
  this.m_thickness = [];
  this.m_segments = [];
  this.m_color = col; //[random(100),random(100),random(100),20 + random(30)];
  this.m_segCount = segCount;

  for ( var i = 0; i < corners.length; i++ )
  {
    this.m_cornerPoints.push( p5.Vector.mult(corners[i],radiusFactor));
  }

  for ( var i = 0; i < segCount; i++ )
  {
    var midpoint = p5.Vector.lerp( this.m_cornerPoints[i], this.m_cornerPoints[(i+1)%segCount], 0.5 );
    this.m_midPoints.push( midpoint );
    this.m_thickness.push( random(params.width - params.widthVar,params.width + params.widthVar) );
  }

  for ( var i = 0; i < segCount; i++ )
  {
    var nextIndex = (i+1)%segCount;
    var v0 = this.m_midPoints[i];
    var corner = this.m_cornerPoints[nextIndex];
    var v1 = this.m_midPoints[nextIndex];

    // as radius gets smaller, lerp strength to corner should also decrease?
    var cp0 = p5.Vector.lerp(v0,corner,random(0.5,0.6) + 0.1 * radiusFactor);
    var cp1 = p5.Vector.lerp(v1,corner,random(0.5,0.6) + 0.1 * radiusFactor);

    var w0 = this.m_thickness[i];
    var w1 = this.m_thickness[nextIndex];

    this.m_segments.push(new CurveSegment(v0,cp0,cp1,v1,w0,w1));
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

  this.DrawFill = function(col)
  {
    noStroke();
    fill(col);
    beginShape();
    this.m_segments.forEach(function(seg)
    {
      seg.InnerVertices();
    });
    endShape(CLOSE);
  };

  this.Draw = function()
  {
  //  fill(this.m_color);
  //  noStroke();
    //noFill();
    stroke(0);
    /*
    for ( var i = 0; i < this.m_radialItems.length; i++ )
    {
      this.m_radialItems[ i ].Draw();

    //  var v0 = this.m_radialItems[ i ];
    //  var v1 = this.m_radialItems[ ( i + 1 ) % this.m_radialItems.length ];

    //  line( v0.inner.x, v0.inner.y, v0.outer.x, v0.outer.y );
    //  line( v0.outer.x, v0.outer.y, v1.outer.x, v1.outer.y );
    //  line( v0.inner.x, v0.inner.y, v1.inner.x, v1.inner.y );

    //  quad(v0.inner.x, v0.inner.y, v0.outer.x, v0.outer.y, v1.outer.x, v1.outer.y, v1.inner.x, v1.inner.y);

    //    text(v0.index.toString(),v0.outer.x,v0.outer.y);

      // this.m_widthModifiers.forEach(function(m) {
      //   console.log(AngleDiff(v0.angle,m.angle) * 180 / PI);
      // });
    }
*/
    //ForEach(this.m_links,Draw);

    this.m_cornerPoints.forEach(function(pt)
    {
    //  ellipse(pt.x,pt.y,5,5);
    });

    stroke(255,0,0);
    this.m_midPoints.forEach(function(pt)
    {
//      ellipse(pt.x,pt.y,5,5);
    });

    fill(this.m_color);
    this.m_segments.forEach(function(seg)
    {
      seg.Draw();

    //  stroke(255,0,0);
    //  ellipse(seg.inner[0].x,seg.inner[0].y, 10,10);
    });

/*
    noStroke();
    fill(0,100,120);
    beginShape();
    this.m_segments.forEach(function(seg)
    {
      seg.InnerVertices();
    });
    endShape(CLOSE);
*/
  };

};

var RingGroup = function(params, pos)
{
  var segCount = params.segCount;
  this.m_rings = [];
  this.m_cornerPoints = [];

  this.pos = pos;
  //this.xOffset = 100 + random(100);
  //this.yOffset = 100 + random(100);

  var angleDelta = TWO_PI / segCount;
  for ( var i = 0; i < segCount; i++ )
  {
//    var item = new RadialItem( angleDelta * i, angleDelta, 10 );
//    this.m_radialItems.push( item );

      var radialDir = CreateDirVectorFromAngle( angleDelta * i + QUARTER_PI );
      this.m_cornerPoints.push( p5.Vector.mult( radialDir, params.radius + random(-params.radiusVar,params.radiusVar) ) );
  }


  for(var i=0;i<params.ringCount;i++)
  {
  //  var col = [20 + random(20), 30 + random(20),100 + random(30),50 + random(50)];
    var col = [120 + random(20), 30 + random(20),50 + random(30),50 + random(80)];

    this.m_rings.push(new Ring(params,this.m_cornerPoints,random(0.95),col));
  }

  // fully opaque outer ring last
  var ringColor = [0,0,0];
  this.m_outerRing = new Ring(params,this.m_cornerPoints,1,ringColor);
//  this.m_rings.push(this.m_outerRing);


  this.Draw = function()
  {
    translate(this.pos.x,this.pos.y);

    this.m_outerRing.DrawFill(255);

    this.m_rings.forEach(function(r){r.Draw();});

    resetMatrix();
  };




    this.InitColor = function( params )
    {
      this.m_rings.forEach(function(r){r.InitColor(params);});

    };

};
