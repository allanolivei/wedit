import { Widget } from "./Widget";
import { Display } from "./Display";
import { Rect } from "./Utils";
import { SelectionTransform } from "./Selection";
import { Selectable } from "./Selectable";
import { LiteEvent } from "./LiteEvent";
import { ImageUpload } from "./ImageUpload";

export namespace UI
{
    Widget.AddTemplate("UI-BACKGROUND",
        "<div class='ui-background w-ui-editor'></div>");

    Widget.AddTemplate("UI-WINDOW",
        "<div class='ui-window w-ui-editor'>"+
        "   <div class='ui-window-header'>{{title}}</div>"+
        "   <div class='ui-window-body' data-type='VerticalLayout'>{{list}}</div>" +
        "</div>");

    Widget.AddTemplate("UI-LABEL",
        "<div class='ui-label w-ui-editor'>" +
        "   <div class='ui-label-body'>{{label}}</div>" +
        "</div>");

    Widget.AddTemplate("UI-INPUT",
        "<div class='ui-input w-ui-editor'>" +
        "   <label class='ui-input-label' from='lname'>{{label}}</label>" +
        "   <div class='ui-input-body'><input class='ui-input-data' type='text' name='lname' value='{{value}}' /></div>" +
        "</div>");

    Widget.AddTemplate("UI-TEXTAREA",
        "<div class='ui-textarea w-ui-editor'>" +
        "   <label class='ui-textarea-label' from='lname'>{{label}}</label>" +
        "   <div class='ui-textarea-body'><textarea class='ui-textarea-editor' rows='4' cols='50'>{{text}}</textarea></div>" +
        "</div>");

    Widget.AddTemplate("UI-BUTTON",
        "<button class='ui-button w-ui-editor'>{{label}}</button>");
    Widget.AddTemplate("UI-EMPTY",
        "<span class='ui-empty w-ui-editor'></span>");

    Widget.AddTemplate("UI-SELECT",
        "<div class='ui-input ui-select w-ui-editor'>" +
        "   <label class='ui-select-label' from='select-test'>{{label}}</label>" +
        "   <select class='ui-select-data' id='select-test'>"+
        "       <option value='' disabled='disabled' selected='selected'>Please select a color</option>"+
        "       <option value='volvo'>Volvo</option>"+
        "       <option value='saab'>Saab</option>"+
        "       <option value='mercedes'>Mercedes</option>"+
        "       <option value='audi'>Audi</option>"+
        "   </select>"+
        "</div>");

    Widget.AddTemplate("UI-H-GROUP",
        "<div class='ui-h-group w-ui-editor'>" +
        "   <div class='ui-h-group-container' data-type='AutoLayout'>{{list}}</div>" +
        "</div>");

    Widget.AddTemplate("UI-GRID-GROUP",
        "<div class='ui-grid-group w-ui-editor'>" +
        "   <div class='ui-grid-group-container' data-type='AutoLayout'>{{list}}</div>" +
        "</div>");

    Widget.AddTemplate("UI-TEMPLATE",
        "<div class='ui-template w-ui-editor'>" +
        "   <div class='ui-template-list' data-type='VerticalLayout'>{{list}}</div>" +
        "</div>");

    Widget.AddTemplate("UI-TEMPLATE-ITEM",
        "<div class='ui-template-item w-ui-editor w-empty' data-template='{{template}}'></div>");

    Widget.AddTemplate("UI-THUMB",
        "<div class='ui-thumb w-ui-editor'>" +
        "<img src='{{img}}' />"+
        "</div>");

    export class UIWindow extends Widget
    {
        public readonly onActive = new LiteEvent();
        public readonly onDeactive = new LiteEvent();


        private static zindex:number = 1000;
        // cache
        private header:Display;
        private background:Display;
        // drag data
        private isDown:boolean;
        private offsetX:number;
        private offsetY:number;
        private bounds:Rect;
        // background is active?
        private backgroundIsActive:boolean = false;

        constructor()
        {
            super("UI-WINDOW");

            this.setWidgetText("title", "Box Model");

            let self = this;

            this.header = this.findByClass("ui-window-header");
            this.header.html.addEventListener("mousedown", (event: MouseEvent) => self.mousedown(event));
            window.addEventListener("mousemove", (event: MouseEvent) => self.mousemove(event));
            window.addEventListener("mouseup", (event: MouseEvent) => self.onmouseup(event));

            document.body.appendChild(this.html);

            this.deactive();
        }

