// Test 6: Preprocessor directives and comments

/* Multi-line comment
 * spanning multiple lines
 */

#define MAX 100
#define MIN(a, b) ((a) < (b) ? (a) : (b))
#define STRINGIFY(x) #x
#define CONCAT(a, b) a##b

#ifdef DEBUG
#define LOG(msg) printf("DEBUG: %s\n", msg)
#else
#define LOG(msg)
#endif

#if defined(__GNUC__) && __GNUC__ >= 10
#define HAS_FEATURE 1
#elif defined(__clang__)
#define HAS_FEATURE 1
#else
#define HAS_FEATURE 0
#endif

#ifndef CONFIG_H
#define CONFIG_H
#endif

// Line comment at top level

int global_var = 42; // trailing comment

void function_with_comments(void) {
    /* Comment inside function */
    int x = 10; // variable declaration
    
    // Another line comment
    if (x > 5) { /* inline comment */ x = 5; }
    
    /*
     * Block comment
     * with multiple lines
     */
    for (int i = 0; i < 10; i++) {
        // Loop comment
        x += i;
    }
}

// Line comment between functions

/* 
 * Another block comment
 * before main
 */

int main(void) {
    // Main function
    return 0; // Return success
} // End of main