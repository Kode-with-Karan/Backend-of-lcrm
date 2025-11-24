const fs = require("fs");
const path = require("path");

function isExpressRouter(maybeRouter) {
	return (
		maybeRouter &&
		typeof maybeRouter === "function" &&
		typeof maybeRouter.use === "function" &&
		typeof maybeRouter.handle === "function"
	);
}

function walkDirSync(dirPath) {
	const entries = fs.readdirSync(dirPath, { withFileTypes: true });
	const results = [];
	for (const entry of entries) {
		if (entry.name.startsWith(".")) continue;
		const fullPath = path.join(dirPath, entry.name);
		if (entry.isDirectory()) {
			results.push(...walkDirSync(fullPath));
		} else if (entry.isFile() && entry.name.endsWith(".js")) {
			results.push(fullPath);
		}
	}
	return results;
}

/**
 * Auto-load and mount any route files that export an Express router with a basePath.
 *
 * To make a route auto-mounted, set a basePath on the exported router:
 *   const router = require('express').Router();
 *   router.basePath = '/api/example';
 *   module.exports = router;
 *
 * You can also set basePath as a property on module.exports:
 *   module.exports = router;
 *   module.exports.basePath = '/api/example';
 */
function autoLoadRoutes(app, routesRootDir) {
	const files = walkDirSync(routesRootDir);
	for (const file of files) {
		try {
			const exported = require(file);
			const router = exported && exported.default ? exported.default : exported;
			if (!isExpressRouter(router)) continue;

			const basePath = router.basePath || exported.basePath;
			if (!basePath || typeof basePath !== "string") continue;

			app.use(basePath, router);
			// eslint-disable-next-line no-console
			console.log(`Auto-mounted routes from ${path.relative(routesRootDir, file)} at ${basePath}`);
		} catch (err) {
			// eslint-disable-next-line no-console
			console.warn(`Failed to auto-mount routes from ${file}: ${err.message}`);
		}
	}
}

module.exports = { autoLoadRoutes };


