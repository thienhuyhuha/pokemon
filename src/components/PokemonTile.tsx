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
      <div className={`w-full h-full ${dense ? 'p-[0.5px]' : 'p-[0.5px] sm:p-[1.5px]'}`}>
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
            'relative w-full h-full min-w-0 min-h-0 leading-none border transition-transform duration-150 ease-out select-none flex flex-col items-center justify-center overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400',
            dense
              ? 'rounded-[3px] sm:rounded-[5px] p-0'
              : 'rounded-[4px] sm:rounded-[7px] sm:border-[1.5px] p-0 sm:p-[1px]',
            tile.frozen
              ? 'cursor-not-allowed shadow-[inset_0_0_0_1.5px_rgba(56,189,248,0.45),0_1.5px_0_#0284C7]'
              : dense
                ? 'cursor-pointer shadow-[0_1.5px_0_rgba(15,23,42,0.45)] lg:hover:-translate-y-[1px] active:scale-95'
                : 'cursor-pointer shadow-[0_2px_0_rgba(15,23,42,0.45)] lg:hover:-translate-y-[1px] active:scale-95',
            isSelected
              ? 'ring-2 ring-yellow-400 scale-[1.04] shadow-[0_4px_14px_rgba(220,38,38,0.75)] z-20'
              : '',
            isHinted && !isSelected
              ? 'ring-2 ring-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.85)] animate-pulse z-20'
              : '',
            isMatching ? 'animate-pop-match pointer-events-none z-30' : '',
            isInvalid ? 'animate-shake-invalid ring-2 ring-rose-500' : '',
          ].join(' ')}
        >
          {/* Thin top elemental type bar */}
          <span
            style={{ backgroundColor: tile.frozen ? '#38BDF8' : species.borderTint }}
            className="absolute top-0 inset-x-0 pointer-events-none opacity-85 h-[1.5px] sm:h-[2px]"
          />

          {/* Pure white inner canvas with maximized creature artwork */}
          <div className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden">
            <PokemonArtwork
              speciesId={tile.speciesId}
              className={`w-[96%] h-[96%] scale-[1.08] ${
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
