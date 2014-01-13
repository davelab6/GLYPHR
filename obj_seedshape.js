
//-------------------------------------------------------
// SEED SHAPE OBJECT
//-------------------------------------------------------

	function SeedShape(oa){
		this.objtype = "seedshape";

		this.shape = new Shape({});
		this.shape.name = oa.name || "New Seed Shape";
		this.usedin = [];
	}



//-------------------------------------------------------
// SEED SHAPE INSTANCE OBJECT
//-------------------------------------------------------

	function SeedShapeInstance(oa){
		this.objtype = "seedshapeinstance";
		
		this.seed = oa.seed || getFirstSeedShape();
		this.useseedxy = (isval(oa.useseedxy)? oa.useseedxy : true);	
		
		this.name = oa.name || "new seedshape instance";
		this.xpos = oa.xpos || 0;	
		this.ypos = oa.ypos || 0; 
		this.xlock = false;
		this.ylock = false;

		// shape settings that don't apply to seedshapeinstance
		this.path = false;
		this.hlock = false;
		this.wlock = false;
		
		//debug("SEEDSHAPEINSTANCE - end");
	}



//-------------------------------------------------------
// SEED SHAPE INSTANCE METHODS
//-------------------------------------------------------

	
//	Insert Seed Shape
	function insertSeedShapeDialog(){
		if(aalength(_G.seedshapes)>0){
			var content = "Choose a Seed Shape to insert as a layer in this character:";
			content += generateSSThumbs();
			content += "<div style='display:block;'><input type='button' class='button' value='cancel' onclick='closeDialog();'></div>";
			openDialog(content);
			drawSSThumbs();
		} else {
			openDialog("<div class='dialoglargetext'>No Seed Shapes exist.  First, create some Seed Shapes, then you can insert them into characters.</div>");
		}
	}
	
	function insertSeedShape(ssid){
		//debug("INSERTSEEDSHAPE - adding seed shape (id) " + ssid + " to char (id) " + uistate.selectedchar);
		var ns = new SeedShapeInstance({"seed":ssid, "xpos":100, "ypos":100});

		//debug("INSERT SEED SHAPE - JSON: \t" + JSON.stringify(ns));
		addShape(ns);
		
		_G.fontchars[uistate.selectedchar].charwidth = Math.max(_G.fontchars[uistate.selectedchar].charwidth, _G.seedshapes[ssid].shape.path.rightx);
		
		addToUsedIn(ssid, uistate.selectedchar);
		
		closeDialog();
		putundoq("insert seed shape from charedit");
		redraw();
	}
	
	function generateSSThumbs(){		
		var re = "<div class='ssthumbcontainer'>";
		for(var ssid in _G.seedshapes){
			re += "<table cellpadding=0 cellspacing=0 border=0><tr><td>";
			re += "<canvas class='ssthumb' id='thumb"+ssid+"' onclick='insertSeedShape(\""+ssid+"\");' height="+ssthumbsize+"' width="+ssthumbsize+"></canvas>";
			re += "</td></tr><tr><td>"
			re += _G.seedshapes[ssid].shape.name;
			re += "</td></tr></table>";
			//debug("GENERATESSTHUMBS - created canvas 'thumb"+ssid+"'");
		}
		re += "</div>";
		return re;
	}
	
	function drawSSThumbs(){
		var fs = _G.fontsettings;
		var tctx = {};
		var factor = ((ssthumbsize-(2*ssthumbgutter))/(fs.upm + (fs.upm*_G.projectsettings.descender)));
		var yoffset = (ssthumbgutter+(fs.upm*factor));
		for(var ssid in _G.seedshapes){
			tctx = document.getElementById(("thumb"+ssid)).getContext("2d");
			//debug("DRAWSSTHUMBS - factor: " + factor + " yoffset: " + yoffset);
			_G.seedshapes[ssid].shape.drawShapeToArea_Single(tctx, factor, ssthumbgutter, yoffset);
			//debug("DRAWSSTHUMBS - drawCharToArea canvas 'thumb"+ssid+"'");
		}
	}

	
