import { Display } from "./Display";
import { Rect, RectChange } from "./Utils";
import { Selectable } from "./Selectable";
import { DragEvent } from "./Event";
import { RectView } from "./Selection";

export abstract class Layout extends Selectable
{
    public static findLayoutByDisplay(display:Display):Layout
    {
        let root:Display = display.parent;

        while( root != null )
        {
            if( root instanceof Layout ) return root;
            root = root.parent;
        }

        return null;
    }




    protected childTag:string = "";
    protected childClassName:string = "";
    protected requiredStyles:{ [id: string]: string; } = {};

    constructor(tagName: string = "div", ...params: string[])
    {
        super(tagName, "w-layout", ...params);

        if( tagName === "ul" ) this.setChildStruct("li");
        else if( tagName === "ol" ) this.setChildStruct("li");
        else if( tagName === "select" ) this.setChildStruct("option");

        this.setEnable(false);
    }

    public hasChildStruct():boolean
    {
        return this.childTag !== "" || this.childClassName !== "";
    }

    public setChildStruct(childTag:string, ...childClassName:string[]):void
    {
        this.childTag = childTag;
        this.childClassName = childClassName.join(" ");
    }

    public clearChildStruct()
    {
        this.setChildStruct("");
    }

    public addChild(display: Display, index = 99999):void
    {
        this.applyChildStruct(display);
        this.applyRequiredStyle(display);

        // FIX*** Depois de tudo
        super.addChild(display, index);
    }

    public removeChild(display: Display): void
    {
        // FIX*** Antes de tudo
        super.removeChild(display);

        this.removeChildStruct(display);
        this.removeRequiredStyle(display);
    }

    private applyChildStruct(display:Display):void
    {
        if( this.hasChildStruct() )
        {
            display.setData("tagName", display.getTagName());
            display.setTagName(this.childTag);
            display.addClasses(this.childClassName);
        }
    }

    private applyRequiredStyle(display:Display):void
    {
        let previous:string = "";
        for( let key in this.requiredStyles )
            display.setStyle(key, this.requiredStyles[key]);
    }

    private removeChildStruct(display:Display):void
    {
        let previousTag:string = display.getData("tagName");
        if( previousTag !== "" )
            display.setTagName(previousTag);
        display.removeData("tagName");
        display.removeClasses(this.childClassName);
    }

    private removeRequiredStyle(display:Display):void
    {
        for( let key in this.requiredStyles )
            display.removeStyle(key);
    }

    // public enterDrag(event: DragEvent): void
    // {
    //     this.addClass("layout-over");
    // }

    // public exitDrag(event: DragEvent): void
    // {
    //     this.removeClass("layout-over");
    // }

    public simulateResizeChild(event:DragEvent, childIndex:number, change:RectChange):void{/**/}
    public resizeChild(event:DragEvent, childIndex:number, change:RectChange):void{/**/}
    public enterDrag(event: DragEvent): void{/**/}
    public exitDrag(event: DragEvent): void {/**/}
    public updateDrag(event: DragEvent): void {/**/}
    public dropDrag(event: DragEvent): void {/**/}


    // public allowDropGroup(elem:DragEvent):boolean
    // {
    //     for( let i:number = 0 ; i < elem.elements.length ; i++ )
    //         if( !this.allowDrop(elem.elements[i]) ) return false;

    //     return true;
    // }
}

export class RelativeLayout extends Layout
{
    constructor(tag: string = "div", ...params: string[])
    {
        super(tag, "w-layout-relative", ...params);
    }

    public simulateResizeChild(event:DragEvent, childIndex:number, change:RectChange):void
    {
        event.ghost[childIndex].rect.copyAndChange(event.startRect[childIndex], change);
        event.ghost[childIndex].draw();
    }

    public resizeChild(event:DragEvent, childIndex:number, change:RectChange):void
    {
        let bound:Rect = this.getBounds();

        let childRect:Rect = event.startRect[childIndex];
        childRect.copyAndChange(childRect, change);

        event.elements[childIndex].setStyles(
            "left:"+(childRect.x-bound.x)+"px;"+
            "top:"+(childRect.y-bound.y)+"px;"+
            "width:"+(childRect.w)+"px;"+
            "height:"+(childRect.h)+"px;" );
    }

    public enterDrag(event: DragEvent): void
    {
        for( let i = 0 ; i < event.elements.length ; i++ )
        {
            event.ghost[i].rect.copy( event.startRect[i] );
            event.ghost[i].show();
            event.ghost[i].allowed(true);
        }

        this.updateDrag(event);
    }

