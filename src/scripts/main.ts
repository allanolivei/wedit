import { Rect } from "./Utils";
import { Display } from "./Display";
import { VerticalLayout } from "./Layout";
import { Widget } from "./Widget";
import { WEdit } from "./WEdit";






if( window )
{
    let W = (window as any).W || {};
    W.Rect = Rect;
    W.Display = Display;
    W.VerticalLayout = VerticalLayout;
    W.Widget = Widget;
    W.WEdit = WEdit;
    (window as any).W = W;
}


