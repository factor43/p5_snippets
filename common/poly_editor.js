
/*
    Three classes, all with drawing logic
     Poly: collection of verts
     PolyEditor: allow creating/editing a poly via mouse
     PolyCollection: manager class containing n polys, and the editor

     todo: add support for holes by adding additionl polys
*/

function Poly(owner, params)
{
  // Verts are in a completely flat array (for compatibility with polyk)
  this.m_rawVerts = params.verts.slice();  // copy
  this.m_name = params.name;
  this.m_owner = owner;
  this.m_userData = params.userData;

  this.visible = true;

  this.IsInside = function(x,y)
  {
    return PolyK.ContainsPoint(this.m_rawVerts,x,y);
  };

  this.Delete = function()
  {
    this.m_owner.DeletePoly(this);
  };

  this.Edit = function()
  {
    this.m_owner.editor.StartEdit(this);
    Redraw();
  };

  this.DebugDraw = function()
  {
    stroke(200);
    rectMode(CORNER);
    var aabb = PolyK.GetAABB(this.m_rawVerts);
    rect(aabb.x,aabb.y,aabb.width,aabb.height);
  };

  this.GetRandomPointInside = function()
  {
    var aabb = PolyK.GetAABB(this.m_rawVerts);
    return this.GetRandomPointInsideAABB(aabb);
  };

  this.GetRandomPointInsideAABB = function(aabb)
  {
    var limit = 1000;
    while(limit > 0)
    {
      var x = aabb.x + random(aabb.width);
      var y = aabb.y + random(aabb.height);

      if(PolyK.ContainsPoint(this.m_rawVerts,x,y))
        return [x,y];

      var closePoint = this.GetClosestPointOnEdge(x,y);
      x += random(-1,1);
      y += random(-1,1);

      if(PolyK.ContainsPoint(this.m_rawVerts,x,y))
        return [x,y];

      limit--;
    }
    return null;
  }

  this.GetAsPairArray = function()
  {
    var a = [];
    var vertCount = this.GetVertCount();
    for ( var i=0; i<vertCount; i++ )
    {
      a.push(this.GetVertex(i));
    }
    return a;
  };

  this.GetCentroid = function()
  {
    var arr = this.GetAsPairArray();

    var x = arr.map(function(a){ return a[0]; });
    var y = arr.map(function(a){ return a[1]; });
    var minX = Math.min.apply(null, x);
    var maxX = Math.max.apply(null, x);
    var minY = Math.min.apply(null, y);
    var maxY = Math.max.apply(null, y);
    return [(minX + maxX)/2, (minY + maxY)/2];
  };

  this.GetClosestPointOnEdge = function(x,y)
  {
    var edge = PolyK.ClosestEdge(this.m_rawVerts,x,y);
    return [edge.point.x, edge.point.y];
  };

  // Returns the *first* crossing point (if it exists) when travelling from (x0,y0) to (x1,y1)
  this.CrossesEdge = function(x0,y0,x1,y1)
  {
    var result = null;
    var vertCount = this.GetVertCount();
    for ( var i=0; i<vertCount; i++ )
    {
      var e0 = this.GetVertex(i);
      var e1 = this.GetVertexSafe( i + 1 );

      var intersection = getLineSegmentIntersection(x0,y0,x1,y1,e0[0],e0[1],e1[0],e1[1]);
      if(intersection)
      {
        // No result yet, or this one is closer to start of segment
        if(!result || dist(intersection.x,intersection.y,x0,y0) < dist(intersection.x,intersection.y,result.x,result.y))
          result = intersection;
      }
    }

    return result;
  };

  this.Pull = function(x,y, pullStrength)
  {
    if(this.IsInside(x,y))
      return 0;

    var d = GetDefaultArg(pullStrength,30);

    var edge = PolyK.ClosestEdge(this.m_rawVerts,x,y);
    return min(1,edge.dist * edge.dist / (d*d));
  };

  this.GetVertCount = function() { return GetVertCount(this.m_rawVerts); };
  this.Draw = function()
  {
    if(!this.visible)
      return;

    stroke(100);
    noFill();
    var vertCount = this.GetVertCount();
    for ( var i=0; i<vertCount; i++ )
    {
      var next = (i+1) % vertCount;
      drawSegmentFromTuple(this.GetVertex(i),this.GetVertex(next));
    }

    this.DebugDraw();
  };

  this.GetVertex = function(index){ return GetVertex(this.m_rawVerts,index); };
  this.GetVertexSafe = function(index){ return GetVertexSafe(this.m_rawVerts,index); };
}


