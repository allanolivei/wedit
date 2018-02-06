//import { Selectable, ToolbarEditor } from "./selection/Selection";
import { Display } from "./Display";
import { Describer } from "./Utils";
//import { VerticalLayout, AbsoluteLayout, AutoLayout, RowLayout } from "./Layout/Layout";
import { Selectable } from "./Selectable";
import { AutoLayout } from "./Layout";


// {{ list container params params params }}
// interface WidgetContainerAttrib
// {
//     type: string; // "list, text"
//     name: string;
//     params: string[];
// }

// registra possicoes em que conter widgetattrib nos elementos
interface WidgetContainerData
{
    type:string;  // "list, text, attrib"
    display: Display;
    attribName?: string;
}

// Estrutura de template
interface TemplateData
{
    html:string;
}

// Dados que o widget recebe para preencher um widget a partir de um template
interface WidgetData
{
    template:string;
    data?:any;
    dataClassName?:string[];
    className?:string;
    style?:string[];
}

export class Widget extends Selectable
{
    private static TEMPLATES: { [id: string]: TemplateData; } = { // templates
        "text": { html: "<div>{{text content}}</div>" },
        "row-layout": { html: "<div><div class='row' data-type='RowLayout'>{{list container}}</div></div>" },
        "vertical-layout": { html: "<div><div class='vertical' data-type='VerticalLayout'>{{list container}}</div></div>" },
    };

    public static AddTemplate( name:string, value:string|TemplateData ):void
    {
        if( typeof value === "string" )
            Widget.TEMPLATES[name] = { "html": value };
        else if( "html" in value )
            Widget.TEMPLATES[name] = value;
    }
    public static RemoveTemplate(name:string):void { delete Widget.TEMPLATES[name]; }
    public static HasTemplate(name:string):boolean { return ( name in Widget.TEMPLATES ); }
    public static GetTemplate(name:string):TemplateData { return Widget.TEMPLATES[name]; }

    public static GetWidget(data: any): Widget { return new Widget(data); }
    public static GetWidgetByString(data: string): Widget { return Widget.GetWidget(JSON.parse(data)); }



    public static displayTypes: { [id: string]: typeof Display; } = {
        "Display": Display,
        // "VerticalLayout": VerticalLayout,
        // "AbsoluteLayout": AbsoluteLayout,
        // "AutoLayout": AutoLayout,
        // "RowLayout": RowLayout
    };


    private static parser: DOMParser = new DOMParser();

    private templateName: string;
    private containers: { [id: string]: WidgetContainerData; } = {}; // container de atributos

    constructor(settings: string|WidgetData, ...className: string[])
    {
        super("undefined", "widget", ...className);

        if ( typeof settings === "string" )
            settings = { "template": settings };

        if ( settings.template === "undefined" )
            return;

        if ( !Widget.HasTemplate(settings.template) )
            throw "Widget :: The template \"" + settings.template + "\" is undefined.";

        this.templateName = settings.template;

        // convert settings object to xml
        let xml: Document = Widget.parser.parseFromString(Widget.GetTemplate(settings.template).html, "text/xml");
        // create element
        this.html = document.createElement(xml.firstChild.nodeName);
        // fill classes default
        this.html.className = this.classesName.join(" ");
        // fill element with template
        this.applyTemplate(this, xml.firstChild as Element);
        // add defaults containers
        this.createContainer("style", "style", this);
        // fill containers with data
        this.fillContainersByData(settings);
    }

    // public serialize(): string
    // {
    //     return JSON.stringify(this.serializeInObject());
    // }

    // public serializeInObject(): any
    // {
    //     let settings: any = {};
    //     settings.template = this.templateName;
    //     settings.data = {};
    //     settings.className = this.classesName.join(" ");
    //     settings.dataClassName = {};
    //     settings.style = this.style;

    //     for (let key in this.containers)
    //     {
    //         if (this.containersOfWidgets.indexOf(key) !== -1)
    //         {
    //             // settings.data[key] = [];
    //             // for( let i:number = 0 ; i < this.widgets[key].length ; i++ )
    //             //     settings.data[key].push( this.widgets[key][i].serializeInObject() );
    //             settings.data[key] = [];
    //             for (let i: number = 0; i < this.containers[key].length; i++)
    //             {
    //                 let w: Widget = this.containers[key].children[i] as Widget;
    //                 if (w) settings.data[key].push(w.serializeInObject());
    //             }
    //         }
    //         else
    //         {
    //             settings.data[key] = this.containers[key].content;
    //         }

