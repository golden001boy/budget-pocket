/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // jest-expo's own default transformIgnorePatterns assumes a classic flat
  // node_modules layout (`node_modules/<pkg>/...`) with forward slashes.
  // Two things break it on this project: (1) pnpm nests transitive RN/Expo
  // packages at `node_modules/.pnpm/<pkg>@<version>/node_modules/<pkg>/...`
  // — `.test()` matches at the *first* "node_modules/" boundary (right
  // before ".pnpm"), which isn't in the allowed list, so the file is
  // wrongly treated as already-compiled and its Flow-typed source reaches
  // the parser as-is; (2) this runs on Windows, where path separators are
  // backslashes, which the original all-forward-slash pattern never
  // matches at all. Fix: treat ".pnpm/" itself as an allowed name at that
  // outer boundary — this doesn't change the verdict there (packages
  // still need to earn "don't ignore" at the *inner*, real boundary right
  // before the actual file), it just stops the outer boundary from ever
  // being the one that decides. Either separator is matched throughout.
  transformIgnorePatterns: [
    'node_modules[\\\\/](?!((jest-)?react-native|@react-native(-community)?|@react-native[\\\\/].*' +
    '|expo(nent)?|@expo(nent)?[\\\\/].*|@expo-google-fonts[\\\\/].*' +
    '|react-navigation|@react-navigation[\\\\/].*|@unimodules[\\\\/].*' +
    '|unimodules|sentry-expo|native-base|react-native-svg|\\.pnpm[\\\\/]))',
  ],
};
