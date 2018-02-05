// import { Display } from "./core/Display";
// import { Rect } from "./core/Utils";
// import { Selection, SelectionDragger, SelectionTransform, Selectable } from "./selection/Selection";
// import { Editor, Widget } from "./Widget";
// import { TextEditor } from "./Editor";
// import { VerticalLayout } from "./Layout/Layout";
// import { UI } from "./ui";
import { Widget } from "./Widget";

//import * as $ from 'jquery';
// declare var CKEDITOR: any;
// (window as any).allan = "eu";


/*
classes especiais
.ui-editor
.ui-gizmos
.widget-text
*/

export class WEdit extends Widget
{
    // public selectionTransform:SelectionTransform;
    // public selectionDragger: SelectionDragger;
    // public selection:Selection;

    constructor(element: HTMLElement, settings: any = "empty", ...className: string[])
    {
        if( typeof settings === "string" && settings === "empty" )
        {
            super("undefined");
            this.html = element;
            this.addClasses("w-editor w-editing" + className.join(" ") );
        }
        else
        {
            super(settings, "w-editor w-editing", ...className);
            element.appendChild(this.html);
        }



        //this.setData("drag", "false");


        // this.selection = new Selection();
        // this.selectionDragger = new SelectionDragger(this, this.selection);
        // this.selectionTransform = new SelectionTransform(this, this.selection);

        // //this.addChild(this.selectionDragger);
        // //this.addChild(this.selectionTransform);

        // let self = this;

        // // this.selectionDragger.onChange.on( (event:string)=>self.selectDraggerChangeHandler(event) );
        // this.selection.select.onChange.on( (e: Selectable[]) => self.selectionChangeHandler(e) );
        // this.selection.hover.onChange.on((e: Selectable[]) => self.hoverChangeHandler(e));
        // //this.selectionDragger.onEditSelect.on((e: Selectable) => self.onEditSelectEventHandler(e));
        // TextEditor.onEditComplete.on((e: Display) => self.onEditCompleteEventHandler(e));

        // window.document.addEventListener("keydown", (e: KeyboardEvent) => self.onKeydownHandler(e));

        // //let w = new UI.UIWindow();
        // // var group = new UI.UIHGroup();
        // // group.addWidget("container", new UI.UIInput("X", "10", 28, "center"));
        // // group.addWidget("container", new UI.UIInput("Y", "10", 28, "center"));
        // // w.addWidget( "container", group);
        // // w.addWidget("container", new UI.UIInput("W", "10", 28, "center") );
        // // w.addWidget("container", new UI.UIInput("H", "10", 28, "center") );
        // // w.addWidget("container", new UI.UIInput("width", "10", 50));
        // // w.addWidget("container", new UI.UIInput("height", "10", 50));
        // // w.addWidget("container", new UI.UISelect());
        // //w.addWidget("container", new UI.UIInput("margin-top", "10", 84));

        // //this.addChild(w);

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
        // this.selectionDragger.enable();

        this.addClass("w-editing");
    }

    public disable():void
    {
        // this.selection.select.clear();
        // this.selection.hover.clear();
        // this.selectionDragger.disable();
        // this.selectionTransform.hide();

        this.removeClass("w-editing");
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



