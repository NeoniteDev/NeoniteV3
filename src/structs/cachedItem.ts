export default class CachedItem<T> {
    constructor(data: T, expires: Date) {
        this.data = data;
        this.expires = expires;
    }

    data: T
    expires: Date

    get() {
        return this.data;
    }

    isExpired() {
        return this.expires.getTime() >= Date.now();
    }
}