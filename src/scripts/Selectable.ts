import { Display } from "./Display";

export class Selectable extends Display
{
    private _isOver: boolean = false;
    private _isFocus: boolean = false;
    // private _isDragging: boolean = false;

    constructor(tagName: string = "div", ...classesName: string[])
    {
        super(tagName, "selectable", ...classesName);
    }

    public isDraggable():boolean
    {
        return this.getData("drag") !== "false";
    }

    public isEnable():boolean
    {
        return this.getData("enable") !== "false";
    }

    public setDraggable(isDrag:boolean = true):void
    {
        this.setData("drag", isDrag ? "true" : "false");
    }

    public setEnable(isEnable:boolean=true):void
    {
        this.setData("enable", isEnable ? "true" : "false");
    }

    public over(event:any/*event: DragEvent*/): void
    {
        this._isOver = true;
        this.addClass("hover");
    }

    public out(event: any/*event: DragEvent*/): void
    {
        this._isOver = false;
        this.removeClass("hover");
    }

    public focus(event: any/*event: DragEvent*/): void
    {
        this._isFocus = true;
        this.addClass("selected");
    }

    public unfocus(event: any/*event: DragEvent*/): void
    {
        this._isFocus = false;
        this.removeClass("selected");
    }

    // public startdrag(event: SelectEvent)
    // {
    //     this._isDragging = true;
    //     this.addClass("dragging");
    // }

    public allowDrag(): boolean
    {
        return true;
        // let dragData: any = this.getData("drag");
        // return typeof (dragData) === "object" || dragData === "true";
    }

    // public allowDrop(layout: Layout): boolean
    // {
    //     return true;
    // }
}
