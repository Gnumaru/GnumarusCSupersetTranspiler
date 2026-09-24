// Test 2: C23 features
#include <stddef.h>

// _BitInt
_BitInt(32) my_int = 42;

// typeof
typeof(1 + 2.0) x = 3.14;

// nullptr
int* ptr = nullptr;

// Attributes (C23 standard attributes)
[[nodiscard]] int foo(void) { return 42; }
[[deprecated]] void old_func(void) {}
[[fallthrough]] void switch_example(int x) {
    switch (x) {
        case 1: break;
        case 2: break;
    }
}

// _Static_assert
_Static_assert(sizeof(int) >= 4, "int too small");

// constexpr (C23)
constexpr int MAX = 100;

// auto type deduction
auto y = 42; // C23 auto

// Binary literals
int binary = 0b101010;

// Digit separators
int large = 1'000'000;

// Unicode identifiers
int café = 42;

// UTF-8 string literals
const char* utf8 = u8"Hello 世界";

int main(void) {
    return 0;
}