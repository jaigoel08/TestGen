declare module 'node-apk-parser' {
  const ApkReader: {
    readFile: (path: string) => {
      readManifestSync: () => any;
    };
  };
  export default ApkReader;
}
