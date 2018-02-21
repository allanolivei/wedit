import { Rect, Describer } from "./Utils";
import { SheetRules } from "./Sheet";


export class Display
{
    public static findByPointInChildren(x: number, y: number, element: Display, filter: (p: Display) => boolean = null): Display
    {
        for (let i = 0; i < element.children.length; i++)
        {
            let result: Display = Display.findByPointInChildren(x, y, element.children[i], filter);
            if (result != null) { return result; }
        }

        let domRect = element.getBounds();

        if ((!filter || filter(element)) &&
            x >= domRect.left && y >= domRect.top &&
            x <= domRect.right && y <= domRect.bottom)
        {
            return element;
        }

        return null;
    }

    public static findByAreaInChildren(rect: Rect, element: Display, list: Display[], filter: (p: Display) => boolean = null): number
    {
        let domRect = element.getBounds();

        let amount: number = 0;
        for (let i: number = 0; i < element.children.length; i++)
        {
            amount += Display.findByAreaInChildren(rect, element.children[i], list, filter);
        }

        if (amount === 0 && (!filter || filter(element)) && rect.overlapClientRect(domRect))
        {
            list.push(element);
            return 1;
        }
        return amount;
    }

    // utilizado para gerar um id unico
    public static lastIDCount:number = 0;


    public html: HTMLElement;
    public parent: Display;
    public children: Display[] = [];
    public sheetRules:{[media:string]:SheetRules} = {};
    public autoremove:boolean = false;

    protected classesName: string[];
    protected rect: Rect;

    private _id?:string;

    constructor(tagName: any = "div", ...classesName: string[])
    {
        this.rect = new Rect();
        this.classesName = classesName;
        this.classesName.push("display");

        if (typeof tagName === "string")
        {
            if (tagName === "undefined")
            { // element nao sera gerado, utilizado em casos especiais
                return;
            }
            else
            {
                this.html = document.createElement(tagName);
            }
        }
        else if (tagName instanceof HTMLElement)
        {
            this.html = tagName;
        }
        else
        {
            throw "DISPLAY ERROR:::the first attrib is not equal string or htmlelement";
        }

        this.html.className = this.classesName.join(' ');
    }

    get length(): number
    {
        return this.children.length;
    }

    get name(): string
    {
        return this.html.id;
    }

    set name(newName: string)
    {
        this.html.id = newName;
    }

    get content(): string
    {
        return this.html.innerHTML;
    }

    set content(value: string)
    {
        this.html.innerHTML = value;
    }

    set id(value:string)
    {
        this._id = value;
        this.html.setAttribute("id", value);
        for( let key in this.sheetRules )
            this.sheetRules[key].selector = value;
    }

    get id():string
    {
        return this._id;
    }

    public getTagName():string
    {
        return this.html.tagName;
    }

    public setTagName(tagName:string): void
    {
        if( this.getTagName() === tagName ) return;

        //console.log("change tagName: ", tagName);

        let newHtml = document.createElement(tagName);

        // attributes
        for (let i:number = 0; i < this.html.attributes.length; i++)
            newHtml.setAttribute(this.html.attributes[i].nodeName, this.html.attributes[i].nodeValue);

        // children
        for( let i:number = this.html.childNodes.length-1; i >= 0; i-- )
           newHtml.appendChild(this.html.childNodes[0]);

        this.html = newHtml;
    }

    public serializeStyle():string
    {
        let result:any = {};
        for( let key in this.sheetRules )
            result[key] = this.sheetRules[key].toLine();
        return result.toString();
    }

    public setStyles(values:string|{[n:string]:string}, media:string = "default"):void
    {
        this.getSheetRules(media).setRules(values);
    }

    public getStyles(media:string = "default"):{[n:string]:string}
    {
        return this.getSheetRules(media).getRules();
    }

    public setStyle(key: string, value: string, media:string = "default"): void
    {
        this.getSheetRules(media).setRule(key, value);
        //this.style[key] = value;
        //(this.html.style as any)[key] = value;
    }

    public getStyle(key: string, media: string = "default"): string
    {
        return this.getSheetRules(media).getRule(key);
        // if( typeof this.style[key] !== "undefined" )
        //     return this.style[key];
        // return (this.html.style as any)[key];
    }

    public removeStyle(key: string, media: string = "default"):void
    {
        this.getSheetRules(media).removeRule(key);
        // this.html.style[key] = "";
        // delete this.style[key];
    }

    public setData(key: string, value: string): void
    {
        this.html.setAttribute("data-" + key, value);
    }

    public getData(key: string): string
    {
        return this.html.getAttribute("data-" + key) || "";
    }

    public removeData(key:string):void
    {
        this.html.removeAttribute("data-" + key);
    }

