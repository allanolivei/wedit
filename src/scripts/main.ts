import { Rect } from "./Utils";
import { Display } from "./Display";
import { Selectable } from "./Selectable";
import { VerticalLayout, RowLayout } from "./Layout";
import { Widget } from "./Widget";
import { WEdit } from "./WEdit";
import { SelectableGroup } from "./Selection";
import { SheetRules } from "./Sheet";
import { SerializationGrid } from "./Serialization";



/*



---Display
------Selectable
---------Layout
---------Widget
------------WEdit

Attributos especiais
data-drag: objetos selectables podem controlar se podem ser arrastaveis atraveis desse atributo
*/


if( window )
{
    let W = (window as any).W || {};

    // utils
    W.Rect = Rect;
    W.SelectableGroup = SelectableGroup;
    W.SheetRules = SheetRules;

    // main hierarchy
    W.Display = Display;
    W.Selectable = Selectable;
    W.VerticalLayout = VerticalLayout;
    W.RowLayout = RowLayout;
    W.Widget = Widget;
    W.WEdit = WEdit;

    // serialization
    W.SerializationGrid = SerializationGrid;

    (window as any).W = W;
}


