run-build:
	npm run bundle:prepare
	npm run bundle:ts
	npm run bundle:parcel
	npm run bundle:cleanup