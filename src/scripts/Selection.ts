import { Selectable } from "./Selectable";
import { LiteEvent } from "./LiteEvent";
import { Rect } from "./Utils";
import { Display } from "./Display";


export class SelectableGroup
{

    public selectables: Selectable[] = [];
    public readonly onChange = new LiteEvent<Selectable[]>();

    private onAddHandler: (e: Selectable) => void;
    private onRemoveHandler: (e: Selectable) => void;
    private filter: (e: Selectable) => boolean;
    private allowDispathChangeEvent:boolean = true;

    constructor( onAddHandler: (e: Selectable) => void, onRemoveHandler: (e: Selectable) => void ) 
    {
        this.onAddHandler = onAddHandler;
        this.onRemoveHandler = onRemoveHandler;
        this.filter = this.defaultFilter;
    }

    public get(index:number):Selectable
    {
        return this.selectables[index];
    }

    public getRectArea():Rect
    {
        if( this.count() == 0 ) return new Rect();

        var l = 99999, t = 99999, r = -99999, b=-99999;

        for( let i = 0 ; i < this.count() ; i++ )
        {
            let cr:Rect = this.selectables[i].getBounds();
            l = Math.min(l, cr.left);
            t = Math.min(t, cr.top);
            r = Math.max(r, cr.left + cr.width);
            b = Math.max(b, cr.top + cr.height);
        }

        return new Rect(l, t, r-l, b-t);
    }

    public contains( element:Selectable ):boolean
    {
        return this.selectables.indexOf(element) != -1;
    }

    public count():number
    {
        return this.selectables.length;
    }

    public setFilter( filter: (e: Selectable) => boolean )
    {
        this.filter = filter;
    }

    public clearFilter():void
    {
        this.setFilter(this.defaultFilter);
    }

    // . nokey: simplesmente ignora o que estava selecionado e adiciona todos os elementos atuais.
    // . shift: deixa os elementos que estao de fora, e os que estao dentro inverte, os selecionados sao removidos e os que nao estao sao adicionados.
    // . ctrl: deixa os elementos que estao de fora e adiciona todos os elementos que estao na area de selecao.

    public combine(toggleMode: boolean, ...others:Selectable[] ):void
    {
        this.allowDispathChangeEvent = false;

        if ( toggleMode ) 
        {
            // toggle todos os others
            for (var i = 0; i < others.length; i++)
                if (others[i] != null)
                    this.toggle(others[i]);
        }
        else 
        {
            // remove others
            // if( removeOthers )
            // {
            //     for (var i = 0; i < this.selectables.length; i++) {
            //         var index = others.indexOf(this.selectables[i]);
            //         if (index == -1) this.remove(this.selectables[i]);
            //     }
            // }

            // add news
            for (var i = 0; i < others.length; i++)
                if( others[i] != null )
                    this.add(others[i]);
        }

        this.onChange.trigger(this.selectables);
        this.allowDispathChangeEvent = true;
    }

    public set(...others: Selectable[]): void 
    {
        this.allowDispathChangeEvent = false;

        // remove others
        for (var i = this.selectables.length; i >=0 ; i--) {
            var index = others.indexOf(this.selectables[i]);
            if (index == -1) this.remove(this.selectables[i]);
        }

        // add news
        for (var i = 0; i < others.length; i++)
            if (others[i] != null)
                this.add(others[i]);

        this.onChange.trigger(this.selectables);
        this.allowDispathChangeEvent = true;
    }

    public toggle(obj: Selectable, clearSelection: boolean = false): void 
    {
        let index: number = this.selectables.indexOf(obj);
        if (index == -1)
        {
            if (clearSelection)
                this.set(obj);
            else
                this.add(obj);
        }
        else 
        {
            if (clearSelection)
                this.clear();
            else
                this.remove(obj);
        }
    }

