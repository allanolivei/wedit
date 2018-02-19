// import { Display } from "./core/Display";
// import { Rect } from "./core/Utils";
// import { Selection, SelectionDragger, SelectionTransform, Selectable } from "./selection/Selection";
// import { Editor, Widget } from "./Widget";
// import { TextEditor } from "./Editor";
// import { VerticalLayout } from "./Layout/Layout";
// import { UI } from "./ui";
import { Widget } from "./Widget";
import { VerticalLayout } from "./Layout";
import { Display } from "./Display";
import { Selection, SelectionDragger, SelectionTransform, HoverToolbar } from "./Selection";
import { UI } from "./UI";

//import * as $ from 'jquery';
// declare var CKEDITOR: any;
// (window as any).allan = "eu";


/*
-Obs.: elementos de edição podem utilizar classes como marcadores, mas elementos visuais, que representam os objetos finais
como widget e dispays, devem utilizar data-algumacoisa como identificadores para a interface

-datas especiais (Widget, Display)
-classes especiais (UI)
.w-ui-inner-editor - usado em interfaces internas do editor ( toolbar )
.w-ui-editor - usado em janelas e elementos que sobrepoem tudo
.w-ui-gizmos - usados nas ferramentas de selecao e transformacao
.widget-text - atualmente sao os conteudos de texto
*/

export class WEdit extends Widget
{
    // select - transform
    public selection:Selection;
    public selectionDragger: SelectionDragger;
    public selectionTransform:SelectionTransform;
    public toolbar:HoverToolbar;
    // windows
    public wtemplates:UI.UIWindowTemplates;
    public wtext:UI.UIWindowEditText;
    public wimg:UI.UIWindowEditImage;
    public wmovie:UI.UIWindowEditMove;
    public wconfirm:UI.UIWindowConfirm;
    // events delegate
    private removeElementDelegate:any;



    //temp
    private confirmTarget:Display;


    constructor(element: HTMLElement, settings: any = "default", ...className: string[])
    {
        if( typeof settings === "string" && settings === "empty" )
        {
            super("undefined");

            //empty
            this.html = element;
            this.classesName = this.html.className.split(' ');
            this.addClasses("w-edit w-editing" + className.join(" ") );
        }
        else if (typeof settings === "string" && settings === "default")
        {
            super("undefined");

            this.html = element;
            this.addClasses("w-edit w-editing main-frame " + className.join(" "));

            // create header - main - footer
            let header: Display = new VerticalLayout("header", "header-frame-row");
            let main: Display = new VerticalLayout("div", "content-frame-row", "expand");
            let footer: Display = new VerticalLayout("footer", "footer-frame-row");

            this.addChild(header);
            this.addChild(main);
            this.addChild(footer);

            this.createContainer("header", "list", header, "list");
            this.createContainer("list", "list", main, "list");
            this.createContainer("footer", "list", footer, "list");
        }
        else
        {
            super(settings, "w-edit", "w-editing", ...className);
            element.appendChild(this.html);
        }



        //this.setData("drag", "false");


        this.selection = new Selection();

        this.selectionDragger = new SelectionDragger(this, this.selection);
        this.selectionTransform = new SelectionTransform(this, this.selection);
        this.toolbar = new HoverToolbar(this.selection);

        this.setEnable(false);

        // let self = this;

        // // this.selectionDragger.onChange.on( (event:string)=>self.selectDraggerChangeHandler(event) );
        // this.selection.select.onChange.on( (e: Selectable[]) => self.selectionChangeHandler(e) );
        // this.selection.hover.onChange.on((e: Selectable[]) => self.hoverChangeHandler(e));
        // //this.selectionDragger.onEditSelect.on((e: Selectable) => self.onEditSelectEventHandler(e));
        // TextEditor.onEditComplete.on((e: Display) => self.onEditCompleteEventHandler(e));

        // window.document.addEventListener("keydown", (e: KeyboardEvent) => self.onKeydownHandler(e));

        // let w = new UI.UIWindow();
        // w.setWidgetText("title", "Componentes");
        // let group = new UI.UIHGroup();
        // group.addWidget("list", new UI.UIInput("X", "10", 28, "center"));
        // group.addWidget("list", new UI.UIInput("Y", "10", 28, "center"));
        // w.addWidget( "list", group);
        // w.addWidget("list", new UI.UIInput("W", "10", 28, "center") );
        // w.addWidget("list", new UI.UIInput("H", "10", 28, "center") );
        // w.addWidget("list", new UI.UIInput("width", "10", 50));
        // w.addWidget("list", new UI.UIInput("height", "10", 50));
        // w.addWidget("list", new UI.UISelect());
        // w.addWidget("list", new UI.UIInput("margin-top", "10", 84));

        this.removeElementDelegate = this.confirmRemoveElement.bind(this);





        // WINDOWS

        this.wtemplates = new UI.UIWindowTemplates(this.selectionTransform);
        this.wtext = new UI.UIWindowEditText();
        this.wimg = new UI.UIWindowEditImage();
        this.wmovie = new UI.UIWindowEditMove();
        this.wconfirm = new UI.UIWindowConfirm();




        let deactiveWindowHandlerBinder = this.deactiveWindowHandler.bind(this);
        this.wtext.onDeactive.on(deactiveWindowHandlerBinder);
        this.wimg.onDeactive.on(deactiveWindowHandlerBinder);
        this.wmovie.onDeactive.on(deactiveWindowHandlerBinder);


        this.wtemplates.active(window.innerWidth+0.5 + 470, 20);

        //this.wcomponent = new UI.UIWindow();

        // this.wtext = new UI.UIWindow();
        // this.wtext.setStyles("width:700px;height:400px;");
        // this.wtext.setWidgetText("title", "Editor de Texto");
        // this.wtext.addWidget("list", new UI.UITextarea("Edite o texto do elemento com o campo de texto abaixo."));
        // this.wtext.addWidget("list", new UI.UIButton("Cancelar"));
        // this.wtext.addWidget("list", new UI.UIButton("Confirmar"));




        // window.document.addEventListener("keydown",  this.onKeydownHandler.bind(this));

        this.toolbar.onSelect.on( this.toolbarSelectHandler.bind(this) );

    }

