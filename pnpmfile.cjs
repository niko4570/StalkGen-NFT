// pnpmfile.cjs - pnpm specific configuration
// This file is used to customize pnpm behavior
// https://pnpm.io/pnpmfile

/**
 * Hook for filtering package.json files before installing dependencies
 * @param {Object} pkg - Package.json content
 * @param {Object} context - Context object
 * @returns {Object} Modified package.json content
 */
export function filterPackage(pkg, context) {
  // Ignore unsafe-perm field from bigint-buffer package to suppress warning
  if (pkg.name === 'bigint-buffer') {
    // Remove the deprecated unsafe-perm field that causes npm warnings
    if (pkg.scripts) {
      // No need to modify scripts, the warning comes from npm config, not package.json
    }
  }
  return pkg;
}

/**
 * Hook for modifying resolution of dependencies
 * @param {Object} resolution - Resolution object
 * @returns {Object} Modified resolution
 */
export function readPackage(resolution) {
  // This hook can be used to modify package.json during installation
  // We don't need it for this specific issue, but it's available if needed
  return resolution;
}