    public add(obj: Selectable): void 
    {
        let index: number = this.selectables.indexOf(obj);
        if (index == -1 && this.filter(obj) ) 
        {
            this.onAddHandler(obj);
            this.selectables.push(obj);
            if (this.allowDispathChangeEvent) this.onChange.trigger(this.selectables);
        }

    }

    public remove(obj: Selectable): void 
    {
        let index: number = this.selectables.indexOf(obj);
        if (index != -1)
        {
            this.onRemoveHandler(obj);
            this.selectables.splice(index, 1);
            if (this.allowDispathChangeEvent) this.onChange.trigger(this.selectables);
        }
    }

    // public set(obj: Selectable): void 
    // {
    //     let index: number = this.selectables.indexOf(obj);

    //     if (index != -1) 
    //     {
    //         // FIXX** remove para nao disparar o metodo onRemoveHandler invocado dentro do metodo clear
    //         this.selectables.splice(index, 1);

    //         this.clear();
    //         this.selectables.push(obj);
    //     }
    //     else 
    //     {
    //         this.clear();
    //         this.add(obj);
    //     }
    // }

    public clear(): void 
    {
        for (let i: number = 0; i < this.selectables.length; i++)
            this.onRemoveHandler( this.selectables[i] );
        this.selectables = [];

        if (this.allowDispathChangeEvent) this.onChange.trigger(this.selectables);
    }

    private defaultFilter(e:Selectable):boolean
    {
        return true;
    }
}



export class Selection// extends Display 
{
    public select: SelectableGroup;
    public hover: SelectableGroup;

    constructor()
    {
        this.select = new SelectableGroup((e: Selectable) => e.focus(null), (e: Selectable) => e.unfocus(null));
        this.hover = new SelectableGroup((e: Selectable) => e.over(null), (e: Selectable) => e.out(null));
    }
}

// export class SelectEvent 
// {
//     public selection: Selection;
//     public deltaX: number;
//     public deltaY: number;
//     public x: number;
//     public y: number;
//     public startX: number;
//     public startY: number;

//     public constructor( selection:Selection )
//     {
//         this.selection = selection;
//     }

//     public start( x:number, y:number )
//     {
//         this.startX = x;
//         this.startY = y;
//     }

//     public read(event:MouseEvent)
//     {
//         this.x = event.pageX;
//         this.y = event.pageY;
//         this.deltaX = event.movementX;
//         this.deltaY = event.movementY;
//     }
// }

// show drag and drop area selection
export class RectView extends Display
{
    public rect: Rect;

    protected _isShow:boolean = true;

    constructor(...classes:string[])
    {
        super("div", ...classes);
        this.rect = new Rect();

        this.html.style.position = "absolute";
        this.html.style.pointerEvents = "none";
    }

    public start(x:number, y:number): void
    {
        this.rect.start(x, y);
        this.draw();
    }

    public end(x:number, y:number): void
    {
        this.rect.end(x, y);
        this.draw();
    }

    public isShow():boolean { return this._isShow; }

    public show(): void
    {
        this._isShow = true;
        this.html.style.display = "block";
    }

    public hide(): void
    {
        this._isShow = false;
        this.html.style.display = "none";
    }

    public set(x:number, y:number, w:number, h:number)
    {
        this.rect.x = x;
        this.rect.y = y;
        this.rect.w = w;
        this.rect.h = h;
        this.draw();
    }
    
    public setH(x: number, w: number)
    {
        this.rect.x = x;
        this.rect.w = w;
        this.draw();
    }

    public setV(y: number, h: number)
    {
        this.rect.y = y;
        this.rect.h = h;
        this.draw();
    }

    public move(x: number, y: number) 
    {
        this.rect.move(x, y);
        this.draw();
    }

    public size(w: number, h: number)
    {
        this.rect.size(w, h);
        this.draw();
    }

    public add(x: number, y: number, w:number, h:number) 
    {
        this.rect.x += x;
        this.rect.y += y;
        this.rect.w += w;
        this.rect.h += h;
        this.draw();
    }

