export async function initializeStoredValues(defaultValues = {}) {
  const storageArea = globalThis.chrome?.storage?.local;

  if (!storageArea) {
    return defaultValues;
  }

  const storedValues = await storageArea.get(null);
  const missingValues = {};

  for (const [key, value] of Object.entries(defaultValues)) {
    if (!(key in storedValues)) {
      missingValues[key] = value;
    }
  }

  if (Object.keys(missingValues).length > 0) {
    await storageArea.set(missingValues);
  }

  return {
    ...defaultValues,
    ...storedValues,
    ...missingValues,
  };
}