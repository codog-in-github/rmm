
type StrStyleName = "FontSize"
interface window {
    LODOP: null | {
        PRINT_INIT: (strPrintTask: string) => true,
        PRINT_INITA: (top?: number, left?: number , width?: number, height?: number, strPrintTask?: string) => true
        SET_PRINTER_INDEX: (index: number) => boolean
        SET_PRINT_STYLE: (strStyleName: StrStyleName, styleValue: string | number) => void
        ADD_PRINT_TEXT: (top: number, left: number, width: number, height: number, strText: string) => boolean
        PRINT: () => string | null
    };
}