    //         settings.dataClassName[key] = this.containers[key].html.className;
    //     }

    //     return settings;
    // }


    //+++++++++++++++++++++++++++++ Manipulate all data ++++++++++++++++++++++++++++++
    public setContainerData(containerName:string, value:any)
    {
        if ( !(containerName in this.containers) )
            throw "Tentativa de modificação de um container inexistente. Container Name: " + containerName;

        switch ( this.containers[containerName].type ) {
            case "text":
                this.setWidgetText(containerName, value as string);
                break;
            case "attrib":
                this.setWidgetAttrib(containerName, value as string);
                break;
            case "style":
                this.setWidgetStyle(containerName, value as string);
                break;
            case "list":
                this.addWidget(containerName, value);
                break;
        }
    }
    //+++++++++++++++++++++++++++ Manipulate type(attrib) ++++++++++++++++++++++++++++++
    public setWidgetStyle(key: string, styles: string): void
    {
        if (!(key in this.containers))
            throw "Tentativa de modificação de um estilo em uma chave inexistente. Chave: " + key;

        this.containers[key].display.setStyles(styles);
    }

    public getWidgetStyle(key: string): string
    {
        if (!(key in this.containers))
            throw "Tentativa de modificação de um estilo em uma chave inexistente. Chave: " + key;

        return this.containers[key].display.getStyles();
    }

    //+++++++++++++++++++++++++++ Manipulate type(attrib) ++++++++++++++++++++++++++++++
    public setWidgetAttrib(key: string, value: string): void
    {
        if ( !(key in this.containers) )
            throw "Tentativa de modificação de um attributo em uma chave inexistente. Chave: " + key;

        this.containers[key].display.setAttrib(this.containers[key].attribName, value);
    }

    public getWidgetAttrib(key: string): string
    {
        if ( !(key in this.containers) )
            throw "Tentativa de modificação de um attributo em uma chave inexistente. Chave: " + key;

        return this.containers[key].display.getAttrib(this.containers[key].attribName);
    }

    //+++++++++++++++++==++++++++ Manipulate type(list) ++++++++++++++++++++++++++++++
    public addWidget(key: string, value: any): Widget
    {
        if ( !(key in this.containers) )
            throw "Tentativa de adicao de um elemento em uma chave inexistente. Chave: " + key;

        return this.insertWidget(key, value, this.containers[key].display.length);
    }

    public insertWidget(key: string, value: any, index: number): Widget
    {
        if ( !(key in this.containers) )
            throw "Tentativa de adicao de um elemento em uma chave inexistente. Chave: " + key;

        if ( !(value instanceof Widget) )
            value = new Widget(value);

        this.containers[key].display.addChild(value, index);

        return value;
    }

    public removeWidget(key:string, widget:Widget):void
    {
        if ( !(key in this.containers) )
            throw "Tentativa de remocao de um elemento em uma chave inexistente. Chave: " + key;

        let index:number = this.containers[key].display.children.indexOf(widget);

        if( index === -1 )
            throw "Tentativa de remocao de um elemento que não pertence ao container especificado. Chave: " + key;

        this.containers[key].display.removeChildAt(index);
    }

    public removeWidgetByIndex(key:string, index:number):void
    {
        if ( !(key in this.containers) )
            throw "Tentativa de remocao de um elemento em uma chave inexistente. Chave: " + key;

        this.containers[key].display.removeChildAt(index);
    }


    //++++++++++++++++++==+++++++ Manipulate type(text) ++++++++++++++++++++++++++++++
    public setWidgetText(key: string, value: string): void
    {
        this.containers[key].display.content = value;
    }

    public getWidgetText(key: string): string
    {
        return this.containers[key].display.content;
    }








    /************************************************************************************/
    /************************************************************************************/
    /***************************** FILL CONTAINER BY DATA *******************************/
    /************************************************************************************/
    /************************************************************************************/
    private fillContainersByData(settings: WidgetData): void
    {
        for (let key in settings.style)
            this.setStyle(key, settings.style[key]);

        if (typeof settings.className !== "undefined")
            this.addClasses(settings.className);

        if (typeof settings.dataClassName !== "undefined")
        {
            for (let key in settings.dataClassName)
                if (typeof this.containers[key] !== "undefined")
                    this.containers[key].display.addClasses(settings.dataClassName[key]);
        }

        for (let key in settings.data)
        {
            let item: any = settings.data[key];

            if( key in this.containers && this.containers[key].type !== "text" )
            {
                if( this.containers[key].type === "list" )
                {
                    for (let i: number = 0; i < item.length; i++)
                        this.addWidget(key, item[i]);
                }
                else if( this.containers[key].type === "attrib" )
                {
                    this.setWidgetAttrib(key, item);
                }
                else if( this.containers[key].type === "style" )
                {
                    for( let media in item )
                        this.containers[key].display.setStyles(item[media], media);
                }
            }
            else
            {
                this.setWidgetText(key, item);
            }
        }
    }





