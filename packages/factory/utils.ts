/**
 * Generate a random ID
 *
 * @returns A random string
 */
export const randomId = (length = 24) => {
  let result = '';
  while (result.length < length) {
    result += Math.random().toString(36).substring(2);
  }
  return result.substring(0, length);
};