//	UsedIn Array Stuff
	function addToUsedIn(ssid, charid){
		charid = (""+charid);
		//debug("ADDTOUSEDIN - ssid/charid " + ssid + "/" + charid);
		var uia = _G.seedshapes[ssid].usedin;
		//debug("------------- uia: " + uia);
		//Make sure array values are unique
		if(uia.indexOf(charid) == -1){
			//debug("------------- uia.indexOf(charid): " + uia.indexOf(charid) + ", should be -1, pusing charid: " + charid);
			uia.push(charid);
			// sort numerically as opposed to alpha
			uia.sort(function(a,b){return a-b});
		}
	}
	
	function removeFromUsedIn(ssid, charid){
		//debug("REMOVEFROMUSEDIN - ssid/charid " + ssid + "/" + charid);
		var seedcount = 0;
		var tcgd = _G.fontchars[charid].charshapes;
		
		// make sure there is only one of this ss in the char
		for(var sl=0; sl<tcgd.length; sl++){
			if(tcgd[sl].seed){
				if(tcgd[sl].seed == ssid) seedcount++;
			}
		}
		
		//debug("------------------ seedcount = " + seedcount);
		
		if(seedcount == 1){
			var uia = _G.seedshapes[ssid].usedin;
			var charindex = uia.indexOf(charid);
			//debug("------------------ charindex: " + charindex);
			if(charindex != -1){
				//debug("------------------ deleting from uia charindex " + charindex);
				//debug("------------------ uia before<br>" + uia);
				uia.splice(charindex, 1);
				//debug("------------------ uia after<br>" + uia);
			}
		}
	}

	
//	Detials
	function seedShapeInstanceDetails(s){
		//debug("SEEDSHAPEINSTANCEDETAILS - start of function");
		content = "<tr><td colspan=3><h3>seed shape</h3></td></tr>";	
		content += "<tr><td class='leftcol'>&nbsp;</td><td style='margin-top:0px; padding-top:0px;'> name </td><td style='margin-top:0px; padding-top:0px; padding-right:10px;'><input class='input' style='width:90%;' type='text' value='" + s.name + "' onchange='ss().name = this.value; putundoq(\"shape name\"); redraw();'></td></tr>";
		content += "<tr><td class='leftcol'>&nbsp;</td><td> use seed shape position</td><td>"+checkUI("ss().useseedxy="+!s.useseedxy+"; putundoq(\"use seed shape position\"); redraw();", s.useseedxy)+"</td></tr>";
		if(!s.useseedxy){
		content += "<tr><td class='leftcol'>&nbsp;</td><td colspan=2><h3 style='font-size:.9em; color:rgb(153,158,163);'>x & y values are relative to the seed shape position</h3></td></tr>";
		content += "<tr><td class='leftcol'>&nbsp;</td><td style='margin-top:0px; padding-top:0px; text-transform:none;'>&#916; x </td><td style='margin-top:0px; padding-top:0px; padding-right:10px;'><input class='input' type='text' value='" + s.xpos + "' onchange='ss().xpos = (this.value*1); putundoq(\"seedshape xpos\"); redraw();'>"+spinner()+"</td></tr>";
		content += "<tr><td class='leftcol'>&nbsp;</td><td style='margin-top:0px; padding-top:0px; text-transform:none;'>&#916; y </td><td style='margin-top:0px; padding-top:0px; padding-right:10px;'><input class='input' type='text' value='" + s.ypos + "' onchange='ss().ypos = (this.value*1); putundoq(\"seedshape ypos\"); redraw();'>"+spinner()+"</td></tr>";
		}
		content += "<tr><td class='leftcol'>&nbsp;</td><td> Unique Seed Shape ID </td><td> " + s.seed + " </td></tr>";
		content += "<tr><td class='leftcol'>&nbsp;</td><td> seed shape name </td><td>" + _G.seedshapes[s.seed].shape.name + "</td></tr>";
		content += "<tr><td class='leftcol'>&nbsp;</td><td colspan=2><input type='button' class='button' value='edit this seed shape' onclick='goToEditSeedShape(\""+s.seed+"\");'/></td></tr>";
		return content;
	}
	
	function goToEditSeedShape(ssid){
		uistate.shownseedshape = ssid;
		uistate.navhere = "seed shapes";
		navigate();
	}
	
	function clickSelectSeedShape(x,y){
		//debug("CLICKSELECTSeedShape() - checking x:" + x + " y:" + y);
		
		if(_G.seedshapes[uistate.shownseedshape].shape.isHere(x,y)){
			uistate.selectedshape = uistate.shownseedshape;
			//debug("CLICKSELECTSeedShape() - selecting shape " + uistate.shownseedshape);
			return true;
		}
		
		uistate.selectedshape = -1;
		//debug("CLICKSELECTSeedShape() - deselecting, setting to -1");
		
		return false;
	}

	
