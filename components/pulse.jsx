
import './pulse.css';

export const Pulse = props => {

  const r = props.r || 219;
  const g = props.g || 31;
  const b = props.b || 175;
  const rgb1 = `rgba(${r},${g},${b},1)`;
  const rgb0 = `rgba(${r},${g},${b},0)`;

  const pSecs = props.secs || 4;

  const pVisible = props.visible;

  return (
    <div className={
      `w-full h-px relative overflow-hidden ${ pVisible ? '' : 'invisible' }`
      }>
      <div
        className="absolute w-full top-0 left-0 h-full transform origin-left"
        style={{
          background: `radial-gradient(circle, ${rgb1} 0%, ${rgb1} 50%, ${rgb0} 100%)`,
          animation: `pulse ${ pSecs }s infinite`
        }}
      />
    </div>
  );
};