    /************************************************************************************/
    /************************************************************************************/
    /********************************** APPLY TEMPLATE **********************************/
    /************************************************************************************/
    /************************************************************************************/
    private applyTemplate(display: Display, xmlNode: Element): void
    {
        // copy attributes
        for (let i: number = 0; i < xmlNode.attributes.length; i++)
        {
            let key: string = xmlNode.attributes[i].nodeName;

            if (key === "class")
                display.addClasses(xmlNode.attributes[i].nodeValue);
            else if (key === "style")
                display.html.setAttribute(key, xmlNode.attributes[i].nodeValue + display.html.getAttribute("style"));


            let containerName: string = this.getContainerName(xmlNode.attributes[i].nodeValue);

            if ( containerName !== "" )
                this.createContainer(containerName, key === "style" ? "style" : "attrib", display, key);
            //this.containers[cattrib.name] = { type: "attrib", display: display, attribName: key };
            else
                display.html.setAttribute(key, xmlNode.attributes[i].nodeValue);
        }

        // element of content
        //if (xmlNode.children.length === 0)
        if ( this.xmlNodeElementLength(xmlNode) === 0 )
        {
            let containerName: string = this.getContainerNameByElement(xmlNode);
            let content: string = xmlNode.textContent;

            // elemento editavel
            if (containerName !== "")
            {
                let type: string = display.hasClass("layout") ? "list" : "text";
                //this.containers[wattrib.name] = { type: wattrib.type, display: display, attribName: wattrib.type };
                this.createContainer(containerName, type, display);
                // if ( wattrib.type === 'text' )
                //     display.setData("drag", "false");
                display.addClass("widget-" + type);
            }
            // texto estatico
            else
            {
                display.content = content;
            }
        }
        // element of children
        else
        {
            // create html children
            for (let i: number = 0; i < xmlNode.childNodes.length; i++)
            {
                if (xmlNode.childNodes[i].nodeType !== 1) continue;

                let d: Display = this.getDisplayByElement(xmlNode.childNodes[i] as Element);
                this.applyTemplate(d, xmlNode.childNodes[i] as Element);
                display.addChild(d);
            }
        }
    }

    private getContainerNameByElement(xmlNode: Element): string
    {
        //if (xmlNode.children.length !== 0) return null;
        if (this.xmlNodeElementLength(xmlNode) !== 0) return "";
        return this.getContainerName(xmlNode.textContent);
    }

    private getContainerName(content: string): string
    {
        let start: number = content.indexOf("{{");
        let end: number = content.indexOf("}}");

        if (start === -1 || end === -1) return "";

        return content.substr(start + 2, end - start - 2).replace(/\ /g, "");

        //let metadatas: string[] = content.substr(start + 2, end - start - 2).trim().split(' ');
        //return { name: metadatas[1], type: metadatas[0], params: null };
    }

    protected createContainer(containerName: string, type: string, children: Display, attribName?: string): void
    {
        // type: list, text, style
        this.containers[containerName] = { type: type, display: children, attribName: attribName };
    }

    private xmlNodeElementLength(xmlNode: Node): number
    {
        // FIX** xmlNode.children dont exist in IE

        let count: number = 0;
        for (let i: number = 0; i < xmlNode.childNodes.length; i++)
            if (xmlNode.childNodes[i].nodeType === 1) count++;
        return count;
    }

    private getDisplayByElement(xmlNode: Element): Display
    {
        for (let i: number = 0; i < xmlNode.attributes.length; i++)
            if (xmlNode.attributes[i].name === "data-type" && Widget.displayTypes[xmlNode.attributes[i].value])
                return new Widget.displayTypes[xmlNode.attributes[i].value](xmlNode.tagName);

        let wattrib: string = this.getContainerNameByElement(xmlNode);

        if (wattrib !== "")
            return new Selectable(xmlNode.tagName);

        return new Display(xmlNode.tagName);
    }

}