function PolyCollection()
{
  this.m_polys = [];
  this.m_name = "polyTest01";
  this.m_nextPolyID = 0;
  this.editor = new PolyEditor(this);
  this.guifolder = null;

  // Override hooks to add custom behaviour
  this.OnAddPolyCB = function(p){};
  this.OnCreatePolyCB = function(p){};

  this.CreatePolyName = function()
  {
    this.m_nextPolyID++;
    return "Poly_" + this.m_nextPolyID.toString();
  };

  this.AddPoly = function(z)
  {
    this.m_polys.push(z);
    this.AddPolyGUI(z);
    this.OnAddPolyCB(z);
    return z;
  };

  this.DeletePoly = function(z)
  {
    this.guifolder.removeFolder(z.m_name);
    RemoveFromList( this.m_polys, z );
    this.editor.Reset();
    this.Save();
    Redraw();
  };

  this.CreatePoly = function(verts)
  {
    var params = {verts: verts, name:this.CreatePolyName(), userData:null};
    var p = new Poly(this,params);
    this.OnCreatePolyCB(p);
    this.AddPoly(p);
    this.Save();
  };

  this.Load = function()
  {
    var json = JSON.parse(localStorage.getItem(this.m_name));
    this.LoadInternal(json);
  };

  this.LoadInternal = function(json)
  {
    this.Clear();
    this.m_nextPolyID = json.nextPolyID;
    for ( var i = 0; i < json.polys.length; i++ )
    {
      this.AddPoly(new Poly(this,json.polys[i]));
    }
  };

  this.Import = function(jsonUrl)
  {
    loadJSON(jsonUrl, this.ImportCB.bind(this));
  };

  this.ImportCB = function(json)
  {
    this.LoadInternal(json);
    Redraw();
  };

  this.Save = function(externalJson)
  {
    json = {}; // new JSON Object
    json.polys = [];
    json.nextPolyID = this.m_nextPolyID;
    for ( var i = 0; i < this.m_polys.length; i++ )
    {
      var z = this.m_polys[i];
      json.polys[i] = {verts: z.m_rawVerts, name:z.m_name, userData:z.m_userData};
    }

    if(externalJson)
    {
      saveJSONObject(json, 'test.json');
    }
    else
    {
      var dataToStore = JSON.stringify(json);
      localStorage.setItem(this.m_name, dataToStore);
    }
  };

  this.DrawPolys = function()
  {
    for ( var i = 0; i < this.m_polys.length; i++ )
    {
      this.m_polys[i].Draw();
    }
  };

  this.Clear = function()
  {
    this.m_polys.forEach(function(z) { z.Delete(); });
    this.m_polys = [];
    this.editor.Reset();
  };

  this.OnKeyTyped = function(key)
  {
    if ( key === ' ' )
    {
      // creates poly from vertices
      this.editor.Finish(this);
      Redraw();
    }
    else if ( key === 'c' )
    {
      this.Clear();
      this.Save();
      Redraw();
    }
    else if ( key === 'd' )
    {
      if(this.editor.DeleteVertUnderMouse())
        Redraw();
    }
    else if ( key === 's' )
    {
      this.Save();
    }
    else if ( key === 'e' )
    {
      this.Save(true);
    }
  };

  this.Draw = function()
  {
    ellipseMode( RADIUS );
    noFill();
    this.editor.Draw();
    stroke( 0 );
    this.DrawPolys();
  };

  this.OnMousePressed = function()
  {
    this.editor.OnMousePressed();

    if(this.editor.IsActive())
      Redraw();
  };

  this.OnMouseReleased = function()
  {
    this.editor.OnMouseReleased();
    if(this.editor.IsActive())
      Redraw();
  };

  this.OnMouseDragged = function()
  {
    this.editor.OnMouseDragged();
    if(this.editor.IsActive())
      Redraw();
  };

  this.OnMouseMoved = function()
  {
    if(this.editor.IsActive())
      Redraw();
  };

  this.AddPolyGUI = function( z )
  {
    if(this.guifolder)
    {
      z.uiFolder = this.guifolder.addFolder( z.m_name );
      z.uiFolder.add( z, "visible" ).onChange( function( value )
      {
        Redraw();
      } );
      z.uiFolder.add( z, 'Delete');
      z.uiFolder.add( z, 'Edit');
    }
  };
}