    public draw(): void
    {
        this.html.style.left = this.rect.x + "px";
        this.html.style.top = this.rect.y + "px";
        this.html.style.width = this.rect.w + "px";
        this.html.style.height = this.rect.h + "px";
    }
}

// show drag and drop area selection - responsavel por adicionar selecoes atraves do mouse
enum DRAGGER_MODE
{
    NONE, // set
    CTRL, // add
    SHIFT // toggle
}

export class SelectionDragger extends RectView
{
    //private static readonly OVERRIDE_EVERYTHING: boolean = false;


    public readonly onEditSelect = new LiteEvent<Selectable>();

    //public readonly onChange = new LiteEvent<string>();
    private selection:Selection;
    private mode:DRAGGER_MODE;
    private isDown: boolean;
    private root: Display;
    private isEnabled:boolean = true;
    private hoverMark:RectView;

    constructor(root:Display, selection:Selection) 
    {
        super("select-view");

        this.root = root;
        this.selection = selection;
        this.hide();

        this.hoverMark = new RectView("select-hover");
        this.hoverMark.hide();


        var self = this;
        window.addEventListener("mousedown", (event: MouseEvent) => self.mousedown(event));
        window.addEventListener("mousemove", (event: MouseEvent) => self.mousemove(event));
        window.addEventListener("mouseup", (event: MouseEvent) => self.onmouseup(event));

        window.addEventListener("dblclick", (event: MouseEvent)=> {
            if( !self.isEnabled ) return;

            //var target = self.getSelectionByPoint(event.pageX, event.pageY);
            var target:Selectable = self.root.findByPoint(event.pageX, event.pageY, self.selectableFilter) as Selectable;
            if( target ) self.onEditSelect.trigger(target);
        });

        document.body.appendChild(this.hoverMark.html);
        document.body.appendChild(this.html);
    }

    public enable()
    {
        this.isEnabled = true;
    }

    public disable()
    {
        this.isEnabled = false;
        this.hoverMark.hide();
        this.hide();
    }

    private selectableFilter( element:Display ):boolean
    { 
        return element instanceof Selectable && element.getData("ignoreselect") != "true";
    }

    // . nokey: simplesmente ignora o que estava selecionado e adiciona todos os elementos atuais.
    // . shift: deixa os elementos que estao de fora, e os que estao dentro inverte, os selecionados sao removidos e os que nao estao sao adicionados.
    // . ctrl: deixa os elementos que estao de fora e adiciona todos os elementos que estao na area de selecao.
    protected mousedown(event: MouseEvent): void 
    {
        if( !this.isEnabled ) return;
        if ( this.IsEditor(event.target as HTMLElement) ) return;
        event.preventDefault();


        this.show();
        this.start(event.pageX, event.pageY);

        this.isDown = true;

        if( event.ctrlKey )
            this.mode = DRAGGER_MODE.CTRL;
        else if( event.shiftKey )
            this.mode = DRAGGER_MODE.SHIFT;
        else
            this.mode = DRAGGER_MODE.NONE;

        this.hoverMark.hide();

        //this.updateSelection(this.getSelectionByPoint(event.pageX, event.pageY));
    }

