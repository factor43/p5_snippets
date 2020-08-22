var g_radius = 150;

var RadialItem = function( angle )
{
  // Lots of redundant info here so we can modify later
  this.angle = angle;
  this.radius = g_radius;

  this.radialDir = CreateDirVectorFromAngle( angle );

  this.SetHalfWidth = function( hw )
  {
    this.halfwidth = hw;
    this.inner = p5.Vector.mult( this.radialDir, this.radius - this.halfwidth );
    this.outer = p5.Vector.mult( this.radialDir, this.radius + this.halfwidth );
  };

  this.SetHalfWidth( 5 + random( 4 ) );
};


var WidthModifier = function( angle, halfWidth )
{
  this.angle = angle;
  this.position = CreateDirVectorFromAngle( angle ).mult( g_radius );
  this.halfWidth = halfWidth;

  this.DebugDraw = function()
  {
    ellipse( this.position.x, this.position.y, this.halfWidth, this.halfWidth );
    //text(this.angle.toString(),this.position.x, this.position.y);
  };
};


var RadiusModifier = function( angle, radius )
{
  this.radius = radius;
  this.angle = angle;
  this.position = CreateDirVectorFromAngle( angle ).mult( radius );

  this.DebugDraw = function()
  {
    line( 0, 0, this.position.x, this.position.y );
  };
};

var Ring = function()
{
  this.m_radialItems = [];
  this.m_widthModifiers = [];
  this.m_radiusModifiers = [];
  this.m_color = [random(100),random(100),random(100),20 + random(30)];

  var segCount = 120;

  var angleDelta = TWO_PI / segCount;
  for ( var i = 0; i < segCount; i++ )
  {
    var item = new RadialItem( angleDelta * i );
    this.m_radialItems.push( item );
  }

  // Width Modifiers..
  var widthModifierCount = 2;
  var angleArc = TWO_PI / widthModifierCount;
  for ( var j = 0; j < widthModifierCount; j++ )
  {
    var modifier = new WidthModifier( j * angleArc + random( angleArc ), random( 10, 70 ) );
    this.m_widthModifiers.push( modifier );
  }

  // Radius Modifiers..
  var radiusModifierCount = 2;
  var angleArc = TWO_PI / radiusModifierCount;
  for ( var j = 0; j < radiusModifierCount; j++ )
  {
    var angle = j * angleArc + random( angleArc );

    var modifier = new RadiusModifier( angle, g_radius + random( -60, 60 ) );
    this.m_radiusModifiers.push( modifier );
  }


  for ( var i = 0; i < this.m_radialItems.length; i++ )
  {
    var v0 = this.m_radialItems[ i ];
    v0.index = i;

    {
      var totalWeight = 0;
      var totalWeightedStrength = 0;
      for ( var j = 0; j < this.m_radiusModifiers.length; j++ )
      {
        var m = this.m_radiusModifiers[ j ];
        strength = 1 + (1 - ( Math.abs( AngleDiff( v0.angle, m.angle ) ) / PI ));
        strength *= strength;
        totalWeight += strength;
        totalWeightedStrength += ( strength * m.radius );
      }

      v0.radius = totalWeightedStrength / totalWeight;
    }

    {
      var totalWeight = 0;
      var totalWeightedStrength = 0;
      for ( var j = 0; j < this.m_widthModifiers.length; j++ )
      {
        var m = this.m_widthModifiers[ j ];
        strength = 1 + (1 - ( Math.abs( AngleDiff( v0.angle, m.angle ) ) / PI ));
        strength *= strength;
        totalWeight += strength;
        totalWeightedStrength += ( strength * m.halfWidth );
      }

      v0.SetHalfWidth( totalWeightedStrength / totalWeight );
    }
  }

  this.Draw = function()
  {
    fill(this.m_color);
    noStroke();
    for ( var i = 0; i < this.m_radialItems.length; i++ )
    {
      var v0 = this.m_radialItems[ i ];
      var v1 = this.m_radialItems[ ( i + 1 ) % this.m_radialItems.length ];

  //    line( v0.inner.x, v0.inner.y, v0.outer.x, v0.outer.y );
  //    line( v0.outer.x, v0.outer.y, v1.outer.x, v1.outer.y );
  //    line( v0.inner.x, v0.inner.y, v1.inner.x, v1.inner.y );

      quad(v0.inner.x, v0.inner.y, v0.outer.x, v0.outer.y, v1.outer.x, v1.outer.y, v1.inner.x, v1.inner.y);

    //    text(v0.index.toString(),v0.outer.x,v0.outer.y);

      // this.m_widthModifiers.forEach(function(m) {
      //   console.log(AngleDiff(v0.angle,m.angle) * 180 / PI);
      // });
    }
  };

  this.DebugDraw = function()
  {
    noFill();

    stroke( 200, 10, 10 );
    this.m_widthModifiers.forEach( function( m )
    {
      m.DebugDraw();
    } );

    this.m_radiusModifiers.forEach( function( m )
    {
      m.DebugDraw();
    } );
  };
};
