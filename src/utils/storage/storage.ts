/**
 * Thin async wrapper around the browser's localStorage.
 *
 * Previously backed by the abandoned `AsyncStorage` shim (last published 2016).
 * The API is kept promise-based so existing `await load(...)` call sites are
 * unchanged; localStorage itself is synchronous.
 */

/**
 * Loads a string from storage.
 *
 * @param key The key to fetch.
 */
export async function loadString(key: string): Promise<string | null> {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/**
 * Saves a string to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export async function saveString(key: string, value: string): Promise<boolean> {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

/**
 * Loads something from storage and runs it thru JSON.parse.
 *
 * @param key The key to fetch.
 */
export async function load(key: string): Promise<any | null> {
  try {
    const almostThere = localStorage.getItem(key)
    return almostThere != null ? JSON.parse(almostThere) : null
  } catch {
    return null
  }
}

/**
 * Saves an object to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export async function save(key: string, value: any): Promise<boolean> {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/**
 * Removes something from storage.
 *
 * @param key The key to kill.
 */
export async function remove(key: string): Promise<void> {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

/**
 * Burn it all to the ground.
 */
export async function clear(): Promise<void> {
  try {
    localStorage.clear()
  } catch {
    // ignore
  }
}
