
var g_canvasWidth = 400;
var g_canvasHeight = 550;

var c_y0,c_y1;
var c_x0,c_x1;

var c_roundCnt = 22;
var c_teamCnt = 18;

var c_yStep,c_xStep;

var c_mouseOverNodeThreshold;
var c_mouseOverNodeThresholdSqr;

var g_Data = 0;
var g_selectedTeam = -1;
var g_highlightedTeam = -1;
var g_mouseOverGamePos;
var g_mouseOverGameIndex = -1;
var g_curveData = [];

var g_animRevealCnt = 0;

var c_DistancePerPixelY = 0;
var c_TimePerPixelX = 0;
var c_MinTimeX = 300;
var c_MaxTimeX = 1600;


function InitGlobals()
{
  g_canvasWidth = window.innerWidth
  || document.documentElement.clientWidth
  || document.body.clientWidth;

  c_y0 = 0.925 * g_canvasHeight;
  c_y1 = 0.1 * g_canvasHeight;    // top

  c_x0 = 0.02 * g_canvasWidth;
  c_x1 = 0.875 * g_canvasWidth;

  if(g_Data)
  {
    console.log(g_Data.stations)
    console.log(g_Data.distances)
    console.log(g_Data.services)

    c_DistancePerPixelY =  g_Data.distances[0] / (c_y0 - c_y1);

    var timeRange = c_MaxTimeX - c_MinTimeX;
    c_TimePerPixelX = timeRange / (c_x1 - c_x0);

  //  c_teamCnt = g_teamData.length;
  //  c_roundCnt = g_teamData[0].ladder_pos.length;
/*
    c_yStep = (c_y0 - c_y1) / (c_teamCnt + 1);
    c_xStep = (c_x1 - c_x0) / (c_roundCnt + 1);

    c_mouseOverNodeThreshold = (0.15 * c_xStep);
    c_mouseOverNodeThresholdSqr = c_mouseOverNodeThreshold * c_mouseOverNodeThreshold;
    InitCurves();
*/
  }
}

function InitCurves()
{
  /*
  for(var t in g_teamData)
  {
    var nodes = [];
    var lp = g_teamData[t].ladder_pos;

    g_finalPositions[t] = lp[c_roundCnt-1];

    for(i=0;i<c_roundCnt;i++)
    {
      var prevI = max(0,i-1);
      var nextI = min(i+1,c_roundCnt-1);

      var currPos = GetPos( i, lp[i] );
      var prevPos = GetPos( i-1, lp[prevI] );
      var nextPos = GetPos( i+1, lp[nextI] );

      var toNext = p5.Vector.sub(nextPos, currPos).normalize();
      var fromPrev = p5.Vector.sub(currPos,prevPos).normalize();

      var tangent = p5.Vector.add(toNext,fromPrev).normalize();
      nodes[i] = new Node( currPos, tangent );
    }
    g_curveData[ t ] = nodes;
  }
  */
}

window.onresize = function(event) {
  InitGlobals();
  resizeCanvas(g_canvasWidth, g_canvasHeight);
};

function FlipY(y){ return g_canvasHeight-y; }

function GetPos(round, ladderPos)
{
  var x = c_x0 + ((round+1) * c_xStep);
  var y = c_y1 + ((ladderPos+1) * c_yStep);
  return createVector(x,y);
}

function ClosestPointOnToLineSegment(v0,v1,point)
{
  var axis = p5.Vector.sub(v1,v0);
  var toPoint = p5.Vector.sub(point,v0);

  var axisLength = axis.mag();
  axis.div(axisLength);

  var dotP = toPoint.dot(axis);

  // js clamp?
  if(dotP < 0.0)
  dotP = 0.0;

  if(dotP > axisLength)
  dotP = axisLength;

  return p5.Vector.lerp(v0, v1, dotP / axisLength);
}

function DistanceSquaredToLineSegment(v0,v1,point)
{
  var closePoint = ClosestPointOnToLineSegment(v0,v1,point);
  return p5.Vector.sub(point,closePoint).magSq();
}

