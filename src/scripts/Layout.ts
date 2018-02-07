import { Display } from "./Display";
import { Rect } from "./Utils";
import { Selectable } from "./Selectable";

export abstract class Layout extends Selectable
{
    protected childTag:string = "";
    protected childClassName:string = "";
    //protected requiredStyles:{ [id: string]: string; } = {};

    constructor(tagName: string = "div", ...params: string[])
    {
        super(tagName, "layout", ...params);

        if( tagName === "ul" ) this.setChildStruct("li");
        else if( tagName === "select" ) this.setChildStruct("option");
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
        // this.applyRequiredStyle(display);

        // FIX*** Depois de tudo
        super.addChild(display, index);
    }

    public removeChild(display: Display): void
    {
        // FIX*** Antes de tudo
        super.removeChild(display);

        this.removeChildStruct(display);
        // this.removeRequiredStyle(display);
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

    // private applyRequiredStyle(display:Display):void
    // {
    //     let previous:string = "";
    //     for( let key in this.requiredStyles )
    //     {
    //         let value:string = this.getStyle(key);
    //         if( value !== "" )
    //             previous += (previous!==""?";":"")+key+":"+value;
    //         display.setStyle(key, this.requiredStyles[key]);
    //     }
    //     if( previous !== "" )
    //         display.setData("styles", previous);
    // }

    private removeChildStruct(display:Display):void
    {
        let previousTag:string = display.getData("tagName");
        if( previousTag !== "" )
            display.setTagName(previousTag);
        display.removeData("tagName");
        display.removeClasses(this.childClassName);
    }

    // private removeRequiredStyle(display:Display):void
    // {
    //     for( let key in this.requiredStyles )
    //         display.removeStyle(key);

    //     let previousStyle:string[] = display.getData("styles").split(";");
    //     if( previousStyle.length > 0 )
    //     {
    //         for( let i:number = 0 ; i < previousStyle.length ; i++ )
    //         {
    //             let values:string[] = previousStyle[i].split(":");
    //             display.setStyle(values[0], values[1]);
    //         }
    //     }
    //     display.removeData("styles");
    // }

    // public enterDrag(event: DragEvent): void
    // {
    //     this.addClass("layout-over");
    // }

    // public exitDrag(event: DragEvent): void
    // {
    //     this.removeClass("layout-over");
    // }

    // public abstract updateDrag(event: DragEvent): void;
    // public abstract dropDrag(event: DragEvent): void;


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
        super(tag, ...params);

        // this.requiredStyles["position"] = "absolute";
    }

    // public enterDrag(event: DragEvent): void
    // {
    //     super.enterDrag(event);

    //     for( var i = 0 ; i < event.elements.length ; i++ )
    //     {
    //         var rect:Rect = event.elements[i].getBounds();
    //         event.ghost[i].rect.copy(rect);
    //         event.ghost[i].html.style.position = "absolute";
    //         event.ghost[i].show();
    //     }

    //     this.updateDrag(event);
    // }

    // public updateDrag(event: DragEvent): void
    // {
    //     var deltaX: number = event.pointer.x - event.startPointer.x;
    //     var deltaY: number = event.pointer.y - event.startPointer.y;

    //     for (var i = 0; i < event.elements.length; i++)
    //         event.ghost[i].move(event.startRect[i].x + deltaX, event.startRect[i].y +deltaY);
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

    //     var bounds:Rect = this.getBounds();
    //     for (var i = 0; i < event.ghost.length; i++)
    //     {
    //         var target:Selectable = event.elements[i];
    //         var ghost:Ghost = event.ghost[i];

    //         if( !this.allowDrop(target) || !target.allowDrop(this) ) continue;

    //         target.html.style.position = "absolute";
    //         target.html.style.left = (ghost.rect.x - bounds.x)+"px";
    //         target.html.style.top = (ghost.rect.y - bounds.y) + "px";
    //         target.html.style.width = (ghost.rect.w)+"px";
    //         target.html.style.height = (ghost.rect.h)+"px";

    //         this.addChild( target );
    //     }
    // }
}

export class VerticalLayout extends Layout
{

    // private childIndex:number = 0;

    constructor(tag: string = "div", ...params: string[])
    {
        super(tag, ...params);

        // this.requiredStyles["position"] = "static";
        // this.requiredStyles["left"] = "auto";
        // this.requiredStyles["top"] = "auto";
        // this.requiredStyles["width"] = "auto";
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
    // constructor()
    // {
    //     super("div", "grid");
    //     for (var i = 0; i < 12; i++)
    //         this.addChild(new Display("div", "col-1"));
    // }
}

