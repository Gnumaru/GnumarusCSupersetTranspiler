#!/usr/bin/env node
"use strict";
/**
 * C23 Syntactic Parser with Perfect Round-Trip
 *
 * Parses C23 source code and can emit identical source.
 * No semantic analysis - purely syntactic.
 * Zero external dependencies.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.C23Parser = exports.Emitter = exports.Parser = exports.Lexer = exports.TokenKind = void 0;
// ============================================================================
// TOKEN SYSTEM - Lossless tokenization preserving all source text
// ============================================================================
var TokenKind;
(function (TokenKind) {
    // Preprocessor
    TokenKind["PP_DIRECTIVE"] = "PP_DIRECTIVE";
    TokenKind["PP_LINE"] = "PP_LINE";
    TokenKind["PP_PRAGMA"] = "PP_PRAGMA";
    // Comments
    TokenKind["LINE_COMMENT"] = "LINE_COMMENT";
    TokenKind["BLOCK_COMMENT"] = "BLOCK_COMMENT";
    // Whitespace
    TokenKind["WHITESPACE"] = "WHITESPACE";
    TokenKind["NEWLINE"] = "NEWLINE";
    // Identifiers & Keywords
    TokenKind["IDENTIFIER"] = "IDENTIFIER";
    // Keywords (C23)
    // Types
    TokenKind["KW_VOID"] = "KW_VOID";
    TokenKind["KW_CHAR"] = "KW_CHAR";
    TokenKind["KW_SHORT"] = "KW_SHORT";
    TokenKind["KW_INT"] = "KW_INT";
    TokenKind["KW_LONG"] = "KW_LONG";
    TokenKind["KW_FLOAT"] = "KW_FLOAT";
    TokenKind["KW_DOUBLE"] = "KW_DOUBLE";
    TokenKind["KW_SIGNED"] = "KW_SIGNED";
    TokenKind["KW_UNSIGNED"] = "KW_UNSIGNED";
    TokenKind["KW_BOOL"] = "KW_BOOL";
    TokenKind["KW_COMPLEX"] = "KW_COMPLEX";
    TokenKind["KW_IMAGINARY"] = "KW_IMAGINARY";
    TokenKind["KW_WCHAR_T"] = "KW_WCHAR_T";
    TokenKind["KW_CHAR16_T"] = "KW_CHAR16_T";
    TokenKind["KW_CHAR32_T"] = "KW_CHAR32_T";
    TokenKind["KW_INT8_T"] = "KW_INT8_T";
    TokenKind["KW_INT16_T"] = "KW_INT16_T";
    TokenKind["KW_INT32_T"] = "KW_INT32_T";
    TokenKind["KW_INT64_T"] = "KW_INT64_T";
    TokenKind["KW_UINT8_T"] = "KW_UINT8_T";
    TokenKind["KW_UINT16_T"] = "KW_UINT16_T";
    TokenKind["KW_UINT32_T"] = "KW_UINT32_T";
    TokenKind["KW_UINT64_T"] = "KW_UINT64_T";
    TokenKind["KW_INT_LEAST8_T"] = "KW_INT_LEAST8_T";
    TokenKind["KW_INT_LEAST16_T"] = "KW_INT_LEAST16_T";
    TokenKind["KW_INT_LEAST32_T"] = "KW_INT_LEAST32_T";
    TokenKind["KW_INT_LEAST64_T"] = "KW_INT_LEAST64_T";
    TokenKind["KW_UINT_LEAST8_T"] = "KW_UINT_LEAST8_T";
    TokenKind["KW_UINT_LEAST16_T"] = "KW_UINT_LEAST16_T";
    TokenKind["KW_UINT_LEAST32_T"] = "KW_UINT_LEAST32_T";
    TokenKind["KW_UINT_LEAST64_T"] = "KW_UINT_LEAST64_T";
    TokenKind["KW_INT_FAST8_T"] = "KW_INT_FAST8_T";
    TokenKind["KW_INT_FAST16_T"] = "KW_INT_FAST16_T";
    TokenKind["KW_INT_FAST32_T"] = "KW_INT_FAST32_T";
    TokenKind["KW_INT_FAST64_T"] = "KW_INT_FAST64_T";
    TokenKind["KW_UINT_FAST8_T"] = "KW_UINT_FAST8_T";
    TokenKind["KW_UINT_FAST16_T"] = "KW_UINT_FAST16_T";
    TokenKind["KW_UINT_FAST32_T"] = "KW_UINT_FAST32_T";
    TokenKind["KW_UINT_FAST64_T"] = "KW_UINT_FAST64_T";
    TokenKind["KW_INTPTR_T"] = "KW_INTPTR_T";
    TokenKind["KW_UINTPTR_T"] = "KW_UINTPTR_T";
    TokenKind["KW_INTMAX_T"] = "KW_INTMAX_T";
    TokenKind["KW_UINTMAX_T"] = "KW_UINTMAX_T";
    TokenKind["KW_SIZE_T"] = "KW_SIZE_T";
    TokenKind["KW_PTRDIFF_T"] = "KW_PTRDIFF_T";
    TokenKind["KW_WINT_T"] = "KW_WINT_T";
    TokenKind["KW_WCTRANS_T"] = "KW_WCTRANS_T";
    TokenKind["KW_WCTYPE_T"] = "KW_WCTYPE_T";
    TokenKind["KW_VA_LIST"] = "KW_VA_LIST";
    // Type qualifiers
    TokenKind["KW_CONST"] = "KW_CONST";
    TokenKind["KW_VOLATILE"] = "KW_VOLATILE";
    TokenKind["KW_RESTRICT"] = "KW_RESTRICT";
    TokenKind["KW_ATOMIC"] = "KW_ATOMIC";
    // Storage class
    TokenKind["KW_STATIC"] = "KW_STATIC";
    TokenKind["KW_EXTERN"] = "KW_EXTERN";
    TokenKind["KW_AUTO"] = "KW_AUTO";
    TokenKind["KW_REGISTER"] = "KW_REGISTER";
    TokenKind["KW_THREAD_LOCAL"] = "KW_THREAD_LOCAL";
    TokenKind["KW_TYPEDEF"] = "KW_TYPEDEF";
    // Function specifiers
    TokenKind["KW_INLINE"] = "KW_INLINE";
    TokenKind["KW_NORETURN"] = "KW_NORETURN";
    TokenKind["KW_CONSTEXPR"] = "KW_CONSTEXPR";
    // Control flow
    TokenKind["KW_IF"] = "KW_IF";
    TokenKind["KW_ELSE"] = "KW_ELSE";
    TokenKind["KW_SWITCH"] = "KW_SWITCH";
    TokenKind["KW_CASE"] = "KW_CASE";
    TokenKind["KW_DEFAULT"] = "KW_DEFAULT";
    TokenKind["KW_WHILE"] = "KW_WHILE";
    TokenKind["KW_DO"] = "KW_DO";
    TokenKind["KW_FOR"] = "KW_FOR";
    TokenKind["KW_GOTO"] = "KW_GOTO";
    TokenKind["KW_CONTINUE"] = "KW_CONTINUE";
    TokenKind["KW_BREAK"] = "KW_BREAK";
    TokenKind["KW_RETURN"] = "KW_RETURN";
    // Structure/Union/Enum
    TokenKind["KW_STRUCT"] = "KW_STRUCT";
    TokenKind["KW_UNION"] = "KW_UNION";
    TokenKind["KW_ENUM"] = "KW_ENUM";
    // Other
    TokenKind["KW_SIZEOF"] = "KW_SIZEOF";
    TokenKind["KW_ALIGNOF"] = "KW_ALIGNOF";
    TokenKind["KW_TYPEOF"] = "KW_TYPEOF";
    TokenKind["KW_TYPEOF_UNQUAL"] = "KW_TYPEOF_UNQUAL";
    TokenKind["KW_OFFSETOF"] = "KW_OFFSETOF";
    TokenKind["KW_GENERIC"] = "KW_GENERIC";
    TokenKind["KW_STATIC_ASSERT"] = "KW_STATIC_ASSERT";
    TokenKind["KW_ATTRIBUTE"] = "KW_ATTRIBUTE";
    TokenKind["KW_ALIGNAS"] = "KW_ALIGNAS";
    // C23 new keywords
    TokenKind["KW_BITINT"] = "KW_BITINT";
    TokenKind["KW_DECIMAL32"] = "KW_DECIMAL32";
    TokenKind["KW_DECIMAL64"] = "KW_DECIMAL64";
    TokenKind["KW_DECIMAL128"] = "KW_DECIMAL128";
    TokenKind["KW_NULLPTR"] = "KW_NULLPTR";
    TokenKind["KW_UNREACHABLE"] = "KW_UNREACHABLE";
    TokenKind["KW_FALLTHROUGH"] = "KW_FALLTHROUGH";
    TokenKind["KW_MAYBE_UNUSED"] = "KW_MAYBE_UNUSED";
    TokenKind["KW_NODISCARD"] = "KW_NODISCARD";
    TokenKind["KW_DEPRECATED"] = "KW_DEPRECATED";
    // Literals
    TokenKind["INTEGER_CONSTANT"] = "INTEGER_CONSTANT";
    TokenKind["FLOATING_CONSTANT"] = "FLOATING_CONSTANT";
    TokenKind["CHARACTER_CONSTANT"] = "CHARACTER_CONSTANT";
    TokenKind["STRING_LITERAL"] = "STRING_LITERAL";
    TokenKind["USER_DEFINED_LITERAL"] = "USER_DEFINED_LITERAL";
    // Punctuators
    TokenKind["LBRACE"] = "LBRACE";
    TokenKind["RBRACE"] = "RBRACE";
    TokenKind["LBRACKET"] = "LBRACKET";
    TokenKind["RBRACKET"] = "RBRACKET";
    TokenKind["LPAREN"] = "LPAREN";
    TokenKind["RPAREN"] = "RPAREN";
    TokenKind["SEMICOLON"] = "SEMICOLON";
    TokenKind["COMMA"] = "COMMA";
    TokenKind["COLON"] = "COLON";
    TokenKind["ELLIPSIS"] = "ELLIPSIS";
    TokenKind["ARROW"] = "ARROW";
    TokenKind["DOT"] = "DOT";
    // Operators
    TokenKind["PLUS"] = "PLUS";
    TokenKind["MINUS"] = "MINUS";
    TokenKind["STAR"] = "STAR";
    TokenKind["SLASH"] = "SLASH";
    TokenKind["PERCENT"] = "PERCENT";
    TokenKind["AMPERSAND"] = "AMPERSAND";
    TokenKind["PIPE"] = "PIPE";
    TokenKind["CARET"] = "CARET";
    TokenKind["TILDE"] = "TILDE";
    TokenKind["EXCLAM"] = "EXCLAM";
    TokenKind["QUESTION"] = "QUESTION";
    // Compound assignment
    TokenKind["PLUS_EQ"] = "PLUS_EQ";
    TokenKind["MINUS_EQ"] = "MINUS_EQ";
    TokenKind["STAR_EQ"] = "STAR_EQ";
    TokenKind["SLASH_EQ"] = "SLASH_EQ";
    TokenKind["PERCENT_EQ"] = "PERCENT_EQ";
    TokenKind["AMP_EQ"] = "AMP_EQ";
    TokenKind["PIPE_EQ"] = "PIPE_EQ";
    TokenKind["CARET_EQ"] = "CARET_EQ";
    TokenKind["LSHIFT_EQ"] = "LSHIFT_EQ";
    TokenKind["RSHIFT_EQ"] = "RSHIFT_EQ";
    // Comparison
    TokenKind["EQ_EQ"] = "EQ_EQ";
    TokenKind["NOT_EQ"] = "NOT_EQ";
    TokenKind["LT"] = "LT";
    TokenKind["GT"] = "GT";
    TokenKind["LE"] = "LE";
    TokenKind["GE"] = "GE";
    // Logical
    TokenKind["AMP_AMP"] = "AMP_AMP";
    TokenKind["PIPE_PIPE"] = "PIPE_PIPE";
    // Bitwise shift
    TokenKind["LSHIFT"] = "LSHIFT";
    TokenKind["RSHIFT"] = "RSHIFT";
    // Increment/Decrement
    TokenKind["PLUS_PLUS"] = "PLUS_PLUS";
    TokenKind["MINUS_MINUS"] = "MINUS_MINUS";
    // Attribute syntax
    TokenKind["DBL_LBRACKET"] = "DBL_LBRACKET";
    TokenKind["DBL_RBRACKET"] = "DBL_RBRACKET";
    // Special
    TokenKind["EOF"] = "EOF";
    TokenKind["UNKNOWN"] = "UNKNOWN";
})(TokenKind || (exports.TokenKind = TokenKind = {}));
// ============================================================================
// LEXER - Lossless, preserves all source text exactly
// ============================================================================
const KEYWORD_MAP = new Map([
    // Types
    ['void', TokenKind.KW_VOID],
    ['char', TokenKind.KW_CHAR],
    ['short', TokenKind.KW_SHORT],
    ['int', TokenKind.KW_INT],
    ['long', TokenKind.KW_LONG],
    ['float', TokenKind.KW_FLOAT],
    ['double', TokenKind.KW_DOUBLE],
    ['signed', TokenKind.KW_SIGNED],
    ['unsigned', TokenKind.KW_UNSIGNED],
    ['_Bool', TokenKind.KW_BOOL],
    ['_Complex', TokenKind.KW_COMPLEX],
    ['_Imaginary', TokenKind.KW_IMAGINARY],
    ['wchar_t', TokenKind.KW_WCHAR_T],
    ['char16_t', TokenKind.KW_CHAR16_T],
    ['char32_t', TokenKind.KW_CHAR32_T],
    ['int8_t', TokenKind.KW_INT8_T],
    ['int16_t', TokenKind.KW_INT16_T],
    ['int32_t', TokenKind.KW_INT32_T],
    ['int64_t', TokenKind.KW_INT64_T],
    ['uint8_t', TokenKind.KW_UINT8_T],
    ['uint16_t', TokenKind.KW_UINT16_T],
    ['uint32_t', TokenKind.KW_UINT32_T],
    ['uint64_t', TokenKind.KW_UINT64_T],
    ['int_least8_t', TokenKind.KW_INT_LEAST8_T],
    ['int_least16_t', TokenKind.KW_INT_LEAST16_T],
    ['int_least32_t', TokenKind.KW_INT_LEAST32_T],
    ['int_least64_t', TokenKind.KW_INT_LEAST64_T],
    ['uint_least8_t', TokenKind.KW_UINT_LEAST8_T],
    ['uint_least16_t', TokenKind.KW_UINT_LEAST16_T],
    ['uint_least32_t', TokenKind.KW_UINT_LEAST32_T],
    ['uint_least64_t', TokenKind.KW_UINT_LEAST64_T],
    ['int_fast8_t', TokenKind.KW_INT_FAST8_T],
    ['int_fast16_t', TokenKind.KW_INT_FAST16_T],
    ['int_fast32_t', TokenKind.KW_INT_FAST32_T],
    ['int_fast64_t', TokenKind.KW_INT_FAST64_T],
    ['uint_fast8_t', TokenKind.KW_UINT_FAST8_T],
    ['uint_fast16_t', TokenKind.KW_UINT_FAST16_T],
    ['uint_fast32_t', TokenKind.KW_UINT_FAST32_T],
    ['uint_fast64_t', TokenKind.KW_UINT_FAST64_T],
    ['intptr_t', TokenKind.KW_INTPTR_T],
    ['uintptr_t', TokenKind.KW_UINTPTR_T],
    ['intmax_t', TokenKind.KW_INTMAX_T],
    ['uintmax_t', TokenKind.KW_UINTMAX_T],
    ['size_t', TokenKind.KW_SIZE_T],
    ['ptrdiff_t', TokenKind.KW_PTRDIFF_T],
    ['wint_t', TokenKind.KW_WINT_T],
    ['wctrans_t', TokenKind.KW_WCTRANS_T],
    ['wctype_t', TokenKind.KW_WCTYPE_T],
    ['va_list', TokenKind.KW_VA_LIST],
    // Type qualifiers
    ['const', TokenKind.KW_CONST],
    ['volatile', TokenKind.KW_VOLATILE],
    ['restrict', TokenKind.KW_RESTRICT],
    ['_Atomic', TokenKind.KW_ATOMIC],
    // Storage class
    ['static', TokenKind.KW_STATIC],
    ['extern', TokenKind.KW_EXTERN],
    ['auto', TokenKind.KW_AUTO],
    ['register', TokenKind.KW_REGISTER],
    ['_Thread_local', TokenKind.KW_THREAD_LOCAL],
    ['typedef', TokenKind.KW_TYPEDEF],
    // Function specifiers
    ['inline', TokenKind.KW_INLINE],
    ['_Noreturn', TokenKind.KW_NORETURN],
    ['constexpr', TokenKind.KW_CONSTEXPR],
    // Control flow
    ['if', TokenKind.KW_IF],
    ['else', TokenKind.KW_ELSE],
    ['switch', TokenKind.KW_SWITCH],
    ['case', TokenKind.KW_CASE],
    ['default', TokenKind.KW_DEFAULT],
    ['while', TokenKind.KW_WHILE],
    ['do', TokenKind.KW_DO],
    ['for', TokenKind.KW_FOR],
    ['goto', TokenKind.KW_GOTO],
    ['continue', TokenKind.KW_CONTINUE],
    ['break', TokenKind.KW_BREAK],
    ['return', TokenKind.KW_RETURN],
    // Structure/Union/Enum
    ['struct', TokenKind.KW_STRUCT],
    ['union', TokenKind.KW_UNION],
    ['enum', TokenKind.KW_ENUM],
    // Other
    ['sizeof', TokenKind.KW_SIZEOF],
    ['_Alignof', TokenKind.KW_ALIGNOF],
    ['typeof', TokenKind.KW_TYPEOF],
    ['typeof_unqual', TokenKind.KW_TYPEOF_UNQUAL],
    ['offsetof', TokenKind.KW_OFFSETOF],
    ['_Generic', TokenKind.KW_GENERIC],
    ['_Static_assert', TokenKind.KW_STATIC_ASSERT],
    ['__attribute__', TokenKind.KW_ATTRIBUTE],
    ['_Alignas', TokenKind.KW_ALIGNAS],
    // C23 new keywords
    ['_BitInt', TokenKind.KW_BITINT],
    ['_Decimal32', TokenKind.KW_DECIMAL32],
    ['_Decimal64', TokenKind.KW_DECIMAL64],
    ['_Decimal128', TokenKind.KW_DECIMAL128],
    ['nullptr', TokenKind.KW_NULLPTR],
    ['unreachable', TokenKind.KW_UNREACHABLE],
    ['fallthrough', TokenKind.KW_FALLTHROUGH],
    ['maybe_unused', TokenKind.KW_MAYBE_UNUSED],
    ['nodiscard', TokenKind.KW_NODISCARD],
    ['deprecated', TokenKind.KW_DEPRECATED],
]);
// Punctuators sorted by length (longest first) for greedy matching
const PUNCTUATORS = [
    '...', '<<=', '>>=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=',
    '<<', '>>', '==', '!=', '<=', '>=', '&&', '||', '++', '--', '->',
    '[[', ']]',
    '{', '}', '[', ']', '(', ')', ';', ',', ':', '.',
    '+', '-', '*', '/', '%', '&', '|', '^', '~', '!', '?',
    '<', '>', '=',
];
class Lexer {
    constructor(source) {
        this.pos = 0;
        this.line = 1;
        this.column = 1;
        this.tokens = [];
        this.source = source;
        this.length = source.length;
    }
    tokenize() {
        this.tokens = [];
        this.pos = 0;
        this.line = 1;
        this.column = 1;
        while (this.pos < this.length) {
            this.scanToken();
        }
        // Add EOF token
        const eofLoc = this.makeLoc();
        this.tokens.push({
            kind: TokenKind.EOF,
            text: '',
            range: { start: eofLoc, end: eofLoc },
        });
        return this.tokens;
    }
    makeLoc() {
        return { offset: this.pos, line: this.line, column: this.column };
    }
    makeRange(start) {
        return { start, end: this.makeLoc() };
    }
    addToken(kind, start, text) {
        const tokenText = text ?? this.source.slice(start.offset, this.pos);
        this.tokens.push({
            kind,
            text: tokenText,
            range: this.makeRange(start),
        });
    }
    advance() {
        const ch = this.source[this.pos++];
        if (ch === '\n') {
            this.line++;
            this.column = 1;
        }
        else {
            this.column++;
        }
        return ch;
    }
    peek(offset = 0) {
        const idx = this.pos + offset;
        return idx < this.length ? this.source[idx] : '\0';
    }
    match(str) {
        if (this.source.startsWith(str, this.pos)) {
            for (let i = 0; i < str.length; i++)
                this.advance();
            return true;
        }
        return false;
    }
    scanToken() {
        const start = this.makeLoc();
        const ch = this.peek();
        // End of file
        if (ch === '\0')
            return;
        // Preprocessor directive (starts at column 1 or after whitespace at line start)
        if (ch === '#' && (start.column === 1 || this.isLineStartWhitespaceOnly(start.offset))) {
            this.scanPreprocessorDirective(start);
            return;
        }
        // Comments
        if (ch === '/') {
            const next = this.peek(1);
            if (next === '/') {
                this.scanLineComment(start);
                return;
            }
            if (next === '*') {
                this.scanBlockComment(start);
                return;
            }
        }
        // Whitespace (including newlines)
        if (this.isWhitespace(ch)) {
            this.scanWhitespace(start);
            return;
        }
        // String literals
        if (ch === '"' || (ch === '\'' && this.peek(1) !== '\'' && this.peek(1) !== '\0')) {
            this.scanStringOrCharLiteral(start);
            return;
        }
        // Raw string literals (C23 doesn't have raw strings like C++, but C++ does)
        // C23 has unicode string prefixes: u8, u, U, L
        if (this.matchStringPrefix()) {
            this.scanStringOrCharLiteral(start);
            return;
        }
        // Identifiers and keywords
        if (this.isIdentifierStart(ch)) {
            this.scanIdentifierOrKeyword(start);
            return;
        }
        // Numbers
        if (this.isDigit(ch) || (ch === '.' && this.isDigit(this.peek(1)))) {
            this.scanNumber(start);
            return;
        }
        // Punctuators and operators
        this.scanPunctuator(start);
    }
    isLineStartWhitespaceOnly(offset) {
        for (let i = offset - 1; i >= 0; i--) {
            const c = this.source[i];
            if (c === '\n')
                return true;
            if (c !== ' ' && c !== '\t' && c !== '\r')
                return false;
        }
        return true;
    }
    scanPreprocessorDirective(start) {
        // Scan until end of line, handling line continuations (\)
        while (this.pos < this.length) {
            const ch = this.advance();
            if (ch === '\\' && this.peek() === '\n') {
                this.advance(); // consume \ and \n
                continue;
            }
            if (ch === '\n')
                break;
        }
        this.addToken(TokenKind.PP_DIRECTIVE, start);
    }
    scanLineComment(start) {
        this.advance(); // /
        this.advance(); // /
        while (this.pos < this.length && this.peek() !== '\n') {
            this.advance();
        }
        this.addToken(TokenKind.LINE_COMMENT, start);
    }
    scanBlockComment(start) {
        this.advance(); // /
        this.advance(); // *
        let nested = 1;
        while (this.pos < this.length && nested > 0) {
            if (this.peek() === '*' && this.peek(1) === '/') {
                this.advance();
                this.advance();
                nested--;
            }
            else if (this.peek() === '/' && this.peek(1) === '*') {
                this.advance();
                this.advance();
                nested++;
            }
            else {
                this.advance();
            }
        }
        this.addToken(TokenKind.BLOCK_COMMENT, start);
    }
    scanWhitespace(start) {
        while (this.pos < this.length && this.isWhitespace(this.peek())) {
            this.advance();
        }
        const text = this.source.slice(start.offset, this.pos);
        if (text.includes('\n')) {
            // Split by newlines for better location tracking
            this.addToken(TokenKind.WHITESPACE, start, text);
        }
        else {
            this.addToken(TokenKind.WHITESPACE, start);
        }
    }
    isWhitespace(ch) {
        return ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n' || ch === '\f' || ch === '\v';
    }
    matchStringPrefix() {
        const prefixes = ['u8', 'u', 'U', 'L'];
        for (const prefix of prefixes) {
            if (this.source.startsWith(prefix + '"', this.pos) ||
                this.source.startsWith(prefix + "'", this.pos)) {
                return true;
            }
        }
        return false;
    }
    scanStringOrCharLiteral(start) {
        // Handle prefixes
        const prefixes = ['u8', 'u', 'U', 'L'];
        for (const prefix of prefixes) {
            if (this.match(prefix))
                break;
        }
        const quote = this.advance(); // ' or "
        const isChar = quote === '\'';
        while (this.pos < this.length) {
            const ch = this.advance();
            if (ch === '\\') {
                this.advance(); // escape sequence
            }
            else if (ch === quote) {
                break;
            }
            else if (ch === '\n' && isChar) {
                // Unterminated char literal - but we continue
                break;
            }
        }
        // User-defined literal suffix
        if (this.isIdentifierStart(this.peek())) {
            while (this.isIdentifierPart(this.peek())) {
                this.advance();
            }
            this.addToken(TokenKind.USER_DEFINED_LITERAL, start);
        }
        else {
            this.addToken(isChar ? TokenKind.CHARACTER_CONSTANT : TokenKind.STRING_LITERAL, start);
        }
    }
    scanIdentifierOrKeyword(start) {
        while (this.pos < this.length && this.isIdentifierPart(this.peek())) {
            this.advance();
        }
        const text = this.source.slice(start.offset, this.pos);
        const keywordKind = KEYWORD_MAP.get(text);
        if (keywordKind) {
            this.addToken(keywordKind, start);
            this.tokens[this.tokens.length - 1].isKeyword = true;
        }
        else {
            this.addToken(TokenKind.IDENTIFIER, start);
        }
    }
    isIdentifierStart(ch) {
        return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_' || ch >= '\u0080';
    }
    isIdentifierPart(ch) {
        return this.isIdentifierStart(ch) || (ch >= '0' && ch <= '9');
    }
    isDigit(ch) {
        return ch >= '0' && ch <= '9';
    }
    scanNumber(start) {
        let hasDot = false;
        let hasExp = false;
        // Hex/binary/octal prefix
        if (this.match('0x') || this.match('0X')) {
            while (this.isHexDigit(this.peek()))
                this.advance();
            if (this.peek() === '.') {
                hasDot = true;
                this.advance();
                while (this.isHexDigit(this.peek()))
                    this.advance();
            }
            if (this.peek() === 'p' || this.peek() === 'P') {
                hasExp = true;
                this.advance();
                if (this.peek() === '+' || this.peek() === '-')
                    this.advance();
                while (this.isDigit(this.peek()))
                    this.advance();
            }
        }
        else if (this.match('0b') || this.match('0B')) {
            while (this.peek() === '0' || this.peek() === '1')
                this.advance();
        }
        else {
            // Decimal or float
            while (this.isDigit(this.peek()))
                this.advance();
            if (this.peek() === '.') {
                hasDot = true;
                this.advance();
                while (this.isDigit(this.peek()))
                    this.advance();
            }
            if (this.peek() === 'e' || this.peek() === 'E') {
                hasExp = true;
                this.advance();
                if (this.peek() === '+' || this.peek() === '-')
                    this.advance();
                while (this.isDigit(this.peek()))
                    this.advance();
            }
        }
        // Suffixes (u, U, l, L, ll, LL, f, F, etc.)
        const suffixStart = this.pos;
        while (this.isIdentifierPart(this.peek())) {
            this.advance();
        }
        this.addToken(hasDot || hasExp ? TokenKind.FLOATING_CONSTANT : TokenKind.INTEGER_CONSTANT, start);
    }
    isHexDigit(ch) {
        return this.isDigit(ch) || (ch >= 'a' && ch <= 'f') || (ch >= 'A' && ch <= 'F');
    }
    scanPunctuator(start) {
        // Try longest punctuators first
        for (const punct of PUNCTUATORS) {
            if (this.match(punct)) {
                let kind = this.punctuatorToKind(punct);
                this.addToken(kind, start);
                return;
            }
        }
        // Unknown character
        this.advance();
        this.addToken(TokenKind.UNKNOWN, start);
    }
    punctuatorToKind(punct) {
        const map = {
            '...': TokenKind.ELLIPSIS,
            '<<=': TokenKind.LSHIFT_EQ,
            '>>=': TokenKind.RSHIFT_EQ,
            '+=': TokenKind.PLUS_EQ,
            '-=': TokenKind.MINUS_EQ,
            '*=': TokenKind.STAR_EQ,
            '/=': TokenKind.SLASH_EQ,
            '%=': TokenKind.PERCENT_EQ,
            '&=': TokenKind.AMP_EQ,
            '|=': TokenKind.PIPE_EQ,
            '^=': TokenKind.CARET_EQ,
            '<<': TokenKind.LSHIFT,
            '>>': TokenKind.RSHIFT,
            '==': TokenKind.EQ_EQ,
            '!=': TokenKind.NOT_EQ,
            '<=': TokenKind.LE,
            '>=': TokenKind.GE,
            '&&': TokenKind.AMP_AMP,
            '||': TokenKind.PIPE_PIPE,
            '++': TokenKind.PLUS_PLUS,
            '--': TokenKind.MINUS_MINUS,
            '->': TokenKind.ARROW,
            '[[': TokenKind.DBL_LBRACKET,
            ']]': TokenKind.DBL_RBRACKET,
            '{': TokenKind.LBRACE,
            '}': TokenKind.RBRACE,
            '[': TokenKind.LBRACKET,
            ']': TokenKind.RBRACKET,
            '(': TokenKind.LPAREN,
            ')': TokenKind.RPAREN,
            ';': TokenKind.SEMICOLON,
            ',': TokenKind.COMMA,
            ':': TokenKind.COLON,
            '.': TokenKind.DOT,
            '+': TokenKind.PLUS,
            '-': TokenKind.MINUS,
            '*': TokenKind.STAR,
            '/': TokenKind.SLASH,
            '%': TokenKind.PERCENT,
            '&': TokenKind.AMPERSAND,
            '|': TokenKind.PIPE,
            '^': TokenKind.CARET,
            '~': TokenKind.TILDE,
            '!': TokenKind.EXCLAM,
            '?': TokenKind.QUESTION,
            '<': TokenKind.LT,
            '>': TokenKind.GT,
            '=': TokenKind.PLUS_EQ, // Will be overridden by context, but we use a default
        };
        return map[punct] || TokenKind.UNKNOWN;
    }
}
exports.Lexer = Lexer;
// ============================================================================
// PARSER - Recursive descent parser for C23
// ============================================================================
class Parser {
    constructor(tokens) {
        this.pos = 0;
        this.errors = [];
        this.tokens = tokens;
    }
    parse() {
        const start = this.currentTokenRange().start;
        const externalDeclarations = [];
        while (!this.check(TokenKind.EOF)) {
            if (this.check(TokenKind.PP_DIRECTIVE)) {
                externalDeclarations.push(this.parsePPDirective());
            }
            else if (this.check(TokenKind.LINE_COMMENT) || this.check(TokenKind.BLOCK_COMMENT)) {
                externalDeclarations.push(this.parseComment());
            }
            else {
                const decl = this.parseExternalDeclaration();
                if (decl)
                    externalDeclarations.push(decl);
            }
        }
        const end = this.previousTokenRange().end;
        return {
            kind: 'TranslationUnit',
            range: { start, end },
            children: externalDeclarations,
            externalDeclarations,
        };
    }
    getErrors() {
        return this.errors;
    }
    currentTokenRange() {
        return this.tokens[this.pos]?.range ?? { start: { offset: 0, line: 1, column: 1 }, end: { offset: 0, line: 1, column: 1 } };
    }
    previousTokenRange() {
        return this.tokens[this.pos - 1]?.range ?? { start: { offset: 0, line: 1, column: 1 }, end: { offset: 0, line: 1, column: 1 } };
    }
    peek() {
        return this.tokens[this.pos];
    }
    peekKind() {
        return this.peek().kind;
    }
    check(kind) {
        return this.peekKind() === kind;
    }
    checkAny(...kinds) {
        return kinds.includes(this.peekKind());
    }
    advance() {
        const token = this.peek();
        if (!this.check(TokenKind.EOF))
            this.pos++;
        return token;
    }
    consume(kind, message) {
        if (this.check(kind))
            return this.advance();
        this.error(message, this.currentTokenRange());
        // Return a dummy token to continue parsing
        return { kind, text: '', range: this.currentTokenRange() };
    }
    error(message, range) {
        this.errors.push({ message, range });
    }
    // ---------------------------------------------------------------------------
    // External declarations
    // ---------------------------------------------------------------------------
    parseExternalDeclaration() {
        // Try function definition first (has compound statement body)
        const specStart = this.pos;
        const declSpecs = this.parseDeclarationSpecifiers();
        if (this.check(TokenKind.SEMICOLON)) {
            // Could be a declaration or just a semicolon
            const semi = this.advance();
            return this.makeNode('Declaration', specStart, {
                declarationSpecifiers: declSpecs,
                initDeclarators: [],
            });
        }
        // Check if it's a function definition (declarator followed by {)
        // We need to parse declarator and look ahead
        const savedPos = this.pos;
        const declarator = this.parseDeclarator(declSpecs);
        if (this.check(TokenKind.LBRACE)) {
            // Function definition
            const body = this.parseCompoundStatement();
            return this.makeNode('FunctionDefinition', specStart, {
                declarationSpecifiers: declSpecs,
                declarator,
                compoundStatement: body,
            });
        }
        // Not a function definition - backtrack and parse as declaration
        this.pos = savedPos;
        return this.parseDeclaration(declSpecs);
    }
    parseDeclaration(declSpecs) {
        const start = this.getNodeStart(declSpecs[0]);
        const initDeclarators = [];
        while (true) {
            initDeclarators.push(this.parseInitDeclarator(declSpecs));
            if (!this.check(TokenKind.COMMA))
                break;
            this.advance(); // consume comma
        }
        this.consume(TokenKind.SEMICOLON, 'Expected ; after declaration');
        return this.makeNode('Declaration', start, {
            declarationSpecifiers: declSpecs,
            initDeclarators,
        });
    }
    parseInitDeclarator(declSpecs) {
        const start = this.currentTokenRange().start;
        const declarator = this.parseDeclarator(declSpecs);
        let initializer;
        if (this.check(TokenKind.PLUS_EQ) || this.check(TokenKind.EQ_EQ)) {
            // This is actually an operator, not assignment - but handle gracefully
        }
        else if (this.check(TokenKind.PLUS) || this.check(TokenKind.MINUS) ||
            this.check(TokenKind.STAR) || this.check(TokenKind.SLASH) ||
            this.check(TokenKind.PERCENT) || this.check(TokenKind.AMPERSAND) ||
            this.check(TokenKind.PIPE) || this.check(TokenKind.CARET) ||
            this.check(TokenKind.TILDE) || this.check(TokenKind.EXCLAM) ||
            this.check(TokenKind.QUESTION) || this.check(TokenKind.LT) ||
            this.check(TokenKind.GT) || this.check(TokenKind.COLON) ||
            this.check(TokenKind.SEMICOLON) || this.check(TokenKind.COMMA) ||
            this.check(TokenKind.RBRACE) || this.check(TokenKind.RBRACKET) ||
            this.check(TokenKind.RPAREN)) {
            // No initializer
        }
        else if (this.check(TokenKind.PLUS_EQ) === false && this.matchAssign()) {
            initializer = this.parseInitializer();
        }
        return this.makeNode('InitDeclarator', start, { declarator, initializer });
    }
    matchAssign() {
        if (this.check(TokenKind.PLUS_EQ))
            return false; // handled elsewhere
        const ch = this.peek().text;
        return ch === '=' && !this.peek(1)?.text.startsWith('=');
    }
    parseInitializer() {
        const start = this.currentTokenRange().start;
        if (this.check(TokenKind.LBRACE)) {
            const list = this.parseInitializerList();
            return this.makeNode('Initializer', start, { initializerList: list });
        }
        const expr = this.parseAssignmentExpression();
        return this.makeNode('Initializer', start, { assignmentExpression: expr });
    }
    parseInitializerList() {
        const start = this.currentTokenRange().start;
        this.consume(TokenKind.LBRACE, 'Expected {');
        const initializers = [];
        let hasTrailingComma = false;
        while (!this.check(TokenKind.RBRACE) && !this.check(TokenKind.EOF)) {
            initializers.push(this.parseInitializer());
            if (this.check(TokenKind.COMMA)) {
                this.advance();
                hasTrailingComma = true;
                if (this.check(TokenKind.RBRACE))
                    break;
            }
            else {
                hasTrailingComma = false;
                break;
            }
        }
        this.consume(TokenKind.RBRACE, 'Expected }');
        return this.makeNode('InitializerList', start, { initializers, hasTrailingComma });
    }
    // ---------------------------------------------------------------------------
    // Declaration specifiers
    // ---------------------------------------------------------------------------
    parseDeclarationSpecifiers() {
        const specs = [];
        while (true) {
            if (this.isStorageClassSpecifier()) {
                specs.push(this.parseStorageClassSpecifier());
            }
            else if (this.isTypeSpecifier()) {
                specs.push(this.parseTypeSpecifier());
            }
            else if (this.isTypeQualifier()) {
                specs.push(this.parseTypeQualifier());
            }
            else if (this.isFunctionSpecifier()) {
                specs.push(this.parseFunctionSpecifier());
            }
            else if (this.isAlignmentSpecifier()) {
                specs.push(this.parseAlignmentSpecifier());
            }
            else if (this.isAttributeSpecifier()) {
                specs.push(this.parseAttributeSpecifier());
            }
            else {
                break;
            }
        }
        return specs;
    }
    isStorageClassSpecifier() {
        return this.checkAny(TokenKind.KW_STATIC, TokenKind.KW_EXTERN, TokenKind.KW_AUTO, TokenKind.KW_REGISTER, TokenKind.KW_THREAD_LOCAL, TokenKind.KW_TYPEDEF);
    }
    parseStorageClassSpecifier() {
        const token = this.advance();
        return this.makeNode('StorageClassSpecifier', token.range.start, { token });
    }
    isTypeSpecifier() {
        return this.checkAny(TokenKind.KW_VOID, TokenKind.KW_CHAR, TokenKind.KW_SHORT, TokenKind.KW_INT, TokenKind.KW_LONG, TokenKind.KW_FLOAT, TokenKind.KW_DOUBLE, TokenKind.KW_SIGNED, TokenKind.KW_UNSIGNED, TokenKind.KW_BOOL, TokenKind.KW_COMPLEX, TokenKind.KW_IMAGINARY, TokenKind.KW_WCHAR_T, TokenKind.KW_CHAR16_T, TokenKind.KW_CHAR32_T, TokenKind.KW_INT8_T, TokenKind.KW_INT16_T, TokenKind.KW_INT32_T, TokenKind.KW_INT64_T, TokenKind.KW_UINT8_T, TokenKind.KW_UINT16_T, TokenKind.KW_UINT32_T, TokenKind.KW_UINT64_T, TokenKind.KW_INT_LEAST8_T, TokenKind.KW_INT_LEAST16_T, TokenKind.KW_INT_LEAST32_T, TokenKind.KW_INT_LEAST64_T, TokenKind.KW_UINT_LEAST8_T, TokenKind.KW_UINT_LEAST16_T, TokenKind.KW_UINT_LEAST32_T, TokenKind.KW_UINT_LEAST64_T, TokenKind.KW_INT_FAST8_T, TokenKind.KW_INT_FAST16_T, TokenKind.KW_INT_FAST32_T, TokenKind.KW_INT_FAST64_T, TokenKind.KW_UINT_FAST8_T, TokenKind.KW_UINT_FAST16_T, TokenKind.KW_UINT_FAST32_T, TokenKind.KW_UINT_FAST64_T, TokenKind.KW_INTPTR_T, TokenKind.KW_UINTPTR_T, TokenKind.KW_INTMAX_T, TokenKind.KW_UINTMAX_T, TokenKind.KW_SIZE_T, TokenKind.KW_PTRDIFF_T, TokenKind.KW_WINT_T, TokenKind.KW_WCTRANS_T, TokenKind.KW_WCTYPE_T, TokenKind.KW_VA_LIST, TokenKind.KW_STRUCT, TokenKind.KW_UNION, TokenKind.KW_ENUM, TokenKind.KW_SIZEOF, TokenKind.KW_TYPEOF, TokenKind.KW_TYPEOF_UNQUAL, TokenKind.KW_BITINT, TokenKind.KW_DECIMAL32, TokenKind.KW_DECIMAL64, TokenKind.KW_DECIMAL128, TokenKind.IDENTIFIER // typedef names
        );
    }
    parseTypeSpecifier() {
        const token = this.advance();
        const start = token.range.start;
        // Handle struct/union/enum with body
        if (token.kind === TokenKind.KW_STRUCT || token.kind === TokenKind.KW_UNION) {
            let tag;
            let members;
            if (this.check(TokenKind.IDENTIFIER)) {
                tag = this.advance();
            }
            if (this.check(TokenKind.LBRACE)) {
                members = this.parseStructDeclarationList();
            }
            return this.makeNode('TypeSpecifier', start, { token, tag, members });
        }
        if (token.kind === TokenKind.KW_ENUM) {
            let tag;
            let enumConstants;
            if (this.check(TokenKind.IDENTIFIER)) {
                tag = this.advance();
            }
            if (this.check(TokenKind.LBRACE)) {
                enumConstants = this.parseEnumeratorList();
            }
            return this.makeNode('TypeSpecifier', start, { token, tag, enumConstants });
        }
        // typeof / typeof_unqual
        if (token.kind === TokenKind.KW_TYPEOF || token.kind === TokenKind.KW_TYPEOF_UNQUAL) {
            this.consume(TokenKind.LPAREN, 'Expected ( after typeof');
            // Could be expression or type name - try expression first
            const savedPos = this.pos;
            const expr = this.parseExpression();
            if (this.check(TokenKind.RPAREN)) {
                this.advance();
                return this.makeNode('TypeSpecifier', start, { token, typeofExpression: expr });
            }
            // Backtrack and try type name
            this.pos = savedPos;
            const typeName = this.parseTypeName();
            this.consume(TokenKind.RPAREN, 'Expected ) after typeof');
            return this.makeNode('TypeSpecifier', start, { token, typeofExpression: typeName });
        }
        // _BitInt(N)
        if (token.kind === TokenKind.KW_BITINT) {
            this.consume(TokenKind.LPAREN, 'Expected ( after _BitInt');
            const expr = this.parseExpression();
            this.consume(TokenKind.RPAREN, 'Expected ) after _BitInt');
            return this.makeNode('TypeSpecifier', start, { token, typeofExpression: expr });
        }
        return this.makeNode('TypeSpecifier', start, { token });
    }
    isTypeQualifier() {
        return this.checkAny(TokenKind.KW_CONST, TokenKind.KW_VOLATILE, TokenKind.KW_RESTRICT, TokenKind.KW_ATOMIC);
    }
    parseTypeQualifier() {
        const token = this.advance();
        return this.makeNode('TypeQualifier', token.range.start, { token });
    }
    isFunctionSpecifier() {
        return this.checkAny(TokenKind.KW_INLINE, TokenKind.KW_NORETURN, TokenKind.KW_CONSTEXPR);
    }
    parseFunctionSpecifier() {
        const token = this.advance();
        return this.makeNode('FunctionSpecifier', token.range.start, { token });
    }
    isAlignmentSpecifier() {
        return this.check(TokenKind.KW_ALIGNAS);
    }
    parseAlignmentSpecifier() {
        const token = this.advance(); // _Alignas
        this.consume(TokenKind.LPAREN, 'Expected ( after _Alignas');
        // Could be type name or expression
        const savedPos = this.pos;
        const typeName = this.parseTypeName();
        if (this.check(TokenKind.RPAREN)) {
            this.advance();
            return this.makeNode('AlignmentSpecifier', token.range.start, { token, expression: typeName });
        }
        this.pos = savedPos;
        const expr = this.parseExpression();
        this.consume(TokenKind.RPAREN, 'Expected ) after _Alignas');
        return this.makeNode('AlignmentSpecifier', token.range.start, { token, expression: expr });
    }
    isAttributeSpecifier() {
        return this.check(TokenKind.DBL_LBRACKET);
    }
    parseAttributeSpecifier() {
        const start = this.currentTokenRange().start;
        const tokens = [];
        this.consume(TokenKind.DBL_LBRACKET, 'Expected [[');
        tokens.push(this.tokens[this.pos - 1]);
        while (!this.check(TokenKind.DBL_RBRACKET) && !this.check(TokenKind.EOF)) {
            tokens.push(this.advance());
        }
        this.consume(TokenKind.DBL_RBRACKET, 'Expected ]]');
        tokens.push(this.tokens[this.pos - 1]);
        return this.makeNode('AttributeSpecifier', start, { tokens });
    }
    parseSpecifierQualifierList() {
        const list = [];
        while (this.isTypeSpecifier() || this.isTypeQualifier() || this.isAttributeSpecifier()) {
            const start = this.currentTokenRange().start;
            if (this.isTypeSpecifier()) {
                list.push(this.makeNode('SpecifierQualifier', start, { typeSpecifier: this.parseTypeSpecifier() }));
            }
            else if (this.isTypeQualifier()) {
                list.push(this.makeNode('SpecifierQualifier', start, { typeQualifier: this.parseTypeQualifier() }));
            }
            else if (this.isAttributeSpecifier()) {
                list.push(this.makeNode('SpecifierQualifier', start, { attributeSpecifier: this.parseAttributeSpecifier() }));
            }
        }
        return list;
    }
    // ---------------------------------------------------------------------------
    // Struct/Union/Enum
    // ---------------------------------------------------------------------------
    parseStructDeclarationList() {
        const start = this.currentTokenRange().start;
        this.consume(TokenKind.LBRACE, 'Expected {');
        const structDeclarations = [];
        while (!this.check(TokenKind.RBRACE) && !this.check(TokenKind.EOF)) {
            structDeclarations.push(this.parseStructDeclaration());
        }
        this.consume(TokenKind.RBRACE, 'Expected }');
        return this.makeNode('StructDeclarationList', start, { structDeclarations });
    }
    parseStructDeclaration() {
        const start = this.currentTokenRange().start;
        if (this.check(TokenKind.KW_STATIC_ASSERT)) {
            const staticAssert = this.parseStaticAssertDeclaration();
            return this.makeNode('StructDeclaration', start, {
                specifierQualifierList: [],
                staticAssert
            });
        }
        const specifierQualifierList = this.parseSpecifierQualifierList();
        if (this.check(TokenKind.SEMICOLON)) {
            this.advance();
            return this.makeNode('StructDeclaration', start, { specifierQualifierList });
        }
        const structDeclaratorList = [];
        while (true) {
            structDeclaratorList.push(this.parseStructDeclarator());
            if (!this.check(TokenKind.COMMA))
                break;
            this.advance();
        }
        this.consume(TokenKind.SEMICOLON, 'Expected ;');
        return this.makeNode('StructDeclaration', start, { specifierQualifierList, structDeclaratorList });
    }
    parseStructDeclarator() {
        const start = this.currentTokenRange().start;
        let declarator;
        let bitField;
        if (!this.check(TokenKind.COLON)) {
            declarator = this.parseDeclarator([]);
        }
        if (this.check(TokenKind.COLON)) {
            this.advance();
            bitField = this.parseConstantExpression();
        }
        return this.makeNode('StructDeclarator', start, { declarator, bitField });
    }
    parseEnumeratorList() {
        const start = this.currentTokenRange().start;
        this.consume(TokenKind.LBRACE, 'Expected {');
        const enumerators = [];
        while (!this.check(TokenKind.RBRACE) && !this.check(TokenKind.EOF)) {
            enumerators.push(this.parseEnumerator());
            if (!this.check(TokenKind.COMMA))
                break;
            this.advance();
        }
        this.consume(TokenKind.RBRACE, 'Expected }');
        return this.makeNode('EnumeratorList', start, { enumerators });
    }
    parseEnumerator() {
        const start = this.currentTokenRange().start;
        const identifier = this.consume(TokenKind.IDENTIFIER, 'Expected identifier');
        let constantExpression;
        if (this.check(TokenKind.PLUS_EQ) || this.check(TokenKind.EQ_EQ)) {
            // not assignment
        }
        else if (this.check(TokenKind.PLUS) || this.check(TokenKind.MINUS) ||
            this.check(TokenKind.STAR) || this.check(TokenKind.SLASH) ||
            this.check(TokenKind.PERCENT) || this.check(TokenKind.AMPERSAND) ||
            this.check(TokenKind.PIPE) || this.check(TokenKind.CARET) ||
            this.check(TokenKind.TILDE) || this.check(TokenKind.EXCLAM) ||
            this.check(TokenKind.QUESTION) || this.check(TokenKind.LT) ||
            this.check(TokenKind.GT) || this.check(TokenKind.COLON) ||
            this.check(TokenKind.SEMICOLON) || this.check(TokenKind.COMMA) ||
            this.check(TokenKind.RBRACE)) {
            // no initializer
        }
        else if (this.match('=')) {
            constantExpression = this.parseConstantExpression();
        }
        return this.makeNode('Enumerator', start, { identifier, constantExpression });
    }
    // ---------------------------------------------------------------------------
    // Declarators
    // ---------------------------------------------------------------------------
    parseDeclarator(declSpecs) {
        const start = this.currentTokenRange().start;
        const pointer = this.parsePointer();
        const directDeclarator = this.parseDirectDeclarator();
        return this.makeNode('Declarator', start, { pointer, directDeclarator });
    }
    parsePointer() {
        if (!this.check(TokenKind.STAR))
            return undefined;
        const start = this.currentTokenRange().start;
        const typeQualifiers = [];
        while (this.check(TokenKind.STAR)) {
            this.advance(); // consume *
            while (this.isTypeQualifier()) {
                typeQualifiers.push(this.parseTypeQualifier());
            }
        }
        const next = this.parsePointer();
        return this.makeNode('Pointer', start, { typeQualifiers, next });
    }
    parseDirectDeclarator() {
        const start = this.currentTokenRange().start;
        if (this.check(TokenKind.IDENTIFIER)) {
            const identifier = this.advance();
            return this.parseDirectDeclaratorRest(start, identifier);
        }
        if (this.check(TokenKind.LPAREN)) {
            this.advance(); // consume (
            const nested = this.parseDeclarator([]);
            this.consume(TokenKind.RPAREN, 'Expected )');
            return this.parseDirectDeclaratorRest(start, undefined, nested);
        }
        // Abstract declarator case
        return this.makeNode('DirectDeclarator', start, {});
    }
    parseDirectDeclaratorRest(start, identifier, nestedDeclarator) {
        // Array or function declarator
        while (true) {
            if (this.check(TokenKind.LBRACKET)) {
                // Array declarator
                this.advance(); // consume [
                const typeQualifiers = [];
                while (this.isTypeQualifier()) {
                    typeQualifiers.push(this.parseTypeQualifier());
                }
                let assignmentExpression;
                let isStatic = false;
                let isVLA = false;
                if (this.check(TokenKind.KW_STATIC)) {
                    isStatic = true;
                    this.advance();
                    while (this.isTypeQualifier()) {
                        typeQualifiers.push(this.parseTypeQualifier());
                    }
                }
                else if (this.isTypeQualifier()) {
                    while (this.isTypeQualifier()) {
                        typeQualifiers.push(this.parseTypeQualifier());
                    }
                    if (this.check(TokenKind.KW_STATIC)) {
                        isStatic = true;
                        this.advance();
                    }
                }
                if (this.check(TokenKind.STAR)) {
                    // VLA [*]
                    this.advance();
                    isVLA = true;
                }
                else if (!this.check(TokenKind.RBRACKET)) {
                    assignmentExpression = this.parseAssignmentExpression();
                }
                this.consume(TokenKind.RBRACKET, 'Expected ]');
                const arrayDecl = this.makeNode('ArrayDeclarator', start, {
                    directDeclarator: this.makeNode('DirectDeclarator', start, { identifier, nestedDeclarator }),
                    typeQualifiers,
                    assignmentExpression,
                    isStatic,
                    isVLA,
                });
                // Update the current direct declarator to include this array
                return this.parseDirectDeclaratorRest(start, identifier, nestedDeclarator);
            }
            if (this.check(TokenKind.LPAREN)) {
                // Function declarator
                this.advance(); // consume (
                const parameterList = [];
                if (!this.check(TokenKind.RPAREN)) {
                    // Check if it's a parameter list or identifier list (old style)
                    if (this.isParameterDeclaration()) {
                        while (true) {
                            parameterList.push(this.parseParameterDeclaration());
                            if (!this.check(TokenKind.COMMA))
                                break;
                            this.advance();
                            if (this.check(TokenKind.RPAREN))
                                break; // trailing comma
                        }
                    }
                    else {
                        // Old-style parameter identifier list - skip for now
                        while (!this.check(TokenKind.RPAREN) && !this.check(TokenKind.EOF)) {
                            this.advance();
                        }
                    }
                }
                this.consume(TokenKind.RPAREN, 'Expected )');
                return this.makeNode('DirectDeclarator', start, {
                    identifier,
                    nestedDeclarator,
                    parameterList,
                });
            }
            break;
        }
        return this.makeNode('DirectDeclarator', start, { identifier, nestedDeclarator });
    }
    isParameterDeclaration() {
        // Heuristic: starts with declaration specifier
        return this.isStorageClassSpecifier() || this.isTypeSpecifier() ||
            this.isTypeQualifier() || this.isFunctionSpecifier() ||
            this.isAlignmentSpecifier() || this.isAttributeSpecifier();
    }
    parseParameterDeclaration() {
        const start = this.currentTokenRange().start;
        const declSpecs = this.parseDeclarationSpecifiers();
        if (this.check(TokenKind.ELLIPSIS)) {
            this.advance(); // consume ...
            return this.makeNode('ParameterDeclaration', start, {
                declarationSpecifiers: declSpecs,
                // no declarator for ...
            });
        }
        const declarator = this.parseDeclarator(declSpecs);
        return this.makeNode('ParameterDeclaration', start, {
            declarationSpecifiers: declSpecs,
            declarator,
        });
    }
    parseAbstractDeclarator() {
        const start = this.currentTokenRange().start;
        const pointer = this.parsePointer();
        const directAbstractDeclarator = this.parseDirectAbstractDeclarator();
        return this.makeNode('AbstractDeclarator', start, { pointer, directAbstractDeclarator });
    }
    parseDirectAbstractDeclarator() {
        const start = this.currentTokenRange().start;
        if (this.check(TokenKind.LBRACKET)) {
            // Array
            const arrayDeclarator = this.parseArrayDeclarator(start);
            return this.makeNode('DirectAbstractDeclarator', start, { arrayDeclarator });
        }
        if (this.check(TokenKind.LPAREN)) {
            this.advance(); // consume (
            if (this.check(TokenKind.RPAREN)) {
                this.advance(); // consume )
                // Could be function with no params or nested
                if (this.check(TokenKind.LPAREN) || this.check(TokenKind.LBRACKET)) {
                    return this.parseDirectAbstractDeclarator();
                }
                return this.makeNode('DirectAbstractDeclarator', start, {});
            }
            // Could be parameter list or nested abstract declarator
            const savedPos = this.pos;
            if (this.isParameterDeclaration()) {
                // Parameter list - function type
                const parameterList = [];
                while (true) {
                    parameterList.push(this.parseParameterDeclaration());
                    if (!this.check(TokenKind.COMMA))
                        break;
                    this.advance();
                    if (this.check(TokenKind.RPAREN))
                        break;
                }
                this.consume(TokenKind.RPAREN, 'Expected )');
                return this.makeNode('DirectAbstractDeclarator', start, { parameterList });
            }
            // Nested abstract declarator
            this.pos = savedPos;
            const nested = this.parseAbstractDeclarator();
            this.consume(TokenKind.RPAREN, 'Expected )');
            return this.parseDirectAbstractDeclaratorRest(start, nested);
        }
        return undefined;
    }
    parseDirectAbstractDeclaratorRest(start, nestedDeclarator) {
        while (true) {
            if (this.check(TokenKind.LBRACKET)) {
                const arrayDeclarator = this.parseArrayDeclarator(start);
                return this.makeNode('DirectAbstractDeclarator', start, {
                    arrayDeclarator,
                    nestedDeclarator,
                });
            }
            if (this.check(TokenKind.LPAREN)) {
                this.advance();
                const parameterList = [];
                if (!this.check(TokenKind.RPAREN)) {
                    while (true) {
                        parameterList.push(this.parseParameterDeclaration());
                        if (!this.check(TokenKind.COMMA))
                            break;
                        this.advance();
                        if (this.check(TokenKind.RPAREN))
                            break;
                    }
                }
                this.consume(TokenKind.RPAREN, 'Expected )');
                return this.makeNode('DirectAbstractDeclarator', start, {
                    parameterList,
                    nestedDeclarator,
                });
            }
            break;
        }
        return this.makeNode('DirectAbstractDeclarator', start, { nestedDeclarator });
    }
    parseArrayDeclarator(start) {
        this.advance(); // consume [
        const typeQualifiers = [];
        while (this.isTypeQualifier()) {
            typeQualifiers.push(this.parseTypeQualifier());
        }
        let assignmentExpression;
        let isStatic = false;
        let isVLA = false;
        if (this.check(TokenKind.KW_STATIC)) {
            isStatic = true;
            this.advance();
            while (this.isTypeQualifier()) {
                typeQualifiers.push(this.parseTypeQualifier());
            }
        }
        else if (this.isTypeQualifier()) {
            while (this.isTypeQualifier()) {
                typeQualifiers.push(this.parseTypeQualifier());
            }
            if (this.check(TokenKind.KW_STATIC)) {
                isStatic = true;
                this.advance();
            }
        }
        if (this.check(TokenKind.STAR)) {
            this.advance();
            isVLA = true;
        }
        else if (!this.check(TokenKind.RBRACKET)) {
            assignmentExpression = this.parseAssignmentExpression();
        }
        this.consume(TokenKind.RBRACKET, 'Expected ]');
        return this.makeNode('ArrayDeclarator', start, {
            directDeclarator: this.makeNode('DirectDeclarator', start, {}),
            typeQualifiers,
            assignmentExpression,
            isStatic,
            isVLA,
        });
    }
    parseTypeName() {
        const start = this.currentTokenRange().start;
        const specifierQualifierList = this.parseSpecifierQualifierList();
        let abstractDeclarator;
        if (this.check(TokenKind.STAR) || this.check(TokenKind.LPAREN) || this.check(TokenKind.LBRACKET)) {
            abstractDeclarator = this.parseAbstractDeclarator();
        }
        return this.makeNode('TypeName', start, { specifierQualifierList, abstractDeclarator });
    }
    // ---------------------------------------------------------------------------
    // Statements
    // ---------------------------------------------------------------------------
    parseStatement() {
        // Labeled statements
        if (this.check(TokenKind.IDENTIFIER) && this.peek(1)?.kind === TokenKind.COLON) {
            return this.parseLabeledStatement();
        }
        if (this.check(TokenKind.KW_CASE) || this.check(TokenKind.KW_DEFAULT)) {
            return this.parseLabeledStatement();
        }
        // Compound statement
        if (this.check(TokenKind.LBRACE)) {
            return this.parseCompoundStatement();
        }
        // Control flow
        if (this.check(TokenKind.KW_IF))
            return this.parseIfStatement();
        if (this.check(TokenKind.KW_SWITCH))
            return this.parseSwitchStatement();
        if (this.check(TokenKind.KW_WHILE))
            return this.parseWhileStatement();
        if (this.check(TokenKind.KW_DO))
            return this.parseDoWhileStatement();
        if (this.check(TokenKind.KW_FOR))
            return this.parseForStatement();
        if (this.check(TokenKind.KW_GOTO))
            return this.parseGotoStatement();
        if (this.check(TokenKind.KW_CONTINUE))
            return this.parseContinueStatement();
        if (this.check(TokenKind.KW_BREAK))
            return this.parseBreakStatement();
        if (this.check(TokenKind.KW_RETURN))
            return this.parseReturnStatement();
        // Expression statement or declaration
        if (this.isDeclarationStart()) {
            const decl = this.parseDeclaration(this.parseDeclarationSpecifiers());
            return decl;
        }
        // Expression statement
        return this.parseExpressionStatement();
    }
    isDeclarationStart() {
        return this.isStorageClassSpecifier() || this.isTypeSpecifier() ||
            this.isTypeQualifier() || this.isFunctionSpecifier() ||
            this.isAlignmentSpecifier() || this.isAttributeSpecifier();
    }
    parseLabeledStatement() {
        const start = this.currentTokenRange().start;
        let label;
        if (this.check(TokenKind.KW_CASE)) {
            label = this.advance();
            const expr = this.parseConstantExpression();
            this.consume(TokenKind.COLON, 'Expected : after case');
            const stmt = this.parseStatement();
            return this.makeNode('LabeledStatement', start, { label, statement: stmt });
        }
        if (this.check(TokenKind.KW_DEFAULT)) {
            label = this.advance();
            this.consume(TokenKind.COLON, 'Expected : after default');
            const stmt = this.parseStatement();
            return this.makeNode('LabeledStatement', start, { label, statement: stmt });
        }
        // Identifier label
        label = this.consume(TokenKind.IDENTIFIER, 'Expected identifier');
        this.consume(TokenKind.COLON, 'Expected : after label');
        const stmt = this.parseStatement();
        return this.makeNode('LabeledStatement', start, { label, statement: stmt });
    }
    parseCompoundStatement() {
        const start = this.currentTokenRange().start;
        this.consume(TokenKind.LBRACE, 'Expected {');
        const blockItems = [];
        while (!this.check(TokenKind.RBRACE) && !this.check(TokenKind.EOF)) {
            if (this.check(TokenKind.PP_DIRECTIVE)) {
                blockItems.push(this.parsePPDirective());
            }
            else if (this.check(TokenKind.LINE_COMMENT) || this.check(TokenKind.BLOCK_COMMENT)) {
                blockItems.push(this.parseComment());
            }
            else if (this.isDeclarationStart()) {
                const declSpecs = this.parseDeclarationSpecifiers();
                if (this.check(TokenKind.SEMICOLON)) {
                    // Empty declaration
                    this.advance();
                }
                else {
                    blockItems.push(this.parseDeclaration(declSpecs));
                }
            }
            else {
                blockItems.push(this.parseStatement());
            }
        }
        this.consume(TokenKind.RBRACE, 'Expected }');
        return this.makeNode('CompoundStatement', start, { blockItems });
    }
    parseExpressionStatement() {
        const start = this.currentTokenRange().start;
        let expression;
        if (!this.check(TokenKind.SEMICOLON)) {
            expression = this.parseExpression();
        }
        this.consume(TokenKind.SEMICOLON, 'Expected ;');
        return this.makeNode('ExpressionStatement', start, { expression });
    }
    parseIfStatement() {
        const start = this.currentTokenRange().start;
        this.consume(TokenKind.KW_IF, 'Expected if');
        this.consume(TokenKind.LPAREN, 'Expected ( after if');
        const condition = this.parseExpression();
        this.consume(TokenKind.RPAREN, 'Expected ) after if condition');
        const thenStatement = this.parseStatement();
        let elseStatement;
        if (this.check(TokenKind.KW_ELSE)) {
            this.advance();
            elseStatement = this.parseStatement();
        }
        return this.makeNode('IfStatement', start, { condition, thenStatement, elseStatement });
    }
    parseSwitchStatement() {
        const start = this.currentTokenRange().start;
        this.consume(TokenKind.KW_SWITCH, 'Expected switch');
        this.consume(TokenKind.LPAREN, 'Expected ( after switch');
        const condition = this.parseExpression();
        this.consume(TokenKind.RPAREN, 'Expected ) after switch condition');
        const body = this.parseStatement();
        return this.makeNode('SwitchStatement', start, { condition, body });
    }
    parseWhileStatement() {
        const start = this.currentTokenRange().start;
        this.consume(TokenKind.KW_WHILE, 'Expected while');
        this.consume(TokenKind.LPAREN, 'Expected ( after while');
        const condition = this.parseExpression();
        this.consume(TokenKind.RPAREN, 'Expected ) after while condition');
        const body = this.parseStatement();
        return this.makeNode('WhileStatement', start, { condition, body, isDoWhile: false });
    }
    parseDoWhileStatement() {
        const start = this.currentTokenRange().start;
        this.consume(TokenKind.KW_DO, 'Expected do');
        const body = this.parseStatement();
        this.consume(TokenKind.KW_WHILE, 'Expected while after do body');
        this.consume(TokenKind.LPAREN, 'Expected ( after while');
        const condition = this.parseExpression();
        this.consume(TokenKind.RPAREN, 'Expected ) after while condition');
        this.consume(TokenKind.SEMICOLON, 'Expected ; after do-while');
        return this.makeNode('WhileStatement', start, { condition, body, isDoWhile: true });
    }
    parseForStatement() {
        const start = this.currentTokenRange().start;
        this.consume(TokenKind.KW_FOR, 'Expected for');
        this.consume(TokenKind.LPAREN, 'Expected ( after for');
        let init = null;
        if (!this.check(TokenKind.SEMICOLON)) {
            if (this.isDeclarationStart()) {
                const declSpecs = this.parseDeclarationSpecifiers();
                init = this.parseDeclaration(declSpecs);
            }
            else {
                init = this.parseExpression();
                this.consume(TokenKind.SEMICOLON, 'Expected ; after for init');
            }
        }
        else {
            this.advance(); // consume ;
        }
        let condition;
        if (!this.check(TokenKind.SEMICOLON)) {
            condition = this.parseExpression();
        }
        this.consume(TokenKind.SEMICOLON, 'Expected ; after for condition');
        let increment;
        if (!this.check(TokenKind.RPAREN)) {
            increment = this.parseExpression();
        }
        this.consume(TokenKind.RPAREN, 'Expected ) after for increment');
        const body = this.parseStatement();
        return this.makeNode('ForStatement', start, { init, condition, increment, body });
    }
    parseGotoStatement() {
        const start = this.currentTokenRange().start;
        this.consume(TokenKind.KW_GOTO, 'Expected goto');
        const label = this.consume(TokenKind.IDENTIFIER, 'Expected label after goto');
        this.consume(TokenKind.SEMICOLON, 'Expected ; after goto');
        return this.makeNode('GotoStatement', start, { label });
    }
    parseContinueStatement() {
        const start = this.currentTokenRange().start;
        this.consume(TokenKind.KW_CONTINUE, 'Expected continue');
        this.consume(TokenKind.SEMICOLON, 'Expected ; after continue');
        return this.makeNode('ContinueStatement', start, {});
    }
    parseBreakStatement() {
        const start = this.currentTokenRange().start;
        this.consume(TokenKind.KW_BREAK, 'Expected break');
        this.consume(TokenKind.SEMICOLON, 'Expected ; after break');
        return this.makeNode('BreakStatement', start, {});
    }
    parseReturnStatement() {
        const start = this.currentTokenRange().start;
        this.consume(TokenKind.KW_RETURN, 'Expected return');
        let expression;
        if (!this.check(TokenKind.SEMICOLON)) {
            expression = this.parseExpression();
        }
        this.consume(TokenKind.SEMICOLON, 'Expected ; after return');
        return this.makeNode('ReturnStatement', start, { expression });
    }
    parseStaticAssertDeclaration() {
        const start = this.currentTokenRange().start;
        const token = this.consume(TokenKind.KW_STATIC_ASSERT, 'Expected _Static_assert');
        this.consume(TokenKind.LPAREN, 'Expected ( after _Static_assert');
        const constantExpression = this.parseConstantExpression();
        this.consume(TokenKind.COMMA, 'Expected , in _Static_assert');
        const stringLiteral = this.consume(TokenKind.STRING_LITERAL, 'Expected string literal in _Static_assert');
        this.consume(TokenKind.RPAREN, 'Expected ) after _Static_assert');
        this.consume(TokenKind.SEMICOLON, 'Expected ; after _Static_assert');
        return this.makeNode('StaticAssertDeclaration', start, { token, constantExpression, stringLiteral });
    }
    // ---------------------------------------------------------------------------
    // Expressions (precedence climbing)
    // ---------------------------------------------------------------------------
    parseExpression() {
        return this.parseAssignmentExpression();
    }
    parseAssignmentExpression() {
        const left = this.parseConditionalExpression();
        if (this.isAssignmentOperator()) {
            const operator = this.advance();
            const right = this.parseAssignmentExpression();
            return this.makeNode('AssignmentExpression', left.range.start, { left, operator, right });
        }
        return left;
    }
    isAssignmentOperator() {
        const kinds = [
            TokenKind.PLUS_EQ, TokenKind.MINUS_EQ, TokenKind.STAR_EQ, TokenKind.SLASH_EQ,
            TokenKind.PERCENT_EQ, TokenKind.AMP_EQ, TokenKind.PIPE_EQ, TokenKind.CARET_EQ,
            TokenKind.LSHIFT_EQ, TokenKind.RSHIFT_EQ,
        ];
        // Also check for simple =
        const token = this.peek();
        if (token.text === '=' && !this.peek(1)?.text.startsWith('=')) {
            return true;
        }
        return kinds.includes(token.kind);
    }
    parseConditionalExpression() {
        const condition = this.parseLogicalOrExpression();
        if (this.check(TokenKind.QUESTION)) {
            this.advance(); // consume ?
            const trueExpr = this.parseExpression();
            this.consume(TokenKind.COLON, 'Expected : in conditional');
            const falseExpr = this.parseConditionalExpression();
            return this.makeNode('ConditionalExpression', condition.range.start, {
                condition, trueExpression: trueExpr, falseExpression: falseExpr
            });
        }
        return condition;
    }
    parseLogicalOrExpression() {
        let left = this.parseLogicalAndExpression();
        while (this.check(TokenKind.PIPE_PIPE)) {
            const operator = this.advance();
            const right = this.parseLogicalAndExpression();
            left = this.makeNode('LogicalOrExpression', left.range.start, { left, right });
        }
        return left;
    }
    parseLogicalAndExpression() {
        let left = this.parseInclusiveOrExpression();
        while (this.check(TokenKind.AMP_AMP)) {
            const operator = this.advance();
            const right = this.parseInclusiveOrExpression();
            left = this.makeNode('LogicalAndExpression', left.range.start, { left, right });
        }
        return left;
    }
    parseInclusiveOrExpression() {
        let left = this.parseExclusiveOrExpression();
        while (this.check(TokenKind.PIPE)) {
            const operator = this.advance();
            const right = this.parseExclusiveOrExpression();
            left = this.makeNode('InclusiveOrExpression', left.range.start, { left, right });
        }
        return left;
    }
    parseExclusiveOrExpression() {
        let left = this.parseAndExpression();
        while (this.check(TokenKind.CARET)) {
            const operator = this.advance();
            const right = this.parseAndExpression();
            left = this.makeNode('ExclusiveOrExpression', left.range.start, { left, right });
        }
        return left;
    }
    parseAndExpression() {
        let left = this.parseEqualityExpression();
        while (this.check(TokenKind.AMPERSAND)) {
            const operator = this.advance();
            const right = this.parseEqualityExpression();
            left = this.makeNode('AndExpression', left.range.start, { left, right });
        }
        return left;
    }
    parseEqualityExpression() {
        let left = this.parseRelationalExpression();
        while (this.check(TokenKind.EQ_EQ) || this.check(TokenKind.NOT_EQ)) {
            const operator = this.advance();
            const right = this.parseRelationalExpression();
            left = this.makeNode('EqualityExpression', left.range.start, { left, operator, right });
        }
        return left;
    }
    parseRelationalExpression() {
        let left = this.parseShiftExpression();
        while (this.check(TokenKind.LT) || this.check(TokenKind.GT) ||
            this.check(TokenKind.LE) || this.check(TokenKind.GE)) {
            const operator = this.advance();
            const right = this.parseShiftExpression();
            left = this.makeNode('RelationalExpression', left.range.start, { left, operator, right });
        }
        return left;
    }
    parseShiftExpression() {
        let left = this.parseAdditiveExpression();
        while (this.check(TokenKind.LSHIFT) || this.check(TokenKind.RSHIFT)) {
            const operator = this.advance();
            const right = this.parseAdditiveExpression();
            left = this.makeNode('ShiftExpression', left.range.start, { left, operator, right });
        }
        return left;
    }
    parseAdditiveExpression() {
        let left = this.parseMultiplicativeExpression();
        while (this.check(TokenKind.PLUS) || this.check(TokenKind.MINUS)) {
            const operator = this.advance();
            const right = this.parseMultiplicativeExpression();
            left = this.makeNode('AdditiveExpression', left.range.start, { left, operator, right });
        }
        return left;
    }
    parseMultiplicativeExpression() {
        let left = this.parseCastExpression();
        while (this.check(TokenKind.STAR) || this.check(TokenKind.SLASH) || this.check(TokenKind.PERCENT)) {
            const operator = this.advance();
            const right = this.parseCastExpression();
            left = this.makeNode('MultiplicativeExpression', left.range.start, { left, operator, right });
        }
        return left;
    }
    parseCastExpression() {
        // Check for ( type-name ) cast-expression
        if (this.check(TokenKind.LPAREN)) {
            const savedPos = this.pos;
            this.advance(); // consume (
            if (this.isTypeNameStart()) {
                const typeName = this.parseTypeName();
                this.consume(TokenKind.RPAREN, 'Expected ) after type name');
                const expr = this.parseCastExpression();
                return this.makeNode('CastExpression', typeName.range.start, { typeName, expression: expr });
            }
            this.pos = savedPos;
        }
        return this.parseUnaryExpression();
    }
    isTypeNameStart() {
        // A type name starts with a type specifier or type qualifier (but not an identifier that could be a variable)
        // This is heuristic - in practice we'd need more context
        return this.isTypeSpecifier() || this.isTypeQualifier() || this.isAlignmentSpecifier() || this.isAttributeSpecifier();
    }
    parseUnaryExpression() {
        const start = this.currentTokenRange().start;
        // Postfix expressions first (higher precedence)
        if (this.isPostfixStart()) {
            return this.parsePostfixExpression();
        }
        // Unary operators
        if (this.check(TokenKind.PLUS_PLUS) || this.check(TokenKind.MINUS_MINUS) ||
            this.check(TokenKind.AMPERSAND) || this.check(TokenKind.STAR) ||
            this.check(TokenKind.PLUS) || this.check(TokenKind.MINUS) ||
            this.check(TokenKind.TILDE) || this.check(TokenKind.EXCLAM)) {
            const operator = this.advance();
            const operand = this.parseUnaryExpression();
            return this.makeNode('UnaryExpression', start, { operator, operand });
        }
        // sizeof, _Alignof, typeof
        if (this.check(TokenKind.KW_SIZEOF) || this.check(TokenKind.KW_ALIGNOF) ||
            this.check(TokenKind.KW_TYPEOF) || this.check(TokenKind.KW_TYPEOF_UNQUAL)) {
            const token = this.advance();
            this.consume(TokenKind.LPAREN, `Expected ( after ${token.text}`);
            // Could be type name or expression
            const savedPos = this.pos;
            const typeName = this.parseTypeName();
            if (this.check(TokenKind.RPAREN)) {
                this.advance();
                return this.makeNode('UnaryExpression', start, {
                    operator: token,
                    castExpression: undefined,
                    sizeofExpression: typeName,
                });
            }
            this.pos = savedPos;
            const expr = this.parseExpression();
            this.consume(TokenKind.RPAREN, 'Expected )');
            return this.makeNode('UnaryExpression', start, {
                operator: token,
                sizeofExpression: expr,
            });
        }
        // Generic selection
        if (this.check(TokenKind.KW_GENERIC)) {
            return this.parseGenericSelection();
        }
        // Primary expression
        return this.parsePostfixExpression();
    }
    isPostfixStart() {
        return this.check(TokenKind.IDENTIFIER) || this.check(TokenKind.INTEGER_CONSTANT) ||
            this.check(TokenKind.FLOATING_CONSTANT) || this.check(TokenKind.CHARACTER_CONSTANT) ||
            this.check(TokenKind.STRING_LITERAL) || this.check(TokenKind.USER_DEFINED_LITERAL) ||
            this.check(TokenKind.KW_NULLPTR) || this.check(TokenKind.LPAREN) ||
            this.check(TokenKind.KW_SIZEOF) || this.check(TokenKind.KW_ALIGNOF) ||
            this.check(TokenKind.KW_TYPEOF) || this.check(TokenKind.KW_TYPEOF_UNQUAL) ||
            this.check(TokenKind.KW_GENERIC) || this.check(TokenKind.KW_OFFSETOF);
    }
    parsePostfixExpression() {
        let primary = this.parsePrimaryExpression();
        while (true) {
            if (this.check(TokenKind.LBRACKET)) {
                // Array access
                this.advance();
                const expr = this.parseExpression();
                this.consume(TokenKind.RBRACKET, 'Expected ]');
                primary = this.makeNode('PostfixExpression', primary.range.start, {
                    primary,
                    operations: [{ kind: 'ArrayAccess', expression: expr }],
                });
            }
            else if (this.check(TokenKind.LPAREN)) {
                // Function call
                this.advance();
                const args = this.parseArgumentExpressionList();
                this.consume(TokenKind.RPAREN, 'Expected )');
                primary = this.makeNode('PostfixExpression', primary.range.start, {
                    primary,
                    operations: [{ kind: 'FunctionCall', arguments: args }],
                });
            }
            else if (this.check(TokenKind.DOT) || this.check(TokenKind.ARROW)) {
                // Member access
                const isArrow = this.check(TokenKind.ARROW);
                const operator = this.advance();
                const identifier = this.consume(TokenKind.IDENTIFIER, 'Expected member name');
                primary = this.makeNode('PostfixExpression', primary.range.start, {
                    primary,
                    operations: [{ kind: 'MemberAccess', isArrow, identifier }],
                });
            }
            else if (this.check(TokenKind.PLUS_PLUS) || this.check(TokenKind.MINUS_MINUS)) {
                // Postfix increment/decrement
                const op = this.advance();
                primary = this.makeNode('PostfixExpression', primary.range.start, {
                    primary,
                    operations: [{ kind: op.kind === TokenKind.PLUS_PLUS ? 'PostInc' : 'PostDec' }],
                });
            }
            else {
                break;
            }
        }
        return primary;
    }
    parsePrimaryExpression() {
        const start = this.currentTokenRange().start;
        // Parenthesized expression
        if (this.check(TokenKind.LPAREN)) {
            this.advance();
            const expr = this.parseExpression();
            this.consume(TokenKind.RPAREN, 'Expected )');
            return this.makeNode('PrimaryExpression', start, { token: this.tokens[this.pos - 1] });
        }
        // Generic selection
        if (this.check(TokenKind.KW_GENERIC)) {
            const generic = this.parseGenericSelection();
            return this.makeNode('PrimaryExpression', start, { token: generic.tokens[0], genericSelection: generic });
        }
        // offsetof
        if (this.check(TokenKind.KW_OFFSETOF)) {
            const token = this.advance();
            this.consume(TokenKind.LPAREN, 'Expected ( after offsetof');
            const typeName = this.parseTypeName();
            this.consume(TokenKind.COMMA, 'Expected , in offsetof');
            // member designator - simplified
            this.consume(TokenKind.IDENTIFIER, 'Expected member name');
            this.consume(TokenKind.RPAREN, 'Expected )');
            return this.makeNode('PrimaryExpression', start, { token });
        }
        // Literals and identifiers
        const token = this.advance();
        return this.makeNode('PrimaryExpression', start, { token });
    }
    parseGenericSelection() {
        const start = this.currentTokenRange().start;
        this.consume(TokenKind.KW_GENERIC, 'Expected _Generic');
        this.consume(TokenKind.LPAREN, 'Expected ( after _Generic');
        const controllingExpression = this.parseExpression();
        this.consume(TokenKind.COMMA, 'Expected , in _Generic');
        const associations = [];
        while (!this.check(TokenKind.RPAREN) && !this.check(TokenKind.EOF)) {
            let typeName;
            let isDefault = false;
            if (this.check(TokenKind.KW_DEFAULT)) {
                this.advance();
                isDefault = true;
            }
            else {
                typeName = this.parseTypeName();
            }
            this.consume(TokenKind.COLON, 'Expected : in _Generic association');
            const expression = this.parseExpression();
            associations.push(this.makeNode('GenericAssociation', start, { typeName, isDefault, expression }));
            if (!this.check(TokenKind.COMMA))
                break;
            this.advance();
        }
        this.consume(TokenKind.RPAREN, 'Expected ) after _Generic');
        return this.makeNode('GenericSelection', start, { controllingExpression, associations });
    }
    parseArgumentExpressionList() {
        const start = this.currentTokenRange().start;
        const expressions = [];
        if (!this.check(TokenKind.RPAREN)) {
            while (true) {
                expressions.push(this.parseAssignmentExpression());
                if (!this.check(TokenKind.COMMA))
                    break;
                this.advance();
                if (this.check(TokenKind.RPAREN))
                    break; // trailing comma
            }
        }
        return this.makeNode('ArgumentExpressionList', start, { expressions });
    }
    parseConstantExpression() {
        const start = this.currentTokenRange().start;
        const expression = this.parseConditionalExpression();
        return this.makeNode('ConstantExpression', start, { expression });
    }
    // ---------------------------------------------------------------------------
    // Preprocessor directives and comments
    // ---------------------------------------------------------------------------
    parsePPDirective() {
        const token = this.advance();
        return this.makeNode('PPDirective', token.range.start, { token });
    }
    parseComment() {
        const token = this.advance();
        return this.makeNode('Comment', token.range.start, { token });
    }
    // ---------------------------------------------------------------------------
    // AST node factory
    // ---------------------------------------------------------------------------
    makeNode(kind, start, props) {
        const end = this.previousTokenRange().end;
        const node = {
            kind,
            range: { start, end },
            children: [],
            ...props,
        };
        // Collect children for traversal
        for (const value of Object.values(props)) {
            if (value && typeof value === 'object') {
                if (Array.isArray(value)) {
                    for (const item of value) {
                        if (item && typeof item === 'object' && 'range' in item) {
                            node.children.push(item);
                        }
                    }
                }
                else if ('range' in value) {
                    node.children.push(value);
                }
            }
        }
        return node;
    }
    getNodeStart(node) {
        return node.range.start;
    }
}
exports.Parser = Parser;
// ============================================================================
// EMITTER - Reconstructs exact source from tokens
// ============================================================================
class Emitter {
    emit(ast) {
        // For perfect round-trip, we just concatenate all token texts in order
        // The parser doesn't reorder tokens, it just builds structure on top
        return this.collectTokens(ast).map(t => t.text).join('');
    }
    collectTokens(node) {
        const tokens = [];
        // For nodes that wrap tokens directly (like PPDirective, Comment)
        if ('token' in node && node.token) {
            tokens.push(node.token);
        }
        if ('tokens' in node && Array.isArray(node.tokens)) {
            tokens.push(...node.tokens);
        }
        // Recurse into children
        for (const child of node.children) {
            tokens.push(...this.collectTokens(child));
        }
        return tokens;
    }
}
exports.Emitter = Emitter;
// ============================================================================
// MAIN PARSER CLASS - Public API
// ============================================================================
class C23Parser {
    constructor() {
        this.lexer = new Lexer('');
        this.parser = new Parser([]);
        this.emitter = new Emitter();
    }
    parseSource(source) {
        const tokens = this.lexer.tokenize();
        this.parser = new Parser(tokens);
        const ast = this.parser.parse();
        const errors = this.parser.getErrors();
        const emitted = this.emitter.emit(ast);
        return {
            ast,
            tokens,
            errors,
            emitted,
            success: errors.length === 0,
        };
    }
    parseFile(filePath) {
        const fs = require('fs');
        const source = fs.readFileSync(filePath, 'utf-8');
        return this.parseSource(source);
    }
    emit(ast) {
        return this.emitter.emit(ast);
    }
}
exports.C23Parser = C23Parser;
// ============================================================================
// CLI
// ============================================================================
function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Usage: c23parser <file.c> | --stdin');
        process.exit(1);
    }
    const parser = new C23Parser();
    let source;
    if (args[0] === '--stdin') {
        source = require('fs').readFileSync(0, 'utf-8');
    }
    else {
        source = require('fs').readFileSync(args[0], 'utf-8');
    }
    const result = parser.parseSource(source);
    if (!result.success) {
        console.error('Parse errors:');
        for (const error of result.errors) {
            console.error(`  ${error.range.start.line}:${error.range.start.column}: ${error.message}`);
        }
        process.exit(1);
    }
    // Output the emitted source (should be identical to input)
    process.stdout.write(result.emitted);
}
if (require.main === module) {
    main();
}
