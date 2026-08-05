// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import 'resize-observer-polyfill/dist/ResizeObserver.global';

global.window._env_ = {
    DEFAULT_FAVICON: "favicon.ico",
    DEFAULT_FONT_URL: "",
    DEFAULT_THEME: "purple_theme",
    DEFAULT_TITLE: "Inji Web Test",
    DEFAULT_LANG: 'en',
    MIMOTO_URL: 'https://mimoto.inji.io',
    IGNORED_ISSUER_IDS: "",
};

jest.mock('react-pdf', () => ({
    pdfjs: {
        GlobalWorkerOptions: { workerSrc: '' },
        version: 'mock-version'
    }
}));
jest.mock('pdfjs-dist', () => ({
    GlobalWorkerOptions: {workerSrc: ''},
    version: 'mock-version'
}));