/**
 * PageSnapshot — armazenamento em memória de snapshots do estado original do DOM.
 *
 * Permite que qualquer feature capture o estado de elementos antes de modificá-los
 * e restaure esses valores posteriormente, sem consultar storage externo.
 *
 * O snapshot é capturado apenas uma vez por chave durante a vida do Content Script.
 */
const PageSnapshot = (() => {
    /** @type {Map<string, unknown>} */
    const _store = new Map();

    return {
        /** @param {string} key */
        has(key) {
            return _store.has(key);
        },

        /**
         * Armazena um snapshot para a chave. No-op se a chave já existir.
         * @param {string} key
         * @param {unknown} data
         */
        capture(key, data) {
            if (_store.has(key)) return;
            _store.set(key, data);
        },

        /**
         * @param {string} key
         * @returns {unknown | null}
         */
        get(key) {
            return _store.get(key) ?? null;
        },
    };
})();

export default PageSnapshot;
