// Test 3: Complex declarations
#include <stddef.h>

// Function pointers
int (*func_ptr)(int, int);
int (*signal(int, void (*)(int)))(int);

// Arrays and pointers
int arr[10];
int *ptr_arr[10];
int (*arr_ptr)[10];
int (*(*func_returning_arr_ptr)(void))[10];

// VLA
void vla_func(int n) {
    int vla[n];
    int vla2[n][n+1];
}

// Structs, unions, enums
struct Point {
    int x;
    int y;
};

union Data {
    int i;
    float f;
    char str[20];
};

enum Color { RED, GREEN, BLUE };

// Bit fields
struct Flags {
    unsigned int a : 1;
    unsigned int b : 3;
    unsigned int : 0; // force alignment
    unsigned int c : 4;
};

// Nested structs
struct Rectangle {
    struct Point top_left;
    struct Point bottom_right;
};

// Typedefs
typedef struct Point Point_t;
typedef int (*Callback)(void*);

// _Atomic
_Atomic int atomic_counter = 0;

// Thread local
_Thread_local int tls_var = 42;

// Alignment
alignas(16) char aligned_buffer[64];

int main(void) {
    return 0;
}