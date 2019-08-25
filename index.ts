import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class MultiTag implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _inputElement: HTMLInputElement;
    private _containerBox: HTMLDivElement;
    private _innerContainer: HTMLDivElement;
    private _tagElement: HTMLDivElement;
    private _tagContent: HTMLDivElement;
    private _tagClose: HTMLAnchorElement;
    private _taggedValues: string[];
    private _context: ComponentFramework.Context<IInputs>;
    private _currentValues: string;
    private _tagValueFieldName: string;
    private _notifyOutputChanged: () => void;

    constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='starndard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
        this._context = context;
        this._notifyOutputChanged = notifyOutputChanged;
        // @ts-ignore         
        this._tagValueFieldName = this._context.parameters.TagValue.attributes.LogicalName;
        // @ts-ignore 
        this._currentValues = Xrm.Page.getAttribute(this._tagValueFieldName).getValue();
        this._containerBox = document.createElement("div");
        this._containerBox.setAttribute("class", "container");
        this._innerContainer = document.createElement("div");
        this._innerContainer.setAttribute("class", "innerDiv");
        this._inputElement = document.createElement("input");
        this._inputElement.setAttribute("id", "inputTag");
        this._inputElement.setAttribute("type", "text");
        this._inputElement.addEventListener("keypress", this.onKeyPress.bind(this));
        if (!this._currentValues) {
            this._taggedValues = [];
            this._innerContainer.classList.add("hideBlock");
        }
        else {
            this._innerContainer.classList.add("displayBlock");
            this._taggedValues = this._currentValues.split(", ");
            this.loadTags();
        }
        this._containerBox.appendChild(this._innerContainer);
        this._containerBox.appendChild(this._inputElement);
        container.appendChild(this._containerBox);
    }
    /**
	 * Display the existing values as Tags on load of form
	 */
    private loadTags(): void {
        for (var i = 0; i < this._taggedValues.length; i++) {
            this._tagElement = document.createElement("div");
            this._tagElement.setAttribute("class", "customTag");
            this._tagContent = document.createElement("div");
            this._tagContent.innerHTML = this._taggedValues[i];
            this._tagClose = document.createElement("a");
            this._tagClose.innerHTML = "X";
            this._tagClose.addEventListener("click", this.onClickOfClose.bind(this));
            this._tagClose.setAttribute("class", "closeTag");
            this._tagElement.append(this._tagContent);
            this._tagElement.appendChild(this._tagClose);
            this._innerContainer.appendChild(this._tagElement);
        }
    }
    /**
	 * Function called On key press
	 */
    private onKeyPress(e: any): void {
        if (e.key == "Enter") {
            if (this._inputElement.value) {
                if (!this._innerContainer.classList.contains("displayBlock") && this._innerContainer.classList.contains("hideBlock")) {
                    this._innerContainer.classList.add("displayBlock");
                    this._innerContainer.classList.remove("hideBlock");
                }
                this._taggedValues.push(this._inputElement.value);
                this._tagElement = document.createElement("div");
                this._tagElement.setAttribute("class", "customTag");
                this._tagContent = document.createElement("div");
                this._tagContent.setAttribute("class", "tagContent");
                this._tagContent.innerHTML = this._inputElement.value;
                this._tagClose = document.createElement("a");
                this._tagClose.innerHTML = "X";
                this._tagClose.addEventListener("click", this.onClickOfClose.bind(this));
                this._tagClose.setAttribute("class", "closeTag");
                this._tagElement.append(this._tagContent);
                this._tagElement.appendChild(this._tagClose);
                this._innerContainer.appendChild(this._tagElement);
                this._inputElement.value = "";
                this._notifyOutputChanged();
            }
        }
        else
            return;
    }
     /**
	 * Function called On click of remove Tag
	 */
    private onClickOfClose(e: any): void {
        this._taggedValues.splice(this._taggedValues.indexOf(e.target.previousSibling.textContent), 1);
        e.target.parentElement.remove();
        if (this._taggedValues.length && this._innerContainer.classList.contains("hideBlock") && !this._innerContainer.classList.contains("displayBlock")) {
            this._innerContainer.classList.remove("hideBlock");
            this._innerContainer.classList.add("displayBlock");
        }
        else if (!this._taggedValues.length && !this._innerContainer.classList.contains("hideBlock") && this._innerContainer.classList.contains("displayBlock")) {
            this._innerContainer.classList.remove("displayBlock");
            this._innerContainer.classList.add("hideBlock");
        }
        this._notifyOutputChanged();
    }
    /**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // @ts-ignore 
        Xrm.Page.getAttribute(this._tagValueFieldName).setValue(this._taggedValues.join(", "));
    }

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
    public getOutputs(): IOutputs {
        var result = { TagValue: this._taggedValues.join(", ") };
        return result;
    }

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
    public destroy(): void {
        this._inputElement.removeEventListener("keypress", this.onKeyPress);
        this._tagClose.removeEventListener("click", this.onClickOfClose);
    }
}