    public updateDrag(event: DragEvent): void
    {
        let deltaX: number = event.pointer.x - event.startPointer.x;
        let deltaY: number = event.pointer.y - event.startPointer.y;

        for (let i = 0; i < event.elements.length; i++)
            event.ghost[i].move(event.startRect[i].x + deltaX, event.startRect[i].y + deltaY);
    }

    public dropDrag(event: DragEvent): void
    {
        let deltaX: number = event.pointer.x - event.startPointer.x;
        let deltaY: number = event.pointer.y - event.startPointer.y;
        let bounds: Rect = this.getBounds();

        for (let i:number = 0; i < event.elements.length; i++)
        {
            let target:Selectable = event.elements[i];

            if( !this.allowAddChild(target) ) continue;

            let x:number = event.startRect[i].x + deltaX - bounds.x;
            let y:number = event.startRect[i].y + deltaY - bounds.y;

            target.setStyle("left", x + "px");
            target.setStyle("top", y + "px");
            target.setStyle("width", event.startRect[i].width + "px");
            target.setStyle("height", event.startRect[i].height + "px");

            if( target.parent !== this ) this.addChild(target);
        }
    }
}

export class AbsoluteLayout extends Layout
{
    constructor(tag: string = "div", ...params: string[])
    {
        super(tag, "w-layout-absolute", ...params);
    }
}

export class VerticalLayout extends Layout
{
    public offsetX:number = 0;

    private childIndex:number = 0;

    constructor(tag: string = "div", ...params: string[])
    {
        super(tag, "w-layout-vertical", ...params);

        this.requiredStyles["position"] = "static";
    }

    public getBounds(): Rect
    {
        let rect: Rect = super.getBounds();
        rect.x += this.offsetX;
        rect.w -= this.offsetX * 2;
        return rect;
    }

    public enterDrag(event: DragEvent): void
    {
        let rowBounds: Rect = this.getBounds();

        for( let i:number = 1 ; i < event.ghost.length ; i++ )
            event.ghost[i].hide();

        event.ghost[0].size(rowBounds.w, 4);
        event.ghost[0].allowed(true);
        event.ghost[0].show();

        this.updateDrag(event);
    }

    public updateDrag(event: DragEvent): void
    {
        this.childIndex = this.children.length;

        // find index relative childrens
        for( let i:number = this.children.length-1 ; i >= 0 ; i-- )
        {
            let child:Selectable = this.children[i] as Selectable;
            let elemRect: Rect =  child.getBounds();

            if( event.pointer.y >= elemRect.top )
            {
                let isChild:boolean = false;
                if( !isChild && event.pointer.y >= elemRect.top + elemRect.height*0.5 )
                    this.childIndex = i+1;
                else
                    this.childIndex = i;
                break;
            }
        }

        // move relative index
        let bounds:Rect = this.getBounds();
        if( this.childIndex === 0 )
            event.ghost[0].move( bounds.x, bounds.y );
        else
            event.ghost[0].move( bounds.x, this.children[this.childIndex-1].getBounds().bottom );
    }

    public dropDrag(event: DragEvent): void
    {
        for (let i: number = 0; i < event.elements.length; i++)
        {
            let target:Selectable = event.elements[i];

            if ( !this.allowAddChild(target) ) continue;

            target.setStyle("width", "auto");
            target.setStyle("position", "static");

            if( target.parent === this && this.children.indexOf(target) < this.childIndex )
                this.addChild( target, this.childIndex-1 );
            else
                this.addChild( target, this.childIndex );
        }
    }


    // public enterDrag(event: DragEvent): void
    // {
    //     super.enterDrag(event);

    //     var rowBounds: Rect = this.getBounds();

    //     for( let i:number = 1 ; i < event.ghost.length ; i++ )
    //         event.ghost[i].hide();

    //     // event.ghost[0].size(rowBounds.w, 3);
    //     // event.ghost[0].html.style.position = "relative";
    //     // event.ghost[0].html.style.left = "0";
    //     // event.ghost[0].html.style.top = "0";
    //     // event.ghost[0].html.style.width = "auto";
    //     // event.ghost[0].html.style.marginBottom = "-3px";
    //     // event.ghost[0].show();

    //     event.ghost[0].size( rowBounds.w, 3 );
    //     event.ghost[0].show();
    //     //this.html.appendChild(event.ghost[0].html);

