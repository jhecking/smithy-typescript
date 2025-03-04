import { HttpRequest } from "@smithy/types";
import { escapeUri } from "@smithy/util-uri-escape";

import { SIGNATURE_HEADER } from "./constants";

/**
 * @private
 */
export const getCanonicalQuery = ({ query = {} }: HttpRequest): string => {
  const keys: Array<string> = [];
  const serialized: Record<string, string> = {};
  for (const key of Object.keys(query).sort()) {
    if (key.toLowerCase() === SIGNATURE_HEADER) {
      continue;
    }

    keys.push(key);
    const value = query[key];
    if (typeof value === "string") {
      serialized[key] = `${escapeUri(key)}=${escapeUri(value)}`;
    } else if (Array.isArray(value)) {
      serialized[key] = value
        .slice(0)
        .sort()
        .reduce(
          (encoded: Array<string>, value: string) => encoded.concat([`${escapeUri(key)}=${escapeUri(value)}`]),
          []
        )
        .join("&");
    }
  }

  return keys
    .map((key) => serialized[key])
    .filter((serialized) => serialized) // omit any falsy values
    .join("&");
};
