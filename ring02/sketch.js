var COLOR = net.brehaut.Color;
var g_canvasSize = 500;
var g_random = new Random();

var params =
{
  segCount:120,
  widthMods:3,
  width:20,
  widthVar:20,

  radius:130,
  radiusMods:3,
  radiusVar:30,

  ringCount:20,
  xBias:0,
  yBias:0,

  whiteBG:false,
  blendMode: 0,
  baseColor: "#b32a2a",
  hueVariance : 20,
  lightenVariance : 0.15,
  saturateVariance : 0.1,
  alpha:20,
  alphaVariance:50,

  reColor : function()
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
  GUI_ADD_SLIDER("ringCount",1,100,RebuildAndRedraw);

  GUI_ADD_SLIDER("xBias",-5,5,ReDraw);
  GUI_ADD_SLIDER("yBias",-5,5,ReDraw);

  GUI_ADD_SLIDER("segCount",3,200,RebuildAndRedraw);

  GUI_ADD_SLIDER("widthMods",0,8,RebuildAndRedraw);
  GUI_ADD_SLIDER("width",10,100,RebuildAndRedraw);
  GUI_ADD_SLIDER("widthVar",5,50,RebuildAndRedraw);
  GUI_ADD_SLIDER("radius",0,200,RebuildAndRedraw);
  GUI_ADD_SLIDER("radiusMods",0,8,RebuildAndRedraw);
  GUI_ADD_SLIDER("radiusVar",5,50,RebuildAndRedraw);

  gui.addColor( params, "baseColor" ).onChange( function( value )
  {
      ReColorAndRedraw();
  } );

  GUI_ADD_SLIDER("hueVariance", 0, 80, ReColorAndRedraw );
  GUI_ADD_SLIDER("lightenVariance", 0, 0.5, ReColorAndRedraw );
  GUI_ADD_SLIDER("saturateVariance", 0, 0.5, ReColorAndRedraw );
  GUI_ADD_SLIDER("alpha", 0, 255, ReColorAndRedraw );
  GUI_ADD_SLIDER("alphaVariance", 0, 120, ReColorAndRedraw );
  gui.add( params, "reColor" );
}

function setup()
{
  var myCanvas = createCanvas( g_canvasSize, g_canvasSize );
  myCanvas.parent( 'container' );

  initGui();

  params.blendMode = BLEND; // argh

  smooth();
  ellipseMode( RADIUS );

  RebuildAndRedraw();
}


function RebuildAndRedraw()
{
  ReBuildItems();
  RecolorRings();
  ReDraw();
}


function ReColorAndRedraw()
{
  RecolorRings();
  ReDraw();
}

var g_rings = [];

function RecolorRings()
{
  for(var i=0;i<g_rings.length;i++)
  {
    g_rings[i].InitColor(params);
  }
}

function ReBuildItems()
{
  g_rings = [];
  for(var i=0;i<params.ringCount;i++)
    g_rings.push( new Ring(params) );
}

function ReDraw()
{
  clear();
  blendMode(params.blendMode);
  background( params.whiteBG ? 255 : 0 );

  translate( g_canvasSize / 2, g_canvasSize / 2 );

  for(var i=0;i<g_rings.length;i++)
  {
    translate(params.xBias,params.yBias);
    g_rings[i].Draw();
  //  g_rings[i].DebugDraw();
  }
  resetMatrix();
}

function draw()
{
  // //RebuildAndRedraw();
  // // need persistent color
  // g_rings.splice( 0, 1 );
  // g_rings.push( new Ring(params) );
  //
  // ReDraw();
}

function mousePressed() {
  if(mouseX > 0 && mouseY > 0 && mouseX < g_canvasSize && mouseY < g_canvasSize && mouseButton == LEFT)
    RebuildAndRedraw();
}