    public static addTemplate(templateName:string, templateValue:string):void
    {
        Widget.AddTemplate(templateName, templateValue);
    }

    public static getTemplate(templateName:string):string
    {
        return Widget.GetTemplate(templateName).html;
    }

    public enable():void
    {
        this.selectionDragger.enable();

        this.addClass("w-editing");
    }

    public disable():void
    {
        this.selection.select.clear();
        this.selection.hover.clear();
        //this.selectionDragger.disable();
        //this.selectionTransform.hide();
        this.selectionDragger.disable();
        this.selectionTransform.disable();

        this.removeClass("w-editing");
    }

    public dispose():void
    {
        for( let i = this.children.length-1 ; i >= 0 ; i-- )
            this.children[i].remove();
        this.selectionDragger.remove();
        this.selectionTransform.remove();
        this.removeClasses("w-edit w-editing");
    }

    private onKeydownHandler(event:KeyboardEvent):void
    {
        //console.log(event.code);
        //if( event.code === "h" ) {}
    }

    private toolbarSelectHandler(data:any):void
    {
        if( data.name === "edit" )
        {
            switch(data.target.templateName)
            {
                case "text":
                    this.wtext.setTarget(data.target);
                    this.wtext.active();
                break;
                case "img":
                    this.wimg.setTarget(data.target);
                    this.wimg.active();
                break;
                case "movie":
                    this.wmovie.setTarget(data.target);
                    this.wmovie.active();
                break;
            }
        }
        else
        {
            this.wconfirm.setLabel("Você tem certeza que deseja deletar a coluna?");
            this.wconfirm.active();
            this.wconfirm.onSelect.on(this.removeElementDelegate);
            this.confirmTarget = data.target;
        }
    }

    private deactiveWindowHandler():void
    {
        this.selectionTransform.redraw();
    }

    private confirmRemoveElement( confirm:boolean ):void
    {
        this.wconfirm.onSelect.off(this.removeElementDelegate);

        if( confirm && this.confirmTarget)
        {
            this.confirmTarget.remove();
            this.selection.hover.clear();
            this.selection.select.clear();
        }
        this.confirmTarget = null;
    }
    // private onKeydownHandler(event:KeyboardEvent):void
    // {
    //     if( this.selection.select.count() == 0 ) return;

    //     if( event.code == "Enter" )
    //     {
    //         var target:Display = this.selection.select.get(0).findByClass("widget-text");

    //         if( target )
    //         {
    //             this.disable();

    //             TextEditor.edit(target);
    //         }
    //     }
    //     else if( event.code == "Escape" )
    //     {
    //         if( TextEditor.hasEditor() )
    //             TextEditor.clear();
    //         else
    //             this.selection.select.clear();
    //     }
    // }

    // // EVENT:::> O usuario solicitou atraves do mouse a edicao de um elemento.
    // private onEditCompleteEventHandler(e:Display):void
    // {
    //     this.enable();
    // }

    // // EVENT:::> O usuario acabou de editar um campo de texto
    // private onEditSelectEventHandler(e:Selectable) :void
    // {
    //     if( e.hasClass("widget-text") )
    //     {
    //         this.disable();

    //         TextEditor.edit(e);
    //     }
    // }

    // // EVENT:::> Os objetos selecionados foram modificados
    // private selectionChangeHandler(e:Selectable[]):void
    // {
    //     //console.log("selectChangeHandler: ", e);
    //     Editor.focus(e);
    // }

    // // EVENT:::> O alvo atual foi modificado. Utiliza a posicao do mouse para determinar o alvo.
    // private hoverChangeHandler(e: Selectable[]): void
    // {
    //     Editor.over(e);
    // }

    // public selectDraggerChangeHandler( event:string ):void
    // {
    //     console.log(event);
    // }
}