function Node (pos, tangent) {
  this.m_position = pos;
  this.m_tangent = tangent;
  this.m_tangent.setMag(c_xStep * 0.25);

  this.DrawBezier = function(next)
  {
    var p0 = this.m_position;
    var p1 = next.m_position;

    var c0 = p5.Vector.add(p0,this.m_tangent);
    var c1 = p5.Vector.sub(p1,next.m_tangent);

    bezier(p0.x, p0.y, c0.x, c0.y, c1.x, c1.y, p1.x, p1.y);
  };

  this.IsMouseOverNode= function(pos)
  {
    return p5.Vector.sub(pos,this.m_position).magSq() < c_mouseOverNodeThresholdSqr;
  }

  this.IsMouseOverSegment = function(next,mousePos)
  {
    var p0 = this.m_position;
    var p1 = next.m_position;

    return DistanceSquaredToLineSegment(p0,p1,mousePos) < c_mouseOverNodeThresholdSqr;
  }

  this.GetPos = function() { return this.m_position; }
}

function getParameterByName(name)
{
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
  results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function GetTeamIndex(name)
{
  for(var t in g_teamData)
  {
    if(g_teamData[t].display_name == name)
    return t;
  }

  return -1;
}

function setup()
{
  InitGlobals();

  var myCanvas = createCanvas(g_canvasWidth, g_canvasHeight);
  myCanvas.parent('container');

  loadJSON("processed.json", LoadData);
}

function LoadData(data)
{
  g_Data = data;
  InitGlobals();
//  InitCurves();
}

function drawSegment(startRound, ladderPos0, ladderPos1)
{
  var p0 = GetPos(startRound,ladderPos0);
  var p1 = GetPos(startRound+1,ladderPos1);

  line( p0.x, p0.y, p1.x, p1.y );
}

function UpdateMouseOver()
{
  /*
  g_highlightedTeam = -1;
  g_mouseOverGame = null;
  g_mouseOverGameIndex = -1;

  var mousePos = createVector(mouseX,mouseY);

  for(var t in g_curveData)
  {
    var curve = g_curveData[t];
    for(i=0;i<curve.length-1;i++)
    {
      if(curve[i].IsMouseOverSegment(curve[i+1],mousePos))
      g_highlightedTeam = t;

      if(curve[i].IsMouseOverNode(mousePos))
      {
        g_mouseOverGamePos = curve[i].GetPos();
        g_mouseOverGameIndex = g_teamData[t].match_indices[i];
      }
    }

    var endPos = curve[curve.length-1].GetPos();
    var xStart = endPos.x + (0.6 * c_xStep);
    if(mousePos.x > xStart )
    {
      var yStart = endPos.y + 4;
      var w = textWidth(g_teamData[t].display_name);

      if(mousePos.x < xStart + w)
      {
        if(mousePos.y > yStart-12 && mousePos.y < yStart)
        g_highlightedTeam = t;
      }
    }
  }
  */
}

function mousePressed()
{
  if (g_highlightedTeam != -1)
  {
    g_selectedTeam = g_highlightedTeam;
  }
}

function StationY(i)
{
  return c_y0 - g_Data.distances[i] / c_DistancePerPixelY;
}

function draw()
{
  if(!g_Data)
    return;

  UpdateMouseOver();
  background(25);

  // HEADING
  noStroke();
  textAlign(CENTER);
  textSize(24);
  textStyle(NORMAL);
  text(" Vline timetable ", g_canvasWidth/2, 32);

  stroke(90,90,90,50);
  strokeWeight(1);

  var y = c_y1;

  textAlign(LEFT);
  textStyle(NORMAL);
  textSize(12);
  fill(200);
  for(var i = 0;i<g_Data.stations.length;i++)
  {
    y = StationY(i);
    line(c_x0,y,c_x1,y);
    text(g_Data.stations[i], c_x1,y+4);
  }

  stroke(200);
  for(var key in g_Data.services)
  {
    var service = g_Data.services[key];
    var prev = null;
    for(var i = 0;i<g_Data.stations.length;i++)
    {
      var time = service[i];
      if(time != "-")
      {
        var y = StationY(i);
        var x = c_x0 + (parseInt(time) - c_MinTimeX) / c_TimePerPixelX;
        if(prev != null)
        {
          line(x,y,prev.x,prev.y);
        }
        ellipse(x,y,3,3);
        prev = createVector(x,y);
      }
    }

  }



  // GRID, ROUND LABELS
  /*
  textSize(14);
  textStyle(NORMAL);
  stroke(90,90,90,50);
  strokeWeight(1);
  var yBottom = c_y0 - 0.6 * c_yStep;
  var yTop = c_y1 + 0.6 * c_yStep;
  for(i=0;i<c_roundCnt;i++)
  {
    var x = c_x0 + ((i+1) * c_xStep);
    line(x,yBottom,x,yTop);

    text(parseInt(i+1), x, c_y0 + 6);
  }

  var xStart = c_x0 + 0.6 * c_xStep;
  var xEnd = c_x1 - 0.6 * c_xStep;
  for(i=1;i<=c_teamCnt;i++)
  {
    var yOffset = i * c_yStep;
    line(xStart, c_y0 - yOffset, xEnd, c_y0 - yOffset);
  }

  //  TEAM LABELS
  textAlign(LEFT);
  for(var t in g_curveData)
  {
    var curve = g_curveData[t];
    var endPos = curve[curve.length-1].GetPos();

    if(t == g_selectedTeam || t == g_highlightedTeam)
      textStyle(BOLD);
    else
      textStyle(NORMAL);

    var xStart = endPos.x + (0.6 * c_xStep);
    var yStart = endPos.y + 4;
    text(g_teamData[t].display_name, xStart, yStart);
  }

  DrawCurves();
  DrawMouseOver();
  */
}

function DrawMouseOver()
{
  noStroke();
  /*
  if(g_mouseOverGameIndex != -1)
  {
    var pos = g_mouseOverGamePos;
    ellipse(pos.x, pos.y, 10, 10);

    var matchTokens = g_matchData[g_mouseOverGameIndex].split("|");

    var team0 = parseInt(matchTokens[0]);
    var team1 = parseInt(matchTokens[2]);

    var score0 = parseInt(matchTokens[1])
    var score1 = parseInt(matchTokens[3])

    var line0 = g_teamData[team0].display_name + " " + matchTokens[1];
    var line1 = g_teamData[team1].display_name + " " + matchTokens[3];

    if( score1 > score0 )
    {
      var temp = line1;
      line1 = line0;
      line0 = temp;
    }

    var str0 = line0;
    var str1 = "def";
    var str2 = line1;

    fill(0);
    textStyle(NORMAL);
    textSize(10);
    textAlign(CENTER);

    var w = max(textWidth(str0),textWidth(str2)) + 10;
    var halfW = w / 2;

    fill(150, 150, 150, 240);
    var h = 40;
    rect(pos.x - halfW, pos.y - h - 7, w, h);

    fill(0);
    text(str0, pos.x, pos.y - h + 5);
    text(str1, pos.x, pos.y - h + 17);
    text(str2, pos.x, pos.y - h + 29);
  }
  */
}

function DrawCurves()
{
  // Draw non-selected
  strokeWeight(2);

  var g_green = color(0,255,0);
  var g_red = color(255,0,0);

  for(var t in g_curveData)
  {
    if(t != g_selectedTeam)
    {
      col = lerpColor(g_green, g_red, g_finalPositions[t] / c_teamCnt);
      stroke(red(col),green(col),blue(col),240);
      DrawCurve(t);
    }
  }

  if(g_highlightedTeam != -1 && g_highlightedTeam != g_selectedTeam)
  {
    stroke(160,160,200,255);
    DrawCurve(g_highlightedTeam);
  }

  // Draw selected
  if(g_selectedTeam != -1 )
  {
    stroke(255,255,255,255);
    DrawCurve(g_selectedTeam);
  }
}

function DrawCurve(index)
{
  var curve = g_curveData[index];
  for(i=0;i<curve.length-1;i++)
  curve[i].DrawBezier(curve[i+1]);
}
