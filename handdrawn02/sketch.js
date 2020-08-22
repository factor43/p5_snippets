var COLOR = net.brehaut.Color;
var g_random = new Random();

var g_canvasWidth = 800;
var g_canvasHeight = 400;

var g_lines = [];

var params =
{
  lineCount:5,
  lineLength:g_canvasHeight,
  wavyness:0.1,
  controlPointF: 0.2,
  midRandomness:0.2,

  // probably don't want to tweak these
  tangentLength:0.5,
  tangentLengthVar:0.15,

  whiteBG:false,
  blendMode: 0,

  strokeWidth:1.2,
  baseColor: "#e62121",
  hueVariance : 4,
  lightenVariance : 0.15,
  saturateVariance : 0.05,
  alpha:220,
  alphaVariance:10,

  Redraw : function()
  {
      ReColorAndRedraw();
  }

};

function initGui()
{
  // Init GUI
  var gui = new dat.GUI({ autoPlace: false });
  var guiContainer = document.getElementById('gui_container');
  guiContainer.appendChild(gui.domElement);

  function GUI_ADD( name, fn )
  {
    gui.add( params, name ).onChange( function( value )
    {
      fn();
    } );
  }

  function GUI_ADD_SLIDER( name, a, b, fn )
  {
    gui.add( params, name, a, b ).onChange( function( value )
    {
      fn();
    } );
  }

  GUI_ADD("whiteBG",ReDraw);
  gui.add( params, 'blendMode', { BLEND: BLEND, LIGHTEST: LIGHTEST, DARKEST: DARKEST, EXCLUSION: EXCLUSION, SCREEN: SCREEN, MULTIPLY: MULTIPLY, SOFT_LIGHT: SOFT_LIGHT } )
   .onChange( function( value ) { ReDraw(); } );
  GUI_ADD_SLIDER("lineCount",1,1000,RebuildAndRedraw);
  GUI_ADD_SLIDER("lineLength",50,500,RebuildAndRedraw);
  GUI_ADD_SLIDER("wavyness",0,QUARTER_PI,RebuildAndRedraw);

  GUI_ADD_SLIDER("controlPointF",0,1,RebuildAndRedraw);
  GUI_ADD_SLIDER("midRandomness",0,0.5,RebuildAndRedraw);

  GUI_ADD_SLIDER("tangentLength",0,1,RebuildAndRedraw);
  GUI_ADD_SLIDER("tangentLengthVar",0,0.5,RebuildAndRedraw);

  GUI_ADD_SLIDER("strokeWidth",0.5,2.5,ReDraw);

  gui.addColor( params, "baseColor" ).onChange( function( value )
  {
      ReColorAndRedraw();
  } );

  GUI_ADD_SLIDER("hueVariance", 0, 40, ReColorAndRedraw );
  GUI_ADD_SLIDER("lightenVariance", 0, 0.25, ReColorAndRedraw );
  GUI_ADD_SLIDER("saturateVariance", 0, 0.25, ReColorAndRedraw );
  GUI_ADD_SLIDER("alpha", 0, 255, ReColorAndRedraw );
  GUI_ADD_SLIDER("alphaVariance", 0, 120, ReColorAndRedraw );
  gui.add( params, "Redraw" );

}

function setup()
{
  var myCanvas = createCanvas( g_canvasWidth, g_canvasHeight );
  myCanvas.parent( 'container' );

  initGui();

  params.blendMode = BLEND; // argh

  smooth();
  ellipseMode( RADIUS );

  RebuildAndRedraw();
}


function RebuildAndRedraw()
{
  g_lines = [];
  for(var i=0;i<params.lineCount;i++)
  {
    var xPos = random(0,g_canvasWidth);
    var p1 = createVector(xPos,0);
    var p2 = createVector(xPos + random(-5,5),params.lineLength);
    g_lines.push( new HandDrawnLine(params,p1,p2) );
  }

  ReColorAndRedraw();
}

function ReColorAndRedraw()
{
  Recolor();
  ReDraw();
}

function Recolor()
{
  g_lines.forEach(function(r){r.InitColor(params);});
}

function ReDraw()
{
  clear();
  blendMode(params.blendMode);
  background( params.whiteBG ? 255 : 0 );

  stroke(0);
  noFill();

  g_lines.forEach(function(r){r.Draw();});

}

function draw()
{
}

function mousePressed() {
  if(mouseX > 0 && mouseY > 0 && mouseX < g_canvasWidth && mouseY < g_canvasHeight && mouseButton == LEFT)
    RebuildAndRedraw();
}
