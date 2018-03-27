


export class Describer
{
    public static getName(inputClass: any): string
    {
        let funcNameRegex = /function (.{1,})\(/;
        let results = (funcNameRegex).exec((<any>inputClass).constructor.toString());
        return (results && results.length > 1) ? results[1] : "";
    }
}

export class Vec2
{
    public x: number;
    public y: number;
}

export interface RectChange
{
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export class Rect
{
    public x: number = 0;
    public y: number = 0;
    public w: number = 0;
    public h: number = 0;

    private startX: number = 0;
    private startY: number = 0;

    constructor(x: number = 0, y: number = 0, w: number = 0, h: number = 0)
    {
        this.move(x, y);
        this.size(w, h);
    }

    public set width(value: number) { this.w = value; }
    public get width(): number { return this.w; }

    public set height(value: number) { this.h = value; }
    public get height(): number { return this.h; }

    public set left(value: number) { this.x = value; }
    public get left(): number { return this.x; }

    public set top(value: number) { this.y = value; }
    public get top(): number { return this.y; }

    public set right(value: number) { this.w = value - this.x; }
    public get right(): number { return this.x + this.w; }

    public set bottom(value: number) { this.h = value - this.y; }
    public get bottom(): number { return this.y + this.h; }

    public overlapClientRect(rect: Rect): boolean
    {
        let innerH: boolean =
            (this.x <= rect.right && this.x + this.w >= rect.left);

        let innerV: boolean =
            (this.y <= rect.bottom && this.y + this.h >= rect.top);

        return innerH && innerV;
    }

    public containsPoint( x:number, y:number )
    {
        return this.x <= x && this.y <= y && this.right >= x && this.bottom >= y;
    }

    public containsClientRect(clientRect: Rect): boolean
    {
        return (this.x <= clientRect.left && this.y <= clientRect.top &&
            this.x + this.w >= clientRect.right && this.y + this.h >= clientRect.bottom);
    }

    public copy(rect: Rect): void
    {
        this.startX = this.x = rect.x;
        this.startY = this.y = rect.y;
        this.w = rect.w;
        this.h = rect.h;
    }

    public copyAndChange(rect: Rect, change:RectChange): void
    {
        this.startX = this.x = rect.x + change.left;
        this.startY = this.y = rect.y;
        this.w = rect.w + change.right - change.left;
        this.h = rect.h;
    }

    public getChangeByRect(rect: Rect): RectChange
    {
        return {
            top: rect.y - this.y,
            left: rect.x - this.x,
            right: (rect.x + rect.w) - (this.x + this.w),
            bottom: (rect.y + rect.h) - (this.y + this.h),
        };
    }

    public copyClientRect(clientRect: ClientRect): void
    {
        this.x = clientRect.left;
        this.y = clientRect.top;
        this.w = clientRect.width;
        this.h = clientRect.height;
    }

    public size(w: number, h: number)
    {
        this.w = w;
        this.h = h;
    }

    public move(x: number, y: number)
    {
        this.startX = this.x = x;
        this.startY = this.y = y;
    }

    public start(x: number, y: number)
    {
        this.startX = this.x = x;
        this.startY = this.y = y;
        this.w = 0;
        this.h = 0;
    }

    public end(x: number, y: number)
    {
        if (x < this.startX) // move left
        {
            this.x = x;
            this.w = this.startX - this.x;
        }
        else // move right
        {
            this.x = this.startX;
            this.w = x - this.startX;
        }

        if (y < this.startY) // move left
        {
            this.y = y;
            this.h = this.startY - this.y;
        }
        else // move right
        {
            this.y = this.startY;
            this.h = y - this.startY;
        }
    }
}
