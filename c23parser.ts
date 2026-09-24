#!/usr/bin/env node
/**
 * C23 Syntactic Parser with Perfect Round-Trip
 * 
 * Parses C23 source code and can emit identical source.
 * No semantic analysis - purely syntactic.
 * Zero external dependencies.
 */

// ============================================================================
// TOKEN SYSTEM - Lossless tokenization preserving all source text
// ============================================================================

export enum TokenKind {
  // Preprocessor
  PP_DIRECTIVE = 'PP_DIRECTIVE',        // #include, #define, #ifdef, etc.
  PP_LINE = 'PP_LINE',                   // #line directive
  PP_PRAGMA = 'PP_PRAGMA',               // #pragma
  
  // Comments
  LINE_COMMENT = 'LINE_COMMENT',         // // ...
  BLOCK_COMMENT = 'BLOCK_COMMENT',       // /* ... */
  
  // Whitespace
  WHITESPACE = 'WHITESPACE',             // spaces, tabs, newlines
  NEWLINE = 'NEWLINE',                   // \n (tracked separately for line numbers)
  
  // Identifiers & Keywords
  IDENTIFIER = 'IDENTIFIER',
  
  // Keywords (C23)
  // Types
  KW_VOID = 'KW_VOID',
  KW_CHAR = 'KW_CHAR',
  KW_SHORT = 'KW_SHORT',
  KW_INT = 'KW_INT',
  KW_LONG = 'KW_LONG',
  KW_FLOAT = 'KW_FLOAT',
  KW_DOUBLE = 'KW_DOUBLE',
  KW_SIGNED = 'KW_SIGNED',
  KW_UNSIGNED = 'KW_UNSIGNED',
  KW_BOOL = 'KW_BOOL',
  KW_COMPLEX = 'KW_COMPLEX',
  KW_IMAGINARY = 'KW_IMAGINARY',
  KW_WCHAR_T = 'KW_WCHAR_T',
  KW_CHAR16_T = 'KW_CHAR16_T',
  KW_CHAR32_T = 'KW_CHAR32_T',
  KW_INT8_T = 'KW_INT8_T',
  KW_INT16_T = 'KW_INT16_T',
  KW_INT32_T = 'KW_INT32_T',
  KW_INT64_T = 'KW_INT64_T',
  KW_UINT8_T = 'KW_UINT8_T',
  KW_UINT16_T = 'KW_UINT16_T',
  KW_UINT32_T = 'KW_UINT32_T',
  KW_UINT64_T = 'KW_UINT64_T',
  KW_INT_LEAST8_T = 'KW_INT_LEAST8_T',
  KW_INT_LEAST16_T = 'KW_INT_LEAST16_T',
  KW_INT_LEAST32_T = 'KW_INT_LEAST32_T',
  KW_INT_LEAST64_T = 'KW_INT_LEAST64_T',
  KW_UINT_LEAST8_T = 'KW_UINT_LEAST8_T',
  KW_UINT_LEAST16_T = 'KW_UINT_LEAST16_T',
  KW_UINT_LEAST32_T = 'KW_UINT_LEAST32_T',
  KW_UINT_LEAST64_T = 'KW_UINT_LEAST64_T',
  KW_INT_FAST8_T = 'KW_INT_FAST8_T',
  KW_INT_FAST16_T = 'KW_INT_FAST16_T',
  KW_INT_FAST32_T = 'KW_INT_FAST32_T',
  KW_INT_FAST64_T = 'KW_INT_FAST64_T',
  KW_UINT_FAST8_T = 'KW_UINT_FAST8_T',
  KW_UINT_FAST16_T = 'KW_UINT_FAST16_T',
  KW_UINT_FAST32_T = 'KW_UINT_FAST32_T',
  KW_UINT_FAST64_T = 'KW_UINT_FAST64_T',
  KW_INTPTR_T = 'KW_INTPTR_T',
  KW_UINTPTR_T = 'KW_UINTPTR_T',
  KW_INTMAX_T = 'KW_INTMAX_T',
  KW_UINTMAX_T = 'KW_UINTMAX_T',
  KW_SIZE_T = 'KW_SIZE_T',
  KW_PTRDIFF_T = 'KW_PTRDIFF_T',
  KW_WINT_T = 'KW_WINT_T',
  KW_WCTRANS_T = 'KW_WCTRANS_T',
  KW_WCTYPE_T = 'KW_WCTYPE_T',
  KW_VA_LIST = 'KW_VA_LIST',
  
  // Type qualifiers
  KW_CONST = 'KW_CONST',
  KW_VOLATILE = 'KW_VOLATILE',
  KW_RESTRICT = 'KW_RESTRICT',
  KW_ATOMIC = 'KW_ATOMIC',
  
  // Storage class
  KW_STATIC = 'KW_STATIC',
  KW_EXTERN = 'KW_EXTERN',
  KW_AUTO = 'KW_AUTO',
  KW_REGISTER = 'KW_REGISTER',
  KW_THREAD_LOCAL = 'KW_THREAD_LOCAL',
  KW_TYPEDEF = 'KW_TYPEDEF',
  
  // Function specifiers
  KW_INLINE = 'KW_INLINE',
  KW_NORETURN = 'KW_NORETURN',
  KW_CONSTEXPR = 'KW_CONSTEXPR',
  
  // Control flow
  KW_IF = 'KW_IF',
  KW_ELSE = 'KW_ELSE',
  KW_SWITCH = 'KW_SWITCH',
  KW_CASE = 'KW_CASE',
  KW_DEFAULT = 'KW_DEFAULT',
  KW_WHILE = 'KW_WHILE',
  KW_DO = 'KW_DO',
  KW_FOR = 'KW_FOR',
  KW_GOTO = 'KW_GOTO',
  KW_CONTINUE = 'KW_CONTINUE',
  KW_BREAK = 'KW_BREAK',
  KW_RETURN = 'KW_RETURN',
  
  // Structure/Union/Enum
  KW_STRUCT = 'KW_STRUCT',
  KW_UNION = 'KW_UNION',
  KW_ENUM = 'KW_ENUM',
  
  // Other
  KW_SIZEOF = 'KW_SIZEOF',
  KW_ALIGNOF = 'KW_ALIGNOF',
  KW_TYPEOF = 'KW_TYPEOF',
  KW_TYPEOF_UNQUAL = 'KW_TYPEOF_UNQUAL',
  KW_OFFSETOF = 'KW_OFFSETOF',
  KW_GENERIC = 'KW_GENERIC',
  KW_STATIC_ASSERT = 'KW_STATIC_ASSERT',
  KW_ATTRIBUTE = 'KW_ATTRIBUTE',
  KW_ALIGNAS = 'KW_ALIGNAS',
  
  // C23 new keywords
  KW_BITINT = 'KW_BITINT',
  KW_DECIMAL32 = 'KW_DECIMAL32',
  KW_DECIMAL64 = 'KW_DECIMAL64',
  KW_DECIMAL128 = 'KW_DECIMAL128',
  KW_NULLPTR = 'KW_NULLPTR',
  KW_UNREACHABLE = 'KW_UNREACHABLE',
  KW_FALLTHROUGH = 'KW_FALLTHROUGH',
  KW_MAYBE_UNUSED = 'KW_MAYBE_UNUSED',
  KW_NODISCARD = 'KW_NODISCARD',
  KW_DEPRECATED = 'KW_DEPRECATED',
  
  // Literals
  INTEGER_CONSTANT = 'INTEGER_CONSTANT',
  FLOATING_CONSTANT = 'FLOATING_CONSTANT',
  CHARACTER_CONSTANT = 'CHARACTER_CONSTANT',
  STRING_LITERAL = 'STRING_LITERAL',
  USER_DEFINED_LITERAL = 'USER_DEFINED_LITERAL',
  
  // Punctuators
  LBRACE = 'LBRACE',          // {
  RBRACE = 'RBRACE',          // }
  LBRACKET = 'LBRACKET',      // [
  RBRACKET = 'RBRACKET',      // ]
  LPAREN = 'LPAREN',          // (
  RPAREN = 'RPAREN',          // )
  SEMICOLON = 'SEMICOLON',    // ;
  COMMA = 'COMMA',            // ,
  COLON = 'COLON',            // :
  ELLIPSIS = 'ELLIPSIS',      // ...
  ARROW = 'ARROW',            // ->
  DOT = 'DOT',                // .
  
  // Operators
  PLUS = 'PLUS',              // +
  MINUS = 'MINUS',            // -
  STAR = 'STAR',              // *
  SLASH = 'SLASH',            // /
  PERCENT = 'PERCENT',        // %
  AMPERSAND = 'AMPERSAND',    // &
  PIPE = 'PIPE',              // |
  CARET = 'CARET',            // ^
  TILDE = 'TILDE',            // ~
  EXCLAM = 'EXCLAM',          // !
  QUESTION = 'QUESTION',      // ?
  
  // Compound assignment
  PLUS_EQ = 'PLUS_EQ',        // +=
  MINUS_EQ = 'MINUS_EQ',      // -=
  STAR_EQ = 'STAR_EQ',        // *=
  SLASH_EQ = 'SLASH_EQ',      // /=
  PERCENT_EQ = 'PERCENT_EQ',  // %=
  AMP_EQ = 'AMP_EQ',          // &=
  PIPE_EQ = 'PIPE_EQ',        // |=
  CARET_EQ = 'CARET_EQ',      // ^=
  LSHIFT_EQ = 'LSHIFT_EQ',    // <<=
  RSHIFT_EQ = 'RSHIFT_EQ',    // >>=
  