//	---------------------------
//	Seed Shape Paridy Functions
//	---------------------------
	SeedShapeInstance.prototype.drawShape_Stack = function(lctx){
		//debug("DRAWSEEDSHAPE");
		if(this.useseedxy){
			//debug("------------- useseedxy=true, calling seedshapes[this.seed].shape.drawShape");
			_G.seedshapes[this.seed].shape.drawShape_Stack(lctx);
		} else {
			//debug("------------- does not useseedxy, calling FORCE=true updatepathposition");
			//debug("------------- this.seed: " + this.seed);
			var ns = clone(_G.seedshapes[this.seed].shape);
			ns.path.updatePathPosition(this.xpos, this.ypos, true);
			ns.drawShape_Stack(lctx);
		}
	}	

	SeedShapeInstance.prototype.drawShape_Single = function(lctx){
		//debug("DRAWSEEDSHAPE");
		if(this.useseedxy){
			//debug("------------- useseedxy=true, calling seedshapes[this.seed].shape.drawShape");
			_G.seedshapes[this.seed].shape.drawShape_Single(lctx);
		} else {
			//debug("------------- does not useseedxy, calling FORCE=true updatepathposition");
			//debug("------------- this.seed: " + this.seed);
			var ns = clone(_G.seedshapes[this.seed].shape);
			ns.path.updatePathPosition(this.xpos, this.ypos, true);
			ns.drawShape_Single(lctx);
		}
	}
	
	SeedShapeInstance.prototype.genPostScript = function(lastx, lasty){
		//debug("GENSEEDPOSTSCRIPT");
		if(this.useseedxy){
			//debug("------------- useseedxy=true, calling seedshapes[this.seed].shape.drawShape");
			return _G.seedshapes[this.seed].shape.path.genPathPostScript(lastx, lasty);
		} else {
			//debug("------------- does not useseedxy, calling FORCE=true updatepathposition");
			var ns = clone(_G.seedshapes[this.seed].shape);
			ns.path.updatePathPosition(this.xpos, this.ypos, true);
			return ns.path.genPathPostScript(lastx, lasty);
		}
	}
	
	SeedShapeInstance.prototype.drawShapeToArea_Single = function(lctx, size, offsetX, offsetY){
		//debug("DRAWSEEDSHAPETOAREA - size/offsetx/offsety: " + size +"/"+ offsetX +"/"+ offsetY);
		if(this.useseedxy){
			//debug("--------------------- useseedxy=true, calling drawShapeToArea for seedshape.");
			_G.seedshapes[this.seed].shape.drawShapeToArea_Single(lctx, size, offsetX, offsetY);
		} else {
			//debug("--------------------- useseedxy=false, calling updatepathposition with FORCE.");
			var ns = clone(_G.seedshapes[this.seed].shape);
			ns.path.updatePathPosition(this.xpos, this.ypos, true);
			ns.name += " HAS BEEN MOVED";
			ns.drawShapeToArea_Single(lctx, size, offsetX, offsetY);
		}
	}
	
	SeedShapeInstance.prototype.drawShapeToArea_Stack = SeedShapeInstance.prototype.drawShapeToArea_Single;


	SeedShapeInstance.prototype.drawSelectOutline = function(onlycenter){
		//_G.seedshapes[this.seed].shape.drawSelectOutline();
		
		if(this.useseedxy){
			_G.seedshapes[this.seed].shape.drawSelectOutline(onlycenter);
		} else {
			var ns = clone(_G.seedshapes[this.seed].shape);
			ns.path.updatePathPosition(this.xpos, this.ypos);
			//ns.path.calcMaxes();
			ns.drawSelectOutline(onlycenter);
		}
	}
	
	SeedShapeInstance.prototype.draw8points = function(onlycenter){
		//_G.seedshapes[this.seed].shape.draw8points(onlycenter);
	}
	
	SeedShapeInstance.prototype.isHere = function(x,y){
		//debug("ISSEEDSHAPEHERE - checking " + x + "," + y);
		if(this.useseedxy){
			return _G.seedshapes[this.seed].shape.isHere(x,y);
		} else {
			var ns = clone(_G.seedshapes[this.seed].shape);
			ns.path.updatePathPosition(this.xpos, this.ypos);
			return ns.isHere(x,y);
		}
	}
	
	SeedShapeInstance.prototype.isOverHandle = function(){ return false;	}


	
//	------------------------------
//	Generic Seed Shape Functions
//	------------------------------

	var seedshapecounter = 0;
	
	function getFirstSeedShape(){
		for(var ssid in _G.seedshapes){
			return ssid;
		}
		
		return "[ERROR] - SEEDSHAPES array has zero keys";
	}
	
	function generateNewSSID(){
		seedshapecounter++;
		return ("id"+seedshapecounter);
	}