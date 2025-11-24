import React from "react";
import {
ResponsiveContainer,
LineChart,
Line,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
Legend,
PieChart,
Pie,
Cell,
AreaChart,
Area
} from "recharts";
import { TrendingUp, PieChart as PieChartIcon } from "lucide-react";

const COLORS = ['#28a458', '#5ebb82', '#20b2aa', '#ffa500', '#9400d3', '#ff6b6b', '#4ecdc4', '#45b7d1'];

// Tooltip pour graphique en ligne/aire
const CustomLineTooltip = ({ active, payload, label }) => {
if (active && payload && payload.length) {
return (
<div style={{
backgroundColor: 'rgba(255, 255, 255, 0.98)',
padding: '1rem',
border: '2px solid #28a458',
borderRadius: '12px',
boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
}}>
<p style={{ fontWeight: '700', marginBottom: '0.5rem', color: '#1a1a1a' }}>{label}</p>
{payload.map((entry, index) => (
<p key={index} style={{ color: entry.color, margin: '0.25rem 0', fontWeight: '600' }}>
{entry.name}: {entry.value.toLocaleString('fr-FR')} Ar </p>
))} </div>
);
}
return null;
};

// Tooltip pour graphique circulaire
const CustomPieTooltip = ({ active, payload }) => {
if (active && payload && payload.length) {
const data = payload[0];
const total = payload[0].payload.payload?.total || 0;
const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
return (
<div style={{
backgroundColor: 'rgba(255, 255, 255, 0.98)',
padding: '1rem',
border: `2px solid ${data.payload.fill}`,
borderRadius: '12px',
boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
}}>
<p style={{ fontWeight: '700', color: '#1a1a1a', marginBottom: '0.5rem' }}>{data.name}</p>
<p style={{ color: '#28a458', fontWeight: '700', fontSize: '1.1rem' }}>{data.value.toLocaleString('fr-FR')} Ar</p>
<p style={{ color: '#6b7280', fontWeight: '600', fontSize: '0.9rem' }}>{percentage}% du total</p> </div>
);
}
return null;
};

// Label pour le Pie chart
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
if (percent < 0.05) return null;
const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
return ( <text
   x={x}
   y={y}
   fill="white"
   textAnchor={x > cx ? 'start' : 'end'}
dominantBaseline="central"
style={{ fontWeight: '700', fontSize: '14px', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}
>
{`${(percent * 100).toFixed(0)}%`} </text>
);
};

const GraphiquesSection = ({ evolutionVentes, ventesParCategorie }) => {
const totalVentes = ventesParCategorie?.reduce((sum, cat) => sum + (cat.value || 0), 0) || 0;
const ventesAvecTotal = ventesParCategorie?.map(cat => ({ ...cat, total: totalVentes })) || [];

return ( <section className="graphiques-grid">
{/* GRAPHIQUE EN LIGNE/AIRE */} <div className="chart-card large"> <h3><TrendingUp size={22} /> Évolution des ventes</h3> <ResponsiveContainer width="100%" height={320}>
{evolutionVentes && evolutionVentes.length > 0 ? ( <AreaChart data={evolutionVentes}> <defs> <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1"> <stop offset="5%" stopColor="#28a458" stopOpacity={0.8} /> <stop offset="95%" stopColor="#28a458" stopOpacity={0.1} /> </linearGradient> </defs> <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
<XAxis dataKey="label" stroke="#6b7280" style={{ fontWeight: '600', fontSize: '0.875rem' }} />
<YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} stroke="#6b7280" style={{ fontWeight: '600', fontSize: '0.875rem' }} />
<Tooltip content={<CustomLineTooltip />} />
<Legend wrapperStyle={{ fontWeight: '600', paddingTop: '1rem' }} /> <Area type="monotone" dataKey="ventes" stroke="#28a458" strokeWidth={3} fill="url(#colorVentes)" name="Ventes (Ar)" /> </AreaChart>
) : (
<div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#9ca3af', fontSize:'1rem', fontWeight:'500' }}>
Aucune donnée disponible </div>
)} </ResponsiveContainer> </div>

  {/* GRAPHIQUE CIRCULAIRE */}
  <div className="chart-card medium">
    <h3><PieChartIcon size={22} /> Répartition par catégorie</h3>
    <ResponsiveContainer width="100%" height={320}>
      {ventesParCategorie && ventesParCategorie.length > 0 ? (
        <PieChart>
          <Pie
            data={ventesAvecTotal}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={renderCustomLabel}
            labelLine={false}
          >
            {ventesParCategorie.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomPieTooltip />} />
          <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" wrapperStyle={{ fontWeight: '600', fontSize: '0.875rem', paddingLeft:'1rem'}} />
        </PieChart>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'#9ca3af' }}>
          <PieChartIcon size={48} style={{ marginBottom:'1rem', opacity:0.3 }} />
          <p style={{ fontSize:'1rem', fontWeight:'500' }}>Aucune vente pour cette période</p>
        </div>
      )}
    </ResponsiveContainer>
  </div>
</section>

);
};

export default GraphiquesSection;
