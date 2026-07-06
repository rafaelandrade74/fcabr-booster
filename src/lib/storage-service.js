export default class StorageService {

    static prefix = "fcabr";

    static cache = new Map();

    static buildKey(key) {
        return `${this.prefix}.${key}`;
    }

    static set(key, value) {
        this.cache.set(this.buildKey(key), value);
    }

    static get(key) {
        return this.cache.get(this.buildKey(key));
    }

    static has(key) {
        return this.cache.has(this.buildKey(key));
    }

    static remove(key) {
        this.cache.delete(this.buildKey(key));
    }

    static clear() {
        this.cache.clear();
    }

    static keys() {
        return [...this.cache.keys()];
    }

    static values() {
        return [...this.cache.values()];
    }

    static entries() {
        return [...this.cache.entries()];
    }
}