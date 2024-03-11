
type StrStyleName = "FontSize"
interface window {
    LODOP: null | {
        PRINT_INIT: (strPrintTask: string) => true,
        PRINT_INITA: (top?: number, left?: number , width?: number, height?: number, strPrintTask?: string) => true
        SET_PRINTER_INDEX: (index: number) => boolean
        SET_PRINT_STYLE: (strStyleName: StrStyleName, styleValue: string | number) => void
        ADD_PRINT_TEXT: (top: number, left: number, width: number, height: number, strText: string) => boolean
        PRINT: () => string | null,
        GET_PRINTER_COUNT: () => number,
        GET_PRINTER_NAME: (pinterIndex: number) => string
        GET_PAGESIZES_LIST: (pinterIndex: number, separator: string) => string,
        NEWPAGE: () => void,
        SET_PRINT_PAGESIZE: (intOrient: 0|1|2|3, PageWidth?: number, PageHeight?: number, strPageName?: string) =>  void,
        ADD_PRINT_HTM: (top: number, left: number, width: number, height: number, strHTML: string) => void
    };
}
