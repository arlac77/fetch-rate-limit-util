/**
 * Creates a new transformer.
 * On match the entry will be assigned new properties as given by propertyDefinitions.
 * @param {Object} propertyDefinitions
 * @param {Matcher} matcher
 * @param {string} name
 * @return {Transformer}
 */
export function createPropertiesTransformer(
  match,
  propertyDefinitions,
  name = "property"
) {
  return {
    name,
    match,
    transform: async entry => Object.create(entry, propertyDefinitions)
  };
}
