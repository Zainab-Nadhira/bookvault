const sizes = [60, 90, 40, 120, 70, 50, 100];

const ParticlesBackground = () => (
  <div className="particles">
    {sizes.map((size, i) => (
      <span
        key={i}
        className="particle"
        style={{
          width: size,
          height: size,
          left: `${(i * 37) % 100}%`,
          top: `${(i * 53) % 100}%`,
          animationDelay: `${i * 0.7}s`,
          animationDuration: `${7 + i}s`,
        }}
      />
    ))}
  </div>
);

export default ParticlesBackground;
