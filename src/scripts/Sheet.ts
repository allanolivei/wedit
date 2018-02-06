class Sheet
{
    private static sheets: { [media: string]: Sheet } = {};
    public static getSheet(media: string): Sheet
    {
        if ( !(media in Sheet.sheets) ) Sheet.sheets[media] = new Sheet(media);
        return Sheet.sheets[media];
    }

    public style: HTMLStyleElement;

    constructor( media:string = "default" )
    {
        this.style = document.createElement("style");
        this.style.type = "text/css";
        this.style.appendChild(document.createTextNode(""));// WebKit hack :(

        if( media !== "default" )
            this.style.setAttribute("media", media);

        document.head.appendChild(this.style);
    }

    public append(rules:SheetRules):void
    {
        this.style.appendChild(rules.node);
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
        if( name in this.rules ) return this.rules[name];
        return "";
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

    public setRules(rules: { [n: string]: string } | string): void
    {
        if (typeof rules === "string")
        {
            let parts: string[] = rules.trim().replace(/[\{\}]/g, "").split(";");
            rules = {};
            for (let i: number = 0; i < parts.length; i++)
            {
                let rule: string[] = parts[0].split(':');
                rules[rule[0]] = rule[1];
            }
        }

        for (let key in rules)
            this.rules[key] = rules[key];

        this.render();
    }

    public toString():string
    {
        let result: string = this.selector + "{";
        for (let key in this.rules)
            result += key + ":" + this.rules[key] + ";";
        result += "}";
        return result;
    }

    private render(): void
    {
        this.node.textContent = this.toString();
    }
}
