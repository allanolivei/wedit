import { Selectable } from "./Selectable";
import { Ghost } from "./Selection";
import { Rect, Vec2 } from "./Utils";

abstract class BasicEvent
{

}

export class DragEvent extends BasicEvent
{
    public elements: Selectable[] = [];    // elementos selecionados
    public startRect:Rect[] = [];          // area inicial em que foram selecionados
    public ghost: Ghost[] = [];            // representacao visual dos elementos selecionados
    public pointer: Vec2 = new Vec2;       // posicao atual do mouse
    public startPointer: Vec2 = new Vec2;  // posicao inicial registrada quando o usuario pressiona o mouse
    public offset: Vec2 = new Vec2;        // offset relative bounds of all elements

    public clear():void
    {
        this.elements = [];
        for (let i = this.ghost.length-1 ; i >= 0 ; i-- )
            Ghost.Recycle( this.ghost.pop() );
    }
}