    protected mousemove(event: MouseEvent): void 
    {
        if ( !this.isEnabled ) return;



        if ( !this.isDown ) 
        {
            //var hoverTarget: Selectable = this.getSelectionByPoint(event.pageX, event.pageY);
            var hoverTarget:Selectable = this.root.findByPoint(event.pageX, event.pageY, this.selectableFilter) as Selectable;
            var elem: HTMLElement = event.target as HTMLElement;

            if (this.IsEditor(elem)) return;

            // elementos de edicao contem a tag editor-gizmo, evitando selecionar os objetos que estao atras deles
            if (hoverTarget && elem.className.indexOf("editor-gizmo") == -1 )
            {
                this.selection.hover.set(hoverTarget);

                var rect: Rect = this.selection.hover.getRectArea();
                this.hoverMark.set(rect.x, rect.y, rect.w, rect.h);
                this.hoverMark.show();

                //???????????????????????????????????
                // if( hoverTarget.allowDrag() )
                //     this.hoverMark.removeClass("drag-false");
                // else
                //     this.hoverMark.addClass("drag-false");
            }
            else 
            {
                this.selection.hover.clear();
                this.hoverMark.hide();
            }

            // if button is pressed
            if( event.buttons == 1 && event.which == 1 )
                this.hoverMark.hide();

            return;
        }

        this.hoverMark.hide();

        this.selection.hover.clear();

        event.preventDefault();

        this.end(event.pageX, event.pageY);
        //this.updateSelection(...this.getSelectionByArea(this.rect));
        this.updateSelection(...this.root.findByArea(this.rect, this.selectableFilter) as Selectable[]);
        

        if (event.which !== 1) this.onmouseup(event);
    }

    protected onmouseup(event: MouseEvent): void 
    {
        if ( !this.isEnabled ) return;
        if ( !this.isDown ) return;
        event.preventDefault();

        this.end(event.pageX, event.pageY);
        //this.updateSelection(...this.getSelectionByArea(this.rect));
        var teste:Display[];
        this.updateSelection(...this.root.findByArea(this.rect, this.selectableFilter) as Selectable[]);

        this.hide();
        this.isDown = false;
    }

    protected updateSelection( ...elements:Selectable[] )
    {
        switch (this.mode) {
            case DRAGGER_MODE.NONE:
                this.selection.select.set(...elements);
                break;
            case DRAGGER_MODE.CTRL:
                this.selection.select.combine(false, ...elements);
                break;
            case DRAGGER_MODE.SHIFT:
                this.selection.select.combine(true, ...elements);
                break;
        }
    }

    private IsEditor( elem:HTMLElement ):boolean
    {
        //if (elem.parentElement != null) return this.IsEditor(elem.parentElement);
        var root:HTMLElement = elem;
        while( root != null )
        {
            if (root.className.indexOf("ui-editor") != -1) return true;
            root = root.parentElement;
        }
        return false;
    }

}

// export class DragEvent
// {
//     public elements: Selectable[] = [];    // elementos selecionados
//     public startRect:Rect[] = [];          // area inicial em que foram selecionados
//     public ghost: Ghost[] = [];            // representacao visual dos elementos selecionados
//     public pointer: Vec2 = new Vec2;       // posicao atual do mouse
//     public startPointer: Vec2 = new Vec2;  // posicao inicial registrada quando o usuario pressiona o mouse
//     public offset: Vec2 = new Vec2;        // offset relative bounds of all elements

//     public clear():void
//     {
//         this.elements = [];
//         for (var i = this.ghost.length-1 ; i >= 0 ; i-- )
//             Ghost.Recycle( this.ghost.pop() );
//     }
// }

// // show selected area with anchors
// export class SelectionTransform extends RectView
// {

//     public hasMovementHorizontal: boolean;
//     public hasMovementVertical: boolean;
//     public isAnchor: boolean;
//     public isDown: boolean;
//     public isMinusHorizontal: boolean;
//     public isMinusVertical: boolean;

//     private nextRect:Rect;
//     private startDragRect:Rect;
//     private _event:DragEvent;
//     private _layout:Layout;
//     private _selection:Selection;
//     private _enableAnchors:boolean;
//     private layoutMark:RectView;
//     private root:Display;

//     constructor(root:Display, selection:Selection) 
//     {
//         super("selection-view", "editor-gizmo");

//         this.root = root;
//         this._selection = selection;

//         // anchors
//         this.addChild(new Display("div", "anchor", "a-u"));
//         this.addChild(new Display("div", "anchor", "a-r"));
//         this.addChild(new Display("div", "anchor", "a-d"));
//         this.addChild(new Display("div", "anchor", "a-l"));
//         this.addChild(new Display("div", "anchor", "a-ul"));
//         this.addChild(new Display("div", "anchor", "a-ur"));
//         this.addChild(new Display("div", "anchor", "a-dl"));
//         this.addChild(new Display("div", "anchor", "a-dr"));