function PointOnScreen(x,y)
{
  return ( x > 0 && y > 0 && x < g_canvasWidth && y < g_canvasHeight );
}



var PolyEditor = function(manager)
{
  this.manager = manager;
  this.poly = null;
  this.verts = [];
  this.draggingPointIndex = -1;
  this.vertRadius = 8;

  this.OnMouseReleased = function()
  {
    this.draggingPointIndex = -1;
  };

  this.OnMousePressed = function()
  {
    // hack to ignore right click
    if (mouseButton !== LEFT)
      return;

    this.draggingPointIndex = this.FindVertIndexAtMousePosition();

    if ( this.draggingPointIndex === -1)
    {
      if(this.poly)
      {
        var edge = PolyK.ClosestEdge(this.verts,mouseX,mouseY);

        if(edge.dist < this.vertRadius)
        {
          this.verts.splice((edge.edge+1) * 2, 0, edge.point.x, edge.point.y);
        }
      }
      else if ( PointOnScreen(mouseX,mouseY) )
      {
        // Just add vert wherever, buy only if this is a new poly
        this.verts.push( mouseX );
        this.verts.push( mouseY );
        // Drag immediately?
        //this.draggingPointIndex = GetVertCount( this.verts ) - 1;
      }
    }
  };

  this.OnMouseDragged = function()
  {
      if ( this.draggingPointIndex !== -1 )
      {
        var vertIndex = this.draggingPointIndex * 2;
        this.verts[ vertIndex ] = mouseX;
        this.verts[ vertIndex + 1 ] = mouseY;
      }
  };

  this.FindVertIndexAtMousePosition = function()
  {
    for ( var i = 0; i < GetVertCount( this.verts ); i++ )
    {
      var v = GetVertex( this.verts, i );
      if ( dist( mouseX, mouseY, v[ 0 ], v[ 1 ] ) < this.vertRadius )
      {
        return i;
      }
    }
    return -1;
  };

  this.DeleteVertUnderMouse = function()
  {
    var i = this.FindVertIndexAtMousePosition();
    if(i !== -1)
    {
      this.verts.splice(i*2, 2);
      return true;
    }

    return false;
  };

  this.StartEdit = function(z)
  {
    this.poly = z;
    this.verts = z.m_rawVerts;
  };

  this.Reset = function()
  {
    this.poly = null;
    this.verts = [];
  };

  this.Finish = function()
  {
    if(!this.poly)
    {
      if ( GetVertCount( this.verts ) > 2 )
      {
        this.manager.CreatePoly( this.verts );
      }
    }

    this.Reset();
  };

  this.IsActive = function(){ return this.verts.length > 0; };

  this.Draw = function()
  {
    var vertCount = GetVertCount( this.verts );
    var mouseOverVert = this.FindVertIndexAtMousePosition();
    for ( var i = 0; i < vertCount; i++ )
    {
      stroke( 100 );
      noFill();

      var curr = GetVertex( this.verts, i );

      if( mouseOverVert === i)
        fill(150);

      if(i === this.draggingPointIndex)
        fill(200,100,0);

      ellipse( curr[ 0 ], curr[ 1 ], this.vertRadius, this.vertRadius );

      var next = GetVertexSafe( this.verts, i + 1 );
      if ( i === ( vertCount - 1 ) && vertCount > 2 && !this.poly)
        continue;

      drawSegmentFromTuple( curr, next );
    }

    if(this.poly && mouseOverVert === -1 && vertCount > 2)
    {
      var edge = PolyK.ClosestEdge(this.verts,mouseX,mouseY);
      if(edge.dist < this.vertRadius)
        ellipse( edge.point.x, edge.point.y, this.vertRadius, this.vertRadius );
    }

    if(!this.poly && vertCount >= 2 && PointOnScreen(mouseX,mouseY))
    {
      stroke( 200, 200, 0 );
      drawSegmentFromTuple( GetVertex( this.verts, 0 ), [mouseX,mouseY] );
      drawSegmentFromTuple( GetVertex( this.verts, GetVertCount(this.verts)-1 ), [mouseX,mouseY] );
    }
  };
};
