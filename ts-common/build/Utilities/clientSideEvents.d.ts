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
export declare class MDClientEventHandler {
    get EventHandlerList(): IClientSideEvent[];
    /**
     * Attaches event and bind event handler
     * @param eventName Name of the event , this will be used to call the event.
     * @param eventHandler Method to handle the event. The method is passed data.detail of the event for data transfer across from caller to component where the event is bound.
     * @returns Index of the attached Event in the global event list.
     */
    AttachEvent(eventName: string, eventHandler: (...params: unknown[]) => void, dispatchEvent?: (...params: unknown[]) => void): number;
    /**
     * Dispatches the event bounded by another component.
     * @param eventName Name of the event attached to the target component.
     * @param data Data to be passed to event handler.
     */
    DispatchEvent(eventName: string, ...params: unknown[]): void;
    private ObjectValuesAsArray;
}