//         // rect
//         //this.set(200, 200, 200, 250);
//         this.hide();
//         this.nextRect = new Rect();
//         this.nextRect.copy(this.rect);

//         // cache data
//         this._event = new DragEvent();
//         this.startDragRect = new Rect();

//         // layout mark
//         this.layoutMark = new RectView("layout-hover");
//         this.layoutMark.hide();

//         // start in disable
//         this.disableAnchors();

//         // events
//         var self = this;
//         this.html.addEventListener( "mousedown", (event: MouseEvent) => self.mousedown(event) );
//         window.addEventListener( "mousemove", (event: MouseEvent) => self.mousemove(event) );
//         window.addEventListener( "mouseup", (event: MouseEvent) => self.onmouseup(event) );

//         this._selection.select.onChange.on((e: Selectable[]) => self.selectionChangeHandler(e));

//         document.body.appendChild(this.layoutMark.html);
//         document.body.appendChild(this.html);

//         this.html.style.pointerEvents = "auto";
//     }

//     private selectionChangeHandler(e: Selectable[]): void
//     {
//         this._event.elements = [];
//         for( let i:number = 0 ; i < e.length ; i++ )
//             if( e[i].allowDrag() ) this._event.elements.push(e[i]);

//         var diff: number = this._event.elements.length - this._event.ghost.length;

//         // rect
//         this._event.startRect = [];
//         for( let i:number = 0 ; i < e.length ; i++ )
//             this._event.startRect.push( e[i].getBounds() );

//         // add ghosts
//         for( let i:number = 0 ; i < diff ; i++ )
//             this._event.ghost.push( Ghost.Get(e[i], false) );

//         // remove ghosts
//         for( let i:number = 0 ; i > diff ; i-- )
//             Ghost.Recycle( this._event.ghost.pop() );

//         if( e.length > 0 )
//             this.show();
//         else
//             this.hide();

//         this.redraw();
//     }

//     private redraw():void
//     {
//         var rect: Rect = this._selection.select.getRectArea();
//         this.set(rect.x, rect.y, rect.w, rect.h);

//         var isDraggable:boolean = false;

//         for( let i:number = 0 ; i < this._event.ghost.length ; i++ )
//         {
//             this._event.ghost[i].rect.copyClientRect( this._event.elements[i].getBounds() );
//             this._event.ghost[i].draw();

//             if( this._event.elements[i].allowDrag() ) isDraggable = true;
//         }

//         this.setData('drag', isDraggable ? 'true' : 'false');
//     }

//     public get layout():Layout
//     {
//         return this._layout;
//     }

//     public enableAnchors():void
//     {
//         this._enableAnchors = true;
//         this.removeClass("anchor-disable");
//     }

//     public disableAnchors():void
//     {
//         this._enableAnchors = false;
//         this.addClass("anchor-disable");
//     }

//     private layoutFilter( element:Display ):boolean
//     {
//         return element instanceof Layout;
//     }

//     // public getLayoutByPoint(x: number, y: number): Layout 
//     // {
//     //     return this.getLayoutByPointInChildren(x, y, this.root);
//     // }

//     // public getLayoutByPointInChildren(x: number, y: number, element: Display): Layout 
//     // {
//     //     for (var i = 0; i < element.children.length; i++)
//     //     {
//     //         var result: Layout = this.getLayoutByPointInChildren(x, y, element.children[i]);
//     //         if (result != null) return result;
//     //     }

//     //     var domRect = element.getBounds();
//     //     if (element instanceof Layout &&
//     //         x >= domRect.left && y >= domRect.top &&
//     //         x <= domRect.right && y <= domRect.bottom)
//     //     {
//     //         return element;
//     //     }