        public active( left?:number, top?:number ):void
        {
            this.html.style.display = "block";

            if( this.backgroundIsActive )
                this.addBackground();
            this.moveForward();

            this.bounds = this.getBounds();

            if( left === undefined )
                left = (window.innerWidth - this.bounds.w) * 0.5;
            if( top === undefined )
                top = (window.innerHeight - this.bounds.h) * 0.5;

            this.move(left, top);

            this.onActive.trigger();
        }

        public deactive():void
        {
            this.removeBackground();
            this.html.style.display = "none";

            this.onDeactive.trigger();
        }

        public activeBackground():void
        {
            this.backgroundIsActive = true;
            this.addBackground();
            this.moveForward();
        }

        public deactiveBackground():void
        {
            this.backgroundIsActive = false;
            this.removeBackground();
        }

        public moveForward()
        {
            if( this.background )
                this.background.html.style.zIndex = (++UIWindow.zindex).toString();
            this.html.style.zIndex = (++UIWindow.zindex).toString();
        }

        public move(x:number, y:number):void
        {
            this.bounds.x = x;
            this.bounds.y = y;

            this.bounds.x = Math.max(0, Math.min( this.bounds.x, window.innerWidth-this.bounds.width ));
            this.bounds.y = Math.max(0, Math.min( this.bounds.y, window.innerHeight-this.bounds.height ));

            //this.setStyle("left", this.bounds.x + "px");
            //this.setStyle("top", this.bounds.y + "px");
            this.html.style.left = this.bounds.x + "px";
            this.html.style.top = this.bounds.y + "px";
        }

        private removeBackground():void
        {
            if( this.background && this.background.html.parentElement )
                this.background.html.parentElement.removeChild(this.background.html);
        }

        private addBackground():void
        {
            if( this.html.style.display !== "none" )
            {
                if( !this.background )
                    this.background = new Widget("UI-BACKGROUND");
                this.html.parentElement.appendChild(this.background.html);
            }
        }

        private mousedown(event: MouseEvent): void
        {
            event.preventDefault();

            this.isDown = true;

            this.bounds = this.getBounds();
            this.offsetX = this.bounds.x - window.scrollX - event.clientX;
            this.offsetY = this.bounds.y - window.scrollY - event.clientY;

            this.header.addClass("ui-cursor-dragging");
        }

        protected mousemove(event: MouseEvent): void
        {
            if (!this.isDown)  return;
            event.preventDefault();

            this.move(event.clientX + this.offsetX, event.clientY + this.offsetY);

            if (event.which !== 1) this.onmouseup(event);
        }

        protected onmouseup(event: MouseEvent): void
        {
            if ( !this.isDown ) return;
            event.preventDefault();
            this.isDown = false;

            this.header.removeClass("ui-cursor-dragging");
            //document.body.style.cursor = "default";
        }
    }

    export class UILabel extends Widget
    {
        constructor(label: string )
        {
            super("UI-LABEL");
            this.setWidgetText("label", label);
        }
    }

    export class UIInput extends Widget
    {
        private label:Display;
        private input:Display;
        private mouseMoveBind:any;
        private mouseUpBind:any;
        private dragValue:number;

        constructor(label: string, value: string, labelSize: number = 28, labelAlign:string = "left" )
        {
            super("UI-INPUT");
            this.setWidgetText("label", label);
            this.setWidgetAttrib("value", value);

            this.label = this.findByClass("ui-input-label");
            this.input = this.findByClass("ui-input-data");

            this.label.setStyle("width", labelSize+"px");
            this.label.setStyle("text-align", labelAlign);

            this.mouseMoveBind = this.mousemove.bind(this);
            this.mouseUpBind = this.onmouseup.bind(this);

            //this.label.html.addEventListener("mousedown", this.mousedown.bind(this));
            //this.input.html.addEventListener("wheel", this.mousewheel.bind(this));
        }

        public getValue():string
        {
            return (this.input.html as any).value;
        }

        public getNumberValue():number
        {
            let value:number = parseInt((this.input.html as any).value, 10);
            return isNaN(value) ? 0 : value;
        }

        public setValue(value:any):void
        {
            (this.input.html as any).value = value;
        }

