// Deterministic mock data for demo without Supabase connection
// Coordinates centered around Nairobi-ish reforestation area for realistic demo

export const MOCK_PROJECT = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Green Belt Reforestation — Kiambu",
  description:
    "Monitoring 1,240 ha of reforestation across 24 plots in Kiambu County. Tracking tree survival, canopy closure and early anomaly detection via satellite & field reports.",
  organization: "Kenya Forest Service • TreeTrack",
  total_area_hectares: 1240.5,
  expected_tree_count: 42000,
  boundary: {
    type: "Polygon",
    coordinates: [
      [
        [36.78, -1.12],
        [36.95, -1.12],
        [36.95, -1.28],
        [36.78, -1.28],
        [36.78, -1.12],
      ],
    ],
  },
  created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(),
};

export type MockPlot = {
  id: string;
  project_id: string;
  plot_code: string;
  geometry: GeoJSON.Polygon;
  area_hectares: number;
  expected_tree_count: number;
  estimated_tree_count: number;
  health_score: number;
  risk_score: number;
  status: string;
  ndvi: number;
  ndvi_change: number;
  last_observation: string;
};

// Generate 24 plots in a grid
function makePlots(): MockPlot[] {
  const baseLng = 36.8;
  const baseLat = -1.15;
  const plots: MockPlot[] = [];
  const codes = [
    "A1","A2","A3","A4","A5","A6",
    "B1","B2","B3","B4","B5","B6",
    "C1","C2","C3","C4","C5","C6",
    "D1","D2","D3","D4","D5","D6",
  ];
  // deterministic health scores — C7 equivalent is C3 (index 14)
  const healthScores = [82,78,88, 71,65, 84,  69,73, 62, 58,44,79,  55,41,31, 52,67,74,  80,76, 68,61, 59,85];
  const ndvis = [0.71,0.68,0.75, 0.64,0.58,0.73, 0.61,0.66,0.54,0.49,0.38,0.69, 0.48,0.39,0.42,0.46,0.60,0.65, 0.70,0.67,0.59,0.52,0.50,0.74];
  const ndviChanges = [-2.1, 1.2, -0.8, -4.2,-8.1, 2.3, -6.4,-1.1,-12.4,-18.2,-28.5, 0.9, -15.2,-32.1,-38.2,-14.8,-3.2, 1.1, 0.4,-2.0,-7.3,-10.1,-11.2, 2.8];

  let idx=0;
  for(let row=0; row<4; row++){
    for(let col=0; col<6; col++){
      const lng = baseLng + col*0.028 + (row%2===0?0:0.014);
      const lat = baseLat - row*0.035;
      const size = 0.012;
      const geometry: GeoJSON.Polygon = {
        type:"Polygon",
        coordinates:[[
          [lng, lat],
          [lng+size, lat],
          [lng+size, lat - size*0.85],
          [lng, lat - size*0.85],
          [lng, lat],
        ]]
      };
      const hs = healthScores[idx] ?? 65;
      plots.push({
        id: `00000000-0000-0000-0000-0000000000${String(idx+10).padStart(2,"0")}`,
        project_id: MOCK_PROJECT.id,
        plot_code: codes[idx],
        geometry,
        area_hectares: Number((12.5 + (idx%3)*4.1 + Math.sin(idx)*2).toFixed(1)),
        expected_tree_count: 1750 + (idx%4)*250,
        estimated_tree_count: Math.round((1750 + (idx%4)*250) * (hs/100 + 0.15)),
        health_score: hs,
        risk_score: Math.max(0, Math.min(100, 100 - hs + (idx===14? 22:0))),
        status: hs<30 ? "critical" : hs<50 ? "at_risk" : "active",
        ndvi: ndvis[idx],
        ndvi_change: ndviChanges[idx],
        last_observation: new Date(Date.now() - ( (idx%7)+1 )* 86400000 * 3 ).toISOString(),
      });
      idx++;
    }
  }
  // Force C3 (index 14) to be the critical demo plot: id ending ...24? Actually idx 14 is C3
  // Make sure plot C3 details match spec: 18.2 ha, critical, health 31, NDVI 0.42, -38.2%
  const c3 = plots[14];
  if (c3) {
    c3.area_hectares = 18.2;
    c3.health_score = 31;
    c3.risk_score = 84;
    c3.ndvi = 0.42;
    c3.ndvi_change = -38.2;
    c3.estimated_tree_count = 1420;
    c3.expected_tree_count = 2000;
    c3.last_observation = new Date(Date.now() - 47*86400000).toISOString();
    c3.status = "critical";
  }
  return plots;
}

