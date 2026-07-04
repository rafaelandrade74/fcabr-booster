(() => {

    const originalFetch = window.fetch.bind(window);

    window.fetch = async (...args) => {

        const response = await originalFetch(...args);

        const url =
            typeof args[0] === "string"
                ? args[0]
                : args[0]?.url ?? "";

        if (!url.includes("/api/")) {
            return response;
        }

        const clone = response.clone();

        clone.json().then(data => {

            window.postMessage({
                source: "FCABR_EXTENSION",
                url: url,
                data
            });

        });

        return response;
    };

})();