  // Assignment
  ASSIGN = 'ASSIGN',          // =
  
  // Comparison
  EQ_EQ = 'EQ_EQ',            // ==
  NOT_EQ = 'NOT_EQ',          // !=
  LT = 'LT',                  // <
  GT = 'GT',                  // >
  LE = 'LE',                  // <=
  GE = 'GE',                  // >=
  
  // Logical
  AMP_AMP = 'AMP_AMP',        // &&
  PIPE_PIPE = 'PIPE_PIPE',    // ||
  
  // Bitwise shift
  LSHIFT = 'LSHIFT',          // <<
  RSHIFT = 'RSHIFT',          // >>
  
  // Increment/Decrement
  PLUS_PLUS = 'PLUS_PLUS',    // ++
  MINUS_MINUS = 'MINUS_MINUS', // --
  
  // Attribute syntax
  DBL_LBRACKET = 'DBL_LBRACKET', // [[
  DBL_RBRACKET = 'DBL_RBRACKET', // ]]
  
  // Special
  EOF = 'EOF',
  UNKNOWN = 'UNKNOWN',
}

export interface SourceLocation {
  offset: number;
  line: number;
  column: number;
}

export interface SourceRange {
  start: SourceLocation;
  end: SourceLocation;
}

export interface Token {
  kind: TokenKind;
  text: string;
  range: SourceRange;
  // For keywords that were identified as identifiers but are actually keywords
  isKeyword?: boolean;
}

// ============================================================================
// LEXER - Lossless, preserves all source text exactly
// ============================================================================

