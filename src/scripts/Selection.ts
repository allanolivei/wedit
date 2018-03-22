import { Selectable } from "./Selectable";
import { LiteEvent } from "./LiteEvent";
import { Rect, RectChange, Vec2 } from "./Utils";
import { Display } from "./Display";
import { Layout } from "./Layout";
import { DragEvent } from "./Event";
import { Widget } from "./Widget";


export class SelectableGroup
{

    public selectables: Selectable[] = [];
    public readonly onChange = new LiteEvent<Selectable[]>();

    private onAddHandler: (e: Selectable) => void;
    private onRemoveHandler: (e: Selectable) => void;
    private filter: (e: Selectable) => boolean;
    private cacheSelectables: Selectable[];
    private changeAmount:number = 0;
    private dispatchChange:() => void;

    constructor( onAddHandler: (e: Selectable) => void, onRemoveHandler: (e: Selectable) => void )
    {
        this.onAddHandler = onAddHandler;
        this.onRemoveHandler = onRemoveHandler;
        this.filter = this.defaultFilter;

        this.unlockChangeEvent();
    }

    public get(index:number):Selectable
    {
        return this.selectables[index];
    }

    public getRectArea():Rect
    {
        if( this.count() === 0 ) return new Rect();

        let l = 99999, t = 99999, r = -99999, b=-99999;

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
        return this.selectables.indexOf(element) !== -1;
    }

    public count():number
    {
        return this.selectables.length;
    }

    public setFilter( filter: (e: Selectable) => boolean )
    {
        this.filter = filter;

        for (let i: number = this.selectables.length-1 ; i >= 0 ; i-- )
            if( !this.filter(this.selectables[i]) ) this.remove(this.selectables[i]);
    }

    public clearFilter():void
    {
        this.setFilter(this.defaultFilter);
    }

    public cache():void
    {
        this.cacheSelectables = this.selectables.slice(0);
    }

    public toggleCache(...others:Selectable[]):void
    {
        this.lockChangeEvent();

        // selecao atual
        for( let i:number = 0 ; i < others.length ; i++ )
        {
            // dentro
            if( this.cacheSelectables.indexOf(others[i]) !== -1 )
                this.remove(others[i]);
            // fora
            else
                this.add(others[i]);
        }

        // out freeze - objetos fora do freeze, mas que estao selecionado, e que nao estao na selecao, devem ser removidos
        for( let i:number = 0 ; i < this.selectables.length ; i++ )
            if( this.cacheSelectables.indexOf(this.selectables[i]) === -1 && others.indexOf(this.selectables[i]) === -1 )
                this.remove(this.selectables[i]);

        // inner freeze - objetos dentro do freeze que nao estao na area de selecao devem ser adicionados
        for( let i:number = 0 ; i < this.cacheSelectables.length ; i++ )
            if( others.indexOf(this.cacheSelectables[i]) === -1 )
                this.add(this.cacheSelectables[i]);

        this.unlockChangeEvent();
    }

    public combine(toggleMode: boolean, ...others:Selectable[] ):void
    {
        this.lockChangeEvent();

        if ( toggleMode )
        {
            // toggle todos os others
            for (let i = 0; i < others.length; i++)
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
            for (let i = 0; i < others.length; i++)
                if( others[i] != null )
                    this.add(others[i]);
        }

        this.unlockChangeEvent();
    }

    public set(...others: Selectable[]): void
    {
        this.lockChangeEvent();

        // remove others
        for (let i = this.selectables.length; i >=0 ; i--) {
            let index = others.indexOf(this.selectables[i]);
            if ( index === -1 ) this.remove(this.selectables[i]);
        }

        // add news
        for (let i = 0; i < others.length; i++)
            if (others[i] != null)
                this.insert(others[i], i);

        this.unlockChangeEvent();
    }