    //     this.updateDrag(event);
    // }

    // public updateDrag(event: DragEvent): void
    // {
    //     this.childIndex = this.children.length;


    //     // teste
    //     // eu sou o 1 e estou soltando no 1 -- nao acontece nada
    //     // eu sou o 1 e estou soltando no 2 --

    //     // end to init
    //     for( let i:number = this.children.length-1 ; i >= 0 ; i-- )
    //     {
    //         var child:Selectable = this.children[i] as Selectable;
    //         var elemRect: Rect =  child.getBounds();

    //         if( event.pointer.y >= elemRect.top )
    //         {
    //             var isChild:boolean = false;
    //             if( !isChild && event.pointer.y >= elemRect.top + elemRect.height*0.5 )
    //                 this.childIndex = i+1;
    //             else
    //                 this.childIndex = i;

    //             // if( this.childIndex > 0 )
    //             // {
    //             //     for (let j: number = 0; j < event.elements.length; j++)
    //             //     {
    //             //         if( this.children[this.childIndex-1] == event.elements[j] )
    //             //         {
    //             //             this.childIndex -= 1;
    //             //             break;
    //             //         }
    //             //     }
    //             // }

    //             break;
    //         }
    //     }




    //     var bounds:Rect = this.getBounds();
    //     if( this.childIndex == 0 )
    //         event.ghost[0].move( bounds.x, bounds.y );
    //     else
    //         event.ghost[0].move( bounds.x, this.children[this.childIndex-1].getBounds().bottom );

    //     // var bounds: Rect = this.getBounds();
    //     // var y: number = (this.childIndex < this.children.length) ?
    //     //     this.children[this.childIndex].getBounds().y :
    //     //     this.children[this.children.length-1].getBounds().y;
    //     // var r: Rect = (this.childIndex < this.children.length) ? this.children[this.childIndex].getBounds() : bounds;
    //     // console.log(r);
    //     // event.ghost[0].move(bounds.x, r.y);

    //     // if( this.childIndex < this.children.length )
    //     //     this.html.insertBefore(event.ghost[0].html, this.children[this.childIndex].html);
    //     // else
    //     //     this.html.appendChild(event.ghost[0].html);
    // }

    // public exitDrag(event: DragEvent): void
    // {
    //     super.exitDrag(event);

    //     // this.getRoot().html.appendChild(event.ghost[0].html);
    //     event.ghost[0].hide();
    // }

    // public dropDrag(event: DragEvent): void
    // {
    //     this.exitDrag(event);

    //     for( let i:number = 0 ; i < event.elements.length ; i++ )
    //     {
    //         var target:Selectable = event.elements[i];

    //         if ( !this.allowDrop(target) || !target.allowDrop(this) ) continue;

    //         target.html.style.position = "relative";
    //         target.html.style.left = "auto";
    //         target.html.style.top = "auto";
    //         target.html.style.width = "auto";

    //         if( target.parent == this && this.children.indexOf(target) < this.childIndex )
    //             this.addChild( target, this.childIndex-1 );
    //         else
    //             this.addChild( target, this.childIndex );
    //     }
    // }
}

export class AutoLayout extends Layout
{


    public enterDrag(event: DragEvent): void { console.log("enter"); }
    public exitDrag(event: DragEvent): void { console.log("exit"); }
    public updateDrag(event: DragEvent): void { console.log("update"); }
    public dropDrag(event: DragEvent): void { console.log("drop"); }
    // private startRect:Rect[];

    // constructor(tag: string = "div", ...params: string[])
    // {
    //     super(tag, ...params);
    // }

    // public enterDrag(event: DragEvent): void
    // {
    //     super.enterDrag(event);

    //     this.startRect = [];
    //     for (var i = 0; i < event.elements.length; i++)
    //     {
    //         var rect: Rect = event.elements[i].getBounds();
    //         this.startRect.push(rect);
    //         event.ghost[i].rect.copy(rect);
    //         event.ghost[i].show();
    //     }

    //     this.updateDrag(event);
    // }

    // public updateDrag(event: DragEvent): void
    // {
    //     var deltaX: number = event.pointer.x - event.startPointer.x;
    //     var deltaY: number = event.pointer.y - event.startPointer.y;

    //     for (var i = 0; i < event.elements.length; i++)
    //         event.ghost[i].move(event.startRect[i].x + deltaX, event.startRect[i].y + deltaY);
    // }

