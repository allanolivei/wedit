//import { Selectable, ToolbarEditor } from "./selection/Selection";
import { Display } from "./Display";
import { Describer } from "./Utils";
//import { VerticalLayout, AbsoluteLayout, AutoLayout, RowLayout } from "./Layout/Layout";
import { Selectable } from "./Selectable";
import { AutoLayout, VerticalLayout, RowLayout, RelativeLayout, AbsoluteLayout, FlexLayout, Layout } from "./Layout";


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
    type:string;  // "list, text, attrib, style, class"
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
    //dataClassName?:string[];
    //className?:string;
    //style?:string[];
}


/*
# containers disponives (text,list,attrib,class,style)
W.WEdit.addTemplate("lista",
"<div class='lista-wrapper' data-class='{{minhaclasse}}'>"+
"   <p>{{meutexto}}</p>"+
"   <ul data-style='{{meuestilo}}' data-qualquer='{{meuatributo}}' data-type='VerticalLayout'>{{minhalista}}</ul>" +
"</div>"
);

stage.addWidget("list",{
    "template": "lista",
    "data":{
        "meutexto":"allan",
        "minhaclasse":"container align-itens-center",
        "meuatributo":"ola atributo",
        "meuestilo":"margin-top:20px;background:red;",
        "minhalista":[
            {"template":"text", "data":{"text":"Nicole 1"}},
            {"template":"text", "data":{"text":"Nicole 2"}},
            {"template":"text", "data":{"text":"Nicole 3"}}
        ]
    }
});

stage.addWidget("list",{
    "template": "lista",
    "data":{
        "meuestilo":{"500px":"margin-top:20px;background:red;min-height:40px"}
    }
});

https://microsoft.github.io/monaco-editor/index.html
*/
export class Widget extends Selectable
{
    private static TEMPLATES: { [id: string]: TemplateData; } = { // templates
        "text": { html:
            "<div class='w-text'>{{text}}</div>" },
        "img": { html:
            "<div class='w-img'><img data-style='{{img-style}}' class='img-fluid' src='{{img}}' alt='{{alt}}' /></div>" },
        "movie": { html:
            "<div class='w-movie'><img data-style='{{img-style}}' class='img-fluid' src='{{movie}}' alt='{{alt}}' /></div>" },
        "row-layout": { html:
            "<div><div data-style='{{layout-style}}' data-class='{{row-class}}' data-type='RowLayout'>{{list}}</div></div>" },
        "flex-layout": { html:
            "<div><div data-style='{{layout-style}}' data-class='{{class-layout}}' data-type='FlexLayout'>{{list}}</div></div>" },
        "vertical-layout": { html:
            "<div><div data-style='{{layout-style}}' data-class='{{class-layout}}' data-type='VerticalLayout'>{{list}}</div></div>" },
        "relative-layout": { html:
            "<div><div data-style='{{layout-style}}' data-class='{{class-layout}}' data-type='RelativeLayout'>{{list}}</div></div>" },
        "absolute-layout": { html:
            "<div><div data-style='{{layout-style}}' data-class='{{class-layout}}' data-type='AbsoluteLayout'>{{list}}</div></div>" },
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
        "Layout": VerticalLayout,
        "VerticalLayout": VerticalLayout,
        "RelativeLayout": RelativeLayout,
        "AbsoluteLayout": AbsoluteLayout,
        "AutoLayout": AutoLayout,
        "RowLayout": RowLayout,
        "FlexLayout": FlexLayout,
    };


    private static parser: DOMParser = new DOMParser();
    private containers: { [id: string]: WidgetContainerData; } = {}; // container de atributos


