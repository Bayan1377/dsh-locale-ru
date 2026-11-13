/**
 * Host half of the Russian language pack.
 *
 * The pack contributes browser copy only: every translation is registered by the
 * client half through `ctx.locale`. The host entry exists so the Loader has a row
 * to mount and the client module system has a package to publish a bundle for.
 */

/** Loader display name. */
export const name = 'locale-ru'

/** No host service or configuration is required. */
export function apply() {}