    // public exitDrag(event: DragEvent): void
    // {
    //     super.exitDrag(event);

    //     this.updateDrag(event);

    //     for (var i = 0; i < event.ghost.length; i++)
    //         event.ghost[i].hide();
    // }

    // public dropDrag(event: DragEvent): void
    // {
    //     this.exitDrag(event);

    //     for( let i:number = 0 ; i < event.elements.length ; i++ )
    //     {
    //         var target:Selectable = event.elements[i];
    //         if (!this.allowDrop(target) || !target.allowDrop(this)) continue;
    //     }
    // }
}

export class RowLayout extends Layout
{

    private readonly offset:number = 10;

    // grid data
    private co:number;
    private columns:number;
    private columnSize: number;
    // delegate
    private simulateResizeDelegate:any;
    private resizeDelegate:any;

    // regexp
    private reg_col: RegExp = /col-([0-9]{1,2})/;
    private reg_offset: RegExp = /offset-([0-9]{1,2})/;

    constructor(tag:string, ...params:string[])
    {
        super(tag, "w-layout-row", ...params);

        let grid:GridGizmo = new GridGizmo();
        this.html.appendChild(grid.html);

        this.simulateResizeDelegate = this.simulateResizeChild.bind(this);
        this.resizeDelegate = this.resizeChild.bind(this);
    }

    public removeChild(display: Display): void
    {
        let index:number = this.children.indexOf(display);

        if( index < this.children.length - 1 )
        {
            let offset: number =
                this.getOffsetByDisplay(display) +
                this.getSizeByDisplay(display) +
                this.getOffsetByDisplay(this.children[index+1]);

            this.setOffset(this.children[index + 1], offset);
        }

        super.removeChild(display);
    }

    public addChild(display: Display, index = 99999): void
    {
        if ( index < this.children.length )
        {
            let offset: number =
                this.getOffsetByDisplay(this.children[index]) -
                (this.getOffsetByDisplay(display) + this.getSizeByDisplay(display));

            this.setOffset(this.children[index], offset);
        }

        super.addChild(display, index);
    }

    // used external (serialization)
    public addLayoutByColumnWorldSpace(column:number, size:number):VerticalLayout
    {
        let previousIndex:number = -1;
        let offset:number = column;

        // find previous sibling
        for( let i:number = 0 ; i < this.children.length ; i++ )
        {
            let c:number = this.getColumnByDisplay(this.children[i]);
            if( c < column )
                previousIndex = i;
        }
        // calculate offset with the sibling
        if (previousIndex >= 0)
            offset = column - this.getRightByDisplay(this.children[previousIndex]);

        // create column
        let layout: VerticalLayout = this.createColumn(offset, size) as VerticalLayout;
        this.addChild(layout, previousIndex+1);

        return layout;
    }

    public getBounds():Rect
    {
        let rect:Rect = super.getBounds();
        rect.x += this.offset;
        rect.w -= this.offset * 2;
        return rect;
    }

