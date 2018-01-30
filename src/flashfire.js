/*
    Flashfire JS 
    JavaScript 2D Canvas API top-down game framework
    David Rosenblum, 2018
*/

"use strict";

const FF = (() => {
    const AUTHOR = "David Rosenblum",
        VERSION = "0.1.0";

    let lastDisplayObjectID = 0;

    let FFEvent = class FFEvent{
        constructor(type){
            this.type = type;
        }
    };
    FFEvent.MOVE = "move";
    FFEvent.RESIZE = "resize";
    FFEvent.CHILD_ADDED = "childadded";
    FFEvent.CHILD_REMOVED = "childremoved";
    FFEvent.ADDED_TO_STAGE = "addedtostage";
    FFEvent.REMOVED_FROM_STAGE = "removedfromstage";
    FFEvent.RENDER_START = "renderstart";
    FFEvent.RENDER_DONE = "renderdone";
    FFEvent.CLICK = "click";

    let BitmapData = class BitmapData{
        constructor(data){
            this.data = data;
            this.clipX = 0;
            this.clipY = 0;
            this.clipWidth = 0;
            this.clipHeight = 0;
        }

        get width(){
            return this.data.width;
        }

        get height(){
            return this.data.height;
        }

        static from(url){
            let tempCanvas = document.createElement("canvas"),
                tempCtx = tempCanvas.getContext("2d");

            let img = null;
            if(url in BitmapData.loadedImages){
                img = BitmapData.loadedImages[url];
            }
            else{
                img = document.createElement("img");
                img.addEventListener("load", evt => BitmapData.loadedImages[url] = img);
                img.setAttribute("src", url);
            }

            tempCtx.drawImage(img, 0, 0, image.width, image.height);

            let data = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

            return new BitmapData(data);
        }
    };
    BitmapData.loadedImages = {};

    let ImageData = class ImageData{
        constructor(image=null){
            if(image === null){
                image = document.createElement("img");
            }

            if(image instanceof window.HTMLImageElement === false){
                throw new Error("Image argument must be of type HTMLImageElement.");
            }

            this.image = image;
            this.clipX = 0;
            this.clipY = 0;
            this.clipWidth = 0;
            this.clipHeight = 0;
        }

        autoSize(){
            this.clipWidth = this.image.width;
            this.clipHeight = this.image.height;
        }

        static from(url){
            let img = document.createElement("img");
            
            let imgData = new ImageData(img);
            img.addEventListener("load", evt => imgData.autoSize());
            img.setAttribute("src", url);

            return imgData;
        }
    };

    let EventEmitter = class EventEmitter{
        constructor(){
            this._eventHandlers = {};
        }

        on(eventType, handler){
            if(!this.willTrigger(eventType)){
                this._eventHandlers[eventType] = [];
            }

            this._eventHandlers[eventType].push(handler);
        }

        emit(event){
            event.emitter = this;

            if(this.willTrigger(event.type)){
                for(let fn of this._eventHandlers[event.type]){
                    fn(event);
                }
            }
        }

        willTrigger(eventType){
            return eventType in this._eventHandlers;
        }

        toString(){
            return "[object FF.EventEmitter]";
        }
    };

    let DisplayObject = class DisplayObject extends EventEmitter{
        constructor(x=0, y=0, width=0, height=0){
            super();

            this._x = 0;
            this._y = 0;
            this._width = 0;
            this._height = 0;

            this._alpha = 1;
            this._visible = true;

            this._parent = null;
            this._id = ++lastDisplayObjectID;

            this.setPosition(x, y);
            this.setSize(width, height);
        }

        render(){
            if(this.visible){
                this.emit(new FFEvent(FFEvent.RENDER_START));
                this.emit(new FFEvent(FFEvent.RENDER_DONE));
            }
        }

        hitTestObject(target){
            if(target instanceof DisplayObject){
                if(target.x < this.right && this.x < target.right){
                    if(target.y < this.bottom && this.y < target.bottom){
                        return true;
                    }
                }
                return false;
            }
            else throw new Error("Target argument must be of type DisplayObject.");
        }

        hitTestGroup(group){
            for(let target of group){
                if(this.hitTestObject(target)){
                    return target;
                }
            }
            return null;
        }

        center(){
            if(this.parent){
                this.x = (this.parent.width - this.width) / 2;
                this.y = (this.parent.height - this.height) / 2;
            }
        }

        remove(){
            if(this.parent){
                this.parent.removeChild(this);
            }
        }

        setPosition(x, y){
            this.x = x;
            this.y = y;
        }

        setSize(width, height){
            this.width = width;
            this.height = height;
        }

        set x(x){
            if(typeof x === "number"){
                this._x = x;
                this.emit(new FFEvent(FFEvent.MOVE));
            }
        }

        set y(y){
            if(typeof y === "number"){
                this._y = y;
                this.emit(new FFEvent(FFEvent.MOVE));
            }
        }

        set width(width){
            if(typeof width === "number"){
                this._width = width;
                this.emit(new FFEvent(FFEvent.RESIZE));
            }
        }

        set height(height){
            if(typeof height === "number"){
                this._height = height;
                this.emit(new FFEvent(FFEvent.RESIZE));
            }
        }

        set alpha(alpha){
            if(typeof alpha === "number"){
                if(alpha < 0)
                    alpha = 0;

                if(alptha > 1)
                    alpha = 1;

                this._alpha = alpha;
            }
        }

        set visible(visible){
            if(typeof visible === "boolean"){
                this._visible = visible;
            }
        }

        get x(){
            return this._x;
        }

        get y(){
            return this._y;
        }

        get width(){
            return this._width;
        }

        get height(){
            return this._height;
        }

        get right(){
            return this.x + this.width;
        }

        get bottom(){
            return this.y + this.height;
        }

        get centerX(){
            return this.x + this.width / 2;
        }

        get centerY(){
            return this.y + this.height / 2;
        }

        get alpha(){
            return this._alpha;
        }

        get visible(){
            return this._visible;
        }

        get parent(){
            return this._parent;
        }

        get drawX(){
            if(this.parent){
                return this.x + this.parent.drawX;
            }
            return this.x;
        }

        get drawY(){
            if(this.parent){
                return this.y + this.parent.drawY;
            }
            return this.y;
        }

        toString(){
            return "[object FF.DisplayObject]";
        }
    };

    let DisplayObjectContainer = class DisplayObjectContainer extends DisplayObject{
        constructor(x=0, y=0, width=0, height=0){
            super(x, y, width, height);

            this._children = {};
            this._drawList = [];

            this.on(FFEvent.RENDER_START, evt => this.renderChildren());
        }

        renderChildren(){
            for(let child of this._drawList){
                child.render();
            }
        }

        addChild(object){
            if(object instanceof DisplayObject){
                if(!this.containsChild(object)){
                    object._parent = this;
                    this._children[object._id] = object;
                    this._drawList.push(object);

                    this.emit(new FFEvent(FFEvent.CHILD_ADDED, object));
                    object.emit(new FFEvent(FFEvent.ADDED_TO_STAGE, this));

                    return true;
                }
                return false;
            }
            else throw new Error("Object argument must be of type DisplayObject.");
        }

        addChildAt(object, index){
            if(object instanceof DisplayObject){
                let updatedList = [];
                for(let i = 0; i < this.numChildren; i++){
                    if(this.getChildAt(i) === object){
                        return false;
                    }

                    if(i === index){
                        updatedList.push(object);
                    }
                    updatedList.push(this.getChildAt(i));

                    this._drawList = updatedList;
                    object._parent = this;
                    this._children[object._id] = object;

                    this.emit(new FFEvent(FFEvent.CHILD_ADDED, object));
                    object.emit(new FFEvent(FFEvent.ADDED_TO_STAGE, this));

                    return true;
                }
            }
            else throw new Error("Object argument must be of type DisplayObject.");
        }

        addChildren(array){
            for(let object of array){
                this.addChild(object);
            }
        }

        removeChild(object){
            return this.removeChildAt(this.findChildIndex(object));
        }

        removeChildAt(index){
            if(index >= 0 && index < this.numChildren){
                let object = this._drawList.splice(index, 1)[0];
                object._parent = null;
                delete this._children[object._id];

                this.emit(new FFEvent(FFEvent.CHILD_REMOVED, object));
                object.emit(new FFEvent(FFEvent.REMOVED_FROM_STAGE, this));

                return object;
            }
            return null;
        }

        removeChildren(array){
            for(let object of array){
                this.removeChild(object);
            }
        }

        findChildIndex(object){
            for(let i = 0; i < this.numChildren; i++){
                if(this.getChildAt(i) === object){
                    return i;
                }
            }
            return -1;
        }

        containsChild(object){
            if(object instanceof DisplayObject){
                return object._id in this._children;
            }
            else throw new Error("Object argument must be of type DisplayObject.");
        }

        depthSort(){
            for(let i = 0; i < this.numChildren; i++){
                let a = this.getChildAt(i);

                for(let j = i + 1; j < this.numChildren; j++){
                    let b = this.getChildAt(j);

                    if(a.bottom > b.bottom){
                        this.swapChildrenAt(i, j);
                        a = b;
                    }
                }
            }
        }

        swapChildren(target1, target2){
            let a = -1,
                b = -1;

            for(let i = 0; i < this.numChildren; i++){
                if(this.getChildAt(i) === target1){
                    a = i;
                }
                else if(this.getChildAt(i) === target2){
                    b = i;
                }

                if(a > -1 && b > -1){
                    break;
                }
            }

            if(a > -1 && b > -1){
                this._drawList[a] = target2;
                this._drawList[b] = target1;
            }
        }

        swapChildrenAt(index1, index2){
            let child1 = this._drawList[index1] || null,
                child2 = this._drawList[index2] || nullnull;

            if(child1 && child2){
                this._drawList[index1] = child2;
                this._drawList[index2] = child1;
                return true;
            }
            return false;
        }

        forEachChild(fn){
            for(let i = 0; i < this.numChildren; i++){
                fn(this.getChildAt(i), i);
            }
        }

        forEachChildRecursive(fn){
            this.forEachChild((child, index) => {
                fn(child, index);
                
                if(child instanceof DisplayObjectContainer){
                    child.forEachChildRecursive(fn);
                }
            });
        }

        getChildAt(index){
            return this._drawList[index];
        }

        get numChildren(){
            return this._drawList.length;
        }

        toString(){
            return "[object FF.DisplayObjectContainer]";
        }
    };

    let TextField = class TextField extends DisplayObject{
        constructor(text=null, x=0, y=0){
            super(x, y);

            this._text = (typeof text === "string") ? text : "";
            this._font = "12px arial";

            this._fillColor = "white";
            this._strokeColor = "black";
        }

        render(){
            if(this.visible){
                this.emit(new FFEvent(FFEvent.RENDER_START));

                GLOBAL_CTX.save();

                GLOBAL_CTX.alpha = this.alpha;
                GLOBAL_CTX.font = this.font;
                GLOBAL_CTX.fillStyle = this.fillColor;
                GLOBAL_CTX.strokeStyle = this.strokeStyle;

                GLOBAL_CTX.strokeText(this.text, this.drawX, this.drawY);
                GLOBAL_CTX.fillText(this.text, this.drawX, this.drawY);

                GLOBAL_CTX.restore();

                this.emit(new FFEvent(FFEvent.RENDER_DONE));
            }
        }

        centerText(){
            if(this.parent){
                this.x = (this.parent.width - this.width) / 2;
            }
        }

        setColors(fill, stroke){
            this.fillColor = fill;
            this.strokeColor = stroke;
        }

        set text(text){
            if(typeof text === "string"){
                this._text = text;
            }
        }

        set font(font){
            if(typeof font === "string"){
                this._font = font;
            }
        }

        set fillColor(fillColor){
            if(typeof fillColor === "string"){
                this._fillColor = fillColor;
            }
        }

        set strokeColor(strokeColor){
            if(typeof strokeColor === "string"){
                this._strokeColor = strokeColor;
            }
        }

        get text(){
            return this._text;
        }

        get font(){
            return this._font;
        }

        get fillColor(){
            return this._fillColor;
        }

        get strokeColor(){
            return this._strokeColor;
        } 

        set width(width){
            // ignore...
        }

        set height(height){
            // ignore...
        }

        get width(){
            GLOBAL_CTX.save();
            GLOBAL_CTX.font = this.font;
            let width = GLOBAL_CTX.measureText(this.text).width;
            GLOBAL_CTX.restore();
            return width;
        }

        get height(){
            return parseInt(this.font);
        }

        toString(){
            return "[object FF.TextField]";
        }
    };

    let Sprite = class Sprite extends DisplayObjectContainer{
        constructor(bmd=null, x=0, y=0, width=0, height=0){
            super(x, y, width, height);

            this._imageData = null;
            
            if(typeof bmd === "string"){
                this._imageData = ImageData.from(bmd);
            }
            else if(bmd instanceof BitmapData){
                this._imageData = bmd;
            }
            else{
                this._imageData = new ImageData();
            }
        }
        
        render(){
            if(this.visible){
                this.emit(new FFEvent(FFEvent.RENDER_START));

                GLOBAL_CTX.alpha = this.alpha;

                GLOBAL_CTX.drawImage(this.getImageElement(), this.drawX, this.drawY, this.width, this.height);

                GLOBAL_CTX.restore();

                this.emit(new FFEvent(FFEvent.RENDER_DONE));
            }
        }

        getImageElement(){
            return this._imageData.image;
        }

        toString(){
            return "[object FF.Sprite]";
        }
    };

    let AnimatedSprite = class AnimatedSprite extends Sprite{
        constructor(image=null, x=0, y=0, width=0, height){
            super(image, x, y, width, height);
        }

        toString(){
            return "[object FF.AnimatedSprite]";
        }
    };

    let GameEntity = class GameEntity extends AnimatedSprite{
        constructor(image=null, x=0, y=0, width=0, height=0){
            super(image, x, y, width, height);
            
            this._moveSpeed = 1;
            this._objectID = 0;
            this._ownerID = 0;
        }

        static create(options){
            options = (!options) ? {} : options;

            return new GameEntity(options.image, options.x, options.y, options.width, options.heigth);
        }

        moveLeft(collisionDetector=null, bounds=null, scroller=null){
            let originalX = this.x;

            this.x -= this.moveSpeed;

            if(collisionDetector){
                if(collisionDetector instanceof CollisionDetector){
                    if(collisionDetector.collisionLeft(this)){
                        this.x = originalX;
                    }
                }
                else if(collisionDetector instanceof Array){
                    let hit = this.hitTestGroup(collisionDetector);
                    if(hit){
                        this.x = hit.right;
                    }
                }
            }

            if(bounds && bounds instanceof DisplayObject){
                if(this.x < bounds.x){
                    this.x = bounds.x;
                }
            }
        }

        moveRight(collisionDetector=null, bounds=null, scroller=null){
            let originalX = this.x;

            this.x += this.moveSpeed;

            if(collisionDetector){
                if(collisionDetector instanceof CollisionDetector){
                    if(collisionDetector.collisionRight(this)){
                        this.x = originalX;
                    }
                }
                else if(collisionDetector instanceof Array){
                    let hit = this.hitTestGroup(collisionDetector);
                    if(hit){
                        this.x = hit.x - this.width;
                    }
                }
            }

            if(bounds && bounds instanceof DisplayObject){
                if(this.right > bounds.x){
                    this.x = bounds.x - this.width;
                }
            }
        }

        moveUp(collisionDetector=null, bounds=null, scroller=null){
            let originalY = this.y;

            this.y -= this.moveSpeed;

            if(collisionDetector){
                if(collisionDetector instanceof CollisionDetector){
                    if(collisionDetector.collisionAbove(this)){
                        this.y = originalY + 1;
                    }
                }
                else if(collisionDetector instanceof Array){
                    let hit = this.hitTestGroup(collisionDetector);
                    if(hit){
                        this.y = hit.bottom;
                    }
                }
            }

            if(bounds && bounds instanceof DisplayObject){
                if(this.y < bounds.y){
                    this.y = bounds.y;
                }
            }
        }

        moveDown(collisionDetector=null, bounds=null, scroller=null){
            let originalY = this.y;

            this.y += this.moveSpeed;

            if(collisionDetector){
                if(collisionDetector instanceof CollisionDetector){
                    if(collisionDetector.collisionBelow(this)){
                        this.y = originalY - 1;
                    }
                }
                else if(collisionDetector instanceof Array){
                    let hit = this.hitTestGroup(collisionDetector);
                    if(hit){
                        this.y = hit.y - this.height;
                    }
                }
            }

            if(bounds && bounds instanceof DisplayObject){
                if(this.bottom > bounds.y){
                    this.y = bounds.y - this.height;
                }
            }
        }

        updateData(data){
            if(typeof data.x === "number"){
                this.x = data.x;
            }

            if(typeof data.y === "number"){
                this.y = data.y;
            }
        }

        getData(){
            return {
                objectID: this.objectID,
                ownerID: this.ownerID,
                ffID: this._id,
                x: this.x,
                y: this.y
            };
        }

        set moveSpeed(moveSpeed){
            if(typeof moveSpeed === "number"){
                this._moveSpeed = Math.abs(moveSpeed);
            }
        }

        get moveSpeed(){
            return this._moveSpeed;
        }

        get objectID(){
            return this._objectID;
        }

        get ownerID(){
            return this._ownerID;
        }

        toString(){
            return "[object FF.GameEntity]";
        }
    };

    let CollisionDetector = class CollisionDetector{
        constructor(tileSize){
            this._objects = {};
            this._tileSize = tileSize;
        }

        storeAt(x, y, object){
            this._objects[`${x}-${y}`] = object;
        }

        collisionLeft(entity){
            let x = Math.floor(entity.x / this._tileSize),
                y = Math.floor(entity.centerY / this._tileSize);

            return this.getTileAt(x, y);
        }

        collisionRight(entity){
            let x = Math.floor(entity.right / this._tileSize),
                y = Math.floor(entity.centerY / this._tileSize);

            return this.getTileAt(x, y);
        }

        collisionAbove(entity){
            let x = Math.floor(entity.centerX / this._tileSize),
                y = Math.floor(entity.bottom / this._tileSize);

           return this.getTileAt(x, y);
        }

        collisionBelow(entity){
            let x = Math.floor(entity.centerX / this._tileSize),
                y = Math.ceil(entity.bottom / this._tileSize);

           return this.getTileAt(x, y);
        }

        getTileAt(x, y){
            return this._objects[`${x}-${y}`] || null;
        }
    }

    let MultiplayerManager = class MultiplayerManager{
        constructor(){
            this._objects = {};
            this._numObjects = 0;
        }

        store(object, id=0){
            if(typeof id === "number" && id > 0){
                object._objectID = id;
            }

            if(!this.containsObject(object)){
                this._objects[object._objectID] = object;
                this._numObjects++;
            }
        }

        ignore(object){
            if(this.containsObject(object)){
                delete this._objects[object._objectID];
                this._numObjects--;
                return true;
            }
            return false;
        }

        containsObject(object){
            if(object instanceof GameEntity){
                return object._objectID in this._objects;
            }
            else throw new Error("Object argument must be of type GameEntity.");
        }

        getObjectByID(id){
            return this._objects[id] || null;
        }

        get numObjects(){
            return this._numObjects;
        }
    };

    let KeyHandler = class KeyHandler{
        constructor(element){
            element = (element instanceof window.HTMLElement) ? element : document.body;

            this._keys = {};
            this._numKeys = 0;

            element.addEventListener("keyup", evt => this.forceKeyUp(evt.keyCode));
            element.addEventListener("keydown", evt => this.forceKeyDown(evt.keyCode));
        }

        isKeyUp(keyCode){
            return !(keyCode in this._keys);
        }

        isKeyDown(keyCode){
            return keyCode in this._keys;
        }

        allKeysUp(keyCodes){
            for(let key of keyCodes){
                if(this.isKeyDown(key)){
                    return false;
                }
            }
            return true;
        }

        allKeysDown(keyCodes){
            for(let key of keyCodes){
                if(this.isKeyUp(key)){
                    return false;
                }
            }
            return true;
        }

        someKeysUp(keyCodes){
            for(let key of keyCodes){
                if(this.isKeyUp(key)){
                    return true;
                }
            }
            return false;
        }

        someKeysDown(keyCodes){
            for(let key of keyCodes){
                if(this.isKeyDown(key)){
                    return true;
                }
            }
            return false;
        }

        forceKeyUp(keyCode){
            if(this.isKeyDown(keyCode)){
                delete this._keys[keyCode];
                this._numKeys--;
            }
        }

        forceKeyDown(keyCode){
            if(this.isKeyUp(keyCode)){
                this._keys[keyCode] = 1;
                this._numKeys++;
            }
        }

        get numKeys(){
            return this._numKeys;
        }
    };

    let RNG = class RNG{
        static nextInt(min=0, max=10){
            return Math.round(Math.random() * (max - min) + min);
        }

        static nextNum(min=0, max=1, decDigits=3){
            return parseFloat((Math.random() * (max - min) + min).toFixed(decDigits));
        }
    };

    let Scroller = class Scroller{

    };

    let MapBuilder = class MapBuilder{
        static buildGrid(matrix, tileTypes, cellSize, container, fn){
            let collisionDetector = new CollisionDetector(cellSize);

            for(let y = 0; y < matrix.length; y++){
                for(let x = 0; x < matrix[y].length; x++){
                    let pt = matrix[y][x],
                        type = tileTypes[pt] || null;

                    if(typeof type === "function"){
                        let tile = new type();

                        tile.x = x * cellSize;
                        tile.y = y * cellSize;

                        collisionDetector.storeAt(x, y, tile);

                        if(tile.height > cellSize){
                            tile.y -= (tile.height - cellSize);
                        }

                        container.addChild(tile);

                        if(typeof fn === "function"){
                            fn(tile, x, y);
                        }
                    }
                }
            }

            return collisionDetector;
        }
    };

    let Stage = class Stage extends DisplayObjectContainer{
        constructor(width=550, height=400){
            super();

            this._canvas = document.createElement("canvas");
            this._canvas.setAttribute("flashfire", "canvas");

            this.context = this._canvas.getContext("2d");

            this.resize(width, height);

            let renderLoop = () => {
                this.clear();
                this.render();
                window.requestAnimationFrame(renderLoop);
            };
            renderLoop();

            this.canvas.addEventListener("click", evt => {
                let hitbox = new DisplayObject(evt.offsetX, evt.offsetY, 3, 3);

                this.forEachChildRecursive(child => {
                    if(child.hitTestObject(hitbox)){
                        child.emit(new FFEvent(FFEvent.CLICK));
                    }
                });
            });

            this._canvas.addEventListener("contextmenu", this.showCustomContextMenu);
            this._canvas.addEventListener("click", this.hideCustomContextMenu);
        }

        clear(){
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        resize(width, height){
            this.canvas.width = width;
            this.canvas.height = height;
        }

        showCustomContextMenu(evt){
            let cm = document.querySelector("div[flashfire='context-menu']");
           
            if(!cm){
                let canvasSupported = (typeof window.CanvasRenderingContext2D === "function") ? "Supported" : "Unsupported";

                cm = document.createElement("div");
                cm.setAttribute("flashfire", "context-menu");
                cm.innerHTML = `<ul> 
                    <li><b>Flashfire JS</b><li> 
                    <li>Version ${VERSION} </li> 
                    <li>Canvas ${canvasSupported}</li> 
                    </ul>`;
                document.body.appendChild(cm);

                cm.style.cssText = `
                    width: 200px;
                    position: absolute;
                    background-color: white;
                    border-radius: 3px;
                    position: absolute;
                    font-family: arial,
                    padding: 5px 10px 5px 10px;
                    box-shadow: 2px 2px 2px black;
                `;

                let ul = cm.querySelector("ul");
                ul.style.cssText = `
                    list-style-type: none;
                    margin: 1px 1px 1px 10px;
                    padding: 0px;
                `;

                let lis = cm.querySelectorAll("li");
                lis.forEach(li => li.style.cssText = `margin: 4px 1px 4px 1px;`);
            }

            cm.style.left = evt.clientX + "px";
            cm.style.top = evt.clientY + "px";
            cm.style.display = "block";
        }

        hideCustomContextMenu(evt){
            let cm = document.querySelector("div[flashfire='context-menu']");
            if(cm){
                cm.style.display = "none";
            }
        }

        setContextMenuEnabled(state){
            this._canvas.oncontextmenu = () => {return state};
        }

        set width(width){
            // ignore...
        }

        set height(height){
            // ignore...
        }

        get width(){
            return this.canvas.width;
        }

        get height(){
            return this.canvas.height;
        }

        get canvas(){
            return this._canvas;
        }
    };

    let init = (element, width, height) => {
        if(typeof element === "string"){
            element = document.querySelector(element);
        }
        element = (element instanceof window.HTMLElement) ? element : document.body;

        if(typeof width === "number" && typeof height === "number"){
            GLOBAL_STAGE.resize(width, height);
        }

        element.appendChild(GLOBAL_STAGE.canvas);
    };


    const GLOBAL_STAGE = new Stage(),
        GLOBAL_CTX = GLOBAL_STAGE.context;

    //console.log(`FlashfireJS v${VERSION}`);
    return {
        AnimatedSprite: AnimatedSprite,
        CollisionDetector: CollisionDetector,
        DisplayObject: DisplayObject,
        DisplayObjectContainer: DisplayObjectContainer,
        EventEmitter: EventEmitter,
        FFEvent: FFEvent,
        GameEntity: GameEntity,
        KeyHandler: KeyHandler,
        MapBuilder: MapBuilder,
        RNG: RNG,
        Scroller: Scroller,
        Sprite: Sprite,
        TextField: TextField,
        init: init,
        stage: GLOBAL_STAGE,
        VERSION: VERSION
    };
})();