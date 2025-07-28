# Bradley AI - Complete Color Palette & Design System

## 🎨 **Primary Matrix Theme Colors**

### **Core Matrix Colors**
```css
/* Signature Matrix Colors */
--matrix-cyber-blue: #00d4ff    /* Main cyberpunk accent */
--matrix-green: #00ff41         /* Classic Matrix green */
--matrix-black: #000000         /* Pure black backgrounds */
```

### **Matrix Green Variants**
```css
--matrix-green-light: #39ff74   /* Lighter green for highlights */
--matrix-green-dark: #00cc33    /* Darker green for borders */
--matrix-green-glow: rgba(0, 255, 65, 0.8)  /* Green glow effects */
```

### **Cyber Blue Variants**
```css
--matrix-blue-light: #33ddff    /* Light cyber blue */
--matrix-blue-dark: #0099cc     /* Dark cyber blue */
--matrix-blue-glow: rgba(0, 212, 255, 0.8)  /* Blue glow effects */
```

---

## 🖥️ **Base UI System Colors**

### **Background Colors**
```css
--background: #1a1a1a          /* Main background */
--card: #2a2a2a               /* Card backgrounds */
--secondary: #2e2e2e          /* Secondary backgrounds */
--input: #2a2a2a              /* Input field backgrounds */
--matrix-bg-black: #262626    /* Matrix unified background */
```

### **Text Colors**
```css
--foreground: #fafafa         /* Primary text (98% white) */
--muted-foreground: #9ca3af   /* Secondary text (neutral-400) */
--muted: #6b7280              /* Muted text (neutral-500) */
```

### **Border & Accent Colors**
```css
--border: #606060             /* Standard borders */
--accent: #ff6b00             /* Orange accent color */
--ring: #ff6b00               /* Focus ring color */
--sidebar-primary: #ff6b00    /* Sidebar primary accent */
```

---

## ⚡ **Status & State Colors**

### **Connection Status Glows**
```css
.matrix-glow-green    /* Success: rgba(0, 255, 65, 0.4) */
.matrix-glow-blue     /* Info: rgba(0, 212, 255, 0.4) */
.matrix-glow-red      /* Error: rgba(255, 0, 128, 0.4) */
.matrix-glow-amber    /* Warning: rgba(255, 170, 0, 0.4) */
```

### **Market Sentiment Colors**
```css
.sentiment-bullish    /* Green: rgba(16, 185, 129, 0.2) */
.sentiment-bearish    /* Red: rgba(239, 68, 68, 0.2) */
```

### **Logo Quality Indicators**
```css
.logo-quality-high    /* #10b981 (Emerald-500) */
.logo-quality-medium  /* #f59e0b (Amber-500) */
.logo-quality-low     /* #ef4444 (Red-500) */
```

---

## 📊 **Chart & Data Visualization Colors**

### **Chart Color Palette**
```css
--chart-1: hsl(220, 70%, 50%)  /* Blue */
--chart-2: hsl(160, 60%, 45%)  /* Teal */
--chart-3: hsl(30, 80%, 55%)   /* Orange */
--chart-4: hsl(280, 65%, 60%)  /* Purple */
--chart-5: hsl(340, 75%, 55%)  /* Pink */
```

---

## 🌈 **Gradient Definitions**

### **Primary Gradients**
```css
--gradient-primary: linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)
--gradient-secondary: linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)
--gradient-accent: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)
```

### **Matrix Special Effects**
```css
/* Matrix Data Stream */
linear-gradient(90deg, transparent 0%, #00ff41 20%, #06b6d4 50%, #8b5cf6 80%, transparent 100%)

/* Matrix Token Shimmer */
linear-gradient(45deg, transparent 30%, rgba(6, 182, 212, 0.1) 50%, transparent 70%)

/* Gem Scanner Background Effects */
radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)
radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)
radial-gradient(circle at 40% 40%, rgba(0, 255, 65, 0.05) 0%, transparent 50%)
```

---

## 🎭 **Typography & Font Colors**

### **Matrix Text Classes**
```css
.matrix-text           /* --matrix-green (#00ff41) */
.matrix-text-cyber     /* --matrix-cyber-blue (#00d4ff) */
.matrix-text-glow      /* Animated green glow */
.matrix-text-cyber-glow /* Animated blue glow */
.matrix-text-flicker   /* Flickering Matrix effect */
```

### **Font Family**
```css
font-family: "Fira Code", "Consolas", "Monaco", monospace
```

---

## 💫 **Shadow & Glow Effects**

### **Box Shadows**
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5)
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)
```

### **Glow Effects**
```css
.matrix-shadow-glow    /* Green glow: 0 0 20px var(--matrix-green-glow) */
.matrix-shadow-cyber   /* Blue glow: 0 0 20px var(--matrix-blue-glow) */
.matrix-text-shadow-glow /* Green text glow: 0 0 10px var(--matrix-green) */
.matrix-text-shadow-cyber /* Blue text glow: 0 0 10px var(--matrix-cyber-blue) */
```

---

## 🎯 **Usage Guidelines**

### **Color Hierarchy**
1. **Primary Actions**: Matrix Cyber Blue (`#00d4ff`)
2. **Success States**: Matrix Green (`#00ff41`)
3. **Secondary Actions**: Orange Accent (`#ff6b00`)
4. **Backgrounds**: Unified Grey (`#262626`)
5. **Text**: High contrast white (`#fafafa`)

### **Accessibility**
- **High Contrast Mode**: All colors fall back to pure white/black
- **Reduced Motion**: Animations disabled for accessibility
- **Print Styles**: Colors optimized for print media

### **Brand Consistency**
- **Matrix Theme**: Dominant cyberpunk aesthetic with green/blue
- **Professional Touch**: Orange accents for business elements
- **Dark First**: Optimized for dark theme experience
- **Monospace Typography**: Code-like aesthetic throughout

---

## 🔧 **Technical Implementation**

### **CSS Custom Properties**
All colors defined as CSS custom properties for easy theming and maintenance.

### **Responsive Design**
- Mobile: Reduced animation intensity
- Desktop: Full glow effects and animations
- Print: Optimized black/white fallbacks

### **Performance**
- GPU accelerated with `transform: translateZ(0)`
- Optimized with `will-change` and `backface-visibility`
- Reduced motion support for battery savings

---

**Total Colors**: 40+ distinct colors and variants
**Design System**: Complete Matrix cyberpunk theme with professional accents
**Accessibility**: WCAG compliant with fallbacks and reduced motion support
