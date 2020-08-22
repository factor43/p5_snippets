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

  alpha:30,
  alphaVariance:50,

  whiteBG:true,
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

  GUI_ADD_SLIDER("strokeWidth",0.5,2.5,ReDraw);

  gui.addColor( params, "baseColor" ).onChange( function( value )
  {
      ReColorAndRedraw();
  } );

/*
  GUI_ADD_SLIDER("hueVariance", 0, 40, ReColorAndRedraw );
  GUI_ADD_SLIDER("lightenVariance", 0, 0.25, ReColorAndRedraw );
  GUI_ADD_SLIDER("saturateVariance", 0, 0.25, ReColorAndRedraw );
  GUI_ADD_SLIDER("alpha", 0, 255, ReColorAndRedraw );
  GUI_ADD_SLIDER("alphaVariance", 0, 120, ReColorAndRedraw );
  */
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
  ReDraw();
}

function Pick(points)
{
  return points[RandomIndex(points)];
}

function ReDraw()
{
  clear();
  blendMode(params.blendMode);
  background( params.whiteBG ? 255 : 0 );

  var drawCol =  params.whiteBG ? 0 : 255;

  stroke(drawCol);
  strokeWeight( 2 );
//  noFill();
  fill(drawCol);

  var points = [];

  var safeFract = 0.1;

  var y = g_canvasHeight * safeFract;
  var x = 0.5 * g_canvasWidth;

  while(y < (1.0 - safeFract) * g_canvasHeight )
  {
  //  ellipse(x,y,5,5);
    points.push(createVector(x,y));

    y += g_random.normal( 50, 20 );
    x += g_random.normal( 0, 30 );
  }

  for(var i=1;i<points.length;i++)
  {
    DrawLine(points[i],points[i-1]);
  }

  strokeWeight( 0.8 );

/*
  for(var i=0;i<10;i++)
  {
    var x = random( 0, g_canvasWidth );
    var y = random( 0, g_canvasHeight );

    var p = random(2,5);
    for(var j=0;j<p;j++)
    {
      DrawLine(createVector(x,y),Pick(points));
    }
  }
*/

  stroke(150);

  for(var i=0;i<50;i++)
  {
    var a = Pick(points);
    var b = Pick(points);

    var d = p5.Vector.sub(a,b).mag();
    var mid = p5.Vector.lerp(a,b,0.5);

    mid.y += g_random.normal( 0, d * 0.1 );
    mid.x += g_random.normal( 0, d * 0.5 );
    DrawLine(mid,a);
    DrawLine(mid,b);

    DrawLine(mid,Pick(points));
  }



  strokeWeight(2)
  stroke(0);
    for(var i=1;i<points.length;i++)
    {
      DrawLine(points[i],points[i-1]);
    }

/*
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
  */
}

function mousePressed() {
  if(mouseX > 0 && mouseY > 0 && mouseX < g_canvasWidth && mouseY < g_canvasHeight && mouseButton == LEFT)
    RebuildAndRedraw();
}
