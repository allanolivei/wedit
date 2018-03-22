import { RowLayout, Layout, VerticalLayout } from "./Layout";
import { Widget } from "./Widget";
import { Display } from "./Display";

// serializacao simples usada na revista
export class SerializationGrid
{
    public static serialize( layouts:RowLayout[] ):object
    {
        let result:object = {};
        let widgets:any[] = [];

        for( let l:number = 0 ; l < layouts.length ; l++ )
        {
            let layout: RowLayout = layouts[l] as RowLayout;

            for (let c: number = 0; c < layout.children.length ; c++ )
            {
                let column:Layout = layout.children[c] as Layout;

                for (let w: number = 0; w < column.children.length ; w++ )
                {
                    let widget:Widget = column.children[w] as Widget;

                    widgets.push({
                        "index": w,
                        "column": layout.getColumnByDisplay(column),
                        "size": layout.getSizeByDisplay(column),
                        "row": l,
                        "type": widget.templateName,
                        "content":
                            // widget.templateName === 'img' ?
                            // widget.getData('filename') :
                            widget.getContainerData(widget.templateName) });
                }
            }
        }

        //return JSON.stringify(widgets);
        return widgets;
    }

    public static deserialize( dataStr:any ):RowLayout[]
    {
        let widgetsData:any = typeof(dataStr) === "string" ? JSON.parse(dataStr) : dataStr;
        let rows:RowLayout[] = [];

        for (let i:number = 0; i < widgetsData.length ; i++ )
        {
            // get widget data
            let wdata:any = widgetsData[i];

            // find row
            while( rows.length <= wdata.row ) rows.push( new RowLayout("div") );
            let row:RowLayout = rows[wdata.row];

            // find column
            let column: VerticalLayout = null;
            for (let c: number = 0 ; c < row.children.length ; c++ )
            {
                if (row.getColumnByDisplay(row.children[c]) === wdata.column )
                    column = row.children[c] as VerticalLayout;
            }

            if (column)
                row.setSize(column, wdata.size);
            else
                column = row.addLayoutByColumnWorldSpace(wdata.column, wdata.size);

            // create data of widget
            let data:any = {};
            data[wdata.type] = wdata.content;

            // create widget
            let widget:Widget = new Widget({
                "template": wdata.type,
                "data": data });
            column.addChild(widget, wdata.index);
        }

        return rows;
    }
}
