



/*

media:
default 0 >=
991px Large >=
766px Medium >=
575px Small >=


*/

class Sheet
{
    private static sizes: { [media: string]: string } =
    {
        "xs": "575px", // <
        "sm": "575px", // >=
        "md": "767px", // >=
//<<<<<<< HEAD
        "lg": "940px", // >=
//=======
//        "lg": "991px", // >=
//>>>>>>> e017da3511f983544155a71bc800bd43ac7ab687
        "xl": "1199px",// >=
    };

    private static sheets: { [media: string]: Sheet } = {};
    public static getSheet(media: string): Sheet
    {
        if( typeof Sheet.sizes[media] !== 'undefined' ) media = Sheet.sizes[media];

        if ( !(media in Sheet.sheets) )
            Sheet.sheets[media] = new Sheet(media);
        return Sheet.sheets[media];
    }

    public style: HTMLStyleElement;
    public priority:number = 0;
    public media:string;

    constructor( media:string = "default" )
    {
        if (typeof Sheet.sizes[media] !== 'undefined') media = Sheet.sizes[media];

        this.media = media;
        this.priority = media === "default" ? 9999 : parseInt(media.replace("px", ""), 10);

        this.style = document.createElement("style");
        this.style.type = "text/css";
        this.style.appendChild(document.createTextNode(""));// WebKit hack :(

        if( media !== "default" )
            this.style.setAttribute("media", "screen and (max-width:"+media+")");

        this.insertStyleInPage();
    }

    public append(rules:SheetRules):void
    {
        this.style.appendChild(rules.node);
    }

    private insertStyleInPage():void
    {
        for (let key in Sheet.sheets)
        {
            if ( Sheet.sheets[key].priority < this.priority )
            {
                document.head.insertBefore(this.style, Sheet.sheets[key].style);
                return;
            }
        }
        document.head.appendChild(this.style);
    }
}



export class SheetRules
{

    public selector: string;
    public node: Text;

    private rules: { [n: string]: string } = {};

    constructor(selector: string, media:string = "default")
    {
        this.selector = selector;
        this.node = document.createTextNode("");

        Sheet.getSheet(media).append(this);
    }

    public getRule(name:string):string
    {
        return this.rules[name];
    }

    public removeRule(name: string): void
    {
        delete this.rules[name];
        this.render();
    }

    public setRule(name: string, value: string): void
    {
        this.rules[name] = value;
        this.render();
    }

    public removeRules(names: string[]): void
    {
        for (let i: number = 0; i < names.length; i++)
            delete this.rules[names[i]];
        this.render();
    }

    public getRules():{[n:string]:string}
    {
        return this.rules;
    }

    public setRules(rules: { [n: string]: string } | string): void
    {
        if (typeof rules === "string")
        {
            let parts: string[] = rules.trim().replace(/[\{\}]/g, "").split(";");
            for (let i: number = 0; i < parts.length; i++)
            {
                if( parts[i].length === 0 ) continue;
                let keyvalue: string[] = parts[i].split(':');
                this.rules[keyvalue[0]] = keyvalue[1];
            }
        }
        else
        {
            for (let key in rules)
                this.rules[key] = rules[key];
        }

        this.render();
    }

    public toString():string
    {
        return this.selector+"{"+this.toLine()+"}";
    }

    public toLine():string
    {
        let result: string = "";
        for (let key in this.rules)
            result += key + ":" + this.rules[key] + ";";
        return result;
    }

    private render(): void
    {
        this.node.textContent = this.toString();
    }
}
