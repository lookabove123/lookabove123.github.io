#include <cmath>
#include <iostream>
#include <utility>

using f64 = double;

struct Point {
  f64 x;
  f64 y;
};

using u32 = unsigned int;

Point get_position(u32 input) {
  static constexpr f64 PERIOD = (24.0 * 60.0) + 31.0;
  static constexpr f64 RADIUS = 500.0;
  static constexpr f64 CENTER = 2500.0;

  input %= static_cast<u32>(PERIOD);
  f64 minutes = static_cast<f64>(input);
  // Convert to radians
  minutes = (minutes / PERIOD) * 2 * 3.1415926535;

  // r * sin(theta) + center
  // r * cos(theta) + center
  return Point{(RADIUS * std::cos(minutes)) + CENTER,
               (RADIUS * std::sin(minutes)) + CENTER};
}

int main() {
  for (u32 min = 0; min < (24 * 60) * 4; ++min) {
    Point position = get_position(min);
    std::cout << position.x << "	" << position.y << '\n';
  }
}