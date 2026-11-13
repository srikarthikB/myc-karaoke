import { useEffect, useRef, type RefObject } from 'react';
import MicroSlats from '../../../components/MicroSlats';
import './AmbientArtworkSlats.css';

interface AmbientArtworkSlatsProps {
  artworkRef: RefObject<HTMLImageElement | null>;
}

const VISUAL_STATES = [
  { id: 'mostly-hidden', opacity: 1, blur: 22, weight: 16 },
  { id: 'subtle-reveal', opacity: 0.8, blur: 14, weight: 20 },
  { id: 'partial-reveal', opacity: 0.55, blur: 8, weight: 29.67 },
  { id: 'almost-clear', opacity: 0.3, blur: 2, weight: 19.67 },
  { id: 'fully-visible', opacity: 0.05, blur: 0, weight: 14.66 },
] as const;

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

function chooseState(excluding?: string) {
  const candidates = VISUAL_STATES.filter((state) => state.id !== excluding);
  const totalWeight = candidates.reduce((sum, state) => sum + state.weight, 0);
  let choice = Math.random() * totalWeight;
  return candidates.find((state) => (choice -= state.weight) < 0) ?? candidates[0];
}

/** The fullscreen artwork ambience uses the same Micro Slats as the home background. */
export function AmbientArtworkSlats({ artworkRef }: AmbientArtworkSlatsProps) {
  const slatsLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: number | undefined;
    let previousState: (typeof VISUAL_STATES)[number];

    const applyInitialState = (state: (typeof VISUAL_STATES)[number]) => {
      const slatsLayer = slatsLayerRef.current;
      if (slatsLayer) {
        slatsLayer.style.transition = 'none';
        slatsLayer.style.opacity = String(state.opacity);
      }

      const artwork = artworkRef.current;
      if (artwork) {
        artwork.style.transition = 'none';
        artwork.style.filter = `blur(${state.blur}px) brightness(0.66)`;
      }
    };

    const scheduleHold = () => {
      timer = window.setTimeout(transitionToNextState, randomBetween(3000, 8000));
    };

    const transitionToNextState = () => {
      const nextState = chooseState(previousState.id);
      previousState = nextState;
      const opacityDuration = randomBetween(2, 4);
      const blurDuration = randomBetween(2, 4);
      const transitionDuration = Math.max(opacityDuration, blurDuration);

      const slatsLayer = slatsLayerRef.current;
      if (slatsLayer) {
        slatsLayer.style.transition = `opacity ${opacityDuration.toFixed(2)}s ease-in-out`;
        slatsLayer.style.opacity = String(nextState.opacity);
      }

      const artwork = artworkRef.current;
      if (artwork) {
        artwork.style.transition = `filter ${blurDuration.toFixed(2)}s ease-in-out`;
        artwork.style.filter = `blur(${nextState.blur}px) brightness(0.66)`;
      }

      timer = window.setTimeout(scheduleHold, transitionDuration * 1000);
    };

    previousState = chooseState();
    applyInitialState(previousState);
    scheduleHold();

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [artworkRef]);

  return (
    <div ref={slatsLayerRef} className="ambient-artwork-slats">
      <MicroSlats
        preset="swell"
        color="#3A3A3A"
        glintColor="#F5F5F5"
        backgroundColor="#000000"
        slatWidth={10}
        slatHeight={25}
        gap={3}
        roundness={0.75}
        speed={0.6}
        scale={1.5}
        direction={250}
        chop={0.55}
        stretch={0}
        glint={0.7}
        contrast={1.25}
        perspective={0.55}
        fog={0.55}
        interactive={false}
        cursorStrength={0}
        cursorSize={40}
        intro={false}
        className="fullscreen-micro-slats"
        style={{}}
      />
    </div>
  );
}
