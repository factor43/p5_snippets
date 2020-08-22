var COLOR = net.brehaut.Color;
var g_random = new Random();

var g_canvasWidth = 800;
var g_canvasHeight = 400;

var g_blades = [];

var params =
{
  bladeCount:250,

  height0:100,
  height0Var:20,
  height1:100,
  height1Var:20,

  bend:0,
  bendVar:0.5,

  strokeWidth:1.2,

  width:2,
  widthVar:1,
  whiteBG:true,
  blendMode: 0,
  baseColor: "#3c7243",
  hueVariance : 4,
  lightenVariance : 0.15,
  saturateVariance : 0.05,
  alpha:220,
  alphaVariance:10,

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
  GUI_ADD_SLIDER("bladeCount",1,500,RebuildAndRedraw);

  GUI_ADD_SLIDER("height0",30,200,RebuildAndRedraw);
  GUI_ADD_SLIDER("height0Var",0,100,RebuildAndRedraw);
  GUI_ADD_SLIDER("height1",30,200,RebuildAndRedraw);
  GUI_ADD_SLIDER("height1Var",0,100,RebuildAndRedraw);

  GUI_ADD_SLIDER("bend",-PI/3,PI/3,RebuildAndRedraw);
  GUI_ADD_SLIDER("bendVar",0,PI/2,RebuildAndRedraw);

  //GUI_ADD_SLIDER("strokeWidth",0.5,3,ReDraw);

  GUI_ADD_SLIDER("width",0.5,4.0,RebuildAndRedraw);
  GUI_ADD_SLIDER("widthVar",0,1.5,RebuildAndRedraw);

  gui.addColor( params, "baseColor" ).onChange( function( value )
  {
      ReColorAndRedraw();
  } );

  GUI_ADD_SLIDER("hueVariance", 0, 40, ReColorAndRedraw );
  GUI_ADD_SLIDER("lightenVariance", 0, 0.25, ReColorAndRedraw );
  GUI_ADD_SLIDER("saturateVariance", 0, 0.25, ReColorAndRedraw );
  GUI_ADD_SLIDER("alpha", 0, 255, ReColorAndRedraw );
  GUI_ADD_SLIDER("alphaVariance", 0, 120, ReColorAndRedraw );
  //gui.add( params, "reColor" );
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
  g_blades = [];
  for(var i=0;i<params.bladeCount;i++)
  {
    g_blades.push( new GrassBlade(params,random(0,g_canvasWidth)) );
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
  g_blades.forEach(function(r){r.InitColor(params);});
}

function ReDraw()
{
  clear();
  blendMode(params.blendMode);
  background( params.whiteBG ? 255 : 0 );

  stroke(0);
  noFill();

  translate( 0, g_canvasHeight );

  g_blades.forEach(function(r){r.Draw();});

  resetMatrix();
}

function mousePressed() {
  if(mouseX > 0 && mouseY > 0 && mouseX < g_canvasWidth && mouseY < g_canvasHeight && mouseButton == LEFT)
    RebuildAndRedraw();
}
