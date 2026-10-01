/** Tiny dot/bracket path helpers, e.g. "work.projects.0.title". */

export function getByPath(obj: any, path: string): any {
  return path
    .split(".")
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

/** Immutably set a value at a dot path. Returns a new object. */
export function setByPath<T>(obj: T, path: string, value: any): T {
  const keys = path.split(".");
  const clone = Array.isArray(obj) ? ([...(obj as any)] as any) : { ...(obj as any) };
  let cursor: any = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const next = cursor[k];
    cursor[k] = Array.isArray(next) ? [...next] : { ...next };
    cursor = cursor[k];
  }
  cursor[keys[keys.length - 1]] = value;
  return clone;
}

/** Deep-merge `patch` over `base`, keeping base values when the patch is missing/blank. */
export function deepFill<T>(base: T, patch: any): T {
  if (patch == null) return base;

  if (Array.isArray(base)) {
    if (!Array.isArray(patch)) return base;
    // Use the patch's length, but fill each item against the first base item
    // so AI-returned arrays of a different length still get complete shapes.
    const proto = (base as any[])[0];
    return patch.map((item, i) =>
      deepFill((base as any[])[i] ?? proto ?? item, item)
    ) as any;
  }

  if (typeof base === "object" && base !== null) {
    if (typeof patch !== "object" || patch === null) return base;
    const out: any = { ...(base as any) };
    for (const key of Object.keys(base as any)) {
      if (key in patch) out[key] = deepFill((base as any)[key], patch[key]);
    }
    return out;
  }

  if (typeof patch === "string") {
    const trimmed = patch.trim();
    return (trimmed.length ? trimmed : base) as any;
  }
  if (typeof patch === "number" || typeof patch === "boolean") return String(patch) as any;
  return base;
}
