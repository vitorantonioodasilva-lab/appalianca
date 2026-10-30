import Svg, { ClipPath, Defs, Line, Mask, Path, Rect } from 'react-native-svg';

// Símbolo da Aliança Brasil (três faixas em hexágono). Mesmo desenho de assets/logo.svg.
const ANEL =
  'M100,4 183.14,52 183.14,148 100,196 16.86,148 16.86,52Z M49.77,71 49.77,129 100,158 150.23,129 150.23,71 100,42Z';
const RECORTE = 'M144.64,22.68 189.28,100 144.64,177.32 55.36,177.32 10.72,100 55.36,22.68Z';
const CORTES = [
  [150.23, 71, 210.85, 106],
  [100, 158, 39.38, 193],
  [49.77, 71, 49.77, 1],
] as const;

export function Logo({ tamanho = 40, cor = '#FFFFFF' }: { tamanho?: number; cor?: string }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 200 200" accessibilityRole="image" accessibilityLabel="Aliança Brasil">
      <Defs>
        <ClipPath id="recorte">
          <Path d={RECORTE} />
        </ClipPath>
        <Mask id="faixas" x="0" y="0" width="200" height="200" maskUnits="userSpaceOnUse">
          <Path d={ANEL} fill="#FFFFFF" fillRule="evenodd" />
          {CORTES.map(([x1, y1, x2, y2]) => (
            <Line key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000000" strokeWidth={9} />
          ))}
        </Mask>
      </Defs>
      <Rect width="200" height="200" fill={cor} mask="url(#faixas)" clipPath="url(#recorte)" />
    </Svg>
  );
}
