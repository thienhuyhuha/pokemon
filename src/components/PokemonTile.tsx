import React from 'react';
import { Snowflake } from 'lucide-react';
import { getPokemonSpecies, PokemonArtwork } from '../data/pokemonSprites';
import { TileCell } from '../types/game';

interface PokemonTileProps {
  tile: TileCell;
  r: number;
  c: number;
  dense?: boolean;
  isSelected: boolean;
  isHinted: boolean;
  isMatching: boolean;
  isInvalid: boolean;
  onSelect: (r: number, c: number) => void;
}

export const PokemonTile: React.FC<PokemonTileProps> = React.memo(
  ({ tile, r, c, dense = false, isSelected, isHinted, isMatching, isInvalid, onSelect }) => {
    const species = getPokemonSpecies(tile.speciesId);

    return (
      <div className={`w-full h-full ${dense ? 'p-[1px]' : 'p-[1.5px] sm:p-[2px]'}`}>
        <button
          type="button"
          onClick={() => onSelect(r, c)}
          aria-label={`${species.name} (${species.type})${tile.frozen ? ' - Đang đóng băng' : ''} - Hàng ${r + 1} Cột ${c + 1}`}
          aria-pressed={isSelected}
          style={{
            backgroundColor: tile.frozen ? '#E0F2FE' : '#FFFFFF',
            borderColor: isSelected
              ? '#DC2626'
              : isHinted
                ? '#10B981'
                : tile.frozen
                  ? '#38BDF8'
                  : species.borderTint,
          }}
          className={[
            'relative w-full h-full border transition-transform duration-150 ease-out select-none flex flex-col items-center justify-center overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400',
            dense
              ? 'rounded-[3px] sm:rounded-[4px] p-[1px]'
              : 'rounded-[6px] sm:rounded-[8px] border-[1.5px] p-[2px]',
            tile.frozen
              ? 'cursor-not-allowed shadow-[inset_0_0_0_1.5px_rgba(56,189,248,0.45),0_2px_0_#0284C7]'
              : dense
                ? 'cursor-pointer shadow-[0_1.5px_0_rgba(15,23,42,0.45)] hover:-translate-y-[1px] active:translate-y-[0.5px]'
                : 'cursor-pointer shadow-[0_3px_0_rgba(15,23,42,0.45)] hover:-translate-y-[1.5px] active:translate-y-[1px]',
            isSelected
              ? 'ring-2 ring-yellow-400 -translate-y-[2px] shadow-[0_4px_14px_rgba(220,38,38,0.7)] z-20'
              : '',
            isHinted && !isSelected
              ? 'ring-2 ring-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.85)] animate-pulse z-20'
              : '',
            isMatching ? 'animate-pop-match pointer-events-none z-30' : '',
            isInvalid ? 'animate-shake-invalid ring-2 ring-rose-500' : '',
          ].join(' ')}
        >
          {/* Thin top elemental type bar */}
          <span
            style={{ backgroundColor: tile.frozen ? '#38BDF8' : species.borderTint }}
            className={`absolute top-0 inset-x-0 pointer-events-none opacity-85 ${
              dense ? 'h-[2px]' : 'h-[2.5px]'
            }`}
          />

          {/* Pure white inner canvas so mix-blend-multiply makes sprite background invisible */}
          <div className="relative z-10 w-full h-full flex items-center justify-center pt-[1px]">
            <PokemonArtwork
              speciesId={tile.speciesId}
              className={`${dense ? 'w-[94%] h-[94%]' : 'w-[90%] h-[90%]'} ${
                tile.frozen ? 'opacity-60 saturate-50' : ''
              }`}
            />
          </div>

          {tile.frozen && (
            <span
              className="absolute inset-0 z-20 bg-sky-300/35 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none"
              title="Ô đóng băng: Ghép cặp kề cạnh để làm tan băng"
            >
              <Snowflake
                className={`${dense ? 'w-3 h-3' : 'w-4 h-4'} text-sky-700 drop-shadow-sm`}
              />
            </span>
          )}
        </button>
      </div>
    );
  }
);

PokemonTile.displayName = 'PokemonTile';
