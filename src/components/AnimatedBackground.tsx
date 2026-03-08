import { motion } from "framer-motion";

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Animated gradient orbs */}
    <motion.div
      className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full opacity-20"
      style={{ background: "radial-gradient(circle, hsl(142, 70%, 45%), transparent 70%)" }}
      animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute top-1/3 right-0 h-[600px] w-[600px] rounded-full opacity-15"
      style={{ background: "radial-gradient(circle, hsl(222, 80%, 45%), transparent 70%)" }}
      animate={{ x: [0, -50, 0], y: [0, 60, 0], scale: [1, 1.15, 1] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute -bottom-20 left-1/3 h-[400px] w-[400px] rounded-full opacity-10"
      style={{ background: "radial-gradient(circle, hsl(50, 100%, 50%), transparent 70%)" }}
      animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
    />
    {/* Grid overlay */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `linear-gradient(hsl(210, 40%, 96%) 1px, transparent 1px), linear-gradient(90deg, hsl(210, 40%, 96%) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }}
    />
  </div>
);

export default AnimatedBackground;
