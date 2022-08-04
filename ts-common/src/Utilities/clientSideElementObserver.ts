const cseObservableList = 'ClientSideElementObservableList';
if (!globalThis[cseObservableList]) {
    globalThis[cseObservableList] = [];
}

export class ClientSideElementObserver {

    private observableList = () => { return globalThis[cseObservableList]; };

    /**
     * Observes element for changes and invokes callback if change is observed.
     * @param observationId Unique observation id
     * @param element HTML element to be observed
     * @param callback callback function which will have mutated objects as first parameter, observer as the second.
     * @returns Observer object
     */
    public observeElement = (observationId: string, element: HTMLElement, callback: MutationCallback) => {

        if (
            this.observableList().length > 0 &&
            this.observableList().filter((x) => x.id == observationId)
                .length == 0
        ) {
            return null;
        }
        let observer = new MutationObserver(callback);

        // observe everything except attributes
        observer.observe(element, {
            childList: true, // observe direct children
            subtree: true, // and lower descendants too
            characterDataOldValue: true, // pass old data to callback
        });

        this.observableList().push({ id: observationId, observer });

        return observer;

    }

    /**
     * Observes element for changes and invokes callback if change is observed.
     * @param observationId  Unique observation id
     * @param elemId Id of the element to be observed
     * @param callback callback function which will have mutated objects as first parameter, observer as the second.
     */
    public observeElementById = (observationId, elemId, callback) => {
        const elem = document.getElementById(elemId);
        this.observeElement(observationId, elem, callback);
    };

/**
 * Stops observing the element
 * @param obvId Unique id of the observation
 */
    public stopObserving = (obvId) => {
        this.observableList()
            .filter((x) => (x.id = obvId))[0]
            .disconnect();
    };

}

