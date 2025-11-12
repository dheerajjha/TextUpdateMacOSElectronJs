const { signAsync } = require('@electron/osx-sign');

exports.default = async function(configuration) {
  console.log('Custom signing with configuration:', configuration);

  return await signAsync({
    app: configuration.path,
    platform: configuration.platform,
    type: 'distribution',
    identity: 'Apple Distribution: Ranju Jha (83C822A4J3)',
    provisioningProfile: configuration.provisioningProfile,
    entitlements: 'build/entitlements.mac.plist',
    'entitlements-inherit': 'build/entitlements.mac.plist',
    preAutoEntitlements: false,
    optionsForFile: () => {
      return {
        entitlements: 'build/entitlements.mac.plist'
      };
    }
  });
};