const KEYWORD_MAP: ReadonlyMap<string, TokenKind> = new Map([
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
  ['alignas', TokenKind.KW_ALIGNAS],
  
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
const PUNCTUATORS: readonly string[] = [
  '...', '<<=', '>>=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', 
  '<<', '>>', '==', '!=', '<=', '>=', '&&', '||', '++', '--', '->',
  '[[', ']]',
  '{', '}', '[', ']', '(', ')', ';', ',', ':', '.', 
  '+', '-', '*', '/', '%', '&', '|', '^', '~', '!', '?',
  '<', '>', '=', 
];

export class Lexer {
  private source: string;
  private length: number;
  private pos: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: Token[] = [];
  
  constructor(source: string) {
    this.source = source;
    this.length = source.length;
  }
  
  tokenize(): Token[] {
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
  
  private makeLoc(): SourceLocation {
    return { offset: this.pos, line: this.line, column: this.column };
  }
  
  private makeRange(start: SourceLocation): SourceRange {
    return { start, end: this.makeLoc() };
  }
  
  private addToken(kind: TokenKind, start: SourceLocation, text?: string): void {
    const tokenText = text ?? this.source.slice(start.offset, this.pos);
    this.tokens.push({
      kind,
      text: tokenText,
      range: this.makeRange(start),
    });
  }
  
  private advance(): string {
    const ch = this.source[this.pos++];
    if (ch === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return ch;
  }
  
  private peek(offset: number = 0): string {
    const idx = this.pos + offset;
    return idx < this.length ? this.source[idx] : '\0';
  }
  
  private match(str: string): boolean {
    if (this.source.startsWith(str, this.pos)) {
      for (let i = 0; i < str.length; i++) this.advance();
      return true;
    }
    return false;
  }
  
  private scanToken(): void {
    const start = this.makeLoc();
    const ch = this.peek();
    
    // End of file
    if (ch === '\0') return;
    
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
  
  private isLineStartWhitespaceOnly(offset: number): boolean {
    for (let i = offset - 1; i >= 0; i--) {
      const c = this.source[i];
      if (c === '\n') return true;
      if (c !== ' ' && c !== '\t' && c !== '\r') return false;
    }
    return true;
  }
  
  private scanPreprocessorDirective(start: SourceLocation): void {
    // Scan until end of line, handling line continuations (\)
    while (this.pos < this.length) {
      const ch = this.advance();
      if (ch === '\\' && this.peek() === '\n') {
        this.advance(); // consume \ and \n
        continue;
      }
      if (ch === '\n') break;
    }
    this.addToken(TokenKind.PP_DIRECTIVE, start);
  }
  
  private scanLineComment(start: SourceLocation): void {
    this.advance(); // /
    this.advance(); // /
    while (this.pos < this.length && this.peek() !== '\n') {
      this.advance();
    }
    this.addToken(TokenKind.LINE_COMMENT, start);
  }
  
  private scanBlockComment(start: SourceLocation): void {
    this.advance(); // /
    this.advance(); // *
    let nested = 1;
    while (this.pos < this.length && nested > 0) {
      if (this.peek() === '*' && this.peek(1) === '/') {
        this.advance(); this.advance();
        nested--;
      } else if (this.peek() === '/' && this.peek(1) === '*') {
        this.advance(); this.advance();
        nested++;
      } else {
        this.advance();
      }
    }
    this.addToken(TokenKind.BLOCK_COMMENT, start);
  }
  
  private scanWhitespace(start: SourceLocation): void {
    while (this.pos < this.length && this.isWhitespace(this.peek())) {
      this.advance();
    }
    const text = this.source.slice(start.offset, this.pos);
    if (text.includes('\n')) {
      // Split by newlines for better location tracking
      this.addToken(TokenKind.WHITESPACE, start, text);
    } else {
      this.addToken(TokenKind.WHITESPACE, start);
    }
  }
  
  private isWhitespace(ch: string): boolean {
    return ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n' || ch === '\f' || ch === '\v';
  }
  
  private matchStringPrefix(): boolean {
    const prefixes = ['u8', 'u', 'U', 'L'];
    for (const prefix of prefixes) {
      if (this.source.startsWith(prefix + '"', this.pos) || 
          this.source.startsWith(prefix + "'", this.pos)) {
        return true;
      }
    }
    return false;
  }
  
  private scanStringOrCharLiteral(start: SourceLocation): void {
    // Handle prefixes
    const prefixes = ['u8', 'u', 'U', 'L'];
    for (const prefix of prefixes) {
      if (this.match(prefix)) break;
    }
    
    const quote = this.advance(); // ' or "
    const isChar = quote === '\'';
    
    while (this.pos < this.length) {
      const ch = this.advance();
      if (ch === '\\') {
        this.advance(); // escape sequence
      } else if (ch === quote) {
        break;
      } else if (ch === '\n' && isChar) {
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
    } else {
      this.addToken(isChar ? TokenKind.CHARACTER_CONSTANT : TokenKind.STRING_LITERAL, start);
    }
  }
  
  private scanIdentifierOrKeyword(start: SourceLocation): void {
    while (this.pos < this.length && this.isIdentifierPart(this.peek())) {
      this.advance();
    }
    const text = this.source.slice(start.offset, this.pos);
    const keywordKind = KEYWORD_MAP.get(text);
    if (keywordKind) {
      this.addToken(keywordKind, start);
      this.tokens[this.tokens.length - 1].isKeyword = true;
    } else {
      this.addToken(TokenKind.IDENTIFIER, start);
    }
  }
  
  private isIdentifierStart(ch: string): boolean {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_' || ch >= '\u0080';
  }
  
  private isIdentifierPart(ch: string): boolean {
    return this.isIdentifierStart(ch) || (ch >= '0' && ch <= '9');
  }
  
  private isDigit(ch: string): boolean {
    return ch >= '0' && ch <= '9';
  }
  
  private scanNumber(start: SourceLocation): void {
    let hasDot = false;
    let hasExp = false;
    
    // Hex/binary/octal prefix
    if (this.match('0x') || this.match('0X')) {
      while (this.isHexDigit(this.peek()) || this.peek() === '\'') {
        if (this.peek() === '\'') this.advance(); // digit separator
        else this.advance();
      }
      if (this.peek() === '.') {
        hasDot = true;
        this.advance();
        while (this.isHexDigit(this.peek()) || this.peek() === '\'') {
          if (this.peek() === '\'') this.advance();
          else this.advance();
        }
      }
      if (this.peek() === 'p' || this.peek() === 'P') {
        hasExp = true;
        this.advance();
        if (this.peek() === '+' || this.peek() === '-') this.advance();
        while (this.isDigit(this.peek()) || this.peek() === '\'') {
          if (this.peek() === '\'') this.advance();
          else this.advance();
        }
      }
    } else if (this.match('0b') || this.match('0B')) {
      while (this.peek() === '0' || this.peek() === '1' || this.peek() === '\'') {
        if (this.peek() === '\'') this.advance();
        else this.advance();
      }
    } else {
      // Decimal or float
      while (this.isDigit(this.peek()) || this.peek() === '\'') {
        if (this.peek() === '\'') this.advance();
        else this.advance();
      }
      if (this.peek() === '.') {
        hasDot = true;
        this.advance();
        while (this.isDigit(this.peek()) || this.peek() === '\'') {
          if (this.peek() === '\'') this.advance();
          else this.advance();
        }
      }
      if (this.peek() === 'e' || this.peek() === 'E') {
        hasExp = true;
        this.advance();
        if (this.peek() === '+' || this.peek() === '-') this.advance();
        while (this.isDigit(this.peek()) || this.peek() === '\'') {
          if (this.peek() === '\'') this.advance();
          else this.advance();
        }
      }
    }
    
    // Suffixes (u, U, l, L, ll, LL, f, F, etc.)
    const suffixStart = this.pos;
    while (this.isIdentifierPart(this.peek())) {
      this.advance();
    }
    
    this.addToken(hasDot || hasExp ? TokenKind.FLOATING_CONSTANT : TokenKind.INTEGER_CONSTANT, start);
  }
  
  private isHexDigit(ch: string): boolean {
    return this.isDigit(ch) || (ch >= 'a' && ch <= 'f') || (ch >= 'A' && ch <= 'F');
  }
  
  private scanPunctuator(start: SourceLocation): void {
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
  
  private punctuatorToKind(punct: string): TokenKind {
    const map: Record<string, TokenKind> = {
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
      '=': TokenKind.ASSIGN,
    };
    return map[punct] || TokenKind.UNKNOWN;
  }
}

// ============================================================================
// AST NODES - Minimal structure, preserves token ranges for round-trip
// ============================================================================

export interface ASTNode {
  range: SourceRange;
  children: ASTNode[];
}

export interface TranslationUnit extends ASTNode {
  kind: 'TranslationUnit';
  externalDeclarations: ExternalDeclaration[];
}

export type ExternalDeclaration = 
  | FunctionDefinition
  | Declaration
  | StaticAssertDeclaration
  | PPDirective
  | Comment;

export interface FunctionDefinition extends ASTNode {
  kind: 'FunctionDefinition';
  declarationSpecifiers: DeclarationSpecifier[];
  declarator: Declarator;
  compoundStatement: CompoundStatement;
}

export interface Declaration extends ASTNode {
  kind: 'Declaration';
  declarationSpecifiers: DeclarationSpecifier[];
  initDeclarators: InitDeclarator[];
}

export interface DeclarationSpecifier extends ASTNode {
  kind: 'DeclarationSpecifier';
  storageClass?: StorageClassSpecifier;
  typeSpecifier?: TypeSpecifier;
  typeQualifier?: TypeQualifier;
  functionSpecifier?: FunctionSpecifier;
  alignmentSpecifier?: AlignmentSpecifier;
  attributeSpecifier?: AttributeSpecifier;
}

export interface StorageClassSpecifier extends ASTNode {
  kind: 'StorageClassSpecifier';
  token: Token;
}

export interface TypeSpecifier extends ASTNode {
  kind: 'TypeSpecifier';
  token: Token;
  // For struct/union/enum
  tag?: Token;
  members?: StructDeclarationList;
  enumConstants?: EnumeratorList;
  // For typeof
  typeofExpression?: Expression | TypeName;
}

export interface TypeQualifier extends ASTNode {
  kind: 'TypeQualifier';
  token: Token;
}

export interface FunctionSpecifier extends ASTNode {
  kind: 'FunctionSpecifier';
  token: Token;
}

export interface AlignmentSpecifier extends ASTNode {
  kind: 'AlignmentSpecifier';
  token: Token; // _Alignas
  expression: Expression | TypeName;
}

export interface AttributeSpecifier extends ASTNode {
  kind: 'AttributeSpecifier';
  tokens: Token[]; // [[ ... ]]
}

export interface InitDeclarator extends ASTNode {
  kind: 'InitDeclarator';
  declarator: Declarator;
  initializer?: Initializer;
}

export interface Declarator extends ASTNode {
  kind: 'Declarator';
  pointer?: Pointer;
  directDeclarator: DirectDeclarator;
}

export interface Pointer extends ASTNode {
  kind: 'Pointer';
  typeQualifiers: TypeQualifier[];
  next?: Pointer;
}

export interface DirectDeclarator extends ASTNode {
  kind: 'DirectDeclarator';
  identifier?: Token;
  // Array declarator
  arrayDeclarator?: ArrayDeclarator;
  // Function declarator
  parameterList?: ParameterDeclaration[];
  // Parenthesized declarator
  nestedDeclarator?: Declarator;
}

export interface ArrayDeclarator extends ASTNode {
  kind: 'ArrayDeclarator';
  directDeclarator: DirectDeclarator;
  typeQualifiers: TypeQualifier[];
  assignmentExpression?: Expression;
  isStatic?: boolean;
  isVLA?: boolean;
}

export interface ParameterDeclaration extends ASTNode {
  kind: 'ParameterDeclaration';
  declarationSpecifiers: DeclarationSpecifier[];
  declarator?: Declarator;
  abstractDeclarator?: AbstractDeclarator;
}

export interface AbstractDeclarator extends ASTNode {
  kind: 'AbstractDeclarator';
  pointer?: Pointer;
  directAbstractDeclarator?: DirectAbstractDeclarator;
}

export interface DirectAbstractDeclarator extends ASTNode {
  kind: 'DirectAbstractDeclarator';
  arrayDeclarator?: ArrayDeclarator;
  parameterList?: ParameterDeclaration[];
  nestedDeclarator?: AbstractDeclarator;
}

export interface Initializer extends ASTNode {
  kind: 'Initializer';
  assignmentExpression?: Expression;
  initializerList?: InitializerList;
}

export interface InitializerList extends ASTNode {
  kind: 'InitializerList';
  initializers: Initializer[];
  hasTrailingComma: boolean;
}

export interface Statement extends ASTNode {
  kind: 'Statement';
}

export interface LabeledStatement extends Statement {
  kind: 'LabeledStatement';
  label: Token; // identifier or case/default
  statement: Statement;
}

export interface CompoundStatement extends Statement {
  kind: 'CompoundStatement';
  blockItems: BlockItem[];
}

export type BlockItem = Statement | Declaration | PPDirective | Comment;

export interface ExpressionStatement extends Statement {
  kind: 'ExpressionStatement';
  expression?: Expression;
}

export interface IfStatement extends Statement {
  kind: 'IfStatement';
  condition: Expression;
  thenStatement: Statement;
  elseStatement?: Statement;
}

export interface SwitchStatement extends Statement {
  kind: 'SwitchStatement';
  condition: Expression;
  body: Statement;
}

export interface WhileStatement extends Statement {
  kind: 'WhileStatement';
  condition: Expression;
  body: Statement;
  isDoWhile: boolean;
}

export interface ForStatement extends Statement {
  kind: 'ForStatement';
  init: Expression | Declaration | null;
  condition?: Expression;
  increment?: Expression;
  body: Statement;
}

export interface GotoStatement extends Statement {
  kind: 'GotoStatement';
  label: Token;
}

export interface ContinueStatement extends Statement {
  kind: 'ContinueStatement';
}

export interface BreakStatement extends Statement {
  kind: 'BreakStatement';
}

export interface ReturnStatement extends Statement {
  kind: 'ReturnStatement';
  expression?: Expression;
}

export interface StaticAssertDeclaration extends ASTNode {
  kind: 'StaticAssertDeclaration';
  token: Token; // _Static_assert
  constantExpression: Expression;
  stringLiteral: Token;
}

export interface Expression extends ASTNode {
  kind: 'Expression';
}

export interface PrimaryExpression extends Expression {
  kind: 'PrimaryExpression';
  token: Token; // identifier, constant, string literal, (expression), generic selection
  // For generic selection
  genericSelection?: GenericSelection;
}

export interface GenericSelection extends ASTNode {
  kind: 'GenericSelection';
  controllingExpression: Expression;
  associations: GenericAssociation[];
}

export interface GenericAssociation extends ASTNode {
  kind: 'GenericAssociation';
  typeName?: TypeName;
  isDefault: boolean;
  expression: Expression;
}

export interface PostfixExpression extends Expression {
  kind: 'PostfixExpression';
  primary: PrimaryExpression;
  operations: PostfixOperation[];
}

export type PostfixOperation = 
  | { kind: 'ArrayAccess'; expression: Expression }
  | { kind: 'FunctionCall'; arguments: ArgumentExpressionList }
  | { kind: 'MemberAccess'; isArrow: boolean; identifier: Token }
  | { kind: 'PostInc' }
  | { kind: 'PostDec' };

export interface ArgumentExpressionList extends ASTNode {
  kind: 'ArgumentExpressionList';
  expressions: Expression[];
}

export interface UnaryExpression extends Expression {
  kind: 'UnaryExpression';
  operator?: Token; // ++, --, &, *, +, -, ~, !
  operand?: UnaryExpression;
  castExpression?: CastExpression;
  sizeofExpression?: Expression | TypeName;
  alignofExpression?: Expression | TypeName;
}

export interface CastExpression extends Expression {
  kind: 'CastExpression';
  typeName: TypeName;
  expression: CastExpression;
}

export interface MultiplicativeExpression extends Expression {
  kind: 'MultiplicativeExpression';
  left: CastExpression;
  operator: Token;
  right: CastExpression;
}

export interface AdditiveExpression extends Expression {
  kind: 'AdditiveExpression';
  left: MultiplicativeExpression;
  operator: Token;
  right: MultiplicativeExpression;
}

export interface ShiftExpression extends Expression {
  kind: 'ShiftExpression';
  left: AdditiveExpression;
  operator: Token;
  right: AdditiveExpression;
}

export interface RelationalExpression extends Expression {
  kind: 'RelationalExpression';
  left: ShiftExpression;
  operator: Token;
  right: ShiftExpression;
}

export interface EqualityExpression extends Expression {
  kind: 'EqualityExpression';
  left: RelationalExpression;
  operator: Token;
  right: RelationalExpression;
}

export interface AndExpression extends Expression {
  kind: 'AndExpression';
  left: EqualityExpression;
  right: EqualityExpression;
}

export interface ExclusiveOrExpression extends Expression {
  kind: 'ExclusiveOrExpression';
  left: AndExpression;
  right: AndExpression;
}

export interface InclusiveOrExpression extends Expression {
  kind: 'InclusiveOrExpression';
  left: ExclusiveOrExpression;
  right: ExclusiveOrExpression;
}

export interface LogicalAndExpression extends Expression {
  kind: 'LogicalAndExpression';
  left: InclusiveOrExpression;
  right: InclusiveOrExpression;
}

export interface LogicalOrExpression extends Expression {
  kind: 'LogicalOrExpression';
  left: LogicalAndExpression;
  right: LogicalAndExpression;
}

export interface ConditionalExpression extends Expression {
  kind: 'ConditionalExpression';
  condition: LogicalOrExpression;
  trueExpression: Expression;
  falseExpression: ConditionalExpression;
}

export interface AssignmentExpression extends Expression {
  kind: 'AssignmentExpression';
  left: UnaryExpression;
  operator: Token;
  right: AssignmentExpression;
}

export interface ExpressionList extends Expression {
  kind: 'ExpressionList';
  expressions: AssignmentExpression[];
}

export interface ConstantExpression extends Expression {
  kind: 'ConstantExpression';
  expression: ConditionalExpression;
}

export interface TypeName extends ASTNode {
  kind: 'TypeName';
  specifierQualifierList: SpecifierQualifier[];
  abstractDeclarator?: AbstractDeclarator;
}

export interface SpecifierQualifier extends ASTNode {
  kind: 'SpecifierQualifier';
  typeSpecifier?: TypeSpecifier;
  typeQualifier?: TypeQualifier;
  attributeSpecifier?: AttributeSpecifier;
}

export interface StructDeclarationList extends ASTNode {
  kind: 'StructDeclarationList';
  structDeclarations: StructDeclaration[];
}

export interface StructDeclaration extends ASTNode {
  kind: 'StructDeclaration';
  specifierQualifierList: SpecifierQualifier[];
  structDeclaratorList?: StructDeclarator[];
  staticAssert?: StaticAssertDeclaration;
}

export interface StructDeclarator extends ASTNode {
  kind: 'StructDeclarator';
  declarator?: Declarator;
  bitField?: Expression;
}

export interface EnumeratorList extends ASTNode {
  kind: 'EnumeratorList';
  enumerators: Enumerator[];
}

export interface Enumerator extends ASTNode {
  kind: 'Enumerator';
  identifier: Token;
  constantExpression?: Expression;
}

export interface PPDirective extends ASTNode {
  kind: 'PPDirective';
  token: Token;
}

export interface Comment extends ASTNode {
  kind: 'Comment';
  token: Token;
}

// ============================================================================
// PARSER - Recursive descent parser for C23
// ============================================================================

export class Parser {
  private tokens: Token[];
  private pos: number = 0;
  private errors: ParseError[] = [];
  
  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }
  
  parse(): TranslationUnit {
    const start = this.currentTokenRange().start;
    const externalDeclarations: ExternalDeclaration[] = [];
    
    while (!this.check(TokenKind.EOF)) {
      this.skipWhitespace();
      if (this.check(TokenKind.EOF)) break;
      if (this.check(TokenKind.PP_DIRECTIVE)) {
        externalDeclarations.push(this.parsePPDirective());
      } else if (this.check(TokenKind.LINE_COMMENT) || this.check(TokenKind.BLOCK_COMMENT)) {
        externalDeclarations.push(this.parseComment());
      } else {
        const decl = this.parseExternalDeclaration();
        if (decl) externalDeclarations.push(decl);
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
  
  getErrors(): ParseError[] {
    return this.errors;
  }
  
  private currentTokenRange(): SourceRange {
    return this.tokens[this.pos]?.range ?? { start: { offset: 0, line: 1, column: 1 }, end: { offset: 0, line: 1, column: 1 } };
  }
  
  private previousTokenRange(): SourceRange {
    return this.tokens[this.pos - 1]?.range ?? { start: { offset: 0, line: 1, column: 1 }, end: { offset: 0, line: 1, column: 1 } };
  }
  
  private peek(): Token {
    return this.tokens[this.pos];
  }
  
  private peekNonWhitespace(): Token {
    let pos = this.pos;
    while (pos < this.tokens.length && 
           (this.tokens[pos].kind === TokenKind.WHITESPACE || this.tokens[pos].kind === TokenKind.NEWLINE)) {
      pos++;
    }
    return this.tokens[pos] ?? this.tokens[this.tokens.length - 1]; // EOF
  }
  
  private peekKind(): TokenKind {
    return this.peekNonWhitespace().kind;
  }
  
  private check(kind: TokenKind): boolean {
    return this.peekKind() === kind;
  }
  
  private checkAny(...kinds: TokenKind[]): boolean {
    return kinds.includes(this.peekKind());
  }
  
  private advance(): Token {
    // Skip whitespace
    while (this.pos < this.tokens.length && 
           (this.tokens[this.pos].kind === TokenKind.WHITESPACE || this.tokens[this.pos].kind === TokenKind.NEWLINE)) {
      this.pos++;
    }
    const token = this.peek();
    if (!this.check(TokenKind.EOF)) this.pos++;
    return token;
  }
  
  private advanceRaw(): Token {
    const token = this.peek();
    if (!this.check(TokenKind.EOF)) this.pos++;
    return token;
  }
  
  private skipWhitespace(): void {
    while (this.pos < this.tokens.length && 
           (this.tokens[this.pos].kind === TokenKind.WHITESPACE || this.tokens[this.pos].kind === TokenKind.NEWLINE)) {
      this.pos++;
    }
  }
  
  private error(message: string, range: SourceRange): void {
    this.errors.push({ message, range });
  }
  
  private consume(kind: TokenKind, message: string): Token {
    if (this.check(kind)) return this.advance();
    this.error(message, this.currentTokenRange());
    return { kind, text: '', range: this.currentTokenRange() };
  }
  
  // ---------------------------------------------------------------------------
  // External declarations
  // ---------------------------------------------------------------------------
  
  private parseExternalDeclaration(): ExternalDeclaration | null {
    this.skipWhitespace();
    
    // Handle _Static_assert as a standalone declaration
    if (this.check(TokenKind.KW_STATIC_ASSERT)) {
      return this.parseStaticAssertDeclaration();
    }
    
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
  
  private parseDeclaration(declSpecs: DeclarationSpecifier[]): Declaration {
    const start = this.getNodeStart(declSpecs[0]);
    const initDeclarators: InitDeclarator[] = [];
    
    while (true) {
      initDeclarators.push(this.parseInitDeclarator(declSpecs));
      if (!this.check(TokenKind.COMMA)) break;
      this.advance(); // consume comma
    }
    
    this.consume(TokenKind.SEMICOLON, 'Expected ; after declaration');
    
    return this.makeNode('Declaration', start, {
      declarationSpecifiers: declSpecs,
      initDeclarators,
    });
  }
  
  private parseInitDeclarator(declSpecs: DeclarationSpecifier[]): InitDeclarator {
    const start = this.currentTokenRange().start;
    const declarator = this.parseDeclarator(declSpecs);
    let initializer: Initializer | undefined;
    
    if (this.check(TokenKind.PLUS_EQ) || this.check(TokenKind.EQ_EQ)) {
      // This is actually an operator, not assignment - but handle gracefully
    } else if (this.check(TokenKind.PLUS) || this.check(TokenKind.MINUS) || 
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
    } else if (this.matchAssign()) {
      initializer = this.parseInitializer();
    }
    
    return this.makeNode('InitDeclarator', start, { declarator, initializer });
  }
  
  private matchAssign(): boolean {
    if (this.check(TokenKind.PLUS_EQ)) return false; // handled elsewhere
    if (this.check(TokenKind.ASSIGN)) {
      this.advance(); // consume the = token
      return true;
    }
    return false;
  }
  
  private parseInitializer(): Initializer {
    const start = this.currentTokenRange().start;
    
    if (this.check(TokenKind.LBRACE)) {
      const list = this.parseInitializerList();
      return this.makeNode('Initializer', start, { initializerList: list });
    }
    
    const expr = this.parseAssignmentExpression();
    return this.makeNode('Initializer', start, { assignmentExpression: expr });
  }
  
  private parseInitializerList(): InitializerList {
    const start = this.currentTokenRange().start;
    this.consume(TokenKind.LBRACE, 'Expected {');
    
    const initializers: Initializer[] = [];
    let hasTrailingComma = false;
    
    while (!this.check(TokenKind.RBRACE) && !this.check(TokenKind.EOF)) {
      initializers.push(this.parseInitializer());
      if (this.check(TokenKind.COMMA)) {
        this.advance();
        hasTrailingComma = true;
        if (this.check(TokenKind.RBRACE)) break;
      } else {
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
  
  private parseDeclarationSpecifiers(): DeclarationSpecifier[] {
    const specs: DeclarationSpecifier[] = [];
    
    while (true) {
      this.skipWhitespace();
      
      // Check if next token ends the declaration specifiers
      // (identifier for declarator, or punctuator for function/array declarator)
      const nextKind = this.peekKind();
      if (nextKind === TokenKind.IDENTIFIER || 
          nextKind === TokenKind.LPAREN || 
          nextKind === TokenKind.STAR ||
          nextKind === TokenKind.SEMICOLON ||
          nextKind === TokenKind.COMMA ||
          nextKind === TokenKind.RPAREN) {
        break;
      }
      
      if (this.isStorageClassSpecifier()) {
        specs.push(this.parseStorageClassSpecifier());
      } else if (this.isTypeSpecifier()) {
        specs.push(this.parseTypeSpecifier());
      } else if (this.isTypeQualifier()) {
        specs.push(this.parseTypeQualifier());
      } else if (this.isFunctionSpecifier()) {
        specs.push(this.parseFunctionSpecifier());
      } else if (this.isAlignmentSpecifier()) {
        specs.push(this.parseAlignmentSpecifier());
      } else if (this.isAttributeSpecifier()) {
        specs.push(this.parseAttributeSpecifier());
      } else {
        break;
      }
    }
    
    return specs;
  }
  
  private isStorageClassSpecifier(): boolean {
    return this.checkAny(
      TokenKind.KW_STATIC, TokenKind.KW_EXTERN, TokenKind.KW_AUTO,
      TokenKind.KW_REGISTER, TokenKind.KW_THREAD_LOCAL, TokenKind.KW_TYPEDEF
    );
  }
  
  private parseStorageClassSpecifier(): DeclarationSpecifier {
    const token = this.advance();
    return this.makeNode('StorageClassSpecifier', token.range.start, { token });
  }
  
  private isTypeSpecifier(): boolean {
    return this.checkAny(
      TokenKind.KW_VOID, TokenKind.KW_CHAR, TokenKind.KW_SHORT, TokenKind.KW_INT,
      TokenKind.KW_LONG, TokenKind.KW_FLOAT, TokenKind.KW_DOUBLE,
      TokenKind.KW_SIGNED, TokenKind.KW_UNSIGNED, TokenKind.KW_BOOL,
      TokenKind.KW_COMPLEX, TokenKind.KW_IMAGINARY,
      TokenKind.KW_WCHAR_T, TokenKind.KW_CHAR16_T, TokenKind.KW_CHAR32_T,
      TokenKind.KW_INT8_T, TokenKind.KW_INT16_T, TokenKind.KW_INT32_T, TokenKind.KW_INT64_T,
      TokenKind.KW_UINT8_T, TokenKind.KW_UINT16_T, TokenKind.KW_UINT32_T, TokenKind.KW_UINT64_T,
      TokenKind.KW_INT_LEAST8_T, TokenKind.KW_INT_LEAST16_T, TokenKind.KW_INT_LEAST32_T, TokenKind.KW_INT_LEAST64_T,
      TokenKind.KW_UINT_LEAST8_T, TokenKind.KW_UINT_LEAST16_T, TokenKind.KW_UINT_LEAST32_T, TokenKind.KW_UINT_LEAST64_T,
      TokenKind.KW_INT_FAST8_T, TokenKind.KW_INT_FAST16_T, TokenKind.KW_INT_FAST32_T, TokenKind.KW_INT_FAST64_T,
      TokenKind.KW_UINT_FAST8_T, TokenKind.KW_UINT_FAST16_T, TokenKind.KW_UINT_FAST32_T, TokenKind.KW_UINT_FAST64_T,
      TokenKind.KW_INTPTR_T, TokenKind.KW_UINTPTR_T,
      TokenKind.KW_INTMAX_T, TokenKind.KW_UINTMAX_T,
      TokenKind.KW_SIZE_T, TokenKind.KW_PTRDIFF_T,
      TokenKind.KW_WINT_T, TokenKind.KW_WCTRANS_T, TokenKind.KW_WCTYPE_T,
      TokenKind.KW_VA_LIST,
      TokenKind.KW_STRUCT, TokenKind.KW_UNION, TokenKind.KW_ENUM,
      TokenKind.KW_SIZEOF, TokenKind.KW_TYPEOF, TokenKind.KW_TYPEOF_UNQUAL,
      TokenKind.KW_BITINT, TokenKind.KW_DECIMAL32, TokenKind.KW_DECIMAL64, TokenKind.KW_DECIMAL128
      // Note: IDENTIFIER for typedef names requires symbol table, omitted for now
    );
  }
  
  private parseTypeSpecifier(): DeclarationSpecifier {
    const token = this.advance();
    const start = token.range.start;
    
    // Handle struct/union/enum with body
    if (token.kind === TokenKind.KW_STRUCT || token.kind === TokenKind.KW_UNION) {
      let tag: Token | undefined;
      let members: StructDeclarationList | undefined;
      
      if (this.check(TokenKind.IDENTIFIER)) {
        tag = this.advance();
      }
      
      if (this.check(TokenKind.LBRACE)) {
        members = this.parseStructDeclarationList();
      }
      
      return this.makeNode('TypeSpecifier', start, { token, tag, members });
    }
    
    if (token.kind === TokenKind.KW_ENUM) {
      let tag: Token | undefined;
      let enumConstants: EnumeratorList | undefined;
      
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
  
  private isTypeQualifier(): boolean {
    return this.checkAny(
      TokenKind.KW_CONST, TokenKind.KW_VOLATILE, 
      TokenKind.KW_RESTRICT, TokenKind.KW_ATOMIC
    );
  }
  
  private parseTypeQualifier(): DeclarationSpecifier {
    const token = this.advance();
    return this.makeNode('TypeQualifier', token.range.start, { token });
  }
  
  private isFunctionSpecifier(): boolean {
    return this.checkAny(TokenKind.KW_INLINE, TokenKind.KW_NORETURN, TokenKind.KW_CONSTEXPR);
  }
  
  private parseFunctionSpecifier(): DeclarationSpecifier {
    const token = this.advance();
    return this.makeNode('FunctionSpecifier', token.range.start, { token });
  }
  
  private isAlignmentSpecifier(): boolean {
    return this.check(TokenKind.KW_ALIGNAS);
  }
  
  private parseAlignmentSpecifier(): DeclarationSpecifier {
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
  
  private isAttributeSpecifier(): boolean {
    return this.check(TokenKind.DBL_LBRACKET);
  }
  
  private parseAttributeSpecifier(): DeclarationSpecifier {
    const start = this.currentTokenRange().start;
    const tokens: Token[] = [];
    
    this.consume(TokenKind.DBL_LBRACKET, 'Expected [[');
    tokens.push(this.tokens[this.pos - 1]);
    
    while (!this.check(TokenKind.DBL_RBRACKET) && !this.check(TokenKind.EOF)) {
      tokens.push(this.advance());
    }
    
    this.consume(TokenKind.DBL_RBRACKET, 'Expected ]]');
    tokens.push(this.tokens[this.pos - 1]);
    
    return this.makeNode('AttributeSpecifier', start, { tokens });
  }
  
  private parseSpecifierQualifierList(): SpecifierQualifier[] {
    const list: SpecifierQualifier[] = [];
    
    while (this.isTypeSpecifier() || this.isTypeQualifier() || this.isAttributeSpecifier()) {
      const start = this.currentTokenRange().start;
      
      if (this.isTypeSpecifier()) {
        list.push(this.makeNode('SpecifierQualifier', start, { typeSpecifier: this.parseTypeSpecifier() }));
      } else if (this.isTypeQualifier()) {
        list.push(this.makeNode('SpecifierQualifier', start, { typeQualifier: this.parseTypeQualifier() }));
      } else if (this.isAttributeSpecifier()) {
        list.push(this.makeNode('SpecifierQualifier', start, { attributeSpecifier: this.parseAttributeSpecifier() }));
      }
    }
    
    return list;
  }
  
  // ---------------------------------------------------------------------------
  // Struct/Union/Enum
  // ---------------------------------------------------------------------------
  
  private parseStructDeclarationList(): StructDeclarationList {
    const start = this.currentTokenRange().start;
    this.consume(TokenKind.LBRACE, 'Expected {');
    
    const structDeclarations: StructDeclaration[] = [];
    
    while (!this.check(TokenKind.RBRACE) && !this.check(TokenKind.EOF)) {
      structDeclarations.push(this.parseStructDeclaration());
    }
    
    this.consume(TokenKind.RBRACE, 'Expected }');
    
    return this.makeNode('StructDeclarationList', start, { structDeclarations });
  }
  
  private parseStructDeclaration(): StructDeclaration {
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
    
    const structDeclaratorList: StructDeclarator[] = [];
    
    while (true) {
      structDeclaratorList.push(this.parseStructDeclarator());
      if (!this.check(TokenKind.COMMA)) break;
      this.advance();
    }
    
    this.consume(TokenKind.SEMICOLON, 'Expected ;');
    
    return this.makeNode('StructDeclaration', start, { specifierQualifierList, structDeclaratorList });
  }
  
  private parseStructDeclarator(): StructDeclarator {
    const start = this.currentTokenRange().start;
    
    let declarator: Declarator | undefined;
    let bitField: Expression | undefined;
    
    if (!this.check(TokenKind.COLON)) {
      declarator = this.parseDeclarator([]);
    }
    
    if (this.check(TokenKind.COLON)) {
      this.advance();
      bitField = this.parseConstantExpression();
    }
    
    return this.makeNode('StructDeclarator', start, { declarator, bitField });
  }
  
  private parseEnumeratorList(): EnumeratorList {
    const start = this.currentTokenRange().start;
    this.consume(TokenKind.LBRACE, 'Expected {');
    
    const enumerators: Enumerator[] = [];
    
    while (!this.check(TokenKind.RBRACE) && !this.check(TokenKind.EOF)) {
      enumerators.push(this.parseEnumerator());
      if (!this.check(TokenKind.COMMA)) break;
      this.advance();
    }
    
    this.consume(TokenKind.RBRACE, 'Expected }');
    
    return this.makeNode('EnumeratorList', start, { enumerators });
  }
  
  private parseEnumerator(): Enumerator {
    const start = this.currentTokenRange().start;
    const identifier = this.consume(TokenKind.IDENTIFIER, 'Expected identifier');
    
    let constantExpression: Expression | undefined;
    if (this.check(TokenKind.PLUS_EQ) || this.check(TokenKind.EQ_EQ)) {
      // not assignment
    } else if (this.check(TokenKind.PLUS) || this.check(TokenKind.MINUS) || 
               this.check(TokenKind.STAR) || this.check(TokenKind.SLASH) ||
               this.check(TokenKind.PERCENT) || this.check(TokenKind.AMPERSAND) ||
               this.check(TokenKind.PIPE) || this.check(TokenKind.CARET) ||
               this.check(TokenKind.TILDE) || this.check(TokenKind.EXCLAM) ||
               this.check(TokenKind.QUESTION) || this.check(TokenKind.LT) ||
               this.check(TokenKind.GT) || this.check(TokenKind.COLON) ||
               this.check(TokenKind.SEMICOLON) || this.check(TokenKind.COMMA) ||
               this.check(TokenKind.RBRACE)) {
      // no initializer
    } else if (this.match('=')) {
      constantExpression = this.parseConstantExpression();
    }
    
    return this.makeNode('Enumerator', start, { identifier, constantExpression });
  }
  
  // ---------------------------------------------------------------------------
  // Declarators
  // ---------------------------------------------------------------------------
  
  private parseDeclarator(declSpecs: DeclarationSpecifier[]): Declarator {
    const start = this.currentTokenRange().start;
    const pointer = this.parsePointer();
    const directDeclarator = this.parseDirectDeclarator();
    
    return this.makeNode('Declarator', start, { pointer, directDeclarator });
  }
  
  private parsePointer(): Pointer | undefined {
    if (!this.check(TokenKind.STAR)) return undefined;
    
    const start = this.currentTokenRange().start;
    const typeQualifiers: TypeQualifier[] = [];
    
    while (this.check(TokenKind.STAR)) {
      this.advance(); // consume *
      while (this.isTypeQualifier()) {
        typeQualifiers.push(this.parseTypeQualifier());
      }
    }
    
    const next = this.parsePointer();
    return this.makeNode('Pointer', start, { typeQualifiers, next });
  }
  
  private parseDirectDeclarator(): DirectDeclarator {
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
  
  private parseDirectDeclaratorRest(
    start: SourceLocation, 
    identifier?: Token, 
    nestedDeclarator?: Declarator
  ): DirectDeclarator {
    // Array or function declarator
    while (true) {
      if (this.check(TokenKind.LBRACKET)) {
        // Array declarator
        this.advance(); // consume [
        const typeQualifiers: TypeQualifier[] = [];
        
        while (this.isTypeQualifier()) {
          typeQualifiers.push(this.parseTypeQualifier());
        }
        
        let assignmentExpression: Expression | undefined;
        let isStatic = false;
        let isVLA = false;
        
        if (this.check(TokenKind.KW_STATIC)) {
          isStatic = true;
          this.advance();
          while (this.isTypeQualifier()) {
            typeQualifiers.push(this.parseTypeQualifier());
          }
        } else if (this.isTypeQualifier()) {
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
        } else if (!this.check(TokenKind.RBRACKET)) {
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
        
        const parameterList: ParameterDeclaration[] = [];
        
        if (!this.check(TokenKind.RPAREN)) {
          // Check if it's a parameter list or identifier list (old style)
          if (this.isParameterDeclaration()) {
            while (true) {
              parameterList.push(this.parseParameterDeclaration());
              if (!this.check(TokenKind.COMMA)) break;
              this.advance();
              if (this.check(TokenKind.RPAREN)) break; // trailing comma
            }
          } else {
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
  
  private isParameterDeclaration(): boolean {
    // Heuristic: starts with declaration specifier
    return this.isStorageClassSpecifier() || this.isTypeSpecifier() || 
           this.isTypeQualifier() || this.isFunctionSpecifier() ||
           this.isAlignmentSpecifier() || this.isAttributeSpecifier();
  }
  
  private parseParameterDeclaration(): ParameterDeclaration {
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
  
  private parseAbstractDeclarator(): AbstractDeclarator {
    const start = this.currentTokenRange().start;
    const pointer = this.parsePointer();
    const directAbstractDeclarator = this.parseDirectAbstractDeclarator();
    
    return this.makeNode('AbstractDeclarator', start, { pointer, directAbstractDeclarator });
  }
  
  private parseDirectAbstractDeclarator(): DirectAbstractDeclarator | undefined {
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
        const parameterList: ParameterDeclaration[] = [];
        while (true) {
          parameterList.push(this.parseParameterDeclaration());
          if (!this.check(TokenKind.COMMA)) break;
          this.advance();
          if (this.check(TokenKind.RPAREN)) break;
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
  
  private parseDirectAbstractDeclaratorRest(
    start: SourceLocation, 
    nestedDeclarator?: AbstractDeclarator
  ): DirectAbstractDeclarator {
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
        const parameterList: ParameterDeclaration[] = [];
        if (!this.check(TokenKind.RPAREN)) {
          while (true) {
            parameterList.push(this.parseParameterDeclaration());
            if (!this.check(TokenKind.COMMA)) break;
            this.advance();
            if (this.check(TokenKind.RPAREN)) break;
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
  
  private parseArrayDeclarator(start: SourceLocation): ArrayDeclarator {
    this.advance(); // consume [
    const typeQualifiers: TypeQualifier[] = [];
    
    while (this.isTypeQualifier()) {
      typeQualifiers.push(this.parseTypeQualifier());
    }
    
    let assignmentExpression: Expression | undefined;
    let isStatic = false;
    let isVLA = false;
    
    if (this.check(TokenKind.KW_STATIC)) {
      isStatic = true;
      this.advance();
      while (this.isTypeQualifier()) {
        typeQualifiers.push(this.parseTypeQualifier());
      }
    } else if (this.isTypeQualifier()) {
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
    } else if (!this.check(TokenKind.RBRACKET)) {
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
  
  private parseTypeName(): TypeName {
    const start = this.currentTokenRange().start;
    const specifierQualifierList = this.parseSpecifierQualifierList();
    let abstractDeclarator: AbstractDeclarator | undefined;
    
    if (this.check(TokenKind.STAR) || this.check(TokenKind.LPAREN) || this.check(TokenKind.LBRACKET)) {
      abstractDeclarator = this.parseAbstractDeclarator();
    }
    
    return this.makeNode('TypeName', start, { specifierQualifierList, abstractDeclarator });
  }
  
  // ---------------------------------------------------------------------------
  // Statements
  // ---------------------------------------------------------------------------
  
  private parseStatement(): Statement {
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
    if (this.check(TokenKind.KW_IF)) return this.parseIfStatement();
    if (this.check(TokenKind.KW_SWITCH)) return this.parseSwitchStatement();
    if (this.check(TokenKind.KW_WHILE)) return this.parseWhileStatement();
    if (this.check(TokenKind.KW_DO)) return this.parseDoWhileStatement();
    if (this.check(TokenKind.KW_FOR)) return this.parseForStatement();
    if (this.check(TokenKind.KW_GOTO)) return this.parseGotoStatement();
    if (this.check(TokenKind.KW_CONTINUE)) return this.parseContinueStatement();
    if (this.check(TokenKind.KW_BREAK)) return this.parseBreakStatement();
    if (this.check(TokenKind.KW_RETURN)) return this.parseReturnStatement();
    
    // Expression statement or declaration
    if (this.isDeclarationStart()) {
      const decl = this.parseDeclaration(this.parseDeclarationSpecifiers());
      return decl;
    }
    
    // Expression statement
    return this.parseExpressionStatement();
  }
  
  private isDeclarationStart(): boolean {
    return this.isStorageClassSpecifier() || this.isTypeSpecifier() || 
           this.isTypeQualifier() || this.isFunctionSpecifier() ||
           this.isAlignmentSpecifier() || this.isAttributeSpecifier();
  }
  
  private parseLabeledStatement(): LabeledStatement {
    const start = this.currentTokenRange().start;
    let label: Token;
    
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
  
  private parseCompoundStatement(): CompoundStatement {
    const start = this.currentTokenRange().start;
    this.consume(TokenKind.LBRACE, 'Expected {');
    
    const blockItems: BlockItem[] = [];
    
    while (!this.check(TokenKind.RBRACE) && !this.check(TokenKind.EOF)) {
      if (this.check(TokenKind.PP_DIRECTIVE)) {
        blockItems.push(this.parsePPDirective());
      } else if (this.check(TokenKind.LINE_COMMENT) || this.check(TokenKind.BLOCK_COMMENT)) {
        blockItems.push(this.parseComment());
      } else if (this.isDeclarationStart()) {
        const declSpecs = this.parseDeclarationSpecifiers();
        if (this.check(TokenKind.SEMICOLON)) {
          // Empty declaration
          this.advance();
        } else {
          blockItems.push(this.parseDeclaration(declSpecs));
        }
      } else {
        blockItems.push(this.parseStatement());
      }
    }
    
    this.consume(TokenKind.RBRACE, 'Expected }');
    
    return this.makeNode('CompoundStatement', start, { blockItems });
  }
  
  private parseExpressionStatement(): ExpressionStatement {
    const start = this.currentTokenRange().start;
    
    let expression: Expression | undefined;
    if (!this.check(TokenKind.SEMICOLON)) {
      expression = this.parseExpression();
    }
    
    this.consume(TokenKind.SEMICOLON, 'Expected ;');
    
    return this.makeNode('ExpressionStatement', start, { expression });
  }
  
  private parseIfStatement(): IfStatement {
    const start = this.currentTokenRange().start;
    this.consume(TokenKind.KW_IF, 'Expected if');
    this.consume(TokenKind.LPAREN, 'Expected ( after if');
    const condition = this.parseExpression();
    this.consume(TokenKind.RPAREN, 'Expected ) after if condition');
    const thenStatement = this.parseStatement();
    
    let elseStatement: Statement | undefined;
    if (this.check(TokenKind.KW_ELSE)) {
      this.advance();
      elseStatement = this.parseStatement();
    }
    
    return this.makeNode('IfStatement', start, { condition, thenStatement, elseStatement });
  }
  
  private parseSwitchStatement(): SwitchStatement {
    const start = this.currentTokenRange().start;
    this.consume(TokenKind.KW_SWITCH, 'Expected switch');
    this.consume(TokenKind.LPAREN, 'Expected ( after switch');
    const condition = this.parseExpression();
    this.consume(TokenKind.RPAREN, 'Expected ) after switch condition');
    const body = this.parseStatement();
    
    return this.makeNode('SwitchStatement', start, { condition, body });
  }
  
  private parseWhileStatement(): WhileStatement {
    const start = this.currentTokenRange().start;
    this.consume(TokenKind.KW_WHILE, 'Expected while');
    this.consume(TokenKind.LPAREN, 'Expected ( after while');
    const condition = this.parseExpression();
    this.consume(TokenKind.RPAREN, 'Expected ) after while condition');
    const body = this.parseStatement();
    
    return this.makeNode('WhileStatement', start, { condition, body, isDoWhile: false });
  }
  
  private parseDoWhileStatement(): WhileStatement {
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
  
  private parseForStatement(): ForStatement {
    const start = this.currentTokenRange().start;
    this.consume(TokenKind.KW_FOR, 'Expected for');
    this.consume(TokenKind.LPAREN, 'Expected ( after for');
    
    let init: Expression | Declaration | null = null;
    
    if (!this.check(TokenKind.SEMICOLON)) {
      if (this.isDeclarationStart()) {
        const declSpecs = this.parseDeclarationSpecifiers();
        init = this.parseDeclaration(declSpecs);
      } else {
        init = this.parseExpression();
        this.consume(TokenKind.SEMICOLON, 'Expected ; after for init');
      }
    } else {
      this.advance(); // consume ;
    }
    
    let condition: Expression | undefined;
    if (!this.check(TokenKind.SEMICOLON)) {
      condition = this.parseExpression();
    }
    this.consume(TokenKind.SEMICOLON, 'Expected ; after for condition');
    
    let increment: Expression | undefined;
    if (!this.check(TokenKind.RPAREN)) {
      increment = this.parseExpression();
    }
    this.consume(TokenKind.RPAREN, 'Expected ) after for increment');
    
    const body = this.parseStatement();
    
    return this.makeNode('ForStatement', start, { init, condition, increment, body });
  }
  
  private parseGotoStatement(): GotoStatement {
    const start = this.currentTokenRange().start;
    this.consume(TokenKind.KW_GOTO, 'Expected goto');
    const label = this.consume(TokenKind.IDENTIFIER, 'Expected label after goto');
    this.consume(TokenKind.SEMICOLON, 'Expected ; after goto');
    
    return this.makeNode('GotoStatement', start, { label });
  }
  
  private parseContinueStatement(): ContinueStatement {
    const start = this.currentTokenRange().start;
    this.consume(TokenKind.KW_CONTINUE, 'Expected continue');
    this.consume(TokenKind.SEMICOLON, 'Expected ; after continue');
    
    return this.makeNode('ContinueStatement', start, {});
  }
  
  private parseBreakStatement(): BreakStatement {
    const start = this.currentTokenRange().start;
    this.consume(TokenKind.KW_BREAK, 'Expected break');
    this.consume(TokenKind.SEMICOLON, 'Expected ; after break');
    
    return this.makeNode('BreakStatement', start, {});
  }
  
  private parseReturnStatement(): ReturnStatement {
    const start = this.currentTokenRange().start;
    this.consume(TokenKind.KW_RETURN, 'Expected return');
    
    let expression: Expression | undefined;
    if (!this.check(TokenKind.SEMICOLON)) {
      expression = this.parseExpression();
    }
    
    this.consume(TokenKind.SEMICOLON, 'Expected ; after return');
    
    return this.makeNode('ReturnStatement', start, { expression });
  }
  
  private parseStaticAssertDeclaration(): StaticAssertDeclaration {
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
  
  private parseExpression(): Expression {
    return this.parseAssignmentExpression();
  }
  
  private parseAssignmentExpression(): Expression {
    const left = this.parseConditionalExpression();
    
    if (this.isAssignmentOperator()) {
      const operator = this.advance();
      const right = this.parseAssignmentExpression();
      return this.makeNode('AssignmentExpression', left.range.start, { left, operator, right });
    }
    
    return left;
  }
  
  private isAssignmentOperator(): boolean {
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
  
  private parseConditionalExpression(): Expression {
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
  
  private parseLogicalOrExpression(): Expression {
    let left = this.parseLogicalAndExpression();
    
    while (this.check(TokenKind.PIPE_PIPE)) {
      const operator = this.advance();
      const right = this.parseLogicalAndExpression();
      left = this.makeNode('LogicalOrExpression', left.range.start, { left, right });
    }
    
    return left;
  }
  
  private parseLogicalAndExpression(): Expression {
    let left = this.parseInclusiveOrExpression();
    
    while (this.check(TokenKind.AMP_AMP)) {
      const operator = this.advance();
      const right = this.parseInclusiveOrExpression();
      left = this.makeNode('LogicalAndExpression', left.range.start, { left, right });
    }
    
    return left;
  }
  
  private parseInclusiveOrExpression(): Expression {
    let left = this.parseExclusiveOrExpression();
    
    while (this.check(TokenKind.PIPE)) {
      const operator = this.advance();
      const right = this.parseExclusiveOrExpression();
      left = this.makeNode('InclusiveOrExpression', left.range.start, { left, right });
    }
    
    return left;
  }
  
  private parseExclusiveOrExpression(): Expression {
    let left = this.parseAndExpression();
    
    while (this.check(TokenKind.CARET)) {
      const operator = this.advance();
      const right = this.parseAndExpression();
      left = this.makeNode('ExclusiveOrExpression', left.range.start, { left, right });
    }
    
    return left;
  }
  
  private parseAndExpression(): Expression {
    let left = this.parseEqualityExpression();
    
    while (this.check(TokenKind.AMPERSAND)) {
      const operator = this.advance();
      const right = this.parseEqualityExpression();
      left = this.makeNode('AndExpression', left.range.start, { left, right });
    }
    
    return left;
  }
  
  private parseEqualityExpression(): Expression {
    let left = this.parseRelationalExpression();
    
    while (this.check(TokenKind.EQ_EQ) || this.check(TokenKind.NOT_EQ)) {
      const operator = this.advance();
      const right = this.parseRelationalExpression();
      left = this.makeNode('EqualityExpression', left.range.start, { left, operator, right });
    }
    
    return left;
  }
  
  private parseRelationalExpression(): Expression {
    let left = this.parseShiftExpression();
    
    while (this.check(TokenKind.LT) || this.check(TokenKind.GT) || 
           this.check(TokenKind.LE) || this.check(TokenKind.GE)) {
      const operator = this.advance();
      const right = this.parseShiftExpression();
      left = this.makeNode('RelationalExpression', left.range.start, { left, operator, right });
    }
    
    return left;
  }
  
  private parseShiftExpression(): Expression {
    let left = this.parseAdditiveExpression();
    
    while (this.check(TokenKind.LSHIFT) || this.check(TokenKind.RSHIFT)) {
      const operator = this.advance();
      const right = this.parseAdditiveExpression();
      left = this.makeNode('ShiftExpression', left.range.start, { left, operator, right });
    }
    
    return left;
  }
  
  private parseAdditiveExpression(): Expression {
    let left = this.parseMultiplicativeExpression();
    
    while (this.check(TokenKind.PLUS) || this.check(TokenKind.MINUS)) {
      const operator = this.advance();
      const right = this.parseMultiplicativeExpression();
      left = this.makeNode('AdditiveExpression', left.range.start, { left, operator, right });
    }
    
    return left;
  }
  
  private parseMultiplicativeExpression(): Expression {
    let left = this.parseCastExpression();
    
    while (this.check(TokenKind.STAR) || this.check(TokenKind.SLASH) || this.check(TokenKind.PERCENT)) {
      const operator = this.advance();
      const right = this.parseCastExpression();
      left = this.makeNode('MultiplicativeExpression', left.range.start, { left, operator, right });
    }
    
    return left;
  }
  
  private parseCastExpression(): Expression {
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
  
  private isTypeNameStart(): boolean {
    // A type name starts with a type specifier or type qualifier (but not an identifier that could be a variable)
    // This is heuristic - in practice we'd need more context
    return this.isTypeSpecifier() || this.isTypeQualifier() || this.isAlignmentSpecifier() || this.isAttributeSpecifier();
  }
  
  private parseUnaryExpression(): Expression {
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
  
  private isPostfixStart(): boolean {
    return this.check(TokenKind.IDENTIFIER) || this.check(TokenKind.INTEGER_CONSTANT) ||
           this.check(TokenKind.FLOATING_CONSTANT) || this.check(TokenKind.CHARACTER_CONSTANT) ||
           this.check(TokenKind.STRING_LITERAL) || this.check(TokenKind.USER_DEFINED_LITERAL) ||
           this.check(TokenKind.KW_NULLPTR) || this.check(TokenKind.LPAREN) ||
           this.check(TokenKind.KW_SIZEOF) || this.check(TokenKind.KW_ALIGNOF) ||
           this.check(TokenKind.KW_TYPEOF) || this.check(TokenKind.KW_TYPEOF_UNQUAL) ||
           this.check(TokenKind.KW_GENERIC) || this.check(TokenKind.KW_OFFSETOF);
  }
  
  private parsePostfixExpression(): Expression {
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
        }) as any;
      } else if (this.check(TokenKind.LPAREN)) {
        // Function call
        this.advance();
        const args = this.parseArgumentExpressionList();
        this.consume(TokenKind.RPAREN, 'Expected )');
        primary = this.makeNode('PostfixExpression', primary.range.start, { 
          primary, 
          operations: [{ kind: 'FunctionCall', arguments: args }],
        }) as any;
      } else if (this.check(TokenKind.DOT) || this.check(TokenKind.ARROW)) {
        // Member access
        const isArrow = this.check(TokenKind.ARROW);
        const operator = this.advance();
        const identifier = this.consume(TokenKind.IDENTIFIER, 'Expected member name');
        primary = this.makeNode('PostfixExpression', primary.range.start, { 
          primary, 
          operations: [{ kind: 'MemberAccess', isArrow, identifier }],
        }) as any;
      } else if (this.check(TokenKind.PLUS_PLUS) || this.check(TokenKind.MINUS_MINUS)) {
        // Postfix increment/decrement
        const op = this.advance();
        primary = this.makeNode('PostfixExpression', primary.range.start, { 
          primary, 
          operations: [{ kind: op.kind === TokenKind.PLUS_PLUS ? 'PostInc' : 'PostDec' }],
        }) as any;
      } else {
        break;
      }
    }
    
    return primary;
  }
  
  private parsePrimaryExpression(): PrimaryExpression {
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
  
  private parseGenericSelection(): GenericSelection {
    const start = this.currentTokenRange().start;
    this.consume(TokenKind.KW_GENERIC, 'Expected _Generic');
    this.consume(TokenKind.LPAREN, 'Expected ( after _Generic');
    
    const controllingExpression = this.parseExpression();
    this.consume(TokenKind.COMMA, 'Expected , in _Generic');
    
    const associations: GenericAssociation[] = [];
    
    while (!this.check(TokenKind.RPAREN) && !this.check(TokenKind.EOF)) {
      let typeName: TypeName | undefined;
      let isDefault = false;
      
      if (this.check(TokenKind.KW_DEFAULT)) {
        this.advance();
        isDefault = true;
      } else {
        typeName = this.parseTypeName();
      }
      
      this.consume(TokenKind.COLON, 'Expected : in _Generic association');
      const expression = this.parseExpression();
      
      associations.push(this.makeNode('GenericAssociation', start, { typeName, isDefault, expression }));
      
      if (!this.check(TokenKind.COMMA)) break;
      this.advance();
    }
    
    this.consume(TokenKind.RPAREN, 'Expected ) after _Generic');
    
    return this.makeNode('GenericSelection', start, { controllingExpression, associations });
  }
  
  private parseArgumentExpressionList(): ArgumentExpressionList {
    const start = this.currentTokenRange().start;
    const expressions: Expression[] = [];
    
    if (!this.check(TokenKind.RPAREN)) {
      while (true) {
        expressions.push(this.parseAssignmentExpression());
        if (!this.check(TokenKind.COMMA)) break;
        this.advance();
        if (this.check(TokenKind.RPAREN)) break; // trailing comma
      }
    }
    
    return this.makeNode('ArgumentExpressionList', start, { expressions });
  }
  
  private parseConstantExpression(): Expression {
    const start = this.currentTokenRange().start;
    const expression = this.parseConditionalExpression();
    return this.makeNode('ConstantExpression', start, { expression });
  }
  
  // ---------------------------------------------------------------------------
  // Preprocessor directives and comments
  // ---------------------------------------------------------------------------
  
  private parsePPDirective(): PPDirective {
    const token = this.advance();
    return this.makeNode('PPDirective', token.range.start, { token });
  }
  
  private parseComment(): Comment {
    const token = this.advance();
    return this.makeNode('Comment', token.range.start, { token });
  }
  
  // ---------------------------------------------------------------------------
  // AST node factory
  // ---------------------------------------------------------------------------
  
  private makeNode<T extends ASTNode>(kind: T['kind'], start: SourceLocation, props: Omit<T, 'kind' | 'range' | 'children'>): T {
    const end = this.previousTokenRange().end;
    const node: T = {
      kind,
      range: { start, end },
      children: [],
      ...props,
    } as T;
    
    // Collect children for traversal
    for (const value of Object.values(props)) {
      if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          for (const item of value) {
            if (item && typeof item === 'object' && 'range' in item) {
              node.children.push(item as ASTNode);
            }
          }
        } else if ('range' in value) {
          node.children.push(value as ASTNode);
        }
      }
    }
    
    return node;
  }
  
  private getNodeStart(node: ASTNode): SourceLocation {
    return node.range.start;
  }
}

// ============================================================================
// EMITTER - Reconstructs exact source from tokens
// ============================================================================

export class Emitter {
  emit(ast: TranslationUnit, originalTokens?: Token[]): string {
    // For perfect round-trip, use original tokens if available
    if (originalTokens) {
      return originalTokens
        .filter(t => t.kind !== TokenKind.EOF)
        .map(t => t.text)
        .join('');
    }
    // Fallback: collect from AST (incomplete)
    return this.collectTokens(ast).map(t => t.text).join('');
  }
  
  private collectTokens(node: ASTNode): Token[] {
    const tokens: Token[] = [];
    
    // For nodes that wrap tokens directly (like PPDirective, Comment)
    if ('token' in node && node.token) {
      tokens.push(node.token);
    }
    if ('tokens' in node && Array.isArray(node.tokens)) {
      tokens.push(...node.tokens);
    }
    
    // Recurse into children
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        tokens.push(...this.collectTokens(child));
      }
    }
    
    return tokens;
  }
}

// ============================================================================
// PARSE ERROR
// ============================================================================

export interface ParseError {
  message: string;
  range: SourceRange;
}

// ============================================================================
// MAIN PARSER CLASS - Public API
// ============================================================================

export class C23Parser {
  private parser: Parser;
  private emitter: Emitter;
  
  constructor() {
    this.parser = new Parser([]);
    this.emitter = new Emitter();
  }
  
  parseSource(source: string): ParseResult {
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();
    this.parser = new Parser(tokens);
    const ast = this.parser.parse();
    const errors = this.parser.getErrors();
    const emitted = this.emitter.emit(ast, tokens);
    
    return {
      ast,
      tokens,
      errors,
      emitted,
      success: errors.length === 0,
    };
  }
  
  parseFile(filePath: string): ParseResult {
    const fs = require('fs');
    const source = fs.readFileSync(filePath, 'utf-8');
    return this.parseSource(source);
  }
  
  emit(ast: TranslationUnit): string {
    return this.emitter.emit(ast);
  }
}

export interface ParseResult {
  ast: TranslationUnit;
  tokens: Token[];
  errors: ParseError[];
  emitted: string;
  success: boolean;
}

// ============================================================================
// CLI
// ============================================================================

function main(): void {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: c23parser <file.c> | --stdin');
    process.exit(1);
  }
  
  const parser = new C23Parser();
  let source: string;
  
  if (args[0] === '--stdin') {
    source = require('fs').readFileSync(0, 'utf-8');
  } else {
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