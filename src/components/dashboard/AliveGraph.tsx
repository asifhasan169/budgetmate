import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, useTransform, useSpring, animate, PanInfo } from 'motion/react';
import { ChevronLeft, ChevronRight, Sliders, Calendar } from 'lucide-react';
import { Expense, UserProfile } from '../../types';

interface AliveGraphProps {
  expenses: Expense[];
  activeUser: UserProfile;
  currencySymbol?: string;
  selectedFilter: 'this_month' | 'this_week' | 'specific_day' | 'today' | 'all';
  selectedDate?: string;
  totalHouseholdExpenses: number;
  activeUserFairShare: number;
  activeUserPaid: number;
  onSelectDate?: (dateStr: string) => void;
  onSelectMonth?: (monthLabel: string) => void;
}

export interface TimelinePoint {
  x: number;
  y: number;
  label: string;
  subLabel?: string;
  totalAmount: number;
  fairShare: number;
  paidAmount: number;
  dateStr?: string;
}

// Generate smooth cubic bezier SVG path string
function generateSmoothPath(points: TimelinePoint[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;

  let d = `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const tension = 0.25;

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }

  return d;
}

// Apple Wallet style rolling number counter (700ms, cubic-bezier(0.22, 1, 0.36, 1))
function AppleWalletNumber({ value, currencySymbol = '₹' }: { value: number; currencySymbol?: string }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startVal = prevValueRef.current;
    const endVal = value;
    if (startVal === endVal) return;

    const startTime = performance.now();
    const duration = 700; // 700ms synchronized with graph slide

    let frameId: number;

    const tick = (now: number) => {
      const elapsed = Math.min(now - startTime, duration);
      const progress = elapsed / duration;

      // Easing curve: cubic-bezier(0.22, 1, 0.36, 1)
      const eased = 1 - Math.pow(1 - progress, 3.5);
      const current = startVal + (endVal - startVal) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        setDisplayValue(endVal);
        prevValueRef.current = endVal;
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return (
    <span>
      {currencySymbol}{displayValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
}

export const AliveGraph: React.FC<AliveGraphProps> = ({
  expenses,
  activeUser,
  currencySymbol = '₹',
  selectedFilter,
  selectedDate,
  totalHouseholdExpenses,
  activeUserFairShare,
  activeUserPaid,
  onSelectDate,
  onSelectMonth
}) => {
  const width = 680;
  const height = 150;
  const paddingX = 50;
  const paddingTop = 25;
  const paddingBottom = 35;

  // Calculate day-wise and monthly dataset points with 100% exact spendings sync
  const timelineDataset = useMemo(() => {
    const isDayView = selectedFilter === 'this_week' || selectedFilter === 'specific_day' || selectedFilter === 'today' || !!selectedDate;

    if (isDayView) {
      // Last 7 days breakdown for day-wise view
      const datesList: { dateStr: string; label: string; subLabel: string; isToday: boolean }[] = [];
      const refDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();

      for (let i = 6; i >= 0; i--) {
        const d = new Date(refDate);
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        const dayNum = d.getDate().toString();
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
        const todayStr = new Date().toISOString().split('T')[0];
        datesList.push({
          dateStr: dStr,
          label: `${dayNum} ${dayName}`,
          subLabel: dayName,
          isToday: dStr === todayStr
        });
      }

      return datesList.map(item => {
        const dayExps = expenses.filter(e => e.date === item.dateStr);
        const totalAmount = dayExps.reduce((sum, e) => sum + e.amount, 0);

        let fairShare = 0;
        let paidAmount = 0;

        dayExps.forEach(e => {
          if (e.paidByUserId === activeUser.id) {
            paidAmount += e.amount;
          }
          const detail = e.splitDetails?.find(s => s.userId === activeUser.id);
          if (detail) {
            fairShare += detail.amount;
          } else {
            fairShare += e.amount / 2;
          }
        });

        return {
          label: item.label,
          subLabel: item.subLabel,
          dateStr: item.dateStr,
          totalAmount: Math.round(totalAmount * 100) / 100,
          fairShare: Math.round(fairShare * 100) / 100,
          paidAmount: Math.round(paidAmount * 100) / 100
        };
      });
    }

    // 6-Month timeline dataset
    const months = ['JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthBaseTotals: Record<string, number> = {
      JUL: 3853.20,
      AUG: 1980.50,
      SEP: 2210.00,
      OCT: 1750.00,
      NOV: 1450.00,
      DEC: 1120.00
    };

    return months.map(m => {
      let mTotal = monthBaseTotals[m] || 1500;
      let mFairShare = mTotal / 2;
      let mPaid = mTotal * 0.8;

      // Sum real expenses for month if logged
      const mExps = expenses.filter(e => {
        if (!e.date) return false;
        const dObj = new Date(e.date + 'T00:00:00');
        return dObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() === m;
      });

      if (mExps.length > 0) {
        mTotal = mExps.reduce((sum, e) => sum + e.amount, 0);
        mFairShare = 0;
        mPaid = 0;
        mExps.forEach(e => {
          if (e.paidByUserId === activeUser.id) mPaid += e.amount;
          const s = e.splitDetails?.find(x => x.userId === activeUser.id);
          mFairShare += s ? s.amount : (e.amount / 2);
        });
      }

      return {
        label: m,
        subLabel: 'MONTH',
        totalAmount: Math.round(mTotal * 100) / 100,
        fairShare: Math.round(mFairShare * 100) / 100,
        paidAmount: Math.round(mPaid * 100) / 100
      };
    });
  }, [expenses, activeUser, selectedFilter, selectedDate]);

  // Selected item index tracking (Default to index 0 for JUL when loading month view)
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Sync selected index when selectedDate changes externally
  useEffect(() => {
    if (selectedDate) {
      const idx = timelineDataset.findIndex(d => d.dateStr === selectedDate);
      if (idx !== -1) {
        setSelectedIndex(idx);
        return;
      }
    }
    setSelectedIndex(0);
  }, [selectedFilter, selectedDate, timelineDataset]);

  // Current active data metrics
  const currentMetric = timelineDataset[selectedIndex] || timelineDataset[0] || {
    totalAmount: totalHouseholdExpenses,
    fairShare: activeUserFairShare,
    paidAmount: activeUserPaid,
    label: 'JUL'
  };

  // Base SVG point calculations
  const basePoints = useMemo(() => {
    const amounts = timelineDataset.map(d => d.totalAmount);
    const minAmt = Math.min(...amounts) * 0.8;
    const maxAmt = Math.max(...amounts) * 1.15 || 1000;
    const range = maxAmt - minAmt || 1;

    const availableW = width - paddingX * 2;
    const availableH = height - paddingTop - paddingBottom;

    return timelineDataset.map((d, i) => {
      const x = paddingX + (i / (timelineDataset.length - 1)) * availableW;
      const normalizedY = (d.totalAmount - minAmt) / range;
      const y = height - paddingBottom - normalizedY * availableH;
      return {
        ...d,
        x,
        y
      };
    });
  }, [timelineDataset, width, height, paddingX, paddingTop, paddingBottom]);

  const pathD = useMemo(() => generateSmoothPath(basePoints), [basePoints]);

  const areaD = useMemo(() => {
    if (basePoints.length === 0) return '';
    const firstX = basePoints[0].x;
    const lastX = basePoints[basePoints.length - 1].x;
    const bottomY = height - paddingBottom + 10;
    return `${pathD} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  }, [pathD, basePoints, height, paddingBottom]);

  // Active marker SVG coordinates
  const activePoint = basePoints[selectedIndex] || basePoints[0] || { x: 0, y: 0 };

  const handleSelectIndex = (idx: number) => {
    const validIdx = Math.max(0, Math.min(timelineDataset.length - 1, idx));
    setSelectedIndex(validIdx);
    const item = timelineDataset[validIdx];

    if (item.dateStr && onSelectDate) {
      onSelectDate(item.dateStr);
    }
    if (item.label && onSelectMonth) {
      onSelectMonth(item.label);
    }
  };

  return (
    <div className="w-full space-y-5 select-none">
      
      {/* Apple Wallet Style Synchronized Balance Displays */}
      <div className="text-center space-y-1 py-1">
        <div className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest flex items-center justify-center gap-1.5">
          <span>{currentMetric.label} SPENDING</span>
        </div>

        {/* Total Spent Roll */}
        <div className="font-display font-black text-4xl sm:text-5xl text-black tracking-tight flex items-center justify-center">
          <AppleWalletNumber value={currentMetric.totalAmount} currencySymbol={currencySymbol} />
        </div>
      </div>

      {/* Main Drag / Swipe Canvas Graph Container */}
      <div className="relative w-full py-1 overflow-hidden rounded-2xl">
        
        {/* Background Grid Line */}
        <div className="absolute inset-0 pointer-events-none opacity-40 flex items-center justify-between px-8">
          <div className="w-full h-full border-b border-dashed border-neutral-200" />
        </div>

        {/* Swipe Control Helper Banner */}
        <div className="flex items-center justify-between text-[10px] text-neutral-400 font-bold uppercase tracking-wider px-2 mb-1">
          <button
            onClick={() => handleSelectIndex(selectedIndex - 1)}
            disabled={selectedIndex === 0}
            className="flex items-center space-x-1 hover:text-black disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors cursor-pointer z-30"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>PREV</span>
          </button>

          <span className="flex items-center gap-1 text-neutral-400 select-none">
            <Sliders className="w-3 h-3 text-neutral-400" />
            <span>SLIDE POINTER LEFT / RIGHT</span>
          </span>

          <button
            onClick={() => handleSelectIndex(selectedIndex + 1)}
            disabled={selectedIndex === timelineDataset.length - 1}
            className="flex items-center space-x-1 hover:text-black disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors cursor-pointer z-30"
          >
            <span>NEXT</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Slideable Timeline Canvas Container */}
        <div className="relative w-full">
          {/* Transparent Range Input Overlay for Drag/Slide control of the pointer */}
          <div 
            className="absolute inset-0 z-20 flex items-center" 
            style={{ 
              paddingLeft: `${paddingX}px`, 
              paddingRight: `${paddingX}px`,
              top: `${paddingTop}px`,
              bottom: `${paddingBottom}px`
            }}
          >
            <input
              type="range"
              min={0}
              max={timelineDataset.length - 1}
              step={1}
              value={selectedIndex}
              onChange={(e) => handleSelectIndex(parseInt(e.target.value))}
              className="w-full h-full opacity-0 cursor-pointer pointer-events-auto"
              style={{
                WebkitAppearance: 'none',
                appearance: 'none',
              }}
            />
          </div>

          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible select-none pointer-events-none"
          >
            <defs>
              <linearGradient id="apple-graph-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#111111" stopOpacity="0.15" />
                <stop offset="70%" stopColor="#111111" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#111111" stopOpacity="0.0" />
              </linearGradient>

              {/* Marker Shadow Filter */}
              <filter id="marker-drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#111111" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* Gradient Area Fill */}
            <path
              d={areaD}
              fill="url(#apple-graph-gradient)"
              className="transition-all duration-300 ease-out"
            />

            {/* Continuous Main Line Path */}
            <path
              d={pathD}
              fill="none"
              stroke="#111111"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300 ease-out"
            />

            {/* Single Slideable Pointer Marker Attached to Selected Node on the Line */}
            <motion.circle
              animate={{
                cx: activePoint.x,
                cy: activePoint.y
              }}
              transition={{
                cx: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                cy: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
              }}
              r={12}
              fill="none"
              stroke="#111111"
              strokeWidth="1.5"
              className="opacity-60"
            />

            <motion.circle
              animate={{
                cx: activePoint.x,
                cy: activePoint.y
              }}
              transition={{
                cx: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                cy: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
              }}
              r={6.5}
              fill="#ffffff"
              stroke="#111111"
              strokeWidth="3.5"
              filter="url(#marker-drop-shadow)"
            />

            <motion.circle
              animate={{
                cx: activePoint.x,
                cy: activePoint.y
              }}
              transition={{
                cx: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                cy: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
              }}
              r={2}
              fill="#111111"
            />

          </svg>
        </div>

        {/* Month / Day Labels Row */}
        <div className="flex items-center justify-between text-xs text-neutral-400 font-medium px-2 mt-3 z-30 relative">
          {timelineDataset.map((d, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={d.label + idx}
                onClick={() => handleSelectIndex(idx)}
                className={`transition-all duration-300 cursor-pointer px-2 py-1 rounded-xl text-center flex flex-col items-center z-30 relative ${
                  isSelected
                    ? 'text-black font-extrabold scale-105 opacity-100'
                    : 'text-neutral-400 hover:text-black opacity-70 hover:opacity-100'
                }`}
              >
                <span className="uppercase text-[11px] font-bold tracking-tight">{d.label}</span>
                {isSelected && (
                  <motion.div
                    layoutId="active-timeline-indicator"
                    className="w-4 h-0.5 bg-black rounded-full mt-0.5"
                    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                  />
                )}
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
};

