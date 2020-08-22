var COLOR = net.brehaut.Color;
var g_random = new Random();

var g_canvasWidth = 600;
var g_canvasHeight = 600;

var g_lines = [];
var g_nodes = [];

var params =
{
  gridSize:7,
  gridVariance:0.8,

  drawLines:false,
  drawNodes:false,
  drawCurves:true,

  curveVariance:0.25,
  curveCount:80,
  alpha:30,
  alphaVariance:50,

  whiteBG:false,
  blendMode: 0,

  strokeWidth:1.2,
  baseColor: "#e62121",
  hueVariance : 4,
  lightenVariance : 0.15,
  saturateVariance : 0.05,

  Redraw : function()
  {
      RebuildAndRedraw();
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
//  GUI_ADD("drawLines",ReDraw);
//  GUI_ADD("drawCurves",ReDraw);
//  GUI_ADD("drawNodes",ReDraw);

  gui.add( params, 'blendMode', { BLEND: BLEND, LIGHTEST: LIGHTEST, DARKEST: DARKEST, EXCLUSION: EXCLUSION, SCREEN: SCREEN, MULTIPLY: MULTIPLY, SOFT_LIGHT: SOFT_LIGHT } )
   .onChange( function( value ) { ReDraw(); } );
  GUI_ADD_SLIDER("gridSize",1,20,RebuildAndRedraw);
  GUI_ADD_SLIDER("gridVariance",0,1,RebuildAndRedraw);

  GUI_ADD_SLIDER("curveCount",1,200,RebuildAndRedraw);
  GUI_ADD_SLIDER("curveVariance",0,0.8,RebuildAndRedraw);

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

  params.blendMode = SCREEN; // argh

  smooth();
  ellipseMode( RADIUS );

  RebuildAndRedraw();
}

function RebuildAndRedraw()
{
  var gridSize = Math.round(params.gridSize);
  var spacing = g_canvasWidth / (gridSize + 1);
  g_nodes = new Array(gridSize);
  for(var i=0;i<gridSize;i++)
  {
    g_nodes[i] = new Array(gridSize);

    for(var j=0;j<gridSize;j++)
    {
      var pos = createVector((i+1) * spacing, (j+1) * spacing);
      var halfRange = params.gridVariance * spacing * 0.5;
      pos.x += random(-halfRange,halfRange);
      pos.y += random(-halfRange,halfRange);
      g_nodes[i][j] = pos;
    }
  }

  g_lines = [];

  for(var c=0;c<params.curveCount;c++)
  {
    for(var i=0;i<gridSize;i++)
    {
      for(var j=0;j<gridSize;j++)
      {
        if(j > 0 && i > 0)
        {
          var verts = [g_nodes[i-1][j].copy(),g_nodes[i-1][j-1].copy(),g_nodes[i][j-1].copy(),g_nodes[i][j].copy()];
        //  DrawCornerBezier(g_nodes[i-1][j],g_nodes[i-1][j-1],g_nodes[i][j-1]);
          g_lines.push( new LineLoop(params,verts) );
        }
      }
    }
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

function DrawNode(n)
{
  ellipse(n.x,n.y,4,4);
}

function ReDraw()
{
  clear();
  blendMode(params.blendMode);
  background( params.whiteBG ? 255 : 0 );

  var drawCol =  params.whiteBG ? 0 : 255;

  stroke(drawCol);
  noFill();

  g_lines.forEach(function(r){r.Draw();});

  fill(drawCol);

  var gridSize = Math.round(params.gridSize);
  for(var i=0;i<gridSize;i++)
  {
    for(var j=0;j<gridSize;j++)
    {
      if(params.drawNodes)
        DrawNode(g_nodes[i][j]);

      if(params.drawLines)
      {
        if(j > 0)
          DrawLine(g_nodes[i][j],g_nodes[i][j-1]);

        if(i > 0)
          DrawLine(g_nodes[i][j],g_nodes[i-1][j]);
      }
    }
  }
}

function mousePressed() {
  if(mouseX > 0 && mouseY > 0 && mouseX < g_canvasWidth && mouseY < g_canvasHeight && mouseButton == LEFT)
    RebuildAndRedraw();
}
