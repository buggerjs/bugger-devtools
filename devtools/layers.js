WebInspector.LayerTreeOutline=function(treeOutline)
{WebInspector.Object.call(this);this._treeOutline=treeOutline;this._treeOutline.childrenListElement.addEventListener("mousemove",this._onMouseMove.bind(this),false);this._treeOutline.childrenListElement.addEventListener("mouseout",this._onMouseMove.bind(this),false);this._treeOutline.childrenListElement.addEventListener("contextmenu",this._onContextMenu.bind(this),true);this._lastHoveredNode=null;}
WebInspector.LayerTreeOutline.Events={LayerHovered:"LayerHovered",LayerSelected:"LayerSelected"}
WebInspector.LayerTreeOutline.prototype={selectLayer:function(layer)
{this.hoverLayer(null);var node=layer&&this._treeOutline.getCachedTreeElement(layer);if(node)
node.revealAndSelect(true);else if(this._treeOutline.selectedTreeElement)
this._treeOutline.selectedTreeElement.deselect();},hoverLayer:function(layer)
{var node=layer&&this._treeOutline.getCachedTreeElement(layer);if(node===this._lastHoveredNode)
return;if(this._lastHoveredNode)
this._lastHoveredNode.setHovered(false);if(node)
node.setHovered(true);this._lastHoveredNode=node;},update:function(layerTree)
{var seenLayers=new Map();function updateLayer(layer)
{if(seenLayers.get(layer))
console.assert(false,"Duplicate layer: "+layer.id());seenLayers.set(layer,true);var node=this._treeOutline.getCachedTreeElement(layer);var parent=layer===layerTree.contentRoot()?this._treeOutline:this._treeOutline.getCachedTreeElement(layer.parent());if(!parent)
console.assert(false,"Parent is not in the tree");if(!node){node=new WebInspector.LayerTreeElement(this,layer);parent.appendChild(node);}else{if(node.parent!==parent){node.parent.removeChild(node);parent.appendChild(node);}
node._update();}}
if(layerTree&&layerTree.contentRoot())
layerTree.forEachLayer(updateLayer.bind(this),layerTree.contentRoot());for(var node=(this._treeOutline.children[0]);node&&!node.root;){if(seenLayers.get(node.representedObject)){node=node.traverseNextTreeElement(false);}else{var nextNode=node.nextSibling||node.parent;node.parent.removeChild(node);if(node===this._lastHoveredNode)
this._lastHoveredNode=null;node=nextNode;}}},_onMouseMove:function(event)
{var node=this._treeOutline.treeElementFromPoint(event.pageX,event.pageY);if(node===this._lastHoveredNode)
return;this.dispatchEventToListeners(WebInspector.LayerTreeOutline.Events.LayerHovered,node&&node.representedObject?{layer:node.representedObject}:null);},_selectedNodeChanged:function(node)
{var layer=(node.representedObject);this.dispatchEventToListeners(WebInspector.LayerTreeOutline.Events.LayerSelected,{layer:layer});},_onContextMenu:function(event)
{var node=this._treeOutline.treeElementFromPoint(event.pageX,event.pageY);if(!node||!node.representedObject)
return;var layer=(node.representedObject);if(!layer)
return;var domNode=layer.nodeForSelfOrAncestor();if(!domNode)
return;var contextMenu=new WebInspector.ContextMenu(event);contextMenu.appendApplicableItems(domNode);contextMenu.show();},__proto__:WebInspector.Object.prototype}
WebInspector.LayerTreeElement=function(tree,layer)
{TreeElement.call(this,"",layer);this._treeOutline=tree;this._update();}
WebInspector.LayerTreeElement.prototype={onattach:function()
{var selection=document.createElement("div");selection.className="selection";this.listItemElement.insertBefore(selection,this.listItemElement.firstChild);},_update:function()
{var layer=(this.representedObject);var node=layer.nodeForSelfOrAncestor();var title=document.createDocumentFragment();title.createChild("div","selection");title.createTextChild(node?WebInspector.DOMPresentationUtils.simpleSelector(node):"#"+layer.id());var details=title.createChild("span","dimmed");details.textContent=WebInspector.UIString(" (%d × %d)",layer.width(),layer.height());this.title=title;},onselect:function()
{this._treeOutline._selectedNodeChanged(this);return false;},setHovered:function(hovered)
{this.listItemElement.classList.toggle("hovered",hovered);},__proto__:TreeElement.prototype};WebInspector.LayerDetailsView=function()
{WebInspector.VBox.call(this);this.element.classList.add("layer-details-view");this._emptyView=new WebInspector.EmptyView(WebInspector.UIString("Select a layer to see its details"));this._createTable();}
WebInspector.LayerDetailsView.Events={ObjectSelected:"ObjectSelected"}
WebInspector.LayerDetailsView.CompositingReasonDetail={"transform3D":WebInspector.UIString("Composition due to association with an element with a CSS 3D transform."),"video":WebInspector.UIString("Composition due to association with a <video> element."),"canvas":WebInspector.UIString("Composition due to the element being a <canvas> element."),"plugin":WebInspector.UIString("Composition due to association with a plugin."),"iFrame":WebInspector.UIString("Composition due to association with an <iframe> element."),"backfaceVisibilityHidden":WebInspector.UIString("Composition due to association with an element with a \"backface-visibility: hidden\" style."),"animation":WebInspector.UIString("Composition due to association with an animated element."),"filters":WebInspector.UIString("Composition due to association with an element with CSS filters applied."),"positionFixed":WebInspector.UIString("Composition due to association with an element with a \"position: fixed\" style."),"positionSticky":WebInspector.UIString("Composition due to association with an element with a \"position: sticky\" style."),"overflowScrollingTouch":WebInspector.UIString("Composition due to association with an element with a \"overflow-scrolling: touch\" style."),"blending":WebInspector.UIString("Composition due to association with an element that has blend mode other than \"normal\"."),"assumedOverlap":WebInspector.UIString("Composition due to association with an element that may overlap other composited elements."),"overlap":WebInspector.UIString("Composition due to association with an element overlapping other composited elements."),"negativeZIndexChildren":WebInspector.UIString("Composition due to association with an element with descendants that have a negative z-index."),"transformWithCompositedDescendants":WebInspector.UIString("Composition due to association with an element with composited descendants."),"opacityWithCompositedDescendants":WebInspector.UIString("Composition due to association with an element with opacity applied and composited descendants."),"maskWithCompositedDescendants":WebInspector.UIString("Composition due to association with a masked element and composited descendants."),"reflectionWithCompositedDescendants":WebInspector.UIString("Composition due to association with an element with a reflection and composited descendants."),"filterWithCompositedDescendants":WebInspector.UIString("Composition due to association with an element with CSS filters applied and composited descendants."),"blendingWithCompositedDescendants":WebInspector.UIString("Composition due to association with an element with CSS blending applied and composited descendants."),"clipsCompositingDescendants":WebInspector.UIString("Composition due to association with an element clipping compositing descendants."),"perspective":WebInspector.UIString("Composition due to association with an element with perspective applied."),"preserve3D":WebInspector.UIString("Composition due to association with an element with a \"transform-style: preserve-3d\" style."),"root":WebInspector.UIString("Root layer."),"layerForClip":WebInspector.UIString("Layer for clip."),"layerForScrollbar":WebInspector.UIString("Layer for scrollbar."),"layerForScrollingContainer":WebInspector.UIString("Layer for scrolling container."),"layerForForeground":WebInspector.UIString("Layer for foreground."),"layerForBackground":WebInspector.UIString("Layer for background."),"layerForMask":WebInspector.UIString("Layer for mask."),"layerForVideoOverlay":WebInspector.UIString("Layer for video overlay.")};WebInspector.LayerDetailsView.prototype={setObject:function(activeObject)
{this._layer=activeObject?activeObject.layer:null;this._scrollRectIndex=activeObject?activeObject.scrollRectIndex:null;if(this.isShowing())
this.update();},wasShown:function()
{WebInspector.View.prototype.wasShown.call(this);this.update();},_onScrollRectClicked:function(index,event)
{if(event.which!==1)
return;this.dispatchEventToListeners(WebInspector.LayerDetailsView.Events.ObjectSelected,{layer:this._layer,scrollRectIndex:index});},_createScrollRectElement:function(scrollRect,index)
{if(index)
this._scrollRectsCell.createTextChild(", ");var element=this._scrollRectsCell.createChild("span");element.className=index===this._scrollRectIndex?"scroll-rect active":"scroll-rect";element.textContent=WebInspector.LayerTreeModel.ScrollRectType[scrollRect.type].description+" ("+scrollRect.rect.x+", "+scrollRect.rect.y+", "+scrollRect.rect.width+", "+scrollRect.rect.height+")";element.addEventListener("click",this._onScrollRectClicked.bind(this,index),false);},update:function()
{if(!this._layer){this._tableElement.remove();this._emptyView.show(this.element);return;}
this._emptyView.detach();this.element.appendChild(this._tableElement);this._positionCell.textContent=WebInspector.UIString("%d,%d",this._layer.offsetX(),this._layer.offsetY());this._sizeCell.textContent=WebInspector.UIString("%d × %d",this._layer.width(),this._layer.height());this._paintCountCell.textContent=this._layer.paintCount();const bytesPerPixel=4;this._memoryEstimateCell.textContent=Number.bytesToString(this._layer.invisible()?0:this._layer.width()*this._layer.height()*bytesPerPixel);this._layer.requestCompositingReasons(this._updateCompositingReasons.bind(this));this._scrollRectsCell.removeChildren();this._layer.scrollRects().forEach(this._createScrollRectElement.bind(this));},_createTable:function()
{this._tableElement=this.element.createChild("table");this._tbodyElement=this._tableElement.createChild("tbody");this._positionCell=this._createRow(WebInspector.UIString("Position in parent:"));this._sizeCell=this._createRow(WebInspector.UIString("Size:"));this._compositingReasonsCell=this._createRow(WebInspector.UIString("Compositing Reasons:"));this._memoryEstimateCell=this._createRow(WebInspector.UIString("Memory estimate:"));this._paintCountCell=this._createRow(WebInspector.UIString("Paint count:"));this._scrollRectsCell=this._createRow(WebInspector.UIString("Slow scroll regions:"));},_createRow:function(title)
{var tr=this._tbodyElement.createChild("tr");var titleCell=tr.createChild("td");titleCell.textContent=title;return tr.createChild("td");},_updateCompositingReasons:function(compositingReasons)
{if(!compositingReasons||!compositingReasons.length){this._compositingReasonsCell.textContent="n/a";return;}
var fragment=document.createDocumentFragment();for(var i=0;i<compositingReasons.length;++i){if(i)
fragment.createTextChild(",");var span=document.createElement("span");span.title=WebInspector.LayerDetailsView.CompositingReasonDetail[compositingReasons[i]]||"";span.textContent=compositingReasons[i];fragment.appendChild(span);}
this._compositingReasonsCell.removeChildren();this._compositingReasonsCell.appendChild(fragment);},__proto__:WebInspector.VBox.prototype};WebInspector.LayerPaintProfilerView=function(showImageForLayerCallback)
{WebInspector.SplitView.call(this,true,false);this._showImageForLayerCallback=showImageForLayerCallback;this._logTreeView=new WebInspector.PaintProfilerCommandLogView();this._logTreeView.show(this.sidebarElement());this._paintProfilerView=new WebInspector.PaintProfilerView(this._showImage.bind(this));this._paintProfilerView.show(this.mainElement());this._paintProfilerView.addEventListener(WebInspector.PaintProfilerView.Events.WindowChanged,this._onWindowChanged,this);}
WebInspector.LayerPaintProfilerView.prototype={profileLayer:function(layer)
{this._logTreeView.setCommandLog(null,[]);this._paintProfilerView.setSnapshotAndLog(null,[]);layer.requestSnapshot(onSnapshotDone.bind(this));function onSnapshotDone(snapshot)
{this._layer=layer;snapshot.commandLog(onCommandLogDone.bind(this,snapshot));}
function onCommandLogDone(snapshot,log)
{this._logTreeView.setCommandLog(snapshot.target(),log);this._paintProfilerView.setSnapshotAndLog(snapshot||null,log||[]);}},_onWindowChanged:function()
{var window=this._paintProfilerView.windowBoundaries();this._logTreeView.updateWindow(window.left,window.right);},_showImage:function(imageURL)
{this._showImageForLayerCallback(this._layer,imageURL);},__proto__:WebInspector.SplitView.prototype};;WebInspector.LayersPanel=function()
{WebInspector.PanelWithSidebarTree.call(this,"layers",225);this.registerRequiredCSS("layersPanel.css");this._target=null;this.sidebarElement().classList.add("outline-disclosure");this.sidebarTree.element.classList.remove("sidebar-tree");WebInspector.targetManager.observeTargets(this);this._currentlySelectedLayer=null;this._currentlyHoveredLayer=null;this._layerTreeOutline=new WebInspector.LayerTreeOutline(this.sidebarTree);this._layerTreeOutline.addEventListener(WebInspector.LayerTreeOutline.Events.LayerSelected,this._onObjectSelected,this);this._layerTreeOutline.addEventListener(WebInspector.LayerTreeOutline.Events.LayerHovered,this._onObjectHovered,this);this._rightSplitView=new WebInspector.SplitView(false,true,"layerDetailsSplitViewState");this._rightSplitView.show(this.mainElement());this._layers3DView=new WebInspector.Layers3DView();this._layers3DView.show(this._rightSplitView.mainElement());this._layers3DView.addEventListener(WebInspector.Layers3DView.Events.ObjectSelected,this._onObjectSelected,this);this._layers3DView.addEventListener(WebInspector.Layers3DView.Events.ObjectHovered,this._onObjectHovered,this);this._layers3DView.addEventListener(WebInspector.Layers3DView.Events.LayerSnapshotRequested,this._onSnapshotRequested,this);this._tabbedPane=new WebInspector.TabbedPane();this._tabbedPane.show(this._rightSplitView.sidebarElement());this._layerDetailsView=new WebInspector.LayerDetailsView();this._layerDetailsView.addEventListener(WebInspector.LayerDetailsView.Events.ObjectSelected,this._onObjectSelected,this);this._tabbedPane.appendTab(WebInspector.LayersPanel.DetailsViewTabs.Details,WebInspector.UIString("Details"),this._layerDetailsView);this._paintProfilerView=new WebInspector.LayerPaintProfilerView(this._layers3DView.showImageForLayer.bind(this._layers3DView));this._tabbedPane.appendTab(WebInspector.LayersPanel.DetailsViewTabs.Profiler,WebInspector.UIString("Profiler"),this._paintProfilerView);}
WebInspector.LayersPanel.DetailsViewTabs={Details:"details",Profiler:"profiler"};WebInspector.LayersPanel.prototype={wasShown:function()
{WebInspector.Panel.prototype.wasShown.call(this);this.sidebarTree.element.focus();if(this._target)
this._target.layerTreeModel.enable();},willHide:function()
{if(this._target)
this._target.layerTreeModel.disable();WebInspector.Panel.prototype.willHide.call(this);},targetAdded:function(target)
{if(this._target)
return;this._target=target;this._target.layerTreeModel.addEventListener(WebInspector.LayerTreeModel.Events.LayerTreeChanged,this._onLayerTreeUpdated,this);this._target.layerTreeModel.addEventListener(WebInspector.LayerTreeModel.Events.LayerPainted,this._onLayerPainted,this);if(this.isShowing())
this._target.layerTreeModel.enable();},targetRemoved:function(target)
{if(this._target!==target)
return;this._target.layerTreeModel.removeEventListener(WebInspector.LayerTreeModel.Events.LayerTreeChanged,this._onLayerTreeUpdated,this);this._target.layerTreeModel.removeEventListener(WebInspector.LayerTreeModel.Events.LayerPainted,this._onLayerPainted,this);this._target.layerTreeModel.disable();this._target=null;},_showLayerTree:function(deferredLayerTree)
{deferredLayerTree.resolve(this._setLayerTree.bind(this));},_onLayerTreeUpdated:function()
{if(this._target)
this._setLayerTree(this._target.layerTreeModel.layerTree());},_setLayerTree:function(layerTree)
{this._layers3DView.setLayerTree(layerTree);this._layerTreeOutline.update(layerTree);if(this._currentlySelectedLayer&&(!layerTree||!layerTree.layerById(this._currentlySelectedLayer.layer.id())))
this._selectObject(null);if(this._currentlyHoveredLayer&&(!layerTree||!layerTree.layerById(this._currentlyHoveredLayer.layer.id())))
this._hoverObject(null);this._layerDetailsView.update();},_onLayerPainted:function(event)
{if(!this._target)
return;this._layers3DView.setLayerTree(this._target.layerTreeModel.layerTree());if(this._currentlySelectedLayer&&this._currentlySelectedLayer.layer===event.data)
this._layerDetailsView.update();},_onObjectSelected:function(event)
{var activeObject=(event.data);this._selectObject(activeObject);},_onObjectHovered:function(event)
{var activeObject=(event.data);this._hoverObject(activeObject);},_onSnapshotRequested:function(event)
{var layer=(event.data);this._tabbedPane.selectTab(WebInspector.LayersPanel.DetailsViewTabs.Profiler);this._paintProfilerView.profileLayer(layer);},_selectObject:function(activeObject)
{var layer=activeObject&&activeObject.layer;if(this._currentlySelectedLayer===activeObject)
return;this._currentlySelectedLayer=activeObject;var node=layer?layer.nodeForSelfOrAncestor():null;if(node)
node.highlightForTwoSeconds();else if(this._target)
this._target.domModel.hideDOMNodeHighlight();this._layerTreeOutline.selectLayer(layer);this._layers3DView.selectObject(activeObject);this._layerDetailsView.setObject(activeObject);},_hoverObject:function(activeObject)
{var layer=activeObject&&activeObject.layer;if(this._currentlyHoveredLayer===activeObject)
return;this._currentlyHoveredLayer=activeObject;var node=layer?layer.nodeForSelfOrAncestor():null;if(node)
node.highlight();else if(this._target)
this._target.domModel.hideDOMNodeHighlight();this._layerTreeOutline.hoverLayer(layer);this._layers3DView.hoverObject(activeObject);},__proto__:WebInspector.PanelWithSidebarTree.prototype}
WebInspector.LayersPanel.LayerTreeRevealer=function()
{}
WebInspector.LayersPanel.LayerTreeRevealer.prototype={reveal:function(snapshotData)
{if(!(snapshotData instanceof WebInspector.DeferredLayerTree))
return;var panel=(WebInspector.inspectorView.showPanel("layers"));if(panel)
panel._showLayerTree((snapshotData));}};