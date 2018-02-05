import { Rect } from "./Utils";
import { Display } from "./Display";
import { Selectable } from "./Selectable";
import { VerticalLayout } from "./Layout";
import { Widget } from "./Widget";
import { WEdit } from "./WEdit";
import { SelectableGroup } from "./Selection";



/*



---Display
------Selectable
---------Layout
---------Widget
------------WEdit



*/


if( window )
{
    let W = (window as any).W || {};

    // utils
    W.Rect = Rect;
    W.SelectableGroup = SelectableGroup;

    // main hierarchy
    W.Display = Display;
    W.Selectable = Selectable;
    W.VerticalLayout = VerticalLayout;
    W.Widget = Widget;
    W.WEdit = WEdit;

    (window as any).W = W;
}


