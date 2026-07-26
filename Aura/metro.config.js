const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname)

const {tranformer , resolver } = config;

config.transformer = {
    ...tranformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg']
}

config.resolver.sourceExts.push('mjs')
 
module.exports = withNativeWind(config, { input: './global.css' })