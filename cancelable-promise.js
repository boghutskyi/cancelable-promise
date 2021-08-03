class CancelablePromise {
    constructor(executor) {
        if (typeof executor !== 'function') {
            throw new Error('Executor must be a function');
        }
        this.$state = 'PENDING';
        this.$chained = [];
        this.isCanceled = false;

        const resolve = res => {
            if (this.$state !== 'PENDING') {
                return;
            }

            if (res != null && typeof res.then === 'function') {
                return res.then(resolve, reject);
            }

            this.$state = 'FULFILLED';
            this.$internalValue = res;
            for (const { onFulfilled, onRejected } of this.$chained) {
                if (this.isCanceled) {
                    onRejected(res)
                }
                onFulfilled(0)
            }
            return res;
        };
        const reject = err => {
            if (this.$state !== 'PENDING') {
                return;
            }
            this.$state = 'REJECTED';
            this.$internalValue = err;
            for (const { onFulfilled } of this.$chained) {
                onFulfilled(err);
            }
            return err;
        };
        try {
            executor(resolve, reject);
        } catch (err) {
            reject(err);
        }
    }

    then(onFulfilled, onRejected) {
        if (onFulfilled && typeof onFulfilled !== 'function') {
            throw new Error('then must get a function');
        }
        return new CancelablePromise((resolve, reject) => {

            const _onFulfilled = res => {
                try {
                    resolve(onFulfilled(res));
                } catch (err) {
                    reject(err);
                }
            };
            const _onRejected = err => {
                try {
                    reject(onRejected(err));
                } catch (_err) {
                    reject(_err);
                }
            };
            if (typeof onFulfilled !== 'function') {
                throw new Error('then() must get correct argument');
            }
            if (this.$state === 'FULFILLED') {
                _onFulfilled(this.$internalValue);
            }
            if (this.$state === 'REJECTED') {
                _onFulfilled(this.$internalValue);
            }
            this.$chained.push({
                onFulfilled: _onFulfilled,
                onRejected: _onRejected,
            });
        });
    }

    cancel() {
        this.isCanceled = true;
    }
}

module.exports = CancelablePromise;
