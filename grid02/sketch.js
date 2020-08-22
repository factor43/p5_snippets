var COLOR = net.brehaut.Color;
var g_canvasWidth = 600;
var g_canvasHeight = 480;
var g_random = new Random( 43 );


var Globals = function()
{
  this.baseColor = "#af3a3a";
  this.randomSeed = 43;
  this.boxSize = 32;
  this.offsetVariance = 0.3;
  this.hueVariance = 5;
  this.lightenVariance = 0.1;
  this.saturateVariance = 0.1;

  this.reseed = function()
  {
    this.randomSeed = int( random( 1000 ) );
    RebuildBoxes();
  };
};

var G = new Globals();

var Box = function( x, y, col )
{
  this.x = x;
  this.y = y;
  this.z = g_random.normal( 0, G.boxSize * G.offsetVariance );
  this.col = [ col.getRed() * 255, col.getGreen() * 255, col.getBlue() * 255 ];
  this.Draw = function()
  {
    specularMaterial( this.col );
    push();
    translate( this.x, this.y, this.z );
    box( G.boxSize / 2.5, G.boxSize / 2.5, 10 );
    pop();
  };
};

var g_boxes = [];

function RebuildBoxes()
{
  g_random = new Random( G.randomSeed );
  g_boxes = [];
  var baseColor = COLOR( G.baseColor );

  var xStepCnt = Math.ceil( g_canvasWidth / G.boxSize );
  var yStepCnt = Math.ceil( g_canvasHeight / G.boxSize );

  var xPad = ( ( xStepCnt * G.boxSize ) - g_canvasWidth ) / 2;
  var yPad = ( ( yStepCnt * G.boxSize ) - g_canvasHeight ) / 2;

  xPad = G.boxSize / 2 - xPad;
  yPad = G.boxSize / 2 - yPad;

  for ( var y = 0; y < yStepCnt; y++ )
  {
    var yC = y * G.boxSize + yPad;
    for ( var x = 0; x < xStepCnt; x++ )
    {
      var xC = x * G.boxSize + xPad;
      var col = baseColor.shiftHue( g_random.normal( 0, G.hueVariance ) )
        .darkenByRatio( g_random.normal( 0, G.lightenVariance ) )
        .lightenByRatio( g_random.normal( 0, G.lightenVariance ) )
        .desaturateByAmount( g_random.normal( 0, G.saturateVariance ) )
        .saturateByAmount( g_random.normal( 0, G.saturateVariance ) );

      g_boxes.push( new Box( xC, yC, col ) );
    }
  }
}

function setup()
{
  var myCanvas = createCanvas( g_canvasWidth, g_canvasHeight, WEBGL );
  myCanvas.parent( 'container' );

  var gui = new dat.GUI({ autoPlace: false });
  var guiContainer = document.getElementById('gui_container');
  guiContainer.appendChild(gui.domElement);

  gui.addColor( G, "baseColor" ).onChange( function( value )
  {
    RebuildBoxes();
  } );

  function GUI_ADD( name, a, b )
  {
    gui.add( G, name, a, b ).onChange( function( value )
    {
      RebuildBoxes();
    } );
  }

  GUI_ADD( 'boxSize', 15, 60 );
  GUI_ADD( 'offsetVariance', -2, 2.0 );
  GUI_ADD( 'hueVariance', 0, 50 );
  GUI_ADD( 'lightenVariance', 0, 0.5 );
  GUI_ADD( 'saturateVariance', 0, 0.5 );
  // gui.add( G, 'reseed' );

  RebuildBoxes();
}

function draw()
{
  background( 0 );
  ambientLight( 150 );
  pointLight( 90, 90, 90, 0, 0, 2000 );
  camera( 0, 0, -300 );
  specularMaterial( 250 );

  push();
  translate( -0.5 * g_canvasWidth, -0.5 * g_canvasHeight );
  g_boxes.forEach( function( b )
  {
    b.Draw();
  } );
  pop();
}

function mousePressed() {
  if(mouseX > 0 && mouseY > 0 && mouseX < g_canvasWidth && mouseY < g_canvasHeight)
    G.reseed();
}
