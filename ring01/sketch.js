var g_canvasSize = 500;

function setup()
{
  var myCanvas = createCanvas( g_canvasSize, g_canvasSize );
  myCanvas.parent( 'container' );

  smooth();
  ellipseMode( RADIUS );

  blendMode(SCREEN);

  RebuildAndRedraw();
}


function RebuildAndRedraw()
{
  ReBuildItems();
  ReDraw();
}


var g_rings = [];

function ReBuildItems()
{
  g_rings = [];
  for(var i=0;i<25;i++)
    g_rings.push( new Ring() );
}

function ReDraw()
{
  clear();
  background( 0 );

  translate( g_canvasSize / 2, g_canvasSize / 2 );

  for(var i=0;i<g_rings.length;i++)
  {
    g_rings[i].Draw();
  //  g_rings[i].DebugDraw();
  }
  resetMatrix();
}

function mousePressed() {
  if(mouseX > 0 && mouseY > 0 && mouseX < g_canvasSize && mouseY < g_canvasSize && mouseButton == LEFT)
    RebuildAndRedraw();
}