    public getBounds(): Rect
    {
        this.rect.copyClientRect(this.html.getBoundingClientRect());
        //this.rect.y += window.scrollY;
        //this.rect.y += document.documentElement.scrollTop;
        this.rect.y += window.scrollY || window.pageYOffset || document.body.scrollTop + (document.documentElement && document.documentElement.scrollTop || 0);
        return this.rect;
    }

    public getRoot(): Display
    {
        let root: Display = this;

        while (root.parent != null) { root = root.parent; }

        return root;
    }

    public findByClass(className: string): Display
    {
        if (this.hasClass(className)) { return this; }

        for (let i: number = 0; i < this.length; i++)
        {
            let result: Display = this.children[i].findByClass(className);
            if (result) { return result; }
        }

        return null;
    }

    public findByPoint(x: number, y: number, filter: (p: Display) => boolean = null): Display
    {
        return Display.findByPointInChildren(x, y, this, filter);
    }

    public findByArea(rect: Rect, filter: (p: Display) => boolean = null): Display[]
    {
        let elem: Display[] = [];
        Display.findByAreaInChildren(rect, this, elem, filter);
        return elem;
    }

    public setAttrib(attribName: string, attribValue: string): void
    {
        this.html.setAttribute(attribName, attribValue);
    }

    public getAttrib(attribName: string): string
    {
        return this.html.getAttribute(attribName) || "";
    }

    public removeAttrib(attribName:string):void
    {
        this.html.removeAttribute(attribName);
    }

    public addClasses(classNames: string): void
    {
        let s: string[] = classNames.split(" ");
        for (let i: number = 0; i < s.length; i++)
            if (this.classesName.indexOf(s[i]) === -1) this.classesName.push(s[i]);
        this.html.className = this.classesName.join(" ");
    }

    public removeClasses(classNames:string):void
    {
        let s: string[] = classNames.split(" ");
        for (let i: number = 0; i < s.length; i++)
        {
            let index:number = this.classesName.indexOf(s[i]);
            if ( index !== -1 ) this.classesName.splice(index, 1);
        }
        this.html.className = this.classesName.join(" ");
    }

    public addClass(className: string): void
    {
        let index: number = this.classesName.indexOf(className);
        if (index === -1)
        {
            this.classesName.push(className);
            this.html.className = this.classesName.join(" ");
        }
    }

    public removeClass(className: string): void
    {
        let index: number = this.classesName.indexOf(className);
        if (index !== -1)
        {
            this.classesName.splice(index, 1);
            this.html.className = this.classesName.join(" ");
        }
    }

    public hasClass(className: string): boolean
    {
        return this.classesName.indexOf(className) !== -1;
    }

    public remove(): void
    {
        if (this.parent != null)
            this.parent.removeChild(this);
    }

    public removeChild(display: Display): void
    {
        let index: number = this.children.indexOf(display);
        if (index !== -1)
        {
            this.html.removeChild(display.html);
            this.children.splice(index, 1);
            display.parent = null;
        }

        // auto remove if empty
        if( this.autoremove && this.children.length === 0 ) this.remove();
    }

    public removeChildAt(index:number):void
    {
        this.removeChild(this.children[index]);
    }

    public addChild(display: Display, index = 99999): void
    {
        index = Math.min(this.children.length, index);

        if( this.children.indexOf(display) === index ) return;

        display.remove();
        display.parent = this;

        this.children.splice(index, 0, display);

        if (index === this.children.length - 1)
        {
            this.html.appendChild(display.html);
        }
        else
        {
            this.html.insertBefore(display.html, this.children[index + 1].html);
        }
    }

    public append(display: Display): void
    {
        this.addChild(display, this.children.length);
    }

    public isChild( display:Display ):boolean
    {
        for (let i: number = 0; i < this.children.length; i++)
            if ( this.children[i] === display ) return true;
        return false;
    }

    public isRecursiveChild( display:Display ):boolean
    {
        for( let i:number = 0 ; i < this.children.length ; i++ )
            if( this.children[i] === display || this.children[i].isRecursiveChild(display) )
                return true;
        return false;
    }

    public isRecursiveParent( display:Display ):boolean
    {
        let parent:Display = this;

        while( parent != null )
            if( parent === display ) return true;
            else parent = parent.parent;

        return false;
    }

    public allowAddChild( display:Display ):boolean
    {
        return !this.isRecursiveParent(display);
    }

    private getSheetRules(media:string="default"):SheetRules
    {
        if( !this.id )
            this.id = "w" + (Display.lastIDCount++);

        if ( !(media in this.sheetRules) )
            this.sheetRules[media] = new SheetRules("#" + this.id, media);

        return this.sheetRules[media];
    }

}


