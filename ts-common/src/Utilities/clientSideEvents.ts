/* eslint-disable */
//Global declaration of the event list to avoid duplicate entries of the event.
const myDocsRegistryName = 'ClientEventRegistry';
if (!globalThis[myDocsRegistryName]) {
    globalThis[myDocsRegistryName] = [];
}

/**
* Event Interface
*/
export interface IClientSideEvent {
    name: string;
    eventHandler: (...params: unknown[]) => void;
    dispatchEvent?: (...params: unknown[]) => void;
    type?: string;
    id?: number;
    sequence?: number;
}


/**
 * Enables accessing cross component events to decouple components.
 * Provides AttachEvent and Dispatch Event methods for event processing.
 */
export class MDClientEventHandler {
    public get EventHandlerList(): IClientSideEvent[] {
        return globalThis[myDocsRegistryName];
    }

    /**
     * Attaches event and bind event handler
     * @param eventName Name of the event , this will be used to call the event.
     * @param eventHandler Method to handle the event. The method is passed data.detail of the event for data transfer across from caller to component where the event is bound.
     * @returns Index of the attached Event in the global event list.
     */
    public AttachEvent(
        eventName: string,
        eventHandler: (...params: unknown[]) => void,
        dispatchEvent?: (...params: unknown[]) => void
    ): number {
        let eventIndex = -1;
        const event: IClientSideEvent = {
            name: eventName,
            eventHandler: eventHandler,
            dispatchEvent: dispatchEvent,
        };

        if (
            globalThis[myDocsRegistryName].filter((x) => x.name == eventName)
                .length == 0
        ) {
            //attach the event
            document.addEventListener(eventName, (data: CustomEventInit) => {
                eventHandler(...this.ObjectValuesAsArray(data.detail));
            });
            //assign the index
            eventIndex = globalThis[myDocsRegistryName].push(event) - 1;
        }
        return eventIndex;
    }




    /**
     * Dispatches the event bounded by another component.
     * @param eventName Name of the event attached to the target component.
     * @param data Data to be passed to event handler.
     */
    //public DispatchEvent(eventName: string, data?: {}) {
    public DispatchEvent(eventName: string, ...params: unknown[]) {
        //const param: {} = data ? data : {};

        document.dispatchEvent(
            new CustomEvent(eventName, {
                detail: { ...params },
            })
        );
    }


    private ObjectValuesAsArray(object: Object) {
        const arr: any[] = [];
        for (const item in object) {
            arr.push(object[item]);
        }
        return arr;
    }
}

