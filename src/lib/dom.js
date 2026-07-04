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
    static wait(predicate, timeout = 10000) {

        return new Promise((resolve, reject) => {

            const element = predicate();

            if (element)
                return resolve(element);

            const observer = new MutationObserver(() => {

                const element = predicate();

                if (element) {
                    observer.disconnect();
                    resolve(element);
                }

            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error("Timeout"));
            }, timeout);

        });

    }

    static $(selector, parent = document) {
        return parent.querySelector(selector);
    }

    static $$(selector, parent = document) {
        return [...parent.querySelectorAll(selector)];
    }

    static byText(selector, text, parent = document) {
        return this.$$(selector, parent)
            .find(el => el.textContent.trim() === text);
    }

    static byTextVisible(selector, text, parent = document) {
        return this.$$(selector, parent)
            .find(el => el.textContent.trim() === text && el.offsetParent !== null);
    }

    static containsText(selector, text, parent = document) {
        return this.$$(selector, parent)
            .find(el => el.textContent.includes(text));
    }

    static closest(element, selector) {
        return element?.closest(selector) ?? null;
    }

    static parent(element, levels = 1) {

        let current = element;

        while (current && levels-- > 0)
            current = current.parentElement;

        return current;
    }

    static exists(selector, parent = document) {
        return !!this.$(selector, parent);
    }

    static allText(selector, parent = document) {
        return this.$$(selector, parent)
            .map(el => el.textContent.trim());
    }

    static attr(selector, attribute, parent = document) {
        return this.$(selector, parent)?.getAttribute(attribute);
    }

    static html(selector, parent = document) {
        return this.$(selector, parent)?.innerHTML;
    }

    static text(selector, parent = document) {
        return this.$(selector, parent)?.textContent.trim();
    }

}