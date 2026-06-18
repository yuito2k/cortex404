import katex from 'katex'

function escapeHtml(str: string) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
}

//export function renderLatexText(text: string): string {
//    if (!text) return ''
//
//    // matches \[ ... \]  or  \( ... \)
//    const pattern = /\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g
//
//    let result = ''
//    let lastIndex = 0
//    let match: RegExpExecArray | null
//
//    while ((match = pattern.exec(text)) !== null) {
//        // plain text before this match
//        result += escapeHtml(text.slice(lastIndex, match.index))
//
//        const isBlock = match[1] !== undefined
//        const expr = (isBlock ? match[1] : match[2]) ?? ''
//
//        try {
//            result += katex.renderToString(expr, {
//                throwOnError: false,
//                displayMode: isBlock
//            })
//        } catch {
//            result += escapeHtml(match[0]) // fallback: show raw if it fails
//        }
//
//        lastIndex = pattern.lastIndex
//    }
//
//    result += escapeHtml(text.slice(lastIndex))
//    return result
//}

export function renderLatexText(text: string): string {
    if (!text) return ''

    const pattern = /\[\[([\s\S]*?)\]\]|<<([\s\S]*?)>>/g

    let result = ''
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = pattern.exec(text)) !== null) {
        result += escapeHtml(text.slice(lastIndex, match.index))

        const isBlock = match[1] !== undefined
        const rawExpr = (isBlock ? match[1] : match[2]) ?? ''
        const expr = rawExpr.replace(/@@/g, '\\')

        try {
            result += katex.renderToString(expr, {
                throwOnError: false,
                //displayMode: isBlock
                displayMode: false
            })
        } catch {
            result += escapeHtml(match[0])
        }

        lastIndex = pattern.lastIndex
    }

    result += escapeHtml(text.slice(lastIndex))
    return result
}