        private mousewheel( event:MouseWheelEvent ):void
        {
            event.preventDefault();
            let result: number = this.getNumberValue() - event.deltaY / 100;
            this.setValue(result);
        }

        private mousedown(event: MouseEvent): void
        {
            event.preventDefault();

            this.dragValue = this.getNumberValue();

            window.addEventListener("mousemove", this.mouseMoveBind);
            window.addEventListener("mouseup", this.mouseUpBind);
        }

        protected mousemove(event: MouseEvent): void
        {
            event.preventDefault();

            this.dragValue += event.movementX;
            this.setValue( this.dragValue );

            if (event.which !== 1) this.onmouseup(event);
        }

        protected onmouseup(event: MouseEvent): void
        {
            event.preventDefault();
            window.removeEventListener("mousemove", this.mouseMoveBind);
            window.removeEventListener("mouseup", this.mouseUpBind);


        }
    }

    export class UITextarea extends Widget
    {
        private editor:any;

        constructor(label:string)
        {
            super("UI-TEXTAREA");

            this.setWidgetText("label", label);

            CKEDITOR.addCss('p{margin:0;}');

            this.editor = CKEDITOR.replace(this.findByClass("ui-textarea-editor").html, {
                toolbarGroups: [
                    { name: 'basicstyles', groups: ['basicstyles'] },
                    { name: 'paragraph', groups: ['align'] },
                    //'/',
                    //{ name: 'links' },
                    { name: 'colors' },
                    { name: 'styles' },
                    { name: 'basicstyles', groups: ['cleanup'] },
                ],
                stylesSet: [
                    // Block-level styles
                    { name: 'Titulo', element: 'div', styles: { 'font-weight': 'bold', 'font-size': '30px' } },
                    { name: 'Subtitulo', element: 'div', styles: { 'font-weight': 'bold', 'font-size': '20px' } },
                    //{ name: 'Light Block', element: 'div', styles: { 'font-weight': '300' } },
                    //{ name: 'Extra Light Block', element: 'div', styles: { 'font-weight': '200' } },
                    // Inline styles
                    //{ name: 'Light', element: 'span', attributes: { 'class': 'light' } },
                    //{ name: 'Extra Light', element: 'span', styles: { 'background-color': 'extra-light' } }
                ],
                removeButtons: 'Format',
                extraPlugins: 'justify,colorbutton,colordialog',
                startupFocus: true,
                resize_enabled : 'false',
                removePlugins: "resize",
            });
        }

        public setWidgetText(key:string, value:string):void
        {
            if( key === "text" )
                this.editor.setData(value);
            else
                super.setWidgetText(key, value);
        }

        public getWidgetText(key:string):string
        {
            if( key === "text" )
                return this.editor.getData() as string;

            return super.getWidgetText(key);
        }
    }

    export class UIButton extends Widget
    {
        constructor(label:string)
        {
            super("UI-BUTTON");

            this.setWidgetText("label", label);
        }
    }

    export class UIHGroup extends Widget
    {
        constructor()
        {
            super("UI-H-GROUP");
        }
    }

    export class UIGridGroup extends Widget
    {
        constructor()
        {
            super("UI-GRID-GROUP");
        }
    }

    export class UISelect extends Widget
    {
        constructor()
        {
            super("UI-SELECT");

            this.setWidgetText("label", "classes");
        }
    }

    interface UITemplateItem
    {
        widget:Widget;
        mouseDownListener?:any;
    }

    export class UITemplate extends Widget
    {
        private selectTransform:SelectionTransform;
        private items:UITemplateItem[];

        constructor( selectTransform:SelectionTransform )
        {
            super("UI-TEMPLATE");

            this.selectTransform = selectTransform;

            this.createItem("text");
            this.createItem("img");
            this.createItem("movie");

            this.html.addEventListener("mousedown", this.mousedown.bind(this));

        }

        private createItem(templateName:string):void
        {
            let widget:Widget = new Widget({
                "template":"UI-TEMPLATE-ITEM",
                "data":{
                    "className":"w-"+templateName,
                    "template":templateName,
                },
            });

            this.addItem( widget, 99999 );
        }

        private addItem(widget:Widget, index:number):void
        {
            this.insertWidget("list", widget, index);
        }