//     //     return null;
//     // }

//     public mousedown(event: MouseEvent) : void
//     {
//         if( !this.isShow() ) return;

//         event.preventDefault();
//         event.stopPropagation();
//         this.isDown = true;

//         var target: HTMLElement = event.target as HTMLElement;
//         var className: string = target.className;

//         this.isAnchor = this._enableAnchors && target && className.indexOf("anchor") != -1;

//         // cache start drag information
//         this.startDragRect.copy(this.rect);
//         this._event.pointer.x = this._event.startPointer.x = event.pageX;
//         this._event.pointer.y = this._event.startPointer.y = event.pageY;
//         this._event.offset.x = event.pageX - this.startDragRect.x;
//         this._event.offset.x = event.pageY - this.startDragRect.y;

//         if( this.isAnchor )
//         {
//             this.hasMovementVertical = className.indexOf("-l ") == -1 && className.indexOf("-r ") == -1;
//             this.hasMovementHorizontal = className.indexOf("-u ") == -1 && className.indexOf("-d ") == -1;
//             this.isMinusHorizontal = this.hasMovementHorizontal && (className.indexOf("-l ") != -1 || className.indexOf("l ") != -1);
//             this.isMinusVertical = this.hasMovementVertical && (className.indexOf("-u") != -1);

//             var startX: number = this.rect.x;
//             var endX: number = startX;
//             var startY: number = this.rect.y;
//             var endY: number = startY;

//             if( this.isMinusHorizontal )
//                 startX += this.rect.w;
//             else
//                 endX += this.rect.w;

//             if( this.isMinusVertical )
//                 startY += this.rect.h;
//             else
//                 endY += this.rect.h;

//             this.nextRect.start(startX, startY);
//             this.nextRect.end(endX, endY);
//             this.rect.copy(this.nextRect);
//         }
//         else 
//         {
//             this.nextRect.copy(this.rect);
//         }

//         // layout manager
//         //this._layout = this._event.elements.length == 0 ? null : this.getLayoutByPoint(event.pageX, event.pageY);
//         this._layout = this._event.elements.length == 0 ? null : this.root.findByPoint(event.pageX, event.pageY, this.layoutFilter) as Layout;
//         if (this._layout) this._layout.enterDrag(this._event);

//         // disable mouse in this
//         this.html.style.pointerEvents = "none";
//         this.html.style.opacity = "0";
//     }

//     public mousemove(event: MouseEvent): void
//     {
//         if ( !this.isDown ) return;

//         event.preventDefault();

//         this._event.pointer.x = event.pageX;
//         this._event.pointer.y = event.pageY;

//         this.update(event);

//         // layout manager
//         if( this._event.elements.length > 0 )
//         {
//             //var newLayout:Layout = this.getLayoutByPoint(event.pageX, event.pageY);
//             var newLayout:Layout = this.root.findByPoint(event.pageX, event.pageY, this.layoutFilter) as Layout;
//             if( newLayout != this._layout ) 
//             {
//                 if (this._layout) this._layout.exitDrag(this._event);
//                 if (newLayout) newLayout.enterDrag(this._event);
//             }
//             this._layout = newLayout;
//             if (this._layout) 
//             {
//                 this._layout.updateDrag(this._event);
//                 var rect:Rect = this._layout.getBounds();
//                 this.layoutMark.set(rect.x, rect.y, rect.w, rect.h);
//                 this.layoutMark.show();
//             }
//             else 
//             {
//                 this.layoutMark.hide();
//             }
//         }

//         // disable drag
//         if (event.which !== 1) this.onmouseup(event);
//     }

//     public onmouseup(event: MouseEvent): void
//     {
//         if ( !this.isDown ) return;

//         event.preventDefault();
//         this.isDown = false;

//         this._event.pointer.x = event.pageX;
//         this._event.pointer.y = event.pageY;

//         this.update(event);

