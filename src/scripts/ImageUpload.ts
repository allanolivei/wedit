


export class ImageUpload
{

    public inputs: HTMLInputElement[] = [];
    public files: File[] = [];
    public images: string[] = [];

    private waitingLoadAmount: number = 0;
    private input:HTMLInputElement;
    private wrapper:HTMLElement;

    constructor(wrapper:HTMLElement)
    {
        this.wrapper = wrapper;
        this.createInput();
    }

    private createInput():void
    {
        if( this.input ) this.input.remove();

        this.input = document.createElement("input");
        this.input.setAttribute("type", "file");
        this.input.setAttribute("name", "images[]");
        this.input.setAttribute("multiple", "multiple");
        this.input.setAttribute("accept", "image/*");
        this.input.addEventListener("change", this.inputChangeHandler.bind(this));

        this.inputs.push(this.input);

        this.wrapper.appendChild(this.input);
    }

    private inputChangeHandler(event:Event):void
    {
        this.createInput();
        this.loadFilesByInput(event.currentTarget as HTMLInputElement);
    }

    private loadFilesByInput(input:HTMLInputElement):void
    {
        for( let i:number = 0 ; i < input.files.length ; i++ )
        {
            this.waitingLoadAmount++;

            let file:FileReader = new FileReader();
            file.onload = this.fileReaderLoadComplete.bind(this);
            file.onerror = this.fileReaderLoadError.bind(this);
            file.readAsDataURL(input.files[i]);

            this.files.push(input.files[i]);
        }
    }

    private fileReaderLoadComplete(event:ProgressEvent):void
    {
        let result = (event.currentTarget as FileReader).result;
        this.images.push(result);
        this.wrapper.dispatchEvent(new CustomEvent('loadFile', { detail: result }));
        console.log("LOAD FILE: ", this.waitingLoadAmount);
        if ( --this.waitingLoadAmount <= 0) this.fileReaderComplete();
    }

    private fileReaderLoadError(event:ErrorEvent): void
    {
        console.log("LOAD FILE: ", this.waitingLoadAmount);
        if ( --this.waitingLoadAmount <= 0 ) this.fileReaderComplete();
    }

    private fileReaderComplete():void
    {
        console.log("LOAD COMPLETE");
        this.wrapper.dispatchEvent( new CustomEvent('loadComplete', {detail: this}) );
    }
}


(window as any).ImageUpload = ImageUpload;
