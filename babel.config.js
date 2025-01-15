module.exports = function (api) {
	api.cache(true);
	return {
		// presets: ['babel-preset-expo'],
		presets: ['@babel/preset-react', '@babel/preset-env'],
		plugins: [
			[
				'babel-plugin-root-import',
				{
					rootPathPrefix: '~/',
					rootPathSuffix: './app',
				},
			],
		],
	};
};