    public simulateResizeChild(event:DragEvent, childIndex:number, change:RectChange):void
    {
        // bounds
        let rowBounds:Rect = super.getBounds();
        let bounds:Rect = event.elements[childIndex].parent.getBounds();
        // layout (children of this)
        let layout:Layout = Layout.findLayoutByDisplay(event.elements[childIndex]);
        let index:number = this.children.indexOf(layout);
        // data by grid (colums)
        let startmouse_co:number = Math.floor( (event.startPointer.x - rowBounds.x)/this.columnSize );
        let mouse_co:number = Math.floor( (event.pointer.x - rowBounds.x)/this.columnSize );
        let obj_co:number = Math.floor( (event.startRect[childIndex].x - rowBounds.x)/this.columnSize);
        let obj_size:number = Math.round( bounds.w/this.columnSize );
        let delta:number = mouse_co-startmouse_co;
        // init setup rect
        let rect:Rect = event.ghost[childIndex].rect;
        rect.copy(bounds);

        // right anchor
        if( event.startPointer.x > event.startRect[0].x + event.startRect[0].w*0.5 )
        {
            // maximo que pode avancar
            let max_delta:number = index < this.children.length-1 ?
                this.getColumnByDisplay(this.children[index+1])-(obj_co+obj_size) :
                12-(obj_co+obj_size);
            // minimo que pode voltar
            let min_delta:number = -obj_size+1;
            // clamp
            delta = Math.max(min_delta, Math.min(max_delta, delta));
            // resize
            rect.w = (obj_size+delta) * this.columnSize - this.offset*2;
        }
        // left anchor
        else
        {
            // maximo que pode avancar
            let max_delta:number = obj_size-1;
            // minimo que pode voltar
            let min_delta:number = index > 0 ?
                this.getRightByDisplay(this.children[index-1])-obj_co:
                -obj_co;
            // clamp
            delta = Math.max(min_delta, Math.min(max_delta, delta));
            // resize
            rect.x = rowBounds.x + (obj_co+delta) * this.columnSize + this.offset;
            rect.w = (obj_size-delta) * this.columnSize - this.offset * 2;
        }

        // // position in the window space
        // let rowBounds:Rect = super.getBounds();
        // let layout:Layout = Layout.findLayoutByDisplay(event.elements[childIndex]);
        // let bounds:Rect = event.elements[childIndex].parent.getBounds();
        // // layout (children of this)
        // let index:number = this.children.indexOf(layout);
        // // position in the grid space
        // let obj_co:number = Math.floor( (event.startRect[childIndex].x - rowBounds.x)/this.columnSize);
        // let obj_size:number = Math.round( bounds.w/this.columnSize );
        // // calcule mouse in grid
        // let min_mouse_co:number = index > 0 ? this.getRightByDisplay(this.children[index-1]) : 0;
        // let max_mouse_co:number = index < this.children.length-1 ? this.getColumnByDisplay(this.children[index+1])-1 : 11;
        // let mouse_co:number =
        //     Math.max(min_mouse_co, Math.min(max_mouse_co,
        //     Math.floor( (event.pointer.x - rowBounds.x)/this.columnSize ) ));
        // // setup init of rect
        // let rect:Rect = event.ghost[childIndex].rect;
        // rect.copy(bounds);

        // // right anchor
        // if( event.startPointer.x > event.startRect[0].x + event.startRect[0].w*0.5 )
        // {
        //     if( mouse_co < obj_co ) mouse_co = obj_co;

        //     rect.w = (mouse_co-obj_co+1) * this.columnSize - this.offset*2;
        // }
        // // left anchor
        // else
        // {
        //     if( mouse_co >= obj_co+obj_size ) mouse_co = obj_co+obj_size-1;

        //     rect.x = rowBounds.x + mouse_co * this.columnSize + this.offset;
        //     rect.w = (obj_size + (obj_co-mouse_co)) * this.columnSize - this.offset*2;
        // }

        event.ghost[childIndex].draw();
    }

