import { Widget } from "./Widget";
import { Display } from "./Display";
import { Rect } from "./Utils";

export namespace UI
{

    Widget.AddTemplate("UI-WINDOW",
        "<div class='ui-window w-ui-editor'>"+
        "   <div class='ui-window-header'>{{title}}</div>"+
        "   <div class='ui-window-body' data-type='VerticalLayout'>{{list}}</div>" +
        "</div>");

    Widget.AddTemplate("UI-INPUT",
        "<div class='ui-input w-ui-editor'>" +
        "   <label class='ui-input-label' from='lname'>{{label}}</label>" +
        "   <div class='ui-input-body'><input class='ui-input-data' type='text' name='lname' value='{{value}}' /></div>" +
        "</div>");

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

    export class UIWindow extends Widget
    {

        private header:Display;
        private isDown:boolean;
        private offsetX:number;
        private offsetY:number;

        constructor()
        {
            super("UI-WINDOW");

            this.setWidgetText("title", "Box Model");

            let self = this;

            this.header = this.findByClass("ui-window-header");
            this.header.html.addEventListener("mousedown", (event: MouseEvent) => self.mousedown(event));
            window.addEventListener("mousemove", (event: MouseEvent) => self.mousemove(event));
            window.addEventListener("mouseup", (event: MouseEvent) => self.onmouseup(event));
        }

        private mousedown(event: MouseEvent): void
        {
            event.preventDefault();
            this.isDown = true;

            let bounds:Rect = this.getBounds();
            this.offsetX = bounds.x - window.scrollX - event.clientX;
            this.offsetY = bounds.y - window.scrollY - event.clientY;

            this.header.addClass("ui-cursor-dragging");
        }

        protected mousemove(event: MouseEvent): void
        {
            if (!this.isDown)  return;
            event.preventDefault();

            this.setStyle("left", (event.clientX + this.offsetX) + "px");
            this.setStyle("top", (event.clientY + this.offsetY) + "px");

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

            this.label.html.addEventListener("mousedown", this.mousedown.bind(this));
            this.input.html.addEventListener("wheel", this.mousewheel.bind(this));
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

    export class UIHGroup extends Widget
    {
        constructor()
        {
            super("UI-H-GROUP");
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

}
