export const prefersReduced = {
  opacity: 1,
  scale: 1,
  x: 0,
  y: 0,
  filter: "blur(0px)",
};

export const pageLoad = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: "easeOut" },
  },
};

export const listStagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0.03,
    },
  },
};

export const sidebarRow = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: "easeOut" },
  },
  hover: {
    scale: 1.015,
    transition: { type: "spring", stiffness: 420, damping: 28 },
  },
  press: { scale: 0.992 },
};

export const bubble = {
  hidden: (isMine) => ({
    opacity: 0,
    scale: 0.92,
    x: isMine ? 12 : -12,
    y: 12,
  }),
  show: {
    opacity: 1,
    scale: [0.92, 1.02, 1],
    x: 0,
    y: 0,
    transition: { duration: 0.25, times: [0, 0.72, 1], ease: "easeOut" },
  },
};

export const drawer = {
  hidden: { opacity: 0, x: 28 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 360, damping: 34 },
  },
  exit: { opacity: 0, x: 28, transition: { duration: 0.16 } },
};

export const menuFan = {
  hidden: { opacity: 0, scale: 0.82, y: 8 },
  show: (index = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 520,
      damping: 26,
      delay: index * 0.05,
    },
  }),
  exit: { opacity: 0, scale: 0.9, y: 6, transition: { duration: 0.12 } },
};

export const typingIndicator = {
  hidden: { opacity: 0, filter: "blur(6px)", y: 4 },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.18 },
  },
  exit: { opacity: 0, filter: "blur(6px)", y: 4, transition: { duration: 0.14 } },
};

export const toast = {
  hidden: { opacity: 0, x: 28, y: -8 },
  show: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { type: "spring", stiffness: 420, damping: 28 },
  },
  exit: { opacity: 0, x: 18, transition: { duration: 0.16 } },
};