        private mousedown( event:MouseEvent ):void
        {
            event.preventDefault();

            let widget:Widget = this.getDisplayByContainerName("list").findByPoint(event.pageX, event.pageY) as Widget;

            if( widget )
            {
                this.selectTransform.startDrag(new Widget(widget.getWidgetAttrib("template")), event.pageX, event.pageY, widget.getBounds());
                //widget.remove();
                //this.addItem(widget.clone(), 0);
            }
        }
    }






    ///////// TIPOS DE JANELAS
    export class UIWindowTemplates extends UIWindow
    {
        constructor( transform:SelectionTransform )
        {
            super();
            this.setStyles("width:140px;height:370px;");
            this.setWidgetText("title", "Componentes");
            this.addWidget("list", new UI.UITemplate(transform));
        }
    }

    export class UIWindowConfirm extends UIWindow
    {
        private label:UILabel;

        public readonly onSelect:any = new LiteEvent<boolean>();

        constructor()
        {
            super();

            this.setStyles("width:400px;height:122px;");
            this.setWidgetText("title", "Alerta!");
            this.activeBackground();

            this.label = new UILabel("");
            let cancel:UI.UIButton = new UIButton("Cancelar");
            let confirm:UI.UIButton = new UIButton("Confirmar");

            this.addWidget("list", this.label);
            this.addWidget("list", cancel);
            this.addWidget("list", confirm);

            cancel.html.addEventListener("click", this.cancelHandler.bind(this));
            confirm.html.addEventListener("click", this.confirmHandler.bind(this));
        }

        public setLabel(label:string):void
        {
            this.label.setWidgetText("label", label);
        }

        private cancelHandler():void
        {
            this.deactive();
            this.onSelect.trigger(false);
        }

        private confirmHandler():void
        {

            this.deactive();
            this.onSelect.trigger(true);
        }
    }

    abstract class UIWindowWidgetTarget extends UIWindow
    {
        public readonly onComplete:LiteEvent<Widget> = new LiteEvent<Widget>();

        protected target:Widget;

        public setTarget(target:Widget):void
        {
            this.target = target;
        }

        public deactive():void
        {
            super.deactive();
            this.target = null;
        }
    }

    export class UIWindowEditText extends UIWindowWidgetTarget
    {

        private textarea:UITextarea;

        constructor()
        {
            super();

            this.setStyles("width:700px;height:398px;");
            this.setWidgetText("title", "Editor de Texto");
            this.activeBackground();

            this.textarea = new UI.UITextarea("Edite o texto do elemento com no campo de texto abaixo.");
            let cancel:UI.UIButton = new UIButton("Cancelar");
            let confirm:UI.UIButton = new UIButton("Confirmar");

            this.addWidget("list", this.textarea);
            this.addWidget("list", cancel);
            this.addWidget("list", confirm);

            cancel.html.addEventListener("click", this.deactive.bind(this));
            confirm.html.addEventListener("click", this.confirmHandler.bind(this));
        }

        public setTarget(target:Widget):void
        {
            super.setTarget(target);
            this.textarea.setWidgetText("text", this.target.getWidgetText("text"));
        }

        private confirmHandler():void
        {
            let content:string = this.textarea.getWidgetText("text");
            this.target.setWidgetText("text", content);

            if( content === "" )
                this.target.addClass("w-empty");
            else
                this.target.removeClass("w-empty");

            this.deactive();
        }
    }

    export class UIWindowEditImage extends UIWindowWidgetTarget
    {
        public uploader:ImageUpload;

        private amount:number = 0;
        private group:UIGridGroup;

        constructor()
        {
            super();

            this.setStyles("width:700px;height:410px;");
            this.setWidgetText("title", "Selecione uma Imagem");
            this.activeBackground();

            let cancel:UI.UIButton = new UIButton("Cancelar");
            let upload:UI.UIButton = new UIButton("Upload");
            this.group = new UIGridGroup();

            let groupBody:HTMLElement = this.group.html.querySelector(".ui-grid-group-container");
            groupBody.style.height = "310px";
            groupBody.style.overflowY = "scroll";

            // let confirmHandlerBinder:any = this.confirmHandler.bind(this);
            // for( let i:number = 1 ; i < 10 ; i++ )
            // {
            //     let widget:Widget = new Widget({
            //         "template":"UI-THUMB",
            //         "data":{ "img":"http://www.labtime.ufg.br/modulos/remar/img/examples/example"+i+".jpg" },
            //     });
            //     this.group.addWidget("list", widget);
            //     widget.html.addEventListener("click", confirmHandlerBinder);
            // }


            this.addWidget("list", this.group);
            let uploaderWrapper = this.addWidget("list", "UI-EMPTY").html;
            this.addWidget("list", cancel);

            this.uploader = new ImageUpload(uploaderWrapper);
            uploaderWrapper.addEventListener("loadComplete", this.loadCompleteHandler.bind(this));
            cancel.html.addEventListener("click", this.deactive.bind(this));
        }

