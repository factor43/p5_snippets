var COLOR = net.brehaut.Color;
var g_canvasWidth = 600;
var g_canvasHeight = 400;
var g_random = new Random();

var g_bands = [];

var globals =
{
  whiteBG:false,
  blendMode: 0,

  addBand:function()
  {
    AddBand();
  }
};

var Band = function()
{
  this.waves = [];

  this.waveCount=1;
  this.period=200;
  this.periodVar=0;

  this.amplitude=80;
  this.amplitudeVar=0;

  this.tangetFraction=0.5;
  this.tangetLengthVar=0;
  this.tangetAngleVar=0;

  this.verticalOffset=0;
  this.verticalOffsetVar=0;

  this.width=10;
  this.widthVar=3;

  this.baseColor= "#b32a2a";
  this.hueVariance = 20;
  this.lightenVariance = 0.15;
  this.saturateVariance = 0.1;
  this.alpha=255;
  this.alphaVariance=0;

  this.Recolor = function()
  {
    for(var i=0;i<this.waves.length;i++)
    {
      this.waves[i].InitColor(this);
    }
  };

  this.ReBuildItems = function()
  {
    this.waves = [];
    for(var i=0;i<this.waveCount;i++)
      this.waves.push( new Wave(this) );
  };

  this.ReColorAndRedraw = function()
  {
    this.Recolor();
    ReDraw();   // have to redraw everything
  };

  this.RebuildAndRedraw = function()
  {
    this.ReBuildItems();
    this.ReColorAndRedraw();
  };

  this.Draw = function()
  {
    for(var i=0;i<this.waves.length;i++)
    {
      this.waves[i].Draw();
    //  this.waves[i].DebugDraw();
    }
  };

};

var g_gui;
function initGui()
{
  // Init GUI
  g_gui = new dat.GUI({ autoPlace: false });
  var guiContainer = document.getElementById('gui_container');
  guiContainer.appendChild(g_gui.domElement);

  g_gui.add( globals, 'whiteBG' ).onChange( function( value ){ ReDraw(); } );
  g_gui.add( globals, 'blendMode', { BLEND: BLEND, LIGHTEST: LIGHTEST, DARKEST: DARKEST, EXCLUSION: EXCLUSION, SCREEN: SCREEN, MULTIPLY: MULTIPLY, SOFT_LIGHT: SOFT_LIGHT } )
   .onChange( function( value ) { ReDraw(); } );
  g_gui.add( globals, 'addBand' );
}

function setup()
{
  var myCanvas = createCanvas( g_canvasWidth, g_canvasHeight );
  myCanvas.parent( 'container' );

  initGui();

  globals.blendMode = BLEND; // must be after p5 initialised

  smooth();
  ellipseMode( RADIUS );

  AddBand();
}

function AddBand()
{
  var band = new Band();
  band.folder = g_gui.addFolder( g_bands.length.toString() );
  g_bands.push(band);

  // setup some aliases
  var gui = band.folder;
  var params = band;

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

    var RebuildAndRedraw = band.RebuildAndRedraw.bind(band);
    var ReColorAndRedraw = band.ReColorAndRedraw.bind(band);

    GUI_ADD_SLIDER("waveCount",1,200,RebuildAndRedraw);

    GUI_ADD_SLIDER("period",10,400,RebuildAndRedraw);
    GUI_ADD_SLIDER("periodVar",0,50,RebuildAndRedraw);
    GUI_ADD_SLIDER("amplitude",0,150,RebuildAndRedraw);
    GUI_ADD_SLIDER("amplitudeVar",0,50,RebuildAndRedraw);

    GUI_ADD_SLIDER("tangetFraction",0,1,RebuildAndRedraw);
    GUI_ADD_SLIDER("tangetLengthVar",0,1,RebuildAndRedraw);
    GUI_ADD_SLIDER("tangetAngleVar",0,45,RebuildAndRedraw);

    GUI_ADD_SLIDER("width",0,50,RebuildAndRedraw);
    GUI_ADD_SLIDER("widthVar",0,20,RebuildAndRedraw);

    GUI_ADD_SLIDER("verticalOffset",-g_canvasHeight/2,g_canvasHeight/2,RebuildAndRedraw);
    GUI_ADD_SLIDER("verticalOffsetVar",0,100,RebuildAndRedraw);

    gui.addColor( params, "baseColor" ).onChange( function( value )
    {
        ReColorAndRedraw();
    } );

    GUI_ADD_SLIDER("hueVariance", 0, 80, ReColorAndRedraw );
    GUI_ADD_SLIDER("lightenVariance", 0, 0.5, ReColorAndRedraw );
    GUI_ADD_SLIDER("saturateVariance", 0, 0.5, ReColorAndRedraw );
    GUI_ADD_SLIDER("alpha", 0, 255, ReColorAndRedraw );
    GUI_ADD_SLIDER("alphaVariance", 0, 120, ReColorAndRedraw );
    gui.add( params, "ReColorAndRedraw" );

    band.RebuildAndRedraw();
}

function ReDraw()
{
  clear();
  blendMode(globals.blendMode);
  background( globals.whiteBG ? 255 : 0 );

  // waves are centered vertically around zero, but start at zero horizontally (minus some buffer)
  translate( 0, g_canvasHeight/ 2 );

  for(var i=0;i<g_bands.length;i++)
  {
   g_bands[i].Draw();
  }
  resetMatrix();

  //filter(BLUR);
}

function mousePressed() {
  if(mouseX > 0 && mouseY > 0 && mouseX < g_canvasWidth && mouseY < g_canvasHeight && mouseButton == LEFT)
    RebuildAndRedraw();
}