//         // layout manager
//         if (this._layout != null) this._layout.dropDrag(this._event);
//         this.layoutMark.hide();
//         // this._layout = null;
//         // this._event.clear();

//         // enable mouse in this
//         this.html.style.pointerEvents = "auto";
//         this.html.style.opacity = "1";



//         this.redraw();
//     }

//     private update(event:MouseEvent): RectChange
//     {
//         if (this.isAnchor)
//         {
//             this.nextRect.end(
//                 this.hasMovementHorizontal ? event.pageX : this.rect.x + this.rect.w,
//                 this.hasMovementVertical ? event.pageY : this.rect.y + this.rect.h);
//         }
//         else
//         {
//             this.nextRect.move(
//                 this.nextRect.x + event.movementX, 
//                 this.nextRect.y + event.movementY);
//         }

//         var change: RectChange = this.rect.getChangeByRect(this.nextRect);
//         this.rect.copy(this.nextRect);
//         this.draw();

//         return change;
//     }
// }



// export class Ghost extends RectView
// {
//     private static pool:Ghost[] = [];

//     public static Get(target:Display, show:boolean = true): Ghost
//     {
//         let ghost: Ghost;
//         if( Ghost.pool.length <= 0 )
//         {
//             ghost = new Ghost();
//             document.body.appendChild(ghost.html);
//         } 
//         else
//         {
//             ghost = Ghost.pool.pop();
//         }
//         ghost.rect.copyClientRect(target.getBounds());
//         if( show ) ghost.show();
//         return ghost;
//     }

//     public static Recycle(ghost:Ghost):void
//     {
//         ghost.hide();
//         Ghost.pool.push(ghost);
//     }

//     constructor(...classesName:string[])
//     {
//         super(...classesName, "ghost");

//         this.html.style.display = "none";
//     }

//     public show()
//     {
//         this.html.style.display = "block";
//         super.show();
//     }

//     public hide() 
//     {
//         this.html.style.display = "none";
//         this.rect.size(0, 0);
//         super.hide();
//     }

// }

// export class ToolbarEditor extends Display
// {
//     private static pool: ToolbarEditor[] = [];

//     public static Get(target: Display): ToolbarEditor
//     {
//         let toolbar: ToolbarEditor;
//         if (ToolbarEditor.pool.length <= 0)
//         {
//             toolbar = new ToolbarEditor();
//             target.getRoot().addChild(toolbar)
//         }
//         else
//         {
//             toolbar = ToolbarEditor.pool.pop();
//         }
//         //toolbar.rect.copyClientRect(target.getBounds());
//         toolbar.show( target );
//         return toolbar;
//     }

//     public static Recycle(toolbar: ToolbarEditor): void
//     {
//         toolbar.hide();
//         ToolbarEditor.pool.push(toolbar);
//     }

//     constructor(...classesName: string[])
//     {
//         super( "div", "toolbar", "editor-ui", ...classesName );

//         this.html.style.display = "none";

//         this.html.innerHTML = 
//         "<div class='ui-toolbar'>"+
//         "    <button class='ui-edit'></button>"+
//         "    <button class='ui-close'></button>"+
//         "</div>";
//     }

//     public show(target:Display)
//     {
//         var bounds:Rect = target.getBounds();

//         this.html.style.display = "block";
//         this.html.style.position = "absolute";
//         this.html.style.left = bounds.right + "px";
//         this.html.style.top = (bounds.top) + "px";
//         this.html.style.zIndex = "999";
//     }

//     public hide() 
//     {
//         this.html.style.display = "none";
//     }

//     /*
//     <div class="btn-group mr-2 btn-group-sm toolbar" role="group" aria-label="Opções de Edição">
//         <button type="button" class="btn btn-success"><i class="fa fa-pencil" aria-hidden="true" title="Editar Conteudo"></i></button>
//         <button type="button" class="btn btn-danger"><i class="fa fa-times" aria-hidden="true" title="Deletar Elemento"></i></button>
//     </div>
//     */

// }