    public templateName: string;


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
        this.createContainer("className", "class", this);
        // fill containers with data
        this.setContainersData(settings.data);
    }

    public clone():Widget
    {
        return new Widget(this.templateName);
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
    public createContainer(containerName: string, type: string, children: Display, attribName?: string): void
    {
        this.containers[containerName] = { type: type, display: children, attribName: attribName };
    }

    public getDisplayByContainerName(containerName:string):Display
    {
        return this.containers[containerName].display;
    }

    public getNumberOfContainers():number
    {
        let count = 0;
        for( let key in this.containers ) count++;
        return count;
    }

    public getContainerType(containerName:string):string
    {
        if( containerName in this.containers )
            return this.containers[containerName].type;
        return "";
    }

    public getContainerData(containerName: string):string
    {
        if (!(containerName in this.containers))
            throw "Tentativa de modificação de um container inexistente. Container Name: " + containerName;

        switch (this.containers[containerName].type)
        {
            case "text":
                return this.getWidgetText(containerName);
            case "attrib":
                return this.getWidgetAttrib(containerName);
            case "class":
                //this.get(containerName);
                break;
            case "style":
                //this.setWidgetStyles(containerName, value as string);
                break;
            case "list":
                ///this.addWidget(containerName, value);
                break;
        }

        return "";
    }

    public setContainerData(containerName:string, value:string|Widget):void
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
            case "class":
                this.addWidgetClasses(containerName, value as string);
                break;
            case "style":
                this.setWidgetStyles(containerName, value as string);
                break;
            case "list":
                this.addWidget(containerName, value);
                break;
        }
    }

    public setContainersData( data:{[n:string]:any} ):void
    {
        for (let key in data)
        {
            let item: any = data[key];

            switch ( this.getContainerType(key) )
            {
                case "class":
                    this.addWidgetClasses(key, item);
                    break;
                case "style":
                    if( typeof item === "string" )
                        this.setWidgetStyles(key, item as string);
                    else
                        for( let media in item )
                            this.setWidgetStyles(key, item[media], media );
                    break;
                case "attrib":
                    this.setWidgetAttrib(key, item);
                    break;
                case "list":
                    for (let i: number = 0; i < item.length; i++)
                        this.addWidget(key, item[i]);
                    break;
                default:
                    this.setWidgetText(key, item);
            }
        }
    }

    //+++++++++++++++++++++++++++ Manipulate type(class) ++++++++++++++++++++++++++++++
    public addWidgetClass(key: string, className: string): void
    {
        if ( this.getContainerType(key) !== "class" )
            throw "Widget :: Não foi possível adicionar as (classes) no container " + key;

        this.containers[key].display.addClass(className);
    }
    public addWidgetClasses(key: string, classNames: string): void
    {
        if ( this.getContainerType(key) !== "class" )
            throw "Widget :: Não foi possível adicionar as (classes) no container " + key;

        this.containers[key].display.addClasses(classNames);
    }

    public removeWidgetClass(key:string, className:string):void
    {
        if ( this.getContainerType(key) !== "class" )
            throw "Widget :: Não foi possível removers as (classes) do container " + key;

        this.containers[key].display.removeClass(className);
    }

    public removeWidgetClasses(key: string, classNames:string): void
    {
        if ( this.getContainerType(key) !== "class" )
            throw "Widget :: Não foi possível removers as (classes) do container " + key;

        this.containers[key].display.removeClasses(classNames);
    }

    public hasWidgetClass(key:string, className:string): boolean
    {
        if ( this.getContainerType(key) !== "class" )
            throw "Widget :: Não foi possível verificar as (classes) do container " + key;

        return this.containers[key].display.hasClass(className);
    }

    //+++++++++++++++++++++++++++ Manipulate type(attrib) ++++++++++++++++++++++++++++++
    public setWidgetStyles(key: string, styles: string|{[n:string]:string}, media:string="default"): void
    {
        if ( this.getContainerType(key) !== "style" )
            throw "Widget :: Não foi possível adicionar um novo (estilo) no container " + key;

        this.containers[key].display.setStyles(styles, media);
    }

    public getWidgetStyles(key: string, media:string="default"): {[n:string]:string}
    {
        if ( this.getContainerType(key) !== "style" )
            throw "Widget :: Não foi possível recuperar o (estilo) do container " + key;

        return this.containers[key].display.getStyles(media);
    }

    public hasWidgetStyle(key: string, attribName:string, media:string = "default"): boolean
    {
        if ( this.getContainerType(key) !== "style" )
            throw "Widget :: Não foi possível recuperar o (estilo) do container " + key;

        return this.containers[key].display.getStyle(attribName, media) !== undefined;
    }

    public removeWidgetStyle(key:string, attribName:string, media:string = "default"):void
    {
        if ( this.getContainerType(key) !== "style" )
            throw "Widget :: Não foi possível recuperar o (estilo) do container " + key;

        this.containers[key].display.removeStyle(attribName, media);
    }

    //+++++++++++++++++++++++++++ Manipulate type(attrib) ++++++++++++++++++++++++++++++
    public setWidgetAttrib(key: string, value: string): void
    {
        if ( this.getContainerType(key) !== "attrib" )
            throw "Widget :: Não foi possível modificar o (atributo) do container " + key;

        this.containers[key].display.setAttrib(this.containers[key].attribName, value);
    }

    public getWidgetAttrib(key: string): string
    {
        if ( this.getContainerType(key) !== "attrib" )
            throw "Widget :: Não foi possível recuperar o (atributo) do container " + key;

        return this.containers[key].display.getAttrib(this.containers[key].attribName);
    }

    //+++++++++++++++++==++++++++ Manipulate type(list) ++++++++++++++++++++++++++++++
    public getLayout(key:string):Layout
    {
        if ( this.getContainerType(key) !== "list" )
        throw "Widget :: Não foi possível recuperar o layout do container " + key;

        return this.containers[key].display as Layout;
    }

    public getWidget(key:string, index:number):Widget
    {
        if ( this.getContainerType(key) !== "list" )
            throw "Widget :: Não foi possível recuperar um widget na (lista) do container " + key;

        return this.containers[key].display.children[index] as Widget;
    }

    public addWidget(key: string, value: any): Widget
    {
        return this.insertWidget(key, value, 9999);
    }

    public insertWidget(key: string, value: any, index: number): Widget
    {
        if ( this.getContainerType(key) !== "list" )
            throw "Widget :: Não foi possível adicionar um widget na (lista) do container " + key;

        if ( !(value instanceof Widget) )
            value = new Widget(value);

        this.containers[key].display.addChild(value, index);

        return value;
    }

    public removeWidget(key:string, widget:Widget):void
    {
        if ( this.getContainerType(key) !== "list" )
            throw "Widget :: Não foi possível remover um widget da (lista) do container " + key;

        this.containers[key].display.removeChild(widget);
    }

    public removeWidgetByIndex(key:string, index:number):void
    {
        if ( this.getContainerType(key) !== "list" )
            throw "Widget :: Não foi possível remover um widget da (lista) do container " + key;

        this.containers[key].display.removeChildAt(index);
    }


    //++++++++++++++++++==+++++++ Manipulate type(text) ++++++++++++++++++++++++++++++
    public setWidgetText(key: string, value: string): void
    {
        if ( this.getContainerType(key) !== "text" )
            throw "Widget :: Não foi possível modificar o conteudo de (texto) do container " + key;

        this.containers[key].display.content = value;
    }

    public getWidgetText(key: string): string
    {
        if ( this.getContainerType(key) !== "text" )
            throw "Widget :: Não foi possível recuperar o conteudo de (texto) do container " + key;

        return this.containers[key].display.content;
    }


    /************************************************************************************/
    /************************************************************************************/
    /********************************** APPLY TEMPLATE **********************************/
    /************************************************************************************/
    /************************************************************************************/
    private applyTemplate(display: Display, xmlNode: Element): void
    {
        // copy attributes and identify containers in attributes
        for (let i: number = 0; i < xmlNode.attributes.length; i++)
        {
            let key: string = xmlNode.attributes[i].nodeName;


            let containerName: string = this.getContainerName(xmlNode.attributes[i].nodeValue);

            if ( containerName !== "" )
            {
                this.createContainer(
                    containerName,
                    key === "data-style" ? "style" : key==="data-class" ? "class" : "attrib",
                    display,
                    key);
                //this.containers[cattrib.name] = { type: "attrib", display: display, attribName: key };
            }
            else
            {
                if (key === "class")
                    display.addClasses(xmlNode.attributes[i].nodeValue);
                else if (key === "style")
                    display.html.setAttribute(key, xmlNode.attributes[i].nodeValue + display.html.getAttribute("style"));
                else
                    display.html.setAttribute(key, xmlNode.attributes[i].nodeValue);
            }
        }

        // element of content
        //if (xmlNode.children.length === 0)
        //console.log(xmlNode, this.onlyElementsOrEmpty(xmlNode));
        if ( !this.onlyElementsOrEmpty(xmlNode) )
        {
            //let content: string = xmlNode.textContent;
            //let content: string = xmlNode.innerHTML;
            //let content: string = (xmlNode as any).responseText;
            let content: string = xmlNode.textContent;
            // console.log("GET CONTENT: ", xmlNode, content);
            let containerName: string = this.getContainerName(content);

            // elemento editavel
            if (containerName !== "")
            {
                let type: string = display.hasClass("w-layout") ? "list" : "text";
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

    private getContainerName(content: string): string
    {
        // console.log(content);
        let start: number = content.indexOf("{{");
        let end: number = content.indexOf("}}");

        if (start === -1 || end === -1) return "";

        return content.substr(start + 2, end - start - 2).replace(/\ /g, "");

        //let metadatas: string[] = content.substr(start + 2, end - start - 2).trim().split(' ');
        //return { name: metadatas[1], type: metadatas[0], params: null };
    }

    private onlyElementsOrEmpty( xmlNode: Node ):boolean
    {
        //console.log(xmlNode.childNodes);
        for (let i: number = 0; i < xmlNode.childNodes.length; i++)
            if (xmlNode.childNodes[i].nodeType !== 1 && xmlNode.childNodes[i].nodeValue.trim().length !== 0) return false;
        return true;
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

        let wattrib: string = this.getContainerName(xmlNode.textContent);

        if (wattrib !== "")
            return new Selectable(xmlNode.tagName);

        return new Display(xmlNode.tagName);
    }

}
