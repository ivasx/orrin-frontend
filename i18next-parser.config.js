export default {
    contextSeparator: '_',
    createOldCatalogs: false,
    defaultNamespace: 'translation',
    lexers: {
        js: ['JsxLexer'],
        jsx: ['JsxLexer'],
        default: ['JsxLexer']
    },
    locales: ['en', 'uk'],
    output: 'src/i18n/$LOCALE.json',
    input: ['src/**/*.{js,jsx}'],
    sort: true,
    keepRemoved: true,
};