    public toggle(obj: Selectable, clearSelection: boolean = false): void
    {
        let index: number = this.selectables.indexOf(obj);
        if (index === -1)
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

    public insert(obj: Selectable, i:number): void
    {
        let index: number = this.selectables.indexOf(obj);
        if (index === -1 && this.filter(obj))
        {
            this.onAddHandler(obj);
            this.selectables.splice(Math.min(i, this.selectables.length), 0, obj);

            this.dispatchChange();
        }
    }

    public add(obj: Selectable): void
    {
        let index: number = this.selectables.indexOf(obj);
        if (index === -1 && this.filter(obj) )
        {
            this.onAddHandler(obj);
            this.selectables.push(obj);

            this.dispatchChange();
        }

    }

    public remove(obj: Selectable): void
    {
        let index: number = this.selectables.indexOf(obj);
        if (index !== -1)
        {
            this.onRemoveHandler(obj);
            this.selectables.splice(index, 1);

            this.dispatchChange();
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
        if( this.selectables.length === 0 ) return;

        for (let i: number = 0; i < this.selectables.length; i++)
            this.onRemoveHandler( this.selectables[i] );
        this.selectables = [];

        this.dispatchChange();
    }

    private lockChangeEvent():void
    {
        this.dispatchChange = this._dispatchAmount;
        this.changeAmount = 0;
    }

    private unlockChangeEvent():void
    {
        this.dispatchChange = this._dispatchImmediate;
        if( this.changeAmount > 0 ) this._dispatchImmediate();
        this.changeAmount = 0;
    }

    private _dispatchAmount()
    {
        this.changeAmount++;
    }

    private _dispatchImmediate()
    {
        this.onChange.trigger(this.selectables);
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
    SHIFT, // toggle
}

export class SelectionDragger extends RectView
{

    private selection:Selection;
    private mode:DRAGGER_MODE;
    private root: Display;
    private hoverMark:RectView;
    private isDragging:boolean;

    // events bind
    private mouseDownBind:any;
    private mouseMoveBind:any;
    private mouseUpBind:any;
    private hoverChangeBind:any;

    // update hover whe mouseup in document, fix when elements is transformed.
    private waitHoverFindBinder:any;
    private validateMouseUpHoverBinder:any;
    private waitHoverTimeout:number;

    constructor(root:Display, selection:Selection)
    {
        super("w-select-area");

        // cache
        this.root = root;            // busca inicializada a partir da raiz
        this.selection = selection;  // a instancia de selecao que sera alterada

        // hide this
        this.hide();
        this.isDragging = false;

        // create hover
        this.hoverMark = new RectView("w-select-hover");
        this.hoverMark.hide();

        // cache events bind
        this.mouseDownBind = this.mousedown.bind(this);
        this.mouseMoveBind = this.mousemove.bind(this);
        this.mouseUpBind = this.mouseup.bind(this);
        this.hoverChangeBind = this.hoverChangeHandler.bind(this);
        this.waitHoverFindBinder = this.waitHoverFind.bind(this);
        this.validateMouseUpHoverBinder = this.validateMouseUpHover.bind(this);

        // auto enable
        this.enable();
    }

    public enable()
    {
        if( this.html.parentNode !== null ) return;

        this.add();

        this.selection.hover.onChange.on(this.hoverChangeBind);
        window.addEventListener("mousedown", this.mouseDownBind);
        window.addEventListener("mousemove", this.mouseMoveBind);
        // fix***** edition in current hover
        window.addEventListener("mouseup", this.waitHoverFindBinder);
    }

    public disable()
    {
        if( this.html.parentNode === null ) return;

        this.hoverMark.hide();
        this.hide();
        this.remove();

        this.selection.hover.onChange.off(this.hoverChangeBind);
        window.removeEventListener("mouseup", this.mouseUpBind);
        window.removeEventListener("mousedown", this.mouseDownBind);
        window.removeEventListener("mousemove", this.mouseMoveBind);
        // fix***** edition in current hover
        window.removeEventListener("mouseup", this.waitHoverFindBinder);
    }

    public add()
    {
        document.body.appendChild(this.hoverMark.html);
        document.body.appendChild(this.html);
    }

    public remove()
    {
        document.body.removeChild(this.hoverMark.html);
        document.body.removeChild(this.html);
    }

    private waitHoverFind(event:MouseEvent):void
    {
        clearTimeout(this.waitHoverTimeout);
        this.waitHoverTimeout = setTimeout(this.validateMouseUpHoverBinder, 100, event);
    }

    private validateMouseUpHover(event:MouseEvent):void
    {
        this.mousemove(event);
        this.redrawHover();
    }

    private redrawHover():void
    {
        if ( this.selection.hover.count() > 0 )
        {
            let rect: Rect = this.selection.hover.getRectArea();
            this.hoverMark.set(rect.x, rect.y, rect.w, rect.h);
            this.hoverMark.show();
        }
        else
        {
            this.hoverMark.hide();
        }
    }

    private hoverChangeHandler(selectable:Selectable[]):void
    {
        this.redrawHover();
    }

    private selectableFilter( element:Selectable ):boolean
    {
        return element instanceof Selectable && element.isEnable();
    }

    private mousedown(event: MouseEvent): void
    {
        if ( this.IsEditor(event.target as HTMLElement) ) return;
        event.preventDefault();
        this.isDragging = true;

        this.show();
        this.start(event.pageX, event.pageY);

        if( event.ctrlKey || event.metaKey )
        {
            this.mode = DRAGGER_MODE.CTRL;
        }
        else if( event.shiftKey )
        {
            this.mode = DRAGGER_MODE.SHIFT;
            this.selection.select.cache();
        }
        else
        {
            this.mode = DRAGGER_MODE.NONE;
        }

        //this.hoverMark.hide();
        this.selection.hover.clear();

        window.addEventListener("mouseup", this.mouseUpBind);
    }

    private mousemove(event: MouseEvent): void
    {
        if( event.buttons === 1 )
        {
            if( this.isDragging )
            {
                event.preventDefault();

                this.end(event.pageX, event.pageY);
                this.updateSelection(...this.root.findByArea(this.rect, this.selectableFilter) as Selectable[]);
            }
        }
        // else
        // {
            // let elem: HTMLElement = event.target as HTMLElement;
            // if ( !this.IsUI(elem) ) this.updateHover(event.pageX, event.pageY);
            // else this.hoverMark.hide();
            // console.log(this.IsUI(elem));
        // }
        let elem: HTMLElement = event.target as HTMLElement;

        if( this.IsToolbar(elem) ) return;

        if ( !this.IsUI(elem) ) this.updateHover(event.pageX, event.pageY);
        else this.selection.hover.clear();
    }

    private mouseup(event: MouseEvent): void
    {
        event.preventDefault();
        this.isDragging = false;

        this.updateSelection(...this.root.findByArea(this.rect, this.selectableFilter) as Selectable[]);

        this.hide();
        window.removeEventListener("mouseup", this.mouseUpBind);
    }

    private updateHover(pointX:number, pointY:number):void
    {
        let hoverTarget:Selectable = this.root.findByPoint(pointX, pointY, this.selectableFilter) as Selectable;

        if ( hoverTarget )
        {
            // update select list
            this.selection.hover.set(hoverTarget);
            // update view
            // let rect: Rect = this.selection.hover.getRectArea();
            // this.hoverMark.set(rect.x, rect.y, rect.w, rect.h);
            // this.hoverMark.show();
        }
        else
        {
            // update select list
            this.selection.hover.clear();
            // update view
            // this.hoverMark.hide();
        }
    }

    private updateSelection( ...elements:Selectable[] )
    {
        switch (this.mode) {
            case DRAGGER_MODE.NONE:
                this.selection.select.set(...elements);
                break;
            case DRAGGER_MODE.CTRL:
                this.selection.select.combine(false, ...elements);
                break;
            case DRAGGER_MODE.SHIFT:
                this.selection.select.toggleCache(...elements);
                break;
        }
    }

    // janelas e gizmos
    private IsToolbar(elem: HTMLElement): boolean
    {
        /*
        let root:HTMLElement = elem;
        while( root != null )
        {
            if ( root.className.indexOf("w-ui-gizmos") !== -1 || root.className.indexOf("w-ui-editor") !== -1 ) return true;
            root = root.parentElement;
        }
        return false;
        */
        return this.findClassesInParent(elem, "w-ui-toolbar");
    }

    // janelas e gizmos
    private IsEditor( elem:HTMLElement ):boolean
    {
        /*
        let root:HTMLElement = elem;
        while( root != null )
        {
            if ( root.className.indexOf("w-ui-gizmos") !== -1 || root.className.indexOf("w-ui-editor") !== -1 ) return true;
            root = root.parentElement;
        }
        return false;
        */
        return this.findClassesInParent(elem, "w-ui-toolbar w-ui-editor w-ui-gizmos");
    }

    // janelas
    private IsUI( elem:HTMLElement ):boolean
    {
        // let root:HTMLElement = elem;
        // while( root != null )
        // {
        //     if ( root.className.indexOf("w-ui-editor") !== -1 ) return true;
        //     root = root.parentElement;
        // }
        // return false;
        return this.findClassesInParent(elem, "w-ui-editor");
    }

    private findClassesInParent(elem: HTMLElement, classesName: string): boolean
    {
        let root: HTMLElement = elem;
        let classes: string[] = classesName.split(' ');
        while (root != null)
        {
            let i: number = 0;
            for (; i < classes.length; i++)
                if (root.className.indexOf(classes[i]) !== -1) break;
            if (i < classes.length)
                return true;
            root = root.parentElement;
        }
        return false;
    }

}



// show selected area with anchors
export class SelectionTransform extends RectView
{
    private root:Display;
    private selection:Selection;

    // informations of drag
    private nextRect: Rect;
    private startDragRect:Rect;
    private layout:Layout;
    private layoutMark:RectView;
    private event:DragEvent;

    // delegate
    private updateDelegate:any;
    private dropDelegate:any;
    // event bind
    private selectChangeHandlerBinder:any;
    private keyHandlerBinder:any;
    private mousedownBinder:any;
    private mousemoveBinder:any;
    private mouseupBinder: any;
    private filterBinder:any;

    constructor(root:Display, selection:Selection)
    {
        super("w-select-transform", "w-ui-gizmos");

        // cache
        this.root = root;
        this.selection = selection;

        // informations about dragging
        this.event = new DragEvent();
        this.startDragRect = new Rect();
        this.nextRect = new Rect();
        this.nextRect.copy(this.rect);

        // anchors
        this.createAnchors();

        // layout
        this.layoutMark = new RectView("w-layout-hover");
        this.layoutMark.hide();

        // hide me
        this.hide();

        // binders
        this.selectChangeHandlerBinder = this.selectionChangeHandler.bind(this);
        this.keyHandlerBinder = this.onKeydownHandler.bind(this);
        this.mousedownBinder = this.mousedown.bind(this);
        this.mousemoveBinder = this.mousemove.bind(this);
        this.mouseupBinder = this.mouseup.bind(this);
        this.filterBinder = this.layoutFilter.bind(this);

        // enable
        this.enable();

        this.html.style.pointerEvents = "auto";
    }

    public enable():void
    {
        if( this.html.parentNode !== null ) return;

        // events
        this.selection.select.onChange.on(this.selectChangeHandlerBinder);
        document.addEventListener("keydown",  this.keyHandlerBinder);
        document.addEventListener("keyup",  this.keyHandlerBinder);
        this.html.addEventListener("mousedown", this.mousedownBinder);

        this.add();
    }

    public disable():void
    {
        if( this.html.parentNode === null ) return;

        // events
        this.selection.select.onChange.off(this.selectChangeHandlerBinder);
        document.removeEventListener("keydown",  this.keyHandlerBinder);
        document.removeEventListener("keyup",  this.keyHandlerBinder);
        this.html.removeEventListener("mousedown", this.mousedownBinder);

        this.remove();
    }

    public add():void
    {
        document.body.appendChild(this.html);
        document.body.appendChild(this.layoutMark.html);
    }

    public remove():void
    {
        document.body.removeChild(this.html);
        document.body.removeChild(this.layoutMark.html);
    }

    public redraw(): void
    {
        let rect: Rect = this.selection.select.getRectArea();
        this.set(rect.x, rect.y, rect.w, rect.h);
        this.ghostRedraw();
    }

    private ghostRedraw()
    {
        // let isDraggable:boolean = false;

        for (let i: number = 0; i < this.event.ghost.length; i++)
        {
            this.event.ghost[i].rect.copyClientRect(this.event.startRect[i]);
            this.event.ghost[i].draw();

            // if( this._event.elements[i].allowDrag() ) isDraggable = true;
        }

        // this.setData('drag', isDraggable ? 'true' : 'false');
    }

    private ghostFollow():void
    {
        let deltaX: number = this.event.pointer.x - this.event.startPointer.x;
        let deltaY: number = this.event.pointer.y - this.event.startPointer.y;

        for (let i = 0; i < this.event.elements.length; i++)
            this.event.ghost[i].move(this.event.startRect[i].x + deltaX, this.event.startRect[i].y +deltaY);
    }

    private onKeydownHandler(event:KeyboardEvent):void
    {
        if( event.type === "keydown" && (event.metaKey || event.ctrlKey || event.shiftKey) )
            this.html.style.pointerEvents = "none";
        else if( event.type === "keyup" && !(event.metaKey || event.ctrlKey || event.shiftKey) )
            this.html.style.pointerEvents = "auto";
    }

    private selectionChangeHandler(e: Selectable[]): void
    {
        this.event.elements = [];
        for( let i:number = 0 ; i < e.length ; i++ )
            if( e[i].allowDrag() ) this.event.elements.push(e[i]);

        let diff: number = this.event.elements.length - this.event.ghost.length;

        // rect
        this.event.startRect = [];
        for( let i:number = 0 ; i < e.length ; i++ )
            this.event.startRect.push( e[i].getBounds() );

        // add ghosts
        for( let i:number = 0 ; i < diff ; i++ )
            this.event.ghost.push( Ghost.Get(e[i]) );

        // remove ghosts
        for( let i:number = 0 ; i > diff ; i-- )
            Ghost.Recycle( this.event.ghost.pop() );

        if( e.length > 0 )
            this.show();
        else
            this.hide();

        this.redraw();
    }

    public startDrag(display:Selectable, pageX:number, pageY:number, rect:Rect = null): void
    {
        this.selection.select.set(display);

        if( rect )
        {
            this.event.startRect[0].copy(rect);
            this.set(rect.x, rect.y, rect.w, rect.h);
            this.ghostRedraw();
        }

        this.prepareDrag(pageX, pageY);

        this.updateDelegate = this.updateMove;
        this.dropDelegate = this.dropMove;
        this.updateDelegate();

        window.addEventListener("mousemove", this.mousemoveBinder);
        window.addEventListener("mouseup", this.mouseupBinder);
    }

    private prepareDrag(pageX:number, pageY:number):void
    {
        this.startDragRect.copy(this.rect);
        this.event.pointer.x = this.event.startPointer.x = pageX;
        this.event.pointer.y = this.event.startPointer.y = pageY;
        this.event.offset.x = pageX - this.startDragRect.x;
        this.event.offset.y = pageY - this.startDragRect.y;
        this.nextRect.copy(this.rect);

        // add flag dragging in ghost
        for( let i:number = 0 ; i < this.event.ghost.length ; i++ )
            this.event.ghost[i].addClass("w-ghost-dragging");

        // disable mouse in this
        this.html.style.pointerEvents = "none";
        this.html.style.opacity = "0";
    }

    private mousedown(event:MouseEvent):void
    {
        event.preventDefault();
        event.stopPropagation();

        // cache start drag information
        // this.startDragRect.copy(this.rect);
        // this.event.pointer.x = this.event.startPointer.x = event.pageX;
        // this.event.pointer.y = this.event.startPointer.y = event.pageY;
        // this.event.offset.x = event.pageX - this.startDragRect.x;
        // this.event.offset.y = event.pageY - this.startDragRect.y;
        // this.nextRect.copy(this.rect);

        // // layout manager
        // // this.updateLayout();

        // // add flag dragging in ghost
        // for( let i:number = 0 ; i < this.event.ghost.length ; i++ )
        //     this.event.ghost[i].addClass("w-ghost-dragging");

        // // disable mouse in this
        // this.html.style.pointerEvents = "none";
        // this.html.style.opacity = "0";

        this.prepareDrag(event.pageX, event.pageY);

        // handle events
        let target: HTMLElement = event.target as HTMLElement;
        let className: string = target.className;
        if( className.indexOf("anchor") !== -1 )
        {
            this.updateDelegate = this.updateAnchor;
            this.dropDelegate = this.dropAnchor;

            if ( className.indexOf("-l ") !== -1 )
                this.nextRect.start(this.rect.right, this.rect.top);
            else if ( className.indexOf("-r ") !== -1  )
                this.nextRect.start(this.rect.left, this.rect.top);
        }
        else
        {
            this.updateDelegate = this.updateMove;
            this.dropDelegate = this.dropMove;
        }

        this.updateDelegate(event);

        window.addEventListener("mousemove", this.mousemoveBinder);
        window.addEventListener("mouseup", this.mouseupBinder);
    }

    private mousemove(event: MouseEvent): void
    {
        event.preventDefault();

        // update events
        this.event.pointer.x = event.pageX;
        this.event.pointer.y = event.pageY;

        // update manager (move, anchor)
        this.updateDelegate(event);

        // disable drag
        if (event.which !== 1) this.mouseup(event);
    }

    private mouseup(event: MouseEvent): void
    {
        event.preventDefault();

        // drop manager (move, anchor)
        this.dropDelegate();

        // remove flag dragging in ghost
        for( let i:number = 0 ; i < this.event.ghost.length ; i++ )
            this.event.ghost[i].removeClass("w-ghost-dragging");

        // layout manager
        this.layout = null;

        // enable mouse in this
        this.html.style.pointerEvents = "auto";
        this.html.style.opacity = "1";

        // draw current rect
        this.redraw();

        // remove handle events
        window.removeEventListener("mousemove", this.mousemoveBinder);
        window.removeEventListener("mouseup", this.mouseupBinder);
    }

    private updateMove(event:MouseEvent=null):void
    {
        if (this.event.elements.length === 0) return;

        // new layout
        let newLayout: Layout =
            !event || this.isEditor(event.target as HTMLElement) ? null :
            this.root.findByPoint(this.event.pointer.x, this.event.pointer.y, this.filterBinder) as Layout;

        if (newLayout !== this.layout)
        {
            if (this.layout) this.layout.exitDrag(this.event);
            if (newLayout) newLayout.enterDrag(this.event);
            else this.ghostRedraw();
        }
        this.layout = newLayout;

        // update layout
        if ( this.layout )
        {
            this.layout.updateDrag(this.event);
            let rect: Rect = this.layout.getBounds();
            this.layoutMark.set(rect.x, rect.y, rect.w, rect.h);
            this.layoutMark.show();
        }
        else
        {
            this.ghostFollow();
            this.layoutMark.hide();
        }
    }

    private dropMove():void
    {
        if (this.layout != null) this.layout.dropDrag(this.event);
        this.layoutMark.hide();

        let amountEmpty:number = 0;
        for( let i:number = 0 ; i < this.event.elements.length ; i++ )
            if( this.event.elements[i].parent == null )
                this.selection.select.remove(this.event.elements[i]);
    }

    private updateAnchor(event:MouseEvent=null):void
    {
        this.nextRect.end(this.event.pointer.x, this.rect.y + this.rect.h);
        let change: RectChange = this.rect.getChangeByRect(this.nextRect);

        for( let i:number = 0 ; i < this.event.ghost.length ; i++ )
        {
            let layout:Layout = Layout.findLayoutByDisplay(this.event.elements[i]);
            layout.simulateResizeChild(this.event, i, change);
        }
    }

    private dropAnchor():void
    {
        this.nextRect.end(this.event.pointer.x, this.rect.y + this.rect.h);
        let change: RectChange = this.rect.getChangeByRect(this.nextRect);

        for( let i:number = 0 ; i < this.event.elements.length ; i++ )
        {
            let layout:Layout = Layout.findLayoutByDisplay(this.event.elements[i]);
            layout.resizeChild(this.event, i, change);
        }
    }

    private isEditor(target:HTMLElement):boolean
    {
        let element:HTMLElement = target;
        let amount:number = 0;
        while( element != null && amount++ < 5 )
        {
            if( element.className.indexOf("w-ui-editor") !== -1 ) return true;
            element = element.parentElement;
        }

        return false;
    }

    private layoutFilter(element: Display): boolean
    {
        if( !(element instanceof Layout) ) return false;

        for( let i:number = 0 ; i < this.event.elements.length ; i++ )
            if( this.event.elements[i].isRecursiveChild(element) ) return false;

        return true;
    }

    private createAnchors()
    {
        this.addChild(new Display("div", "anchor", "a-r"));
        this.addChild(new Display("div", "anchor", "a-l"));
    }

    // public hasMovementHorizontal: boolean;
    // public hasMovementVertical: boolean;
    // public isAnchor: boolean;
    // public isDown: boolean;
    // public isMinusHorizontal: boolean;
    // public isMinusVertical: boolean;

    // private nextRect:Rect;
    // private startDragRect:Rect;
    // private _event:DragEvent;
    // private _layout:Layout;
    // private _selection:Selection;
    // private _enableAnchors:boolean;
    // private layoutMark:RectView;
    // private root:Display;

    // constructor(root:Display, selection:Selection)
    // {
    //     super("w-select-transform", "editor-gizmo");

    //     this.root = root;
    //     this._selection = selection;

    //     // anchors
    //     this.addChild(new Display("div", "anchor", "a-u"));
    //     this.addChild(new Display("div", "anchor", "a-r"));
    //     this.addChild(new Display("div", "anchor", "a-d"));
    //     this.addChild(new Display("div", "anchor", "a-l"));
    //     this.addChild(new Display("div", "anchor", "a-ul"));
    //     this.addChild(new Display("div", "anchor", "a-ur"));
    //     this.addChild(new Display("div", "anchor", "a-dl"));
    //     this.addChild(new Display("div", "anchor", "a-dr"));

    //     // rect
    //     //this.set(200, 200, 200, 250);
    //     this.hide();
    //     this.nextRect = new Rect();
    //     this.nextRect.copy(this.rect);

    //     // cache data
    //     this._event = new DragEvent();
    //     this.startDragRect = new Rect();

    //     // layout mark
    //     this.layoutMark = new RectView("layout-hover");
    //     this.layoutMark.hide();

    //     // start in disable
    //     this.disableAnchors();

    //     // events
    //     let self = this;
    //     this.html.addEventListener( "mousedown", (event: MouseEvent) => self.mousedown(event) );
    //     window.addEventListener( "mousemove", (event: MouseEvent) => self.mousemove(event) );
    //     window.addEventListener( "mouseup", (event: MouseEvent) => self.onmouseup(event) );
    //     document.addEventListener("keydown",  this.onKeydownHandler.bind(this));
    //     document.addEventListener("keyup",  this.onKeydownHandler.bind(this));

    //     this._selection.select.onChange.on((e: Selectable[]) => self.selectionChangeHandler(e));

    //     document.body.appendChild(this.layoutMark.html);
    //     document.body.appendChild(this.html);

    //     this.html.style.pointerEvents = "auto";
    // }

    // private onKeydownHandler(event:KeyboardEvent):void
    // {
    //     if( event.type === "keydown" && (event.metaKey || event.ctrlKey || event.shiftKey) )
    //     {
    //         this.html.style.pointerEvents = "none";
    //     }
    //     else if( event.type === "keyup" && !(event.metaKey || event.ctrlKey || event.shiftKey) )
    //     {
    //         this.html.style.pointerEvents = "auto";
    //     }
    // }

    // private selectionChangeHandler(e: Selectable[]): void
    // {
    //     this._event.elements = [];
    //     for( let i:number = 0 ; i < e.length ; i++ )
    //         if( e[i].allowDrag() ) this._event.elements.push(e[i]);

    //     let diff: number = this._event.elements.length - this._event.ghost.length;

    //     // rect
    //     this._event.startRect = [];
    //     for( let i:number = 0 ; i < e.length ; i++ )
    //         this._event.startRect.push( e[i].getBounds() );

    //     // add ghosts
    //     for( let i:number = 0 ; i < diff ; i++ )
    //         this._event.ghost.push( Ghost.Get(e[i], false) );

    //     // remove ghosts
    //     for( let i:number = 0 ; i > diff ; i-- )
    //         Ghost.Recycle( this._event.ghost.pop() );

    //     if( e.length > 0 )
    //         this.show();
    //     else
    //         this.hide();

    //     this.redraw();
    // }

    // private redraw():void
    // {
    //     let rect: Rect = this._selection.select.getRectArea();
    //     this.set(rect.x, rect.y, rect.w, rect.h);

    //     let isDraggable:boolean = false;

    //     for( let i:number = 0 ; i < this._event.ghost.length ; i++ )
    //     {
    //         this._event.ghost[i].rect.copyClientRect( this._event.elements[i].getBounds() );
    //         this._event.ghost[i].draw();

    //         if( this._event.elements[i].allowDrag() ) isDraggable = true;
    //     }

    //     this.setData('drag', isDraggable ? 'true' : 'false');
    // }

    // public get layout():Layout
    // {
    //     return this._layout;
    // }

    // public remove()
    // {
    //     this.html.parentElement.removeChild(this.html);
    //     for (let i: number = this._event.ghost.length-1; i >= 0; i--)
    //         Ghost.Recycle(this._event.ghost.pop());
    // }

    // public enableAnchors():void
    // {
    //     this._enableAnchors = true;
    //     this.removeClass("anchor-disable");
    // }

    // public disableAnchors():void
    // {
    //     this._enableAnchors = false;
    //     this.addClass("anchor-disable");
    // }

    // private layoutFilter( element:Display ):boolean
    // {
    //     return element instanceof Layout;
    // }

    // public mousedown(event: MouseEvent): void
    // {
    //     if( !this.isShow() || event.ctrlKey || event.shiftKey || event.metaKey ) return;

    //     event.preventDefault();
    //     event.stopPropagation();
    //     this.isDown = true;

    //     let target: HTMLElement = event.target as HTMLElement;
    //     let className: string = target.className;

    //     this.isAnchor = this._enableAnchors && target && className.indexOf("anchor") !== -1;

    //     // cache start drag information
    //     this.startDragRect.copy(this.rect);
    //     this._event.pointer.x = this._event.startPointer.x = event.pageX;
    //     this._event.pointer.y = this._event.startPointer.y = event.pageY;
    //     this._event.offset.x = event.pageX - this.startDragRect.x;
    //     this._event.offset.x = event.pageY - this.startDragRect.y;

    //     if( this.isAnchor )
    //     {
    //         this.hasMovementVertical = className.indexOf("-l ") === -1 && className.indexOf("-r ") === -1;
    //         this.hasMovementHorizontal = className.indexOf("-u ") === -1 && className.indexOf("-d ") === -1;
    //         this.isMinusHorizontal = this.hasMovementHorizontal && (className.indexOf("-l ") !== -1 || className.indexOf("l ") !== -1);
    //         this.isMinusVertical = this.hasMovementVertical && (className.indexOf("-u") !== -1);

    //         let startX: number = this.rect.x;
    //         let endX: number = startX;
    //         let startY: number = this.rect.y;
    //         let endY: number = startY;

    //         if( this.isMinusHorizontal )
    //             startX += this.rect.w;
    //         else
    //             endX += this.rect.w;

    //         if( this.isMinusVertical )
    //             startY += this.rect.h;
    //         else
    //             endY += this.rect.h;

    //         this.nextRect.start(startX, startY);
    //         this.nextRect.end(endX, endY);
    //         this.rect.copy(this.nextRect);
    //     }
    //     else
    //     {
    //         this.nextRect.copy(this.rect);
    //     }

    //     // layout manager
    //     this._layout = this._event.elements.length === 0 ?
    //         null :
    //         this.root.findByPoint(event.pageX, event.pageY, this.layoutFilter) as Layout;
    //     // if (this._layout) this._layout.enterDrag(this._event);

    //     // disable mouse in this
    //     this.html.style.pointerEvents = "none";
    //     this.html.style.opacity = "0";
    // }

    // public mousemove(event: MouseEvent): void
    // {
    //     if ( !this.isDown ) return;

    //     event.preventDefault();

    //     this._event.pointer.x = event.pageX;
    //     this._event.pointer.y = event.pageY;

    //     this.update(event);

    //     // layout manager
    //     if( this._event.elements.length > 0 )
    //     {
    //         let newLayout:Layout = this.root.findByPoint(event.pageX, event.pageY, this.layoutFilter) as Layout;
    //         if( newLayout !== this._layout )
    //         {
    //             // if (this._layout) this._layout.exitDrag(this._event);
    //             // if (newLayout) newLayout.enterDrag(this._event);
    //         }
    //         this._layout = newLayout;
    //         if (this._layout)
    //         {
    //             // this._layout.updateDrag(this._event);
    //             let rect:Rect = this._layout.getBounds();
    //             this.layoutMark.set(rect.x, rect.y, rect.w, rect.h);
    //             this.layoutMark.show();
    //         }
    //         else
    //         {
    //             this.layoutMark.hide();
    //         }
    //     }

    //     // disable drag
    //     if (event.which !== 1) this.onmouseup(event);
    // }

    // public onmouseup(event: MouseEvent): void
    // {
    //     if ( !this.isDown ) return;

    //     event.preventDefault();
    //     this.isDown = false;

    //     this._event.pointer.x = event.pageX;
    //     this._event.pointer.y = event.pageY;

    //     this.update(event);

    //     // layout manager
    //     // if (this._layout != null) this._layout.dropDrag(this._event);
    //     this.layoutMark.hide();

    //     // enable mouse in this
    //     this.html.style.pointerEvents = "auto";
    //     this.html.style.opacity = "1";

    //     this.redraw();
    // }

    // private update(event:MouseEvent): RectChange
    // {
    //     if (this.isAnchor)
    //     {
    //         this.nextRect.end(
    //             this.hasMovementHorizontal ? event.pageX : this.rect.x + this.rect.w,
    //             this.hasMovementVertical ? event.pageY : this.rect.y + this.rect.h);
    //     }
    //     else
    //     {
    //         this.nextRect.move(
    //             this.nextRect.x + event.movementX,
    //             this.nextRect.y + event.movementY);
    //     }

    //     let change: RectChange = this.rect.getChangeByRect(this.nextRect);
    //     this.rect.copy(this.nextRect);
    //     this.draw();

    //     return change;
    // }
}





export class Ghost extends RectView
{
    private static pool:Ghost[] = [];

    public static Get(target:Display, show:boolean = true): Ghost
    {
        let ghost: Ghost;
        if( Ghost.pool.length <= 0 )
        {
            ghost = new Ghost();
            document.body.appendChild(ghost.html);
        }
        else
        {
            ghost = Ghost.pool.pop();
        }
        ghost.rect.copyClientRect(target.getBounds());
        if( show ) ghost.show();
        return ghost;
    }

    public static Recycle(ghost:Ghost):void
    {
        ghost.hide();
        Ghost.pool.push(ghost);
    }

    constructor(...classesName:string[])
    {
        super(...classesName, "w-ghost");

        this.html.style.display = "none";
    }

    public show()
    {
        this.html.style.display = "block";
        super.show();
    }

    public allowed( ok:boolean ):void
    {
        if (ok)
            this.removeClass("unallowed");
        else
            this.addClass("unallowed");
    }

    public hide()
    {
        this.html.style.display = "none";
        this.rect.size(0, 0);
        super.hide();
    }
}





// show selected area with anchors
interface ToolbarEvent
{
    name:string;
    target:Selectable;
}

export class HoverToolbar extends RectView
{
    public readonly onSelect = new LiteEvent<ToolbarEvent>();

    private selection:Selection;
    private target:Selectable;
    // private textEditor:Window;
    // private imgEditor:Window;
    // private movieEditor:Window;

    private options:Display;
    private delete:Display;
    private edit:Display;

    private waitRedrawTimeout:number;
    private redrawBinder:any;

    constructor(selection:Selection)
    {
        super("w-ui-toolbar");

        // cache
        this.selection = selection;

        this.selection.hover.onChange.on( this.hoverChangeHandler.bind(this) );

        document.body.appendChild(this.html);

        //this.size(22, 22);
        this.hide();

        this.html.style.cursor = "pointer";
        this.html.style.pointerEvents = "auto";

        // let w = new UI.UIWindow();
        // w.setWidgetText("title", "Editor de Texto");
        // w.addWidget("list", new UI.UITemplate(this.selectionTransform));
        // document.body.appendChild(w.html);

        this.options = new Display("div", "w-ui-toolbar-wrapper");
        this.edit = new Display("div", "edit");
        this.delete = new Display("div", "delete");

        this.edit.setData("toolbar-type", "edit");
        this.delete.setData("toolbar-type", "delete");

        this.options.addChild(this.edit);
        this.options.addChild(this.delete);
        this.addChild(this.options);

        //this.html.addEventListener("mousedown", this.mousedown.bind(this));
        this.edit.html.addEventListener("mousedown", this.mousedown.bind(this));
        this.delete.html.addEventListener("mousedown", this.mousedown.bind(this));

        // FIX**** pode ter ocorrido alguma alteracao no objeto in focus
        this.redrawBinder = this.redraw.bind(this);
        window.addEventListener("mouseup", this.waitRedraw.bind(this));
    }

    private mousedown(event:MouseEvent):void
    {
        if( event.target instanceof HTMLInputElement ) return;

        let buttonType:string = (event.currentTarget as HTMLElement).getAttribute("data-toolbar-type");
        this.onSelect.trigger({name:buttonType, target:this.target});
    }

    private tempInputFile:InputImage = new InputImage();

    private hoverChangeHandler( data:Selectable[] ):void
    {
        this.target = data.length > 0 ? data[0] : null;

        this.tempInputFile.input.remove();

        if( data.length > 0 && (data[0] as Widget).templateName === "img" )
        {
            if( this.tempInputFile.isUsed )
                this.tempInputFile = new InputImage();

            this.tempInputFile.widget = data[0] as Widget;
            this.edit.html.appendChild(this.tempInputFile.input);
        }

        // if( data.length > 0 )
        // {
        //     this.target = data[0];
        //     let bounds:Rect = this.target.getBounds();
        //     //this.move(bounds.x + bounds.w - 26, bounds.y + 3);
        //     this.move(bounds.x, bounds.y);
        //     this.size(bounds.w, 22);
        //     this.show();
        // }
        // else
        // {
        //     this.hide();
        // }

        this.redraw();
    }

    private waitRedraw():void
    {
        clearTimeout(this.waitRedrawTimeout);
        this.waitRedrawTimeout = setTimeout(this.redrawBinder, 100);
    }

    private redraw():void
    {
        if( this.target )
        {
            let bounds:Rect = this.target.getBounds();
            this.move(bounds.x, bounds.y);
            this.size(bounds.w, 22);
            this.show();
        }
        else
        {
            this.hide();
        }
    }




    // private createInputFile():void
    // {
    //     this.tempInputFile = document.createElement("input");
    //     this.tempInputFile.setAttribute("type", "file");
    //     this.tempInputFile.setAttribute("name", "image");
    //     this.tempInputFile.setAttribute("accept", "image/*");
    //     this.tempInputFile.setAttribute("data-type-type", "edit");
    //     this.tempInputFile.addEventListener("mousedown", (event:Event)=>event.preventDefault);
    //     this.tempInputFile.addEventListener("change", this.inputChangeHandler.bind(this));
    // }

    // private inputChangeHandler(event:Event):void
    // {
    //     event.preventDefault();
    // }


}


class InputImage
{
    public widget:Widget;
    public input:HTMLInputElement;
    public isUsed:boolean = false;

    constructor()
    {
        this.input = document.createElement("input");
        this.input.setAttribute("type", "file");
        this.input.setAttribute("name", "image");
        this.input.setAttribute("accept", "image/*");
        this.input.addEventListener("change", this.inputChangeHandler.bind(this));
    }

    private inputChangeHandler(event:Event):void
    {
        event.preventDefault();
        
        if( this.input.files.length > 0 )
        {
            let file:FileReader = new FileReader();
            file.onload = this.fileReaderLoadComplete.bind(this);
            file.onerror = this.fileReaderLoadError.bind(this);
            file.readAsDataURL(this.input.files[0]);
            this.isUsed = true;
        }
    }

    private fileReaderLoadComplete(event:ProgressEvent):void
    {
        let result = (event.currentTarget as FileReader).result;
        this.widget.setWidgetAttrib("img", result);
    }

    private fileReaderLoadError(event:ErrorEvent): void
    {
        alert("Não foi possível carregar a imagem. Tente novamente.")
    }
}