export const MOCK_PLOTS: MockPlot[] = makePlots();

export const MOCK_OBSERVATIONS = Array.from({length: 12}, (_,i)=>{
  const date = new Date(Date.now() - (11-i)* 30 * 86400000);
  const base = 0.62 + Math.sin(i/2)*0.08;
  // decline for C3
  const decline = i>7 ? (i-7)*0.04 : 0;
  return {
    observation_date: date.toISOString().slice(0,10),
    ndvi: Number((base - decline).toFixed(3)),
    vegetation_coverage: Number((72 - decline*40).toFixed(1)),
    canopy_density: Number((68 - decline*35).toFixed(1)),
    estimated_tree_count: Math.round(1650 - decline*600),
    health_score: Math.round(68 - decline*90),
  };
});

export const MOCK_ALERTS = [
  {
    id:"a0000000-0000-0000-0000-000000000001",
    project_id: MOCK_PROJECT.id,
    plot_id: MOCK_PLOTS[14].id,
    alert_type:"vegetation_decline",
    severity:"critical",
    title:"Critical vegetation decline — Plot C3",
    description:"NDVI dropped 38.2% over 47 days. Canopy density below 40%. Possible illegal clearing or pest outbreak. Field verification required.",
    risk_score:84,
    status:"open",
    created_at: new Date(Date.now()-2*86400000).toISOString(),
  },
  {
    id:"a0000000-0000-0000-0000-000000000002",
    project_id: MOCK_PROJECT.id,
    plot_id: MOCK_PLOTS[10].id,
    alert_type:"health_drop",
    severity:"high",
    title:"Health score drop — Plot B5",
    description:"Health score fell from 62 to 44 in 3 weeks. Bare soil +18%.",
    risk_score:61,
    status:"open",
    created_at: new Date(Date.now()-5*86400000).toISOString(),
  },
  {
    id:"a0000000-0000-0000-0000-000000000003",
    project_id: MOCK_PROJECT.id,
    plot_id: MOCK_PLOTS[13].id,
    alert_type:"fire_risk",
    severity:"medium",
    title:"Elevated fire risk — Plot C2",
    description:"Dry season + low canopy. Risk score 52. Monitor weekly.",
    risk_score:52,
    status:"acknowledged",
    created_at: new Date(Date.now()-9*86400000).toISOString(),
  },
];

export const MOCK_FIELD_REPORTS = [
  {
    id:"f0000000-0000-0000-0000-000000000001",
    plot_id: MOCK_PLOTS[14].id,
    reporter_name:"James Mwangi",
    reporter_phone:"+254712345678",
    event_type:"illegal_clearing",
    severity:"critical",
    description:"Found freshly cut stumps on eastern edge. Approx 40 trees. Tracks leading to road.",
    status:"verified",
    created_at: new Date(Date.now()-1*86400000).toISOString(),
    image_url:null,
  },
  {
    id:"f0000000-0000-0000-0000-000000000002",
    plot_id: MOCK_PLOTS[10].id,
    reporter_name:"Amina O.",
    reporter_phone:"+254799001123",
    event_type:"disease",
    severity:"high",
    description:"Leaves yellowing, fungal spots observed on ~30% saplings.",
    status:"pending",
    created_at: new Date(Date.now()-3*86400000).toISOString(),
    image_url:null,
  },
];

export const MOCK_IMAGERY = [
  {
    id:"i0000000-0000-0000-0000-000000000001",
    plot_id: MOCK_PLOTS[14].id,
    captured_at: new Date(Date.now()-47*86400000).toISOString(),
    source:"sentinel-2",
    image_url:"https://picsum.photos/seed/treetrack-c3-1/800/600",
    thumbnail_url:"https://picsum.photos/seed/treetrack-c3-1/300/200",
    analysis_status:"completed",
  },
  {
    id:"i0000000-0000-0000-0000-000000000002",
    plot_id: MOCK_PLOTS[14].id,
    captured_at: new Date().toISOString(),
    source:"sentinel-2",
    image_url:"https://picsum.photos/seed/treetrack-c3-2/800/600",
    thumbnail_url:"https://picsum.photos/seed/treetrack-c3-2/300/200",
    analysis_status:"pending",
  },
];