    public resizeChild(event:DragEvent, childIndex:number, change:RectChange):void
    {
        // bounds
        let rowBounds:Rect = super.getBounds();
        let bounds:Rect = event.elements[childIndex].parent.getBounds();
        // layout (children of this)
        let layout:Layout = Layout.findLayoutByDisplay(event.elements[childIndex]);
        let index:number = this.children.indexOf(layout);
        // data by grid (colums)
        let startmouse_co:number = Math.floor( (event.startPointer.x - rowBounds.x)/this.columnSize );
        let mouse_co:number = Math.floor( (event.pointer.x - rowBounds.x)/this.columnSize );
        let obj_co:number = Math.floor( (event.startRect[childIndex].x - rowBounds.x)/this.columnSize);
        let obj_size:number = Math.round( bounds.w/this.columnSize );
        let delta:number = mouse_co-startmouse_co;
        // init setup rect
        let rect:Rect = event.ghost[childIndex].rect;
        rect.copy(bounds);

        // right anchor
        if( event.startPointer.x > event.startRect[0].x + event.startRect[0].w*0.5 )
        {
            // maximo que pode avancar
            let max_delta:number = index < this.children.length-1 ?
                this.getColumnByDisplay(this.children[index+1])-(obj_co+obj_size) :
                12-(obj_co+obj_size);
            // minimo que pode voltar
            let min_delta:number = -obj_size+1;
            // clamp
            delta = Math.max(min_delta, Math.min(max_delta, delta));
            // resize
            this.setSize(layout, obj_size+delta);
            if( index < this.children.length-1 )
            {
                this.setOffset(
                    this.children[index+1],
                    this.getOffsetByDisplay(this.children[index+1]) - delta);
            }
        }
        // left anchor
        else
        {
            // maximo que pode avancar
            let max_delta:number = obj_size-1;
            // minimo que pode voltar
            let min_delta:number = index > 0 ?
                this.getRightByDisplay(this.children[index-1])-obj_co:
                -obj_co;
            // clamp
            delta = Math.max(min_delta, Math.min(max_delta, delta));
            // resize
            if( index > 0 )
                this.setOffset(layout, (obj_co+delta)-this.getRightByDisplay(this.children[index-1]));
            else
                this.setOffset(layout, obj_co+delta);
            this.setSize(layout, obj_size-delta);
        }
        // position in the window space
        // let rowBounds:Rect = super.getBounds();
        // let layout:Layout = Layout.findLayoutByDisplay(event.elements[childIndex]);
        // let bounds:Rect = layout.getBounds();
        // // layout (children of this)
        // let index:number = this.children.indexOf(layout);
        // // obj info in grid space
        // let obj_co:number = Math.floor( (event.startRect[childIndex].x - rowBounds.x)/this.columnSize);
        // let obj_size:number = Math.round( bounds.w/this.columnSize );
        // // calcule mouse in grid
        // let min_mouse_co:number = index > 0 ? this.getRightByDisplay(this.children[index-1]) : 0;
        // let max_mouse_co:number = index < this.children.length-1 ? this.getColumnByDisplay(this.children[index+1])-1 : 11;
        // let mouse_co:number =
        //     Math.max(min_mouse_co, Math.min(max_mouse_co,
        //     Math.floor( (event.pointer.x - rowBounds.x)/this.columnSize ) ));

        // // right anchor
        // if( event.startPointer.x > event.startRect[0].x + event.startRect[0].w*0.5 )
        // {
        //     if( mouse_co < obj_co ) mouse_co = obj_co;

        //     let new_size:number = mouse_co-obj_co+1;
        //     this.setSize(layout, new_size);
        //     if( index < this.children.length-1 )
        //     {
        //         this.setOffset(
        //             this.children[index+1],
        //             this.getOffsetByDisplay(this.children[index+1]) + (obj_size-new_size));
        //     }
        // }
        // // left anchor
        // else
        // {
        //     if( mouse_co >= obj_co+obj_size ) mouse_co = obj_co+obj_size-1;

        //     //console.log(mouse_co, obj_co, obj_size);

        //     if( index > 0 )
        //         this.setOffset(
        //             layout,
        //             mouse_co-
        //             (this.getColumnByDisplay(this.children[index-1])+this.getSizeByDisplay(this.children[index-1])));
        //     else
        //         this.setOffset(layout, mouse_co);

        //     this.setSize(layout, obj_size + (obj_co-mouse_co));
        // }
    }

    public enterDrag(event: DragEvent): void
    {
        let rowBounds: Rect = super.getBounds();
        let maxSize:number = 0;

        for( let i:number = 0 ; i < event.startRect.length ; i++ )
        {
            if( event.startRect[i].w > maxSize ) maxSize = event.startRect[i].w;
            event.ghost[i].show();
        }

        this.columnSize = rowBounds.width/12;
        this.columns = Math.max(1, Math.ceil( maxSize/this.columnSize ));

        this.updateDrag(event);
        // let rowBounds: Rect = this.getBounds();

        // for( var i = 0 ; i < event.elements.length ; i++ )
        // {
        //     if (!event.elements[i].allowDrag()) continue

        //     var rect:Rect = event.elements[i].getBounds();
        //     event.ghost[i].rect.copy(rect);
        //     event.ghost[i].html.style.height = rowBounds.height+"px";
        //     event.ghost[i].html.style.position = "absolute";
        //     event.ghost[i].show();
        // }

        // this.updateDrag(event);
    }

    public exitDrag(event: DragEvent): void {/**/
        //TEMPORARIO////////////////////////////////////////////////////////////////////
        for( let i:number = 0 ; i < event.ghost.length ; i++ )
            event.ghost[i].allowed( true );
        ////////////////////////////////////////////////////////////////////////////////
    }

    public updateDrag(event: DragEvent): void
    {
        let rowBounds: Rect = super.getBounds();
        // calcule current of column
        let offsetDrag:number = event.offset.x;//this.columns * this.columnSize * 0.5;
        this.co = Math.floor( (event.pointer.x - rowBounds.x - offsetDrag)/this.columnSize );
        this.co = Math.max(0, Math.min(this.co, 12 - this.columns));
        // verifica colisoes
        let collision:boolean = this.hasCollision(this.co, this.columns, event.elements);

        // height of elements
        let height:number = rowBounds.height/event.elements.length;
        // draw ghosts
        for( let i:number = 0 ; i < event.elements.length ; i++ )
        {
            event.ghost[i].move( rowBounds.x + this.co * this.columnSize + this.offset, rowBounds.y + i * height );
            event.ghost[i].size( this.columns * this.columnSize - this.offset * 2, height );
            event.ghost[i].allowed( !collision );
        }
    }

