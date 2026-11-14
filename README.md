# SG Carpark Finder

A real-time web app that helps drivers find nearby HDB carparks in Singapore, with live lot availability shown on an interactive map.

<div style="text-align: center;">
  <img src="./docs/screenshot.png" width="80%" />
</div>


## Features

- **Live availability:** Lots available and total lots for HDB carparks, refreshed automatically every 60 seconds
- **Nearby me:** Tap to use your location
- **Interactive map:** Colour-coded markers (green, amber, red) by occupancy
- **Radius filter:** 0.5, 1, 2 or 5 km around your location
- **Responsive layout:** Suitable for viewing on desktop or mobile

On first load, the web app shows carparks within 2 km of the centre of Singapore.


## Getting Started

### Prerequisites

- **Node.js** (v18 or later)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/carineang/sg-carparks.git
cd sg-carparks
npm install
npm run dev
```

#### 2. Open [http://localhost:3000](http://localhost:3000).


## Limitations

- Covers HDB carparks only. Malls and most private carparks are not in the data.gov.sg dataset.

## Possible Improvements

- Search for carparks based on address
- Filters for motorcycle and heavy vehicle lots
- Favourite carparks saved in local storage

## Data Sources

- [data.gov.sg](https://data.gov.sg): Carpark Availability and HDB Carpark Information

