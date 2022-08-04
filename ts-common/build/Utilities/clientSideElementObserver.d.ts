export declare class ClientSideElementObserver {
    private observableList;
    /**
     * Observes element for changes and invokes callback if change is observed.
     * @param observationId Unique observation id
     * @param element HTML element to be observed
     * @param callback callback function which will have mutated objects as first parameter, observer as the second.
     * @returns Observer object
     */
    observeElement: (observationId: string, element: HTMLElement, callback: MutationCallback) => MutationObserver;
    /**
     * Observes element for changes and invokes callback if change is observed.
     * @param observationId  Unique observation id
     * @param elemId Id of the element to be observed
     * @param callback callback function which will have mutated objects as first parameter, observer as the second.
     */
    observeElementById: (observationId: any, elemId: any, callback: any) => void;
    /**
     * Stops observing the element
     * @param obvId Unique id of the observation
     */
    stopObserving: (obvId: any) => void;
}
