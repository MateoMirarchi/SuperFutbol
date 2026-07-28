/**
 * SoccerBall.jsx
 * Decoración visual: pelota de fútbol SVG animada.
 * Props:
 *   - size: número (px)
 *   - animate: boolean — activa la rotación continua
 *   - className: string extra
 */

import './SoccerBall.css';

function SoccerBall({ size = 80, animate = false, className = '' }) {
  return (
    <svg
      className={`soccer-ball ${animate ? 'soccer-ball--spin' : ''} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Sombra exterior */}
      <defs>
        <radialGradient id="ballGrad" cx="38%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="#e8f4fd" />
          <stop offset="60%"  stopColor="#b0d0f0" />
          <stop offset="100%" stopColor="#4a90c4" />
        </radialGradient>
        <radialGradient id="ballGlow" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(30,144,255,0.4)" />
        </radialGradient>
      </defs>

      {/* Círculo base */}
      <circle cx="50" cy="50" r="48" fill="url(#ballGrad)" />

      {/* Glow rim */}
      <circle cx="50" cy="50" r="48" fill="url(#ballGlow)" />

      {/* Borde */}
      <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(30,144,255,0.6)" strokeWidth="1.5" />

      {/* Pentágono central y hexágonos — patrón de pelota */}
      <polygon
        points="50,22 62,31 57,45 43,45 38,31"
        fill="#0a0f1e"
        stroke="#1e90ff"
        strokeWidth="1"
        opacity="0.85"
      />
      <polygon
        points="62,31 76,31 80,44 70,53 57,45"
        fill="#0a0f1e"
        stroke="#1e90ff"
        strokeWidth="1"
        opacity="0.85"
      />
      <polygon
        points="38,31 43,45 30,53 20,44 24,31"
        fill="#0a0f1e"
        stroke="#1e90ff"
        strokeWidth="1"
        opacity="0.85"
      />
      <polygon
        points="57,45 70,53 65,67 50,70 35,67 30,53 43,45"
        fill="#0a0f1e"
        stroke="#1e90ff"
        strokeWidth="1"
        opacity="0.85"
      />
      <polygon
        points="70,53 80,44 90,52 86,66 74,68"
        fill="#0a0f1e"
        stroke="#1e90ff"
        strokeWidth="1"
        opacity="0.85"
      />
      <polygon
        points="30,53 26,66 14,68 10,52 20,44"
        fill="#0a0f1e"
        stroke="#1e90ff"
        strokeWidth="1"
        opacity="0.85"
      />
    </svg>
  );
}

export default SoccerBall;
