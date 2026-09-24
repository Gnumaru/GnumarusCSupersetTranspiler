// Test 4: Control flow statements
#include <stdio.h>

void if_examples(int x) {
    if (x > 0) {
        printf("positive\n");
    } else if (x < 0) {
        printf("negative\n");
    } else {
        printf("zero\n");
    }
    
    // Ternary
    const char* sign = x > 0 ? "pos" : (x < 0 ? "neg" : "zero");
}

void switch_example(int x) {
    switch (x) {
        case 1:
            printf("one\n");
            break;
        case 2:
        case 3:
            printf("two or three\n");
            break;
        default:
            printf("other\n");
    }
}

void loop_examples(int n) {
    // while
    while (n > 0) {
        n--;
    }
    
    // do-while
    do {
        n++;
    } while (n < 10);
    
    // for
    for (int i = 0; i < 10; i++) {
        if (i == 5) continue;
        if (i == 8) break;
    }
    
    // for with declaration (C99)
    for (int i = 0, j = 10; i < j; i++, j--) {}
    
    // empty for
    for (;;) { break; }
}

void goto_example(void) {
    int i = 0;
start:
    if (i++ < 5) goto start;
    
    // labels as values (GNU extension)
    void* labels[] = { &&start };
}

void return_examples(void) {
    return;
    return 42;
    return (1 + 2) * 3;
}

int main(void) {
    return 0;
}