    public dropDrag(event: DragEvent): void
    {
        // CHAMADO PARA MODIFICAR O ESTADO ALLOWED DOS GHOSTS
        //TEMPORARIO////////////////////////////////////////////////////////////////////
        this.exitDrag(event);
        ////////////////////////////////////////////////////////////////////////////////

        if ( this.hasCollision(this.co, this.columns, event.elements) ) return;

        // remove all dragged elements - this fix drag children
        for ( let i: number = event.elements.length-1; i >= 0; i-- )
        {
            // TODO: Nao posso modificar a lista do event, ele ainda esta em uso
            //if ( !this.allowAddChild(event.elements[i]) ) event.elements = event.elements.splice(i, 1);
            //else event.elements[i].remove();
            event.elements[i].remove();
        }

        // calculate index and offset position
        let offset:number = this.co;
        let index:number = this.getChildIndexByColumn(this.co);
        if (index > 0)
            offset = this.co - (this.getColumnByDisplay(this.children[index - 1]) + this.getSizeByDisplay(this.children[index - 1]));

        // create column and add drag elements
        let layout:Layout = this.createColumn(offset, this.columns);
        for ( let i:number = 0 ; i < event.elements.length ; i++ )
        {
            event.elements[i].setStyle("width", "auto");
            event.elements[i].setStyle("position", "static");
            layout.addChild( event.elements[i] );
        }
        this.addChild(layout, index);
    }

    /************************** UTILITIES ******************************/
    private createColumn( offset:number, size:number ):Layout
    {
        let class_offset:string = "offset-"+offset;
        let class_columns: string = "col-" +size;
        //let class_columns:string = "col-"+this.columns;

        let layout:VerticalLayout = new VerticalLayout("div", class_offset, class_columns);
            layout.offsetX = this.offset;
            layout.autoremove = true;
            layout.simulateResizeChild = this.simulateResizeDelegate;
            layout.resizeChild = this.resizeDelegate;

        return layout;
    }

    private hasCollision( column:number, size:number, ignore:Display[] ):boolean
    {
        let amount:number = 0;

        for( let i:number = 0 ; i < this.children.length ; i++ )
        {
            let c_co: number = this.getOffsetByDisplay(this.children[i]);
            let c_size: number = this.getSizeByDisplay(this.children[i]);

            if ( amount + c_co < column + size &&                   // child left < drag right
                 amount + c_co + c_size > column &&                 // child right > drag left
                 !this.allChildIsInList(ignore, this.children[i]) ) // all child is not in ignore list
                return true;

            amount += c_co + c_size;
        }

        return false;
    }

    private allChildIsInList( lista: Display[], display:Display ):boolean
    {
        for (let j: number = 0; j < display.children.length; j++)
            if (lista.indexOf(display.children[j]) === -1) return false;
        return true;
    }

    private getChildIndexByColumn( column:number ):number
    {
        let amount = 0;
        let result:number = 0;

        for (; result < this.children.length; result++)
        {
            let left: number = this.getOffsetByDisplay(this.children[result]);
            if (amount + left > this.co) break;
            amount += left + this.getSizeByDisplay(this.children[result]);
        }

        return result;
    }

    public getColumnByDisplay(display:Display): number
    {
        let amount = 0;

        for (let i: number = 0; i < this.children.length; i++)
        {
            amount += this.getOffsetByDisplay(this.children[i]);
            if (this.children[i] === display) break;
            amount += this.getSizeByDisplay(this.children[i]);
        }

        return amount;
    }

    public getSizeByDisplay(display: Display): number
    {
        let match: RegExpExecArray = this.reg_col.exec(display.html.className);
        return parseInt(match[1], 10);
    }

    private getRightByDisplay(display:Display):number
    {
        return this.getColumnByDisplay(display) + this.getSizeByDisplay(display);
    }

    private getOffsetByDisplay(display:Display):number
    {
        let match: RegExpExecArray = this.reg_offset.exec(display.html.className);
        return parseInt(match[1], 10);
    }

