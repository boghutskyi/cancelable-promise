class CancelablePromise extends Promise{
    constructor(executor) {
        super(executor)
        this.isCanceled = false;
    }
    then(onFulfilled, onRejected) {
        if (!onFulfilled) {
            return new CancelablePromise(() => {})
        }
        if (typeof onFulfilled !== 'function') {
            throw new Error('then must get a function');
        }
        return new CancelablePromise(onFulfilled)
    }
    cancel() {
        this.isCanceled = true;
    }
}

module.exports = CancelablePromise;
