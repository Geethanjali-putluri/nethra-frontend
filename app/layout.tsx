import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NETHRA — Autonomous Search & Rescue UGV',
  description: 'Robotics monitoring station for NETHRA autonomous search and rescue UGV prototype featuring phone camera vision, YOLO11 detection, 12x12 occupancy grid, A* path planning simulation, and algorithm benchmarks.',
  openGraph: {
    title: 'NETHRA — Autonomous Search & Rescue UGV',
    description: 'Robotics monitoring station for NETHRA autonomous search and rescue UGV prototype.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NETHRA — Autonomous Search & Rescue UGV',
    description: 'Robotics monitoring station for NETHRA autonomous search and rescue UGV prototype.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080B11] text-slate-100 antialiased min-h-screen font-sans selection:bg-cyan-500/30 selection:text-cyan-200" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
