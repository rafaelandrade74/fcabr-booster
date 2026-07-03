export async function initializeStoredValues(defaultValues = {}) {
  if (!globalThis.chrome?.storage?.local) {
    return defaultValues;
  }

  const storedValues = await chrome.storage.local.get(null);
  const missingValues = {};

  for (const [key, value] of Object.entries(defaultValues)) {
    if (!(key in storedValues)) {
      missingValues[key] = value;
    }
  }

  if (Object.keys(missingValues).length > 0) {
    await chrome.storage.local.set(missingValues);
  }

  return {
    ...defaultValues,
    ...storedValues,
    ...missingValues,
  };
}