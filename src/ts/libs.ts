const [dojoRuntime] = await globalThis.importDojoLibs(['dojo', 'dojo/fx', 'dojo/_base/fx']);
const [CounterClass, StockClass, PopinDialogClass] = await globalThis.importDojoLibs([
    'ebg/counter', 'ebg/stock', 'ebg/popindialog',
]) as [new () => Counter, new () => Stock, new () => PopinDialog];
const BgaZoom: typeof globalThis.BgaZoom = await globalThis.importEsmLib('bga-zoom', '1.x');

const dojo: Omit<Dojo, 'connect'> & {
    connect(node: HTMLElement | DojoAnimation, eventType: string, callback: Function): unknown;
} = dojoRuntime;
export { dojo, CounterClass, StockClass, PopinDialogClass, BgaZoom };