        private loadCompleteHandler(event:CustomEvent):void
        {
            let confirmHandlerBinder: any = this.confirmHandler.bind(this);
            for( this.amount ; this.amount < this.uploader.images.length ; this.amount++ )
            {
                let widget: Widget = new Widget({
                    "template": "UI-THUMB",
                    "data": { "img": this.uploader.images[this.amount] },
                });
                // widget.html.querySelector("img").setAttribute("data-filename", this.uploader.files[this.amount].name );
                widget.html.addEventListener("click", confirmHandlerBinder);

                this.group.addWidget("list", widget);
            }
        }

        private confirmHandler(event:MouseEvent):void
        {
            let img:HTMLElement = (event.currentTarget as HTMLElement).childNodes[0] as HTMLElement;
            let content:string = img.getAttribute("src");
            this.target.setWidgetAttrib("img", content);
            // this.target.setData("filename", img.getAttribute("data-filename"));

            if( content === "" )
                this.target.addClass("w-empty");
            else
                this.target.removeClass("w-empty");

            this.deactive();
        }
    }

    export class UIWindowEditMove extends UIWindowWidgetTarget
    {
        private regex:RegExp = /watch\?v=([^\ \n\&]+)/;
        private thumblink:string = "https://img.youtube.com/vi/{0}/0.jpg";
        private input:UIInput;

        constructor()
        {
            super();

            this.setStyles("width:530px;height:125px;");
            this.setWidgetText("title", "Insira o link do video no youtube.");
            this.activeBackground();

            let cancel:UI.UIButton = new UIButton("Cancelar");
            let confirm:UI.UIButton = new UIButton("Confirmar");
            this.input = new UIInput("", "https://www.youtube.com/watch?v=5LooCGIl-Vw");

            this.addWidget("list", this.input);
            this.addWidget("list", cancel);
            this.addWidget("list", confirm);

            cancel.html.addEventListener("click", this.deactive.bind(this));
            confirm.html.addEventListener("click", this.confirmHandler.bind(this));
        }

        private confirmHandler():void
        {
            let inputValue:string = this.input.getValue();
            let result:RegExpExecArray = this.regex.exec(inputValue);
            let content:string = result ? this.thumblink.replace("{0}", result[1]) : "";

            if( content === "" )
            {
                this.target.addClass("w-empty");
            }
            else
            {
                this.target.setWidgetAttrib("movie", content);
                this.target.removeClass("w-empty");
            }

            this.deactive();
        }
    }

}





declare var CKEDITOR: any;


// export class TextEditor
// {
//     public static readonly onEditComplete = new LiteEvent<Display>();

//     private static isInitialized: boolean = false;
//     private static lastDisplay: Display;

//     public static init()
//     {
//         CKEDITOR.disableAutoInline = true;

//         let self = this;

//         CKEDITOR.on('currentInstance', function ()
//         {
//             if( CKEDITOR.currentInstance == null )
//                 self.clear();
//         });

//         TextEditor.isInitialized = true;
//     }

//     public static edit( e:Display ):void
//     {
//         if ( !TextEditor.isInitialized ) TextEditor.init();

//         TextEditor.lastDisplay = e;

//         e.html.setAttribute('contenteditable', 'true');
//         CKEDITOR.inline(e.html, {
//             toolbarGroups: [
//                 { name: 'basicstyles', groups: ['basicstyles'] },
//                 { name: 'paragraph', groups: ['align'] },
//                 { name: 'links' },
//             ],
//             extraPlugins: 'justify',
//             startupFocus: true,
//         });
//     }

//     public static clear():void
//     {
//         for( let i in CKEDITOR.instances )
//         {
//             CKEDITOR.instances[i].container.$.setAttribute('contenteditable', 'false');
//             CKEDITOR.instances[i].destroy();
//         }

//         TextEditor.onEditComplete.trigger(TextEditor.lastDisplay);
//         TextEditor.lastDisplay = null;
//     }
// }
