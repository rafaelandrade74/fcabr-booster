export default class DOM {

    static async waitUntil(fn, timeout = 10000, interval = 100) {

        const start = performance.now();

        while (performance.now() - start < timeout) {

            const result = fn();

            if (result)
                return result;

            await new Promise(resolve => setTimeout(resolve, interval));
        }

        throw new Error("Timeout");
    }

    static $$(selector, parent = document) {
        return [...parent.querySelectorAll(selector)];
    }

    static byTextVisible(selector, text, parent = document) {
        return this.$$(selector, parent)
            .find(el => el.textContent.trim() === text && el.offsetParent !== null);
    }

}
