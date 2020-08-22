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

var Ring = function( params )
{
  this.m_radialItems = [];
  this.m_widthModifiers = [];
  this.m_radiusModifiers = [];

  var segCount = params.segCount;

  var angleDelta = TWO_PI / segCount;
  for ( var i = 0; i < segCount; i++ )
  {
    var item = new RadialItem( angleDelta * i - HALF_PI );
    this.m_radialItems.push( item );
  }

  // Width Modifiers..
  var widthModifierCount = params.widthMods;
  var angleArc = TWO_PI / widthModifierCount;
  for ( var j = 0; j < widthModifierCount; j++ )
  {
    var width = max( 0, g_random.normal( params.width, params.widthVar ) );
    var modifier = new WidthModifier( j * angleArc + random( angleArc ), width );
    this.m_widthModifiers.push( modifier );
  }

  // Radius Modifiers..
  var radiusModifierCount = params.radiusMods;
  var angleArc = TWO_PI / radiusModifierCount;
  //var tempAngle = [PI/3,PI/3 + PI/10];
  for ( var j = 0; j < radiusModifierCount; j++ )
  {
    var angle = j * angleArc + random( angleArc );

    //  angle = tempAngle[j];
    var modifier = new RadiusModifier( angle, params.radius + g_random.normal( 0, params.radiusVar ) );
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
        strength = 1 + ( 1 - ( Math.abs( AngleDiff( v0.angle, m.angle ) ) / PI ) );
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
        strength = 1 + ( 1 - ( Math.abs( AngleDiff( v0.angle, m.angle ) ) / PI ) );
        strength *= strength;
        totalWeight += strength;
        totalWeightedStrength += ( strength * m.halfWidth );
      }

      v0.SetHalfWidth( totalWeightedStrength / totalWeight );
    }
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
    fill( this.m_color );
    noStroke();
    for ( var i = 0; i < this.m_radialItems.length; i++ )
    {
      var v0 = this.m_radialItems[ i ];
      var v1 = this.m_radialItems[ ( i + 1 ) % this.m_radialItems.length ];

      //    line( v0.inner.x, v0.inner.y, v0.outer.x, v0.outer.y );
      //    line( v0.outer.x, v0.outer.y, v1.outer.x, v1.outer.y );
      //    line( v0.inner.x, v0.inner.y, v1.inner.x, v1.inner.y );

      quad( v0.inner.x, v0.inner.y, v0.outer.x, v0.outer.y, v1.outer.x, v1.outer.y, v1.inner.x, v1.inner.y );

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