    public setOffset(display:Display, offset:number):void
    {
        let match: RegExpExecArray = this.reg_offset.exec(display.html.className);
        if( match != null ) display.removeClass(match[0]);
        display.addClass("offset-"+offset);
    }

    public setSize(display:Display, size:number):void
    {
        let match: RegExpExecArray = this.reg_col.exec(display.html.className);
        if( match != null ) display.removeClass(match[0]);
        display.addClass("col-"+size);
    }
    // private childIndex:number;

    // constructor(tag: string = "div", ...params: string[])
    // {
    //     super(tag, ...params);

    //     var grid:GridGizmo = new GridGizmo();
    //     this.html.appendChild(grid.html);

    //     this.html.style.position = "relative";
    // }

    // public enterDrag(event: DragEvent): void
    // {
    //     super.enterDrag(event);

    //     var rowBounds: Rect = this.getBounds();

    //     for( var i = 0 ; i < event.elements.length ; i++ )
    //     {
    //         if (!event.elements[i].allowDrag()) continue

    //         var rect:Rect = event.elements[i].getBounds();
    //         event.ghost[i].rect.copy(rect);
    //         event.ghost[i].html.style.height = rowBounds.height+"px";
    //         event.ghost[i].html.style.position = "absolute";
    //         event.ghost[i].show();
    //     }

    //     this.updateDrag(event);
    // }

    // public updateDrag(event: DragEvent): void
    // {
    //     // bounds of this row
    //     var rowBounds: Rect = this.getBounds();
    //     // size of column in row
    //     var columnSize:number = rowBounds.width/12;
    //     // calculate number of columns of elements
    //     var maxSize:number = 0;
    //     for( let i:number = 0 ; i < event.elements.length ; i++ )
    //         if( event.startRect[i].w > maxSize ) maxSize = event.startRect[i].w;
    //     var columns = Math.max(0, Math.round(maxSize/columnSize));
    //     // calcule current of column
    //     var offsetCenter:number = columns * columnSize * 0.5;
    //     var mouseCo:number = Math.max(0, Math.min(12-columns,
    //             Math.floor( (event.pointer.x - rowBounds.x - offsetCenter)/columnSize )
    //         ));
    //     // height of elements
    //     var height:number = rowBounds.height/event.elements.length;
    //     // draw ghosts
    //     for( let i:number = 0 ; i < event.elements.length ; i++ )
    //     {
    //         event.ghost[i].move( rowBounds.x + mouseCo * columnSize, rowBounds.y + i * height );
    //         event.ghost[i].size( columns * columnSize, height );
    //     }
    // }

    // public exitDrag(event: DragEvent): void
    // {
    //     super.exitDrag(event);

    //     for (var i = 0; i < event.ghost.length; i++)
    //         event.ghost[i].hide();
    // }

    // public dropDrag(event: DragEvent): void
    // {
    //     this.exitDrag(event);

    //     if( !this.allowDropGroup(event) ) return;

    //     // bounds of this row
    //     var rowBounds: Rect = this.getBounds();
    //     // size of column in row
    //     var columnSize:number = rowBounds.width/12;
    //     // calculate number of columns of elements
    //     var maxSize:number = 0;
    //     for( let i:number = 0 ; i < event.elements.length ; i++ )
    //         if( event.startRect[i].w > maxSize ) maxSize = event.startRect[i].w;
    //     var columns = Math.max(0, Math.round(maxSize/columnSize));
    //     // calcule current of column
    //     var offsetCenter:number = columns * columnSize * 0.5;
    //     var mouseCo:number = Math.max(0, Math.min(12-columns,
    //             Math.floor( (event.pointer.x - rowBounds.x - offsetCenter)/columnSize )
    //         ));
    //     // height of elements
    //     var height:number = rowBounds.height/event.elements.length;


    //     var vert:VerticalLayout = new VerticalLayout();
    //     vert.addClass("col-"+columns);
    //     vert.addClass("offset-"+mouseCo);

    //     for( let i:number = 0 ; i < event.elements.length ; i++ )
    //     {
    //         vert.addChild(event.elements[i]);
    //     }

    //     this.addChild(vert);
    // }

}

class GridGizmo extends Display
{
    constructor()
    {
        super("div", "w-row-grid");
        for (let i = 0; i < 12; i++)
            this.addChild( new Display("div", "col-1") );
    }
}

export class FlexLayout extends Layout
{
    constructor(tag:string, ...params:string[])
    {
        super(tag, "w-layout-flex", ...params);
    }
}

