// Test 5: Expressions and operators
#include <stddef.h>

void arithmetic_ops(void) {
    int a = 10, b = 3;
    int add = a + b;
    int sub = a - b;
    int mul = a * b;
    int div = a / b;
    int mod = a % b;
}

void bitwise_ops(void) {
    int a = 0b1100, b = 0b1010;
    int and = a & b;
    int or = a | b;
    int xor = a ^ b;
    int not = ~a;
    int shl = a << 2;
    int shr = a >> 1;
}

void logical_ops(void) {
    int a = 1, b = 0;
    int land = a && b;
    int lor = a || b;
    int lnot = !a;
}

void comparison_ops(void) {
    int a = 5, b = 10;
    int eq = a == b;
    int ne = a != b;
    int lt = a < b;
    int gt = a > b;
    int le = a <= b;
    int ge = a >= b;
}

void assignment_ops(void) {
    int a = 10;
    a += 5;
    a -= 3;
    a *= 2;
    a /= 4;
    a %= 3;
    a &= 0xF;
    a |= 0xF0;
    a ^= 0xFF;
    a <<= 1;
    a >>= 2;
}

void inc_dec_ops(void) {
    int a = 5;
    int pre_inc = ++a;
    int pre_dec = --a;
    int post_inc = a++;
    int post_dec = a--;
}

void sizeof_alignof(void) {
    size_t s1 = sizeof(int);
    size_t s2 = sizeof 42;
    size_t s3 = sizeof(int[10]);
    size_t a1 = _Alignof(int);
    size_t a2 = _Alignof(double);
}

void typeof_example(void) {
    typeof(42) x = 10;
    typeof(3.14) y = 2.71;
    typeof_unqual(const int) z = 42;
}

void generic_selection(void) {
    int i = _Generic(42, int: 1, float: 2, default: 3);
    int f = _Generic(3.14f, int: 1, float: 2, default: 3);
}

void compound_literals(void) {
    int* arr = (int[]){1, 2, 3, 4, 5};
    struct { int x; int y; } p = (struct { int x; int y; }){10, 20};
}

void cast_expressions(void) {
    int i = 42;
    float f = (float)i;
    double d = (double)42;
    void* p = (void*)&i;
}

void conditional_expr(void) {
    int x = 5;
    int y = x > 0 ? 1 : -1;
    int z = x > 0 ? x : -x;
}

void comma_expr(void) {
    int x = (1, 2, 3); // x = 3
    for (int i = 0, j = 10; i < j; i++, j--) {}
}

int main(void) {
    return 0;
}