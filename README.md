# 🌅 HorizonView – Flight Scenic Seat Advisor

**Find the perfect window seat for breathtaking sunrise and sunset views on your flight**

HorizonView is a modern web application that helps travelers choose the best window seats based on sun position during their flight. Using interactive 2D world maps, real-time sun calculations, and beautiful visualizations, it recommends which side of the aircraft will offer the most scenic views.

![HorizonView](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- 🗺️ **Interactive 2D World Map** - Visualize your flight path with linear routes on an interactive Mercator projection map
- ☀️ **Real-Time Sun Calculations** - Accurate sunrise/sunset times using astronomical formulas
- 💺 **Smart Seat Recommendations** - Get personalized window seat suggestions (A-F) based on sun position
- 📊 **Sun Flight Timeline** - Animated timeline showing sun position throughout your journey
- 🌍 **60+ Global Airports** - Comprehensive airport database covering major destinations worldwide
- 🎨 **Beautiful UI** - Modern, minimalist design with pastel sky gradients and smooth animations
- 🌓 **Dark Mode** - Toggle between light and dark themes with persistent preferences
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS 4 with custom CSS variables
- **Maps**: react-simple-maps for 2D world visualization
- **Sun Calculations**: Custom astronomical formulas + suncalc library
- **Geographic Calculations**: d3-geo for great-circle paths and bearings
- **Animations**: Framer Motion for smooth transitions
- **Date Utilities**: date-fns for date manipulation

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/horizon-view.git
   cd horizon-view
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

1. **Enter Flight Details**
   - Select departure and arrival airports from the searchable dropdown
   - Choose your departure date and time
   - Click "Find Scenic Seats"

2. **View Visualizations**
   - **Flight Path Map**: See your route on an interactive world map with animated markers and gradient flight path
   - **Seating Chart**: View highlighted scenic window seats with visual indicators
   - **Sun Timeline**: Watch the sun's position throughout your flight with animated timeline
   - **Seat Legend**: Understand seat recommendations and color coding

3. **Get Recommendations**
   - The app calculates which side (left/right/both) offers the best views
   - Window seats are highlighted with golden glow effects
   - Sunrise and sunset times are displayed for your route

## 🏗️ Project Structure

```
horizon-view/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with theme toggle
│   │   ├── page.tsx                # Home page with flight form
│   │   ├── globals.css             # Global styles and theme variables
│   │   ├── api/
│   │   │   └── flight/
│   │   │       └── route.ts        # Flight calculation API endpoint
│   │   └── visualize/
│   │       ├── page.tsx            # Visualization page wrapper
│   │       └── VisualizeClient.tsx # Client-side visualizations
│   ├── components/
│   │   ├── FlightInputForm.tsx     # Airport search and date picker
│   │   ├── Map2D.tsx               # Interactive world map
│   │   ├── AirplaneSeats.tsx       # Seating chart with highlights
│   │   ├── SunFlightTimeline.tsx   # Animated sun path timeline
│   │   ├── SeatLegend.tsx          # Seat type explanations
│   │   └── ThemeToggle.tsx         # Light/dark mode switcher
│   ├── lib/
│   │   ├── cities.ts               # Airport database (60+ airports)
│   │   ├── geo.ts                  # Geographic utilities (Haversine, bearing, great-circle)
│   │   └── sun.ts                  # Sun calculations and scenic side logic
│   └── types/
│       └── *.d.ts                  # TypeScript definitions
├── public/                         # Static assets
├── package.json
├── tsconfig.json
└── next.config.ts
```

## 🔬 How It Works

### Sun Position Calculation
- Uses custom astronomical formulas to calculate sunrise/sunset times
- Considers sun azimuth and altitude relative to flight path
- Samples sun position at multiple points during the flight

### Scenic Side Determination
- Calculates flight bearing (direction of travel)
- Compares sun azimuth to flight bearing
- Determines if sun is to the left, right, or both sides of aircraft
- Recommends window seats accordingly (A/B/C for left, D/E/F for right)

### Great Circle Path
- Calculates the shortest path between two points on Earth
- Uses d3-geo for accurate great-circle interpolation
- Displays route on interactive Mercator projection map with linear line visualization
- Supports both linear and parabolic curve rendering (parabolic code preserved for future use)

## 🎨 Design Features

- **Pastel Sky Theme**: Soft blue-to-orange gradients representing sky colors
- **Dark Mode**: Dusk/orange gradient for night viewing with persistent theme preference
- **Smooth Animations**: Framer Motion transitions throughout with spring physics
- **Card-Based UI**: Modern card design with soft shadows and elevation
- **Responsive Layout**: Adapts beautifully to all screen sizes (mobile, tablet, desktop)
- **Interactive Map**: Animated markers with pulsing effects and gradient flight paths
- **Gradient Flight Path**: Color-coded route from green (departure) to red (arrival)

## 🌍 Supported Airports

The application includes 60+ major airports worldwide:
- **North America**: JFK, LAX, ORD, ATL, DFW, YYZ, YVR, and more
- **Europe**: LHR, CDG, FRA, AMS, MAD, FCO, and more
- **Asia**: NRT, ICN, PVG, SIN, BKK, DEL, and more
- **Middle East**: DXB, DOH, AUH, and more
- **Oceania**: SYD, MEL, AKL, and more
- **South America & Africa**: GRU, BOG, JNB, and more

## 🛠️ Development

### Build for Production
```bash
npm run build
npm start
```

### Run Linter
```bash
npm run lint
```

## 📝 API Endpoints

### GET `/api/flight`
Calculate flight data and sun positions.

**Query Parameters:**
- `from`: Departure airport code (e.g., "JFK")
- `to`: Arrival airport code (e.g., "LAX")
- `dt`: Departure date/time in ISO format

**Response:**
```json
{
  "success": true,
  "data": {
    "departure": {
      "code": "JFK",
      "name": "John F. Kennedy International Airport",
      "city": "New York",
      "lat": 40.6413,
      "lng": -73.7781
    },
    "arrival": {
      "code": "LAX",
      "name": "Los Angeles International Airport",
      "city": "Los Angeles",
      "lat": 33.9425,
      "lng": -118.4081
    },
    "distance": 3974,
    "bearing": 270,
    "duration": 5.0,
    "path": [[lng, lat], ...],
    "sunData": {
      "scenicSide": "right",
      "recommendedSeats": ["D", "E", "F"],
      "sunriseTime": "2024-01-01T12:20:06.748Z",
      "sunsetTime": "2024-01-01T21:39:04.067Z",
      "departureSunAltitude": 15.5,
      "arrivalSunAltitude": -5.2
    },
    "departureTime": "2024-01-01T10:00:00.000Z",
    "arrivalTime": "2024-01-01T15:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Missing or invalid parameters
- `404`: Airport not found
- `500`: Internal server error

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [suncalc](https://github.com/mourner/suncalc) - Sun position calculations
- [react-simple-maps](https://www.react-simple-maps.io/) - Map visualization
- [d3-geo](https://github.com/d3/d3-geo) - Geographic calculations and projections
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [date-fns](https://date-fns.org/) - Date manipulation utilities
- [tz-lookup](https://github.com/darkskyapp/tz-lookup-oss) - Timezone lookup

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.

---

**Made with ❤️ for travelers who love scenic views**

*Find your perfect window seat and enjoy the journey! ✈️🌅*
