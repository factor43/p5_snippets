var Waypoint = function( pos, angle )
{
  this.pos = pos;
  this.dir = CreateDirVectorFromAngle( angle ); // relative to up

  this.DrawToNext = function( next )
  {
    var dist = p5.Vector.dist( this.pos, next.pos );

    var len0 = g_random.normal( params.tangentLength, params.tangentLengthVar );
    var len1 = g_random.normal( params.tangentLength, params.tangentLengthVar );

    var cp0 = p5.Vector.mult( this.dir, dist * len0 );
    var cp1 = p5.Vector.mult( next.dir, dist * -len1 );
    DrawBezierRelativeCPs( this.pos, cp0, cp1, next.pos );
  };

};


var HandDrawnLine = function( params, p1, p2 )
{
  this.origin = p1;
  this.target = p2;
  this.params = params;

  this.lineAngle = atan2( p2.y - p1.y, p2.x - p1.x );

  this.CreateWaypointAngle = function()
  {
    return randomAroundZero( params.wavyness ) + this.lineAngle;
  };

  var midpoint = p5.Vector.lerp( this.origin, this.target, 0.5 + randomAroundZero( params.midRandomness ) );

  this.waypoints = [ new Waypoint( this.origin, this.CreateWaypointAngle() ) ];
  this.waypoints.push( new Waypoint( midpoint, this.CreateWaypointAngle() ) );
  this.waypoints.push( new Waypoint( this.target, this.CreateWaypointAngle() ) );

  this.Draw = function()
  {
    stroke( this.m_color );
    strokeWeight( this.params.strokeWidth );

    for ( var i = 0; i < this.waypoints.length - 1; i++ )
    {
      this.waypoints[ i ].DrawToNext( this.waypoints[ i + 1 ] );
      //DrawLine(this.waypoints[i-1].pos,this.waypoints[i].pos);
    }

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
