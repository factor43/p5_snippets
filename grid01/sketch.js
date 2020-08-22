var COLOR = net.brehaut.Color;
var g_canvasWidth = 610;
var g_canvasHeight = 450;
var g_random = new Random();

var g_quadSize = 50;

var params =
{
  flare : true,
  noise : true,
  turbulance : true,

  baseColor: "#b32a2a",
  hueVariance : 5,
  lightenVariance : 0.25,
  saturateVariance : 0.1,

  reColor : function()
  {
      recolorAndDraw();
  }
};

var fx = {};

function createFlare()
{
  var flare = createImage(160,160);
  var radius = 80;

  for(x=-radius;x<=radius;x++)
  {
    for(y=-radius;y<=radius;y++)
    {
      var f = max(0,1 - (sqrt(x * x + y * y) / radius));
      var w = f * f * 205;
      flare.set(x + radius, y + radius,color(255,w));
    }
  }

  flare.updatePixels();

  return flare;
}

function createRandomNoise()
{
  var w = 300;
  var h = 300;
  var randomNoise = createImage(w,h);

  for(x=0;x<w;x++)
  {
    for(y=0;y<h;y++)
    {
        randomNoise.set(x, y,color(random(255),random(255)));
    }
  }

  randomNoise.updatePixels();

  return randomNoise;
}


var Noise = function(w,h)
{
  this.height = h;
  this.width = w;

  this.noise = new Array(w);
  for (var i=0; i < w; i++)
    this.noise[i] = new Array(h);

  for (i=0; i < w; i++)
  {
    for (var j=0; j < h; j++)
    {
      this.noise[i][j] = random(1.0);
    }
  }

  // linearly interpolate between points in noise array
  this.linear = function(u, v)
  {
      var iu = int(u);
      var iv = int(v);
      var du = u - iu;
      var dv = v - iv;

      iu = iu % width;
      iv = iv % height;
      var ip = (iu+1) % width;
      var iq = (iv + 1) % height;

      var bot = this.noise[iu][iv] + du*(this.noise[ip][iv]-this.noise[iu][iv]);
      var top = this.noise[iu][iq] + du*(this.noise[ip][iq]-this.noise[iu][iq]);
      return bot+dv*(top-bot);
  };

  // linearly interpolate between noise at different resolutions
  this.turbulence = function(u, v)
  {
      var t = 0;
      var count = 0;
      var scale = 32;
      var pixel_size = 1;
      while ( scale > pixel_size) {
          count++;
          t += this.linear((u/scale), (v/scale)) ;
          scale /= 2;
      }
      return t/count;
  };
};

function createTurbulance()
{
  var w = 200;
  var h = 200;

  var g_noiseObj = new Noise(w,h);
  var turbulance = createImage(w,h);

  for(var x=0;x<w;x++)
  {
    for(var y=0;y<h;y++)
    {
      var c = g_noiseObj.turbulence(x,y);
      turbulance.set(x,y,c * 255);
    }
  }

  turbulance.updatePixels();

  return turbulance;
}

function setup() {

  var myCanvas = createCanvas(g_canvasWidth, g_canvasHeight);
  myCanvas.parent('container');

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

  GUI_ADD("flare", reDraw);
  GUI_ADD("noise", reDraw );
  GUI_ADD("turbulance", reDraw );

  gui.addColor( params, "baseColor" ).onChange( function( value )
  {
      recolorAndDraw();
  } );

  GUI_ADD_SLIDER("hueVariance", 0, 60, recolorAndDraw );
  GUI_ADD_SLIDER("lightenVariance", 0, 0.5, recolorAndDraw );
  GUI_ADD_SLIDER("saturateVariance", 0, 0.5, recolorAndDraw );
//  gui.add( params, "reColor" );

  // Create offscreen graphics (async?)
  fx.flare = createFlare();
  fx.randomNoise = createRandomNoise();
  fx.turbulance = createTurbulance();

  fx.xStepCnt = Math.ceil(g_canvasWidth / g_quadSize);
  fx.yStepCnt = Math.ceil(g_canvasHeight / g_quadSize);

  recolorAndDraw();
}

function recolorAndDraw()
{
  fx.baseColor = COLOR( params.baseColor );
  fx.cols = [];

  for(var y=0;y<fx.yStepCnt;y++)
  {
    for(var x=0;x<fx.xStepCnt;x++)
    {
      var col = fx.baseColor.shiftHue(g_random.normal(0,params.hueVariance))
                         .darkenByRatio(g_random.normal(0,params.lightenVariance))
                         .lightenByRatio(g_random.normal(0,params.lightenVariance))
                         .desaturateByAmount(g_random.normal(0,params.saturateVariance))
                         .saturateByAmount(g_random.normal(0,params.saturateVariance));

      fx.cols.push( [col.getRed() * 255, col.getGreen() * 255, col.getBlue() * 255] );
    }
  }

  reDraw();
}

function reDraw()
{
  clear();
  background(0);
  noStroke();

  var xPad = ((fx.xStepCnt * g_quadSize) - g_canvasWidth) / 2;
  var yPad = ((fx.yStepCnt * g_quadSize) - g_canvasHeight) / 2;

  var colorIndex = 0;
  for(var y=0;y<fx.yStepCnt;y++)
  {
    var yC = y * g_quadSize - yPad;

    for(var x=0;x<fx.xStepCnt;x++)
    {
      var xC = x * g_quadSize - xPad;
      fill(fx.cols[colorIndex++]);
      rect(xC, yC, g_quadSize-1,g_quadSize-1);
    }
  }

  if(params.turbulance)
  {
    tint(255,55);
    image(fx.turbulance,0,0,g_canvasWidth, g_canvasHeight);
  }

  if(params.flare)
  {
    tint(255,220);
    image(fx.flare,0,0,g_canvasWidth, g_canvasHeight);
  }

  if(params.noise)
  {
    blendMode(OVERLAY);
    tint(255,30);
    image(fx.randomNoise,0,0,g_canvasWidth, g_canvasHeight);
    blendMode(BLEND);
  }
}


function mousePressed() {
  if(mouseX > 0 && mouseY > 0 && mouseX < g_canvasWidth && mouseY < g_canvasHeight)
    recolorAndDraw();
}
