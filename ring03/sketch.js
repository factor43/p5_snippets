var COLOR = net.brehaut.Color;
var g_random = new Random();

var g_canvasSize = 600;

var g_rings = [];


var params =
{
  segCount:4,
  width:30,
  widthVar:10,

  radius:300,
  radiusVar:50,

  ringCount:20,

  whiteBG:false,
  blendMode: 0,
  baseColor: "#b32a2a",
  hueVariance : 4,
  lightenVariance : 0.05,
  saturateVariance : 0.05,
  alpha:80,
  alphaVariance:20,

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

  GUI_ADD_SLIDER("segCount",3,10,RebuildAndRedraw);

  GUI_ADD_SLIDER("width",10,100,RebuildAndRedraw);
  GUI_ADD_SLIDER("widthVar",5,50,RebuildAndRedraw);
  GUI_ADD_SLIDER("radius",0,400,RebuildAndRedraw);
  GUI_ADD_SLIDER("radiusVar",5,50,RebuildAndRedraw);

  gui.addColor( params, "baseColor" ).onChange( function( value )
  {
      ReColorAndRedraw();
  } );

  GUI_ADD_SLIDER("hueVariance", 0, 20, ReColorAndRedraw );
  GUI_ADD_SLIDER("lightenVariance", 0, 0.25, ReColorAndRedraw );
  GUI_ADD_SLIDER("saturateVariance", 0, 0.25, ReColorAndRedraw );
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
  g_rings = [];
  for(var i=0;i<16;i++)
  {
    //g_rings.push( new RingGroup(params,createVector(random(g_canvasSize),random(g_canvasSize))) );
  }

  g_rings.push( new RingGroup(params,createVector(g_canvasSize/2,g_canvasSize/2)) );

  ReColorAndRedraw();
}

function ReColorAndRedraw()
{
  RecolorRings();
  ReDraw();
}

function RecolorRings()
{
  g_rings.forEach(function(r){r.InitColor(params);});
}


function ReDraw()
{
  clear();
  blendMode(params.blendMode);
  background( params.whiteBG ? 255 : 0 );

  //translate( g_canvasSize / 2, g_canvasSize / 2 );
//  translate( -100,-100 );

  g_rings.forEach(function(r){r.Draw();});
//  g_ring.DebugDraw();

//  resetMatrix();
}

function mousePressed() {
  if(mouseX > 0 && mouseY > 0 && mouseX < g_canvasSize && mouseY < g_canvasSize && mouseButton == LEFT)
    RebuildAndRedraw();
}
