run-build:
	npm run bundle:prepare
	npm run bundle:ts
	npm run bundle:node_modules
	npm run bundle:parcel
	npm run